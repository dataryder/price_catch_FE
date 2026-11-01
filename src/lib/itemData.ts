import type { ItemLatest, ItemPriceHistory } from "../types";

// Item pages embed their data once, as a plain JSON block that both the React
// island and LLM agents/scrapers can read:
//   <script type="application/json" id="item-data">{ ... }</script>
// The format is documented in public/llms.txt — keep the two in sync.

export const ITEM_DATA_ELEMENT_ID = "item-data";

const LATEST_COLUMNS = ["premise", "premise_type", "state", "district", "price"] as const;
const HISTORY_COLUMNS = ["date", "median", "p5", "p95"] as const;

export interface ItemDataBlock {
  item_code: string;
  item: string;
  unit?: string;
  item_group?: string;
  item_category?: string;
  sources: Record<string, string>;
  latest_prices: {
    date: string | null;
    columns: string[];
    rows: (string | number)[][];
  };
  price_history: {
    columns: string[];
    rows: (string | number)[][];
  };
}

export interface PreloadedItemData {
  history: ItemPriceHistory[];
  prices: ItemLatest[];
}

// Percentiles come out of the pipeline as e.g. 2.9945000000000004.
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;

export function encodeItemData(
  itemCode: string,
  itemName: string,
  meta: { unit?: string; item_group?: string; item_category?: string } | null,
  prices: ItemLatest[],
  history: ItemPriceHistory[],
): ItemDataBlock {
  const dates = new Set(prices.map((p) => p.date));
  const singleDate = dates.size === 1 ? [...dates][0] : null;
  const latestColumns = singleDate ? [...LATEST_COLUMNS] : ["date", ...LATEST_COLUMNS];

  return {
    item_code: itemCode,
    item: itemName,
    unit: meta?.unit,
    item_group: meta?.item_group,
    item_category: meta?.item_category,
    sources: {
      latest_prices_parquet: `https://pricecatcher-lake.iwa.my/data/prices/item_code=${itemCode}/data.parquet`,
      price_history_parquet: `https://pricecatcher-lake.iwa.my/data/history/item_code=${itemCode}/data.parquet`,
      docs: "https://pricecatcher.iwa.my/llms.txt",
    },
    latest_prices: {
      date: singleDate,
      columns: latestColumns,
      rows: prices.map((p) => {
        const row = [p.premise, p.premise_type, p.state, p.district, p.price];
        return singleDate ? row : [p.date, ...row];
      }),
    },
    price_history: {
      columns: [...HISTORY_COLUMNS],
      rows: history.map((h) => [h.date, round4(h.median), round4(h.p5), round4(h.p95)]),
    },
  };
}

/** Serialize for a <script type="application/json"> tag (safe against `</script>`). */
export function serializeItemData(block: ItemDataBlock): string {
  return JSON.stringify(block).replace(/</g, "\\u003c");
}

function decodeItemData(block: ItemDataBlock): PreloadedItemData {
  const lp = block.latest_prices;
  const idx = (c: string) => lp.columns.indexOf(c);
  const [iDate, iPremise, iType, iState, iDistrict, iPrice] = [
    "date", "premise", "premise_type", "state", "district", "price",
  ].map(idx);

  return {
    prices: lp.rows.map((r) => ({
      date: (iDate >= 0 ? r[iDate] : lp.date) as string,
      premise: r[iPremise] as string,
      premise_type: r[iType] as string,
      state: r[iState] as string,
      district: r[iDistrict] as string,
      price: r[iPrice] as number,
    })),
    history: block.price_history.rows.map((r) => ({
      date: r[0] as string,
      median: r[1] as number,
      p5: r[2] as number,
      p95: r[3] as number,
    })),
  };
}

// Build time: the Astro page registers the data here so the island's server
// render sees exactly what the client will later read from the JSON block
// (identical first render => no hydration mismatch).
const serverStore = new Map<string, PreloadedItemData>();
// Browser: decode each page's block once, keeping array identities stable.
const clientCache = new Map<string, PreloadedItemData>();

export function setServerItemData(block: ItemDataBlock) {
  serverStore.set(String(block.item_code), decodeItemData(block));
}

export function getPreloadedItemData(itemCode: string | undefined): PreloadedItemData | null {
  if (!itemCode) return null;
  if (typeof document === "undefined") return serverStore.get(itemCode) ?? null;

  const cached = clientCache.get(itemCode);
  if (cached) return cached;
  const el = document.getElementById(ITEM_DATA_ELEMENT_ID);
  if (!el?.textContent) return null;
  try {
    const block = JSON.parse(el.textContent) as ItemDataBlock;
    if (String(block.item_code) !== String(itemCode)) return null;
    const data = decodeItemData(block);
    clientCache.set(itemCode, data);
    return data;
  } catch {
    return null;
  }
}
