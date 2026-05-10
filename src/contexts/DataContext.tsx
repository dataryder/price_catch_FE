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

interface DataContextType {
  isReady: boolean;
  maxDate: string | null;
  globalSearchData: any[];
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  isReady: false,
  maxDate: null,
  globalSearchData: [],
  error: null,
});

export const useData = () => useContext(DataContext);

const DATA_URL = "https://pricecatcher-lake.iwa.my/data";

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [globalSearchData, setGlobalSearchData] = useState<any[]>([]);
  const [maxDate, setMaxDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initApp = async () => {
      try {
        // 1. Initialize WASM strictly before calling any other functions
        await initWasm();

        // 2. Fetch Global Search Parquet
        const res = await fetch(`${DATA_URL}/global_search.parquet`);
        if (!res.ok) throw new Error("Failed to fetch search index");

        const buffer = new Uint8Array(await res.arrayBuffer());

        // 3. Decode Parquet to WASM Table -> Convert to IPC Stream -> Load into JS Arrow
        const wasmTable = readParquet(buffer);
        const table = tableFromIPC(wasmTable.intoIPCStream());

        const data = table.toArray().map((row) => row.toJSON());

        // Compute max date directly from search data
        let latest = "";
        for (const item of data) {
          if (item.last_updated && item.last_updated > latest) {
            latest = item.last_updated;
          }
        }
        setGlobalSearchData(data);
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
    () => ({ isReady, globalSearchData, maxDate, error }),
    [isReady, globalSearchData, maxDate, error],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
