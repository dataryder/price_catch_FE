import * as duckdb from "@duckdb/duckdb-wasm";
import {
  ItemMetadata,
  ItemLatest,
  ItemPriceHistory,
  IndexData,
  IndexChartAgg,
  CategoryData,
} from "../types";

const arrowToArray = (table: any) =>
  table.toArray().map((row: any) => row.toJSON());

// Replace getItemMetadata and getItemPrices
export const getItemMetadata = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
): Promise<ItemMetadata[]> => {
  // Pushed down date filters and isolated MAX(date) to utilize DuckDB Zone Maps
  const query = `
        WITH max_date_cte AS (
            SELECT MAX(date) as max_d FROM lake.prices WHERE item_code = ${item_code}
        ),
        freq_calc AS (
            SELECT 
                CASE 
                    WHEN m.max_d < current_date() - INTERVAL 60 DAY THEN 'discontinued'
                    WHEN (SELECT COUNT(DISTINCT date) FROM lake.prices WHERE item_code = ${item_code} AND date >= current_date() - INTERVAL 30 DAY) >= 20 THEN 'daily'
                    WHEN (SELECT COUNT(DISTINCT date) FROM lake.prices WHERE item_code = ${item_code} AND date >= current_date() - INTERVAL 30 DAY) >= 4 THEN 'weekly'
                    ELSE 'monthly'
                END as frequency
            FROM max_date_cte m
        ),
        latest_prices AS (
            SELECT p.price 
            FROM lake.prices p
            WHERE p.item_code = ${item_code} 
              AND p.date = (SELECT max_d FROM max_date_cte)
              AND p.premise_code NOT IN (SELECT premise_code FROM lake.lookup_premise WHERE premise ILIKE '%test%')
        )
        SELECT 
            i.item_code, i.item, i.unit, i.item_group, i.item_category,
            (SELECT frequency FROM freq_calc) as frequency,
            quantile_cont(p.price, 0.05) as minimum, 
            quantile_cont(p.price, 0.95) as maximum,
            quantile_cont(p.price, 0.50) as median,
            (SELECT max_d FROM max_date_cte) as last_updated
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
  targetDate: string, // Make targetDate required
): Promise<ItemLatest[]> => {
  // Simplified query since the UI now strictly dictates the date
  const query = `
        SELECT 
            CAST(p.date AS VARCHAR) as date, 
            pr.premise, pr.premise_type, pr.state, pr.district, p.price
        FROM lake.prices p
        JOIN lake.lookup_premise pr ON p.premise_code = pr.premise_code
        WHERE p.item_code = ? 
          AND p.date = ? 
          AND pr.premise NOT ILIKE '%test%'
        ORDER BY p.price ASC;
    `;

  const stmt = await conn.prepare(query);
  const result = await stmt.query(item_code, targetDate);

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
            CAST(p.date AS VARCHAR) as date, 
            quantile_cont(p.price, 0.50) as median, 
            quantile_cont(p.price, 0.05) as p5, 
            quantile_cont(p.price, 0.95) as p95
        FROM lake.prices p
        WHERE p.item_code = ${item_code} 
          AND p.premise_code NOT IN (SELECT premise_code FROM lake.lookup_premise WHERE premise ILIKE '%test%')
        GROUP BY p.date
        ORDER BY p.date ASC;
    `;
  const result = await conn.query(query);
  return arrowToArray(result);
};

export const getWeeklyIndexGroup = async (): Promise<IndexChartAgg[]> => {
  const response = await fetch(
    "https://pricecatcher-lake.iwa.my/indices/item_group_price_index.json",
  );
  return await response.json();
};

export const getWeeklyIndexCategory = async (): Promise<IndexData> => {
  const response = await fetch(
    "https://pricecatcher-lake.iwa.my/indices/item_category_price_index.json",
  );

  // Read as raw text first
  const text = await response.text();

  // Clean invalid Pandas JSON (replace NaN with null) before parsing
  const safeText = text.replace(/:\s*NaN/g, ": null");

  return JSON.parse(safeText);
};

let categoryHierarchyCache: CategoryData[] | null = null;

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
  categoryHierarchyCache = arrowToArray(result) as CategoryData[];
  return categoryHierarchyCache;
};

// Update getItemsByCategory to accept isCacheReady and use memory.item_status
export const getItemsByCategory = async (
  conn: duckdb.AsyncDuckDBConnection,
  group: string,
  category: string,
  isCacheReady: boolean = false,
): Promise<any[]> => {
  const decodedCategory = category.replace(" | ", "/");

  const query = isCacheReady
    ? `SELECT i.*, 'weekly' as frequency, COALESCE(s.status, 'active') as status
       FROM lake.lookup_item i
       LEFT JOIN memory.item_status s ON i.item_code = s.item_code
       WHERE i.item_group = ? AND i.item_category = ?
       ORDER BY i.item ASC`
    : `SELECT i.*, 'weekly' as frequency, 'active' as status
       FROM lake.lookup_item i
       WHERE i.item_group = ? AND i.item_category = ?
       ORDER BY i.item ASC`;

  const stmt = await conn.prepare(query);
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
            WHERE p.item_code = ${item_code} 
              AND p.date = '${targetDate}' 
              AND pr.premise NOT ILIKE '%test%'
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
