import * as duckdb from "@duckdb/duckdb-wasm";
import {
  ItemMetadata,
  ItemLatest,
  ItemPriceHistory,
  IndexData,
  IndexChartAgg,
} from "../types";

const arrowToArray = (table: any) =>
  table.toArray().map((row: any) => row.toJSON());

export const getItemMetadata = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
): Promise<ItemMetadata[]> => {
  const query = `
        WITH freq_calc AS (
            SELECT 
                MAX(date) as max_d,
                CASE 
                    WHEN MAX(date) < current_date() - INTERVAL 60 DAY THEN 'discontinued'
                    WHEN COUNT(DISTINCT CASE WHEN date >= current_date() - INTERVAL 30 DAY THEN date END) >= 20 THEN 'daily'
                    WHEN COUNT(DISTINCT CASE WHEN date >= current_date() - INTERVAL 30 DAY THEN date END) >= 4 THEN 'weekly'
                    ELSE 'monthly'
                END as frequency
            FROM lake.prices 
            WHERE item_code = ${item_code}
        ),
        latest_prices AS (
            SELECT p.price 
            FROM lake.prices p
            JOIN freq_calc f ON p.date = f.max_d
            WHERE p.item_code = ${item_code} 
        )
        SELECT 
            i.item_code, i.item, i.unit, i.item_group, i.item_category,
            (SELECT frequency FROM freq_calc) as frequency,
            quantile_cont(p.price, 0.05) as minimum, 
            quantile_cont(p.price, 0.95) as maximum,
            quantile_cont(p.price, 0.50) as median,
            (SELECT max_d FROM freq_calc) as last_updated
        FROM latest_prices p
        LEFT JOIN lake.lookup_item i ON i.item_code = ${item_code}
        GROUP BY 1, 2, 3, 4, 5, 6, 10;
    `;
  const result = await conn.query(query);
  return arrowToArray(result);
};

export const getItemPrices = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
  targetDate?: string,
): Promise<ItemLatest[]> => {
  let query = `
        SELECT 
            CAST(p.date AS VARCHAR) as date, 
            pr.premise, pr.premise_type, pr.state, pr.district, p.price
        FROM lake.prices p
        JOIN lake.lookup_premise pr ON p.premise_code = pr.premise_code
        WHERE p.item_code = ?
    `;

  if (targetDate) {
    query += ` AND p.date = ? ORDER BY p.price ASC;`;
  } else {
    query += ` AND p.date = (SELECT MAX(date) FROM lake.prices WHERE item_code = ?) ORDER BY p.price ASC;`;
  }

  const stmt = await conn.prepare(query);
  const result = targetDate
    ? await stmt.query(item_code, targetDate)
    : await stmt.query(item_code, item_code);

  const data = arrowToArray(result);
  stmt.close();
  return data;
};

export const getItemPriceHistory = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
): Promise<ItemPriceHistory[]> => {
  const query = `
        SELECT 
            CAST(date AS VARCHAR) as date, 
            quantile_cont(price, 0.50) as median, 
            quantile_cont(price, 0.05) as p5, 
            quantile_cont(price, 0.95) as p95
        FROM lake.prices
        WHERE item_code = ${item_code}
        GROUP BY date
        ORDER BY date ASC;
    `;
  const result = await conn.query(query);
  return arrowToArray(result);
};

export const getWeeklyIndexGroup = async (): Promise<IndexChartAgg[]> => {
  const response = await fetch(
    "https://pub-0725b434f0414f52b90e99dd024acc67.r2.dev/pricecatcher/item_group_price_index.json",
  );
  return await response.json();
};

export const getWeeklyIndexCategory = async (): Promise<IndexData> => {
  const response = await fetch(
    "https://pub-0725b434f0414f52b90e99dd024acc67.r2.dev/pricecatcher/item_category_price_index.json",
  );
  return await response.json();
};

let categoryHierarchyCache: any[] | null = null;

export const getCategoryHierarchy = async (
  conn: duckdb.AsyncDuckDBConnection,
) => {
  if (categoryHierarchyCache) return categoryHierarchyCache;

  const query = `
        SELECT DISTINCT item_group, item_category 
        FROM lake.lookup_item 
        WHERE item_group IS NOT NULL
        ORDER BY item_group ASC, item_category ASC;
    `;
  const result = await conn.query(query);
  categoryHierarchyCache = arrowToArray(result);
  return categoryHierarchyCache;
};

export const getItemsByCategory = async (
  conn: duckdb.AsyncDuckDBConnection,
  group: string,
  category: string,
): Promise<any[]> => {
  // Replace the URL-safe separator back to the slash used in the database
  const decodedCategory = category.replace(" | ", "/");

  // We add a fallback 'weekly' frequency in case the GitHub Action hasn't added the column yet
  const stmt = await conn.prepare(`
        SELECT *, 'weekly' as frequency 
        FROM lake.lookup_item 
        WHERE item_group = ? AND item_category = ?
        ORDER BY item ASC;
    `);
  const result = await stmt.query(group, decodedCategory);
  const data = arrowToArray(result);
  stmt.close();
  return data;
};

export const getLocalityInsights = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
  targetDate: string,
  metric: "median" | "avg" | "p95" | "p5" = "median",
  level: "state" | "district" = "state",
): Promise<any> => {
  const metricAgg = {
    median: "QUANTILE_CONT(price, 0.50)",
    avg: "AVG(price)",
    p95: "QUANTILE_CONT(price, 0.95)",
    p5: "QUANTILE_CONT(price, 0.05)",
  }[metric];

  const query = `
        WITH base_data AS (
            SELECT p.price, pr.state, pr.district, pr.premise
            FROM lake.prices p
            JOIN lake.lookup_premise pr ON p.premise_code = pr.premise_code
            WHERE p.item_code = ${item_code} AND p.date = '${targetDate}'
        ),
        ranked_data AS (
            SELECT 
                ${level} as name,
                ${metricAgg} as val,
                RANK() OVER(ORDER BY ${metricAgg} ASC) as rank
            FROM base_data
            GROUP BY 1
        ),
        region_ranking AS (
            SELECT ${level} as name, premise, district, price,
                   ROW_NUMBER() OVER(PARTITION BY ${level} ORDER BY price ASC) as rn
            FROM base_data
        )
        SELECT 
            (SELECT list({'name': name, 'val': val, 'rank': rank} ORDER BY rank ASC) FROM ranked_data) as ranking,
            (SELECT list({'name': name, 'premise': premise, 'district': district, 'price': price, 'rank': rn} ORDER BY rn ASC) FROM region_ranking WHERE rn <= 10) as cheapest_stores
    `;
  const result = await conn.query(query);
  const rawRow = arrowToArray(result)[0];

  if (!rawRow) return null;

  return {
    ...rawRow,
    ranking: rawRow.ranking ? Array.from(rawRow.ranking) : [],
    cheapest_stores: rawRow.cheapest_stores
      ? Array.from(rawRow.cheapest_stores)
      : [],
  };
};
