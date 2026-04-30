import React, { createContext, useContext, useEffect, useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  isReady: boolean;
  error: string | null; // Added error state
}

const DuckDBContext = createContext<DuckDBContextType>({
  db: null,
  conn: null,
  isReady: false,
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

export const DuckDBProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDB = async () => {
      try {
        const bundle = await duckdb.selectBundle(CDN_BUNDLES);
        const workerBlob = new Blob(
          [`importScripts("${bundle.mainWorker}");`],
          {
            type: "text/javascript",
          },
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
      } catch (err: any) {
        console.error("DuckDB Init Failed:", err);
        setError(err.message || "Failed to connect to Data Lake.");
      }
    };
    initDB();
  }, []);

  return (
    <DuckDBContext.Provider value={{ db, conn, isReady, error }}>
      {children}
    </DuckDBContext.Provider>
  );
};
