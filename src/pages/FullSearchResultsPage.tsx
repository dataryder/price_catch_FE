import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AutoPagination } from "@govtechmy/myds-react/pagination";
import SearchResults from "../components/SearchResults";
import { SearchResultInput } from "../types";
import { useData } from "../contexts/DataContext";

const ITEMS_PER_PAGE = 10;

const FullSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);

  // 1. Use Data Context
  const { isReady, globalSearchData } = useData();

  const [allFilteredResults, setAllFilteredResults] = useState<
    SearchResultInput[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 2. Perform Native JS Filtering (replaces SQL)
  useEffect(() => {
    if (!isReady) return;

    if (!query.trim()) {
      setAllFilteredResults([]);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const term = query.trim().toLowerCase();

      // Return all matches, no slice limit
      const items = globalSearchData.filter((item) => {
        if (!item) return false;

        const nameMatch = item.item?.toLowerCase().includes(term);
        const indexMatch = item.search_index?.toLowerCase().includes(term);
        const catMatch = item.item_category?.toLowerCase().includes(term);

        return nameMatch || indexMatch || catMatch;
      });

      // Maintain sort order: Active items first, then discontinued
      items.sort((a, b) => {
        if (a.status === "active" && b.status === "discontinued") return -1;
        if (a.status === "discontinued" && b.status === "active") return 1;
        return a.item.localeCompare(b.item);
      });

      setAllFilteredResults(items as SearchResultInput[]);
      setCurrentPage(1);
    } catch (e) {
      console.error("Failed to perform full search", e);
      setError("Search functionality encountered an error.");
    } finally {
      setIsLoading(false);
    }
  }, [query, isReady, globalSearchData]);

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
