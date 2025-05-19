import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Fuse from 'fuse.js';
import { AutoPagination } from "@govtechmy/myds-react/pagination";
import MydsSearchBar from '../components/SearchBar';
import SearchResults from "../components/SearchResults";
import { SearchResultInput } from "../types";
import itemsDataFromFile from '../data/items.json';

const ITEMS_PER_PAGE = 10;

const allSearchableItems: SearchResultInput[] = itemsDataFromFile as SearchResultInput[];

const fuseOptions: object = {
  keys: [
    { name: 'item', weight: 0.4 },
    { name: 'item_group', weight: 0.05 },
    { name: 'item_category', weight: 0.05 },
    { name: 'item_eng', weight: 0.4 },
    { name: 'item_group_eng', weight: 0.05 },
    { name: 'item_category_eng', weight: 0.05 },
  ],
  threshold: 0.2,
  ignoreLocation: true
};

const FullSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);

  const [allFilteredResults, setAllFilteredResults] = useState<SearchResultInput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fuseInstance = useMemo(() => {
    if (allSearchableItems && allSearchableItems.length > 0) {
      try {
        return new Fuse(allSearchableItems, fuseOptions);
      } catch (e) {
        console.error("Failed to initialize Fuse for full search:", e);
        setError("Search functionality could not be initialized.");
        return null;
      }
    }
    console.warn("Full search page: No items data available.");
    setError("No data available for searching.");
    return null;
  }, []);

  useEffect(() => {
    if (!fuseInstance) {
      setAllFilteredResults([]);
      return;
    }

    if (!query) {
      setAllFilteredResults([]);
      setCurrentPage(1);
      return;
    }


    const searchResults = fuseInstance.search(query);
    const items = searchResults.map(result => result.item);
    setAllFilteredResults([]);
    setAllFilteredResults(items);
    setCurrentPage(1);
    setIsLoading(false);

  }, [query, fuseInstance]);

  const totalItems = useMemo(() => allFilteredResults.length, [allFilteredResults]);

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
    if (typeof item.item_code !== 'undefined') {
      navigate(`/item/${item.item_code}`);
    } else {
      console.warn("Cannot navigate: item_code is missing from selected item.", item);
    }
  };

  return (
    <div className="max-sm:p-6 container mx-auto py-8 px-4 2xl:px-40">
      <div className="mb-4 pb-6 md:pb-8 border-b border-otl-gray-200">
        <MydsSearchBar />
      </div>

      {error && (
        <p className="text-danger-500 text-center p-4">Error: {error}</p>
      )}

      {!error && query && (
        <h2 className="text-md md:text-xl mb-4 text-txt-black-900">
          Search Results for: <span className="font-bold italic">{query}</span>
          {!isLoading && <span className="text-sm text-txt-black-600"> ({totalItems} found)</span>}
        </h2>
      )}
      {!error && !query && (
        <h2 className="text-md md:text-xl mb-4 text-txt-black-900">
          Please enter a search term.
        </h2>
      )}


      <SearchResults
        results={currentItems}
        onSelectItem={handleSelectItem}
        isLoading={isLoading}
        error={null}
      />

      {!isLoading && !error && totalItems > ITEMS_PER_PAGE && (
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