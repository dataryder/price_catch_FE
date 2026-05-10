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

const bufferCache = new Map<string, Uint8Array>();

const fetchParquet = async (
  url: string,
  filterKey?: string,
  filterValue?: any,
) => {
  let buffer = bufferCache.get(url);

  if (!buffer) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("File not found");
    buffer = new Uint8Array(await res.arrayBuffer());
    bufferCache.set(url, buffer);
  }

  const wasmTable = readParquet(buffer);
  const table = tableFromIPC(wasmTable.intoIPCStream());

  let data;
  if (filterKey) {
    data = [];
    for (const row of table) {
      if (row[filterKey] === filterValue) {
        data.push(row.toJSON());
      }
    }
  } else {
    data = table.toArray().map((row: any) => row.toJSON());
  }

  return data;
};
// const quantile = (arr: number[], q: number) => {
//   if (arr.length === 0) return 0;
//   const sorted = [...arr].sort((a, b) => a - b);
//   const pos = (sorted.length - 1) * q;
//   const base = Math.floor(pos);
//   const rest = pos - base;
//   if (sorted[base + 1] !== undefined) {
//     return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
//   } else {
//     return sorted[base];
//   }
// };

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
    return await fetchParquet(
      `${DATA_URL}/prices/item_code=${item_code}/data.parquet`,
      "date",
      targetDate,
    );
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
