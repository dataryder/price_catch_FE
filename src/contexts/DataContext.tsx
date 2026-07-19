import React, {
  useEffect,
  useState,
} from "react";
import { SearchResultInput } from "../types";
import { cleanKpdnText } from "../lib/utils";

interface DataContextType {
  isReady: boolean;
  maxDate: string | null;
  globalSearchData: SearchResultInput[];
  userRegion: string | null;
  error: string | null;
}

const DATA_URL = "https://pricecatcher-lake.iwa.my/data";

// Global Shared State for Astro Islands
let isReadyGlobal = false;
let globalSearchDataGlobal: SearchResultInput[] = [];
let maxDateGlobal: string | null = null;
let userRegionGlobal: string | null = null;
let errorGlobal: string | null = null;
let isFetchingStarted = false;

const listeners = new Set<() => void>();

const updateState = (updates: Partial<DataContextType>) => {
  if (updates.isReady !== undefined) isReadyGlobal = updates.isReady;
  if (updates.globalSearchData !== undefined) globalSearchDataGlobal = updates.globalSearchData;
  if (updates.maxDate !== undefined) maxDateGlobal = updates.maxDate;
  if (updates.userRegion !== undefined) userRegionGlobal = updates.userRegion;
  if (updates.error !== undefined) errorGlobal = updates.error;
  listeners.forEach((l) => l());
};

const startFetching = () => {
  if (isFetchingStarted || typeof window === "undefined") return;
  isFetchingStarted = true;

  // Fetch Geo API asynchronously
  fetch("/api/geo")
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.country === "MY" && data?.region) {
        updateState({ userRegion: data.region });
      }
    })
    .catch(() => {
      // Geo IP API is optional; fail silently without console noise
    });

  // Fetch Search Index
  fetch(`${DATA_URL}/global_search.json`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch search index");
      return res.json();
    })
    .then((jsonList) => {
      const data: any[] = [];
      let latest = "";

      for (const item of jsonList) {
        item.item = cleanKpdnText(item.item);
        item._search =
          `${item.item || ""} ${item.search_index || ""} ${item.item_category || ""}`.toLowerCase();
        item.search_index = undefined;

        if (item.last_updated && item.last_updated > latest) {
          latest = item.last_updated;
        }
        data.push(item);
      }

      updateState({
        globalSearchData: data as SearchResultInput[],
        maxDate: latest || null,
        isReady: true,
      });
    })
    .catch((err) => {
      console.error("Initialization Failed:", err);
      updateState({ error: err.message || "Failed to load data." });
    });
};

export const useData = () => {
  const [state, setState] = useState({
    isReady: isReadyGlobal,
    globalSearchData: globalSearchDataGlobal,
    maxDate: maxDateGlobal,
    userRegion: userRegionGlobal,
    error: errorGlobal,
  });

  useEffect(() => {
    startFetching();

    const handler = () => {
      setState({
        isReady: isReadyGlobal,
        globalSearchData: globalSearchDataGlobal,
        maxDate: maxDateGlobal,
        userRegion: userRegionGlobal,
        error: errorGlobal,
      });
    };
    listeners.add(handler);
    handler(); // Sync immediate state

    return () => {
      listeners.delete(handler);
    };
  }, []);

  return state;
};

// Backward-compatible shell for Layout.astro
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <>{children}</>;
};

