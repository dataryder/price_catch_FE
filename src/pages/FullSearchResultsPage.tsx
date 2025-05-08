// src/pages/FullSearchResultsPage.tsx (New File)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AutoPagination } from "@govtechmy/myds-react/pagination";
import MydsSearchBar from '../components/SearchBar';
import SearchResults from "../components/SearchResults";
import { searchItemsFull } from "../services/apiClient";
import { SearchResultItem } from "../types";
const ITEMS_PER_PAGE = 10;
const FullSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!query) {
      setResults([]);
      setTotalItems(0);
      setIsLoading(false);
      setError(null);
      setCurrentPage(1);
      return;
    }

    const fetchFullResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchItemsFull(query);
        setResults(data);
        setTotalItems(data.length);
      } catch (err) {
        console.error("Full search failed:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load search results"
        );
        setResults([]);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFullResults();
  }, [query]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return results.slice(startIndex, endIndex);
  }, [results, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectItem = (item: SearchResultItem) => {
    navigate(`/item/${item.item_code}`);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-4 pb-6 md:pb-8 border-b border-otl-gray-200">
        <MydsSearchBar />
      </div>
      <h2 className="text-md md:text-xl mb-4 text-txt-black-900">
        Search Results for: <span className="font-bold italic">{query}</span>
      </h2>

      <SearchResults
        results={currentItems}
        onSelectItem={handleSelectItem}
        isLoading={isLoading}
        error={error}
      />
      {totalItems > ITEMS_PER_PAGE && (
        <div className="mt-6 flex justify-center">
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
  );
};

export default FullSearchResultsPage;
