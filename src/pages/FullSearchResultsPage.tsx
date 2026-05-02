import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AutoPagination } from "@govtechmy/myds-react/pagination";
import SearchResults from "../components/SearchResults";
import { SearchResultInput } from "../types";
import { useDuckDB } from "../contexts/DuckDBContext";

const ITEMS_PER_PAGE = 10;

const FullSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);

  const { conn, isReady, isCacheReady } = useDuckDB();

  const [allFilteredResults, setAllFilteredResults] = useState<
    SearchResultInput[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isReady || !conn) return;

    if (!query.trim()) {
      setAllFilteredResults([]);
      setCurrentPage(1);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryStr = isCacheReady
          ? `SELECT f.*, COALESCE(s.status, 'active') as status 
             FROM lake.lookup_item f 
             LEFT JOIN memory.item_status s ON f.item_code = s.item_code 
             WHERE item ILIKE ? OR search_index ILIKE ? OR item_category ILIKE ?`
          : `SELECT *, 'active' as status FROM lake.lookup_item 
             WHERE item ILIKE ? OR search_index ILIKE ? OR item_category ILIKE ?`;

        const stmt = await conn.prepare(queryStr);
        const term = `%${query}%`;
        const result = await stmt.query(term, term, term);

        const items = result
          .toArray()
          .map((r: any) => r.toJSON() as SearchResultInput);
        setAllFilteredResults(items);
        setCurrentPage(1);
        stmt.close();
      } catch (e) {
        console.error("Failed to perform full search", e);
        setError("Search functionality encountered an error.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, isReady, conn]);

  const totalItems = useMemo(
    () => allFilteredResults.length,
    [allFilteredResults],
  );

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allFilteredResults.slice(startIndex, endIndex);
  }, [allFilteredResults, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectItem = (item: SearchResultInput) => {
    if (typeof item.item_code !== "undefined") {
      navigate(`/item/${item.item_code}`);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[75vh] animate-in fade-in duration-500">
      <div className="flex flex-col gap-8">
        {error && (
          <div className="bg-bg-danger-50 dark:bg-danger-900/10 text-txt-danger dark:text-danger-400 p-5 rounded-2xl text-sm font-semibold border border-otl-danger-200 dark:border-danger-800 shadow-sm">
            Error: {error}
          </div>
        )}

        <div className="flex flex-col gap-2 pb-6 border-b border-otl-gray-200/50 dark:border-gray-800">
          {!error && query ? (
            <>
              <h1 className="text-3xl md:text-4xl font-black text-txt-black-900 dark:text-white tracking-tighter">
                Results for "{query}"
              </h1>
              {!isLoading && (
                <p className="text-sm font-bold text-txt-black-400 dark:text-gray-500 uppercase tracking-widest">
                  {totalItems} items found
                </p>
              )}
            </>
          ) : (
            <h1 className="text-3xl md:text-4xl font-black text-txt-black-900 dark:text-white tracking-tighter">
              Search Database
            </h1>
          )}
        </div>

        <SearchResults
          results={currentItems}
          onSelectItem={handleSelectItem}
          isLoading={isLoading}
          error={null}
        />

        {!isLoading && !error && totalItems > ITEMS_PER_PAGE && (
          <div className="mt-8 flex justify-center pb-10">
            <AutoPagination
              page={currentPage}
              limit={ITEMS_PER_PAGE}
              count={totalItems}
              type="default"
              maxDisplay={5}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FullSearchResultsPage;
