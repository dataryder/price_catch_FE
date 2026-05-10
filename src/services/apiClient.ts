import { readParquet } from "parquet-wasm";
import { tableFromIPC } from "apache-arrow";
import {
  ItemMetadata,
  ItemLatest,
  ItemPriceHistory,
  IndexData,
  IndexChartAgg,
  CategoryData,
} from "../types";

const DATA_URL = "https://pricecatcher-lake.iwa.my/data";

const fetchParquet = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("File not found");

  const buffer = new Uint8Array(await res.arrayBuffer());

  // Extract from WASM memory to JS Arrow using IPC stream
  const wasmTable = readParquet(buffer);
  const table = tableFromIPC(wasmTable.intoIPCStream());

  return table.toArray().map((row: any) => row.toJSON());
};

// JS Helper for percentiles
const quantile = (arr: number[], q: number) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export const getItemMetadata = async (
  globalSearchData: any[],
  item_code: string,
): Promise<ItemMetadata[]> => {
  const item = globalSearchData.find((i) => i.item_code === Number(item_code));
  if (!item) return [];
  return [
    {
      ...item,
      frequency: "weekly",
      minimum: item.minimum || 0,
      maximum: item.maximum || 0,
      median: item.median || 0,
    },
  ];
};

export const getItemPrices = async (
  item_code: string,
  targetDate: string,
): Promise<ItemLatest[]> => {
  try {
    const data = await fetchParquet(
      `${DATA_URL}/prices/item_code=${item_code}/data.parquet`,
    );
    return data.filter((d: any) => d.date === targetDate);
  } catch {
    return [];
  }
};

export const getItemPriceHistory = async (
  item_code: string,
): Promise<ItemPriceHistory[]> => {
  try {
    return await fetchParquet(
      `${DATA_URL}/history/item_code=${item_code}/data.parquet`,
    );
  } catch {
    return [];
  }
};

export const getWeeklyIndexGroup = async (): Promise<IndexChartAgg[]> => {
  const res = await fetch(
    "https://pricecatcher-lake.iwa.my/indices/item_group_price_index.json",
  );
  return await res.json();
};

export const getWeeklyIndexCategory = async (): Promise<IndexData> => {
  const res = await fetch(
    "https://pricecatcher-lake.iwa.my/indices/item_category_price_index.json",
  );
  const text = await res.text();
  return JSON.parse(text.replace(/:\s*NaN/g, ": null"));
};

export const getCategoryHierarchy = async (
  globalSearchData: any[],
): Promise<CategoryData[]> => {
  const unique = new Set<string>();
  const hierarchy: CategoryData[] = [];
  globalSearchData.forEach((i) => {
    if (i.item_group) {
      const key = `${i.item_group}|${i.item_category}`;
      if (!unique.has(key)) {
        unique.add(key);
        hierarchy.push({
          item_group: i.item_group,
          item_category: i.item_category,
        });
      }
    }
  });
  return hierarchy.sort((a, b) => a.item_group.localeCompare(b.item_group));
};

export const getItemsByCategory = async (
  globalSearchData: any[],
  group: string,
  category: string,
): Promise<any[]> => {
  const decodedCategory = category.replace(" | ", "/");
  return globalSearchData
    .filter(
      (i) => i.item_group === group && i.item_category === decodedCategory,
    )
    .sort((a, b) => a.item.localeCompare(b.item));
};

export const getLocalityInsights = async (
  item_code: string,
  targetDate: string,
  metric: "median" | "avg" | "p95" | "p5" = "median",
  level: "state" | "district" = "state",
): Promise<any> => {
  try {
    const data = await fetchParquet(
      `${DATA_URL}/prices/item_code=${item_code}/data.parquet`,
    );
    const filtered = data.filter((d: any) => d.date === targetDate);

    if (filtered.length === 0) return null;

    const grouped = filtered.reduce((acc: any, row: any) => {
      const key = row[level];
      if (!key) return acc;
      if (!acc[key]) acc[key] = { prices: [], records: [] };
      acc[key].prices.push(row.price);
      acc[key].records.push(row);
      return acc;
    }, {});

    interface RankingItem {
      name: string;
      val: number;
      rank?: number;
    }

    const ranking: RankingItem[] = Object.entries(grouped).map(
      ([name, group]: any) => {
        const prices = group.prices;
        let val = 0;
        if (metric === "avg")
          val =
            prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
        if (metric === "median") val = quantile(prices, 0.5);
        if (metric === "p5") val = quantile(prices, 0.05);
        if (metric === "p95") val = quantile(prices, 0.95);
        return { name, val };
      },
    );

    ranking.sort((a, b) => a.val - b.val);
    ranking.forEach((r, idx) => (r.rank = idx + 1));

    const cheapest_stores = filtered
      .sort((a: any, b: any) => a.price - b.price)
      .slice(0, 10);

    return { ranking, cheapest_stores };
  } catch {
    return null;
  }
};
