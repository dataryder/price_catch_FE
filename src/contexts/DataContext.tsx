import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import initWasm, { readParquet } from "parquet-wasm";
import { tableFromIPC } from "apache-arrow";
import { SearchResultInput } from "../types";

interface DataContextType {
  isReady: boolean;
  maxDate: string | null;
  globalSearchData: SearchResultInput[];
  userRegion: string | null;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  isReady: false,
  maxDate: null,
  globalSearchData: [],
  userRegion: null,
  error: null,
});

export const useData = () => useContext(DataContext);

const DATA_URL = "https://pricecatcher-lake.iwa.my/data";

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [globalSearchData, setGlobalSearchData] = useState<SearchResultInput[]>(
    [],
  );
  const [maxDate, setMaxDate] = useState<string | null>(null);
  const [userRegion, setUserRegion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    // Fetch Geo API asynchronously without blocking data initialization
    fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.country === "MY" && data?.region) {
          setUserRegion(data.region);
        }
      })
      .catch(console.error);

    const initApp = async () => {
      try {
        await initWasm();

        const res = await fetch(`${DATA_URL}/global_search.parquet`);
        if (!res.ok) throw new Error("Failed to fetch search index");

        const buffer = new Uint8Array(await res.arrayBuffer());

        const wasmTable = readParquet(buffer);
        const table = tableFromIPC(wasmTable.intoIPCStream());

        const data: any[] = [];
        let latest = "";

        for (const row of table) {
          const item = row.toJSON();

          // Pre-compute lowercased search string for ultra-fast, zero-allocation filtering
          item._search =
            `${item.item || ""} ${item.search_index || ""} ${item.item_category || ""}`.toLowerCase();

          // Clear large strings to drop memory footprint, preserve V8 shape using undefined
          item.search_index = undefined;

          if (item.last_updated && item.last_updated > latest) {
            latest = item.last_updated;
          }
          data.push(item);
        }

        setGlobalSearchData(data as SearchResultInput[]);
        setMaxDate(latest || null);
        setIsReady(true);
      } catch (err: any) {
        console.error("Initialization Failed:", err);
        setError(err.message || "Failed to load data.");
      }
    };

    initApp();
  }, []);

  const value = useMemo(
    () => ({ isReady, globalSearchData, maxDate, userRegion, error }),
    [isReady, globalSearchData, maxDate, userRegion, error],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
