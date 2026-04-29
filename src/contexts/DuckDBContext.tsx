import React, { createContext, useContext, useEffect, useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

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

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: { mainModule: duckdb_wasm, mainWorker: mvp_worker },
  eh: { mainModule: duckdb_wasm_eh, mainWorker: eh_worker },
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
        const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
        const worker = new Worker(bundle.mainWorker!);
        const logger = new duckdb.ConsoleLogger();

        const database = new duckdb.AsyncDuckDB(logger, worker);
        await database.instantiate(bundle.mainModule, bundle.pthreadWorker);
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
