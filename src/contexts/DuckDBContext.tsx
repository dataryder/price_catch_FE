import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  isReady: boolean;
  isCacheReady: boolean;
  maxDate: string | null; // Add maxDate
  error: string | null;
}

const DuckDBContext = createContext<DuckDBContextType>({
  db: null,
  conn: null,
  isReady: false,
  isCacheReady: false,
  maxDate: null,
  error: null,
});

export const useDuckDB = () => useContext(DuckDBContext);

const DUCKDB_VERSION = "1.33.1-dev53.0";
const CDN_URL = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/dist`;

const CDN_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: `${CDN_URL}/duckdb-mvp.wasm`,
    mainWorker: `${CDN_URL}/duckdb-browser-mvp.worker.js`,
  },
  eh: {
    mainModule: `${CDN_URL}/duckdb-eh.wasm`,
    mainWorker: `${CDN_URL}/duckdb-browser-eh.worker.js`,
  },
};

const bundlePromise = duckdb.selectBundle(CDN_BUNDLES);

export const DuckDBProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [maxDate, setMaxDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const bundle = await bundlePromise;
        const workerBlob = new Blob(
          [`importScripts("${bundle.mainWorker}");`],
          { type: "text/javascript" },
        );
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);
        const logger = new duckdb.ConsoleLogger();

        const database = new duckdb.AsyncDuckDB(logger, worker);
        await database.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);

        const connection = await database.connect();

        await connection.query(`
                    INSTALL ducklake; LOAD ducklake;
                    ATTACH 'https://pricecatcher-lake.iwa.my/catalog.ducklake' AS lake (TYPE DUCKLAKE);
                `);

        setDb(database);
        setConn(connection);
        setIsReady(true);

        // Fetch global max date instantly using Zone Maps
        connection
          .query(
            `SELECT CAST(MAX(date) AS VARCHAR) as max_date FROM lake.prices`,
          )
          .then((res) => {
            const val = res.toArray()[0]?.toJSON().max_date;
            if (val) setMaxDate(val);
          })
          .catch(console.error);

        // Build in-memory cache asynchronously without blocking the UI
        connection
          .query(
            `
            CREATE TABLE memory.item_status AS 
            SELECT item_code, 
                   CASE WHEN MAX(date) < current_date() - INTERVAL 60 DAY THEN 'discontinued' ELSE 'active' END as status
            FROM lake.prices 
            GROUP BY item_code;
        `,
          )
          .then(() => {
            setIsCacheReady(true);
          })
          .catch(console.error);
      } catch (err: any) {
        console.error("DuckDB Init Failed:", err);
        setError(err.message || "Failed to connect to Data Lake.");
      }
    };
    initDB();
  }, []);

  const value = useMemo(
    () => ({ db, conn, isReady, isCacheReady, maxDate, error }),
    [db, conn, isReady, isCacheReady, maxDate, error],
  );

  return (
    <DuckDBContext.Provider value={value}>{children}</DuckDBContext.Provider>
  );
};
