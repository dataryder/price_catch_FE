import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useData } from "../contexts/DataContext";
import { SearchResultInput } from "../types";
import { slugify } from "../lib/slug";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarClearButton,
  SearchBarResults,
  SearchBarResultsList,
  SearchBarResultsItem,
} from "@govtechmy/myds-react/search-bar";
import { Spinner } from "@govtechmy/myds-react/spinner";
import { ChevronRightIcon, SearchIcon } from "@govtechmy/myds-react/icon";
import { cn } from "../lib/utils";

interface SearchBarProps {
  variant?: "default" | "minimal";
}

const MydsSearchBar: React.FC<SearchBarProps> = ({ variant = "default" }) => {
  const isMinimal = variant === "minimal";

  // 1. Use the new Data Context instead of DuckDB
  const { isReady, globalSearchData } = useData();

  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [liveResults, setLiveResults] = useState<SearchResultInput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const isMac =
    typeof window !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("mac");

  // Global Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isMinimal) {
          setIsModalOpen(true);
        } else {
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMinimal, isModalOpen]);

  // Autofocus when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);

    const term = newQuery?.trim().toLowerCase();

    if (!isReady || !term || !globalSearchData) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const results = globalSearchData
      .filter((item: any) => item && item._search?.includes(term))
      .slice(0, 5);

    setLiveResults(results);
    setIsSearching(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setHasFocus(false);
      setIsModalOpen(false);
      window.location.assign(`/search-results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const searchInterface = (
    <form onSubmit={handleSearchSubmit} className="w-full relative">
      <SearchBar
        size="large"
        onBlur={(e) => {
          if (
            !e.currentTarget.contains(e.relatedTarget as Node) &&
            !isModalOpen
          ) {
            setHasFocus(false);
          }
        }}
      >
        <SearchBarInputContainer
          className={cn(
            "flex items-center gap-3 px-4 transition-all duration-300 shadow-sm",
            "bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-xl border border-otl-gray-200/80 dark:border-[#27272A]",
            "h-14 rounded-2xl",
            (hasFocus || isModalOpen) &&
            "ring-4 ring-success-500/15 has-[input:focus]:ring-success-500 border-otl-success-400 dark:border-otl-success-500 shadow-lg bg-bg-white",
          )}
        >
          <SearchIcon className="text-txt-black-500 h-5 w-5" />

          <SearchBarInput
            ref={inputRef}
            placeholder="Search products, categories..."
            value={query}
            onValueChange={handleQueryChange}
            onFocus={() => setHasFocus(true)}
            className="flex-1 ring-0 focus:ring-0 placeholder:text-txt-black-300 dark:text-white dark:placeholder:text-gray-500 p-0"
          />

          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <SearchBarClearButton
                onClick={() => {
                  setQuery("");
                  setLiveResults([]);
                  inputRef.current?.focus();
                }}
                className="hover:bg-bg-black-50 dark:hover:bg-gray-800 rounded-lg p-1 transition-colors"
              />
            )}
          </div>
        </SearchBarInputContainer>

        <SearchBarResults
          open={query.length > 0 && (hasFocus || isModalOpen)}
          className={cn(
            "rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/95 dark:bg-[#1D1D21]/95 backdrop-blur-2xl border-otl-gray-200/80 dark:border-[#27272A] overflow-hidden",
            isModalOpen
              ? "relative mt-3"
              : "absolute w-full left-0 top-full mt-2 z-[9999]",
          )}
        >
          <div>
            {isSearching ? (
              <div className="flex items-center justify-center p-10">
                <Spinner size="large" />
              </div>
            ) : liveResults.length > 0 ? (
              <SearchBarResultsList className="p-2 scrollbar overflow-y-auto max-h-[400px]">
                {liveResults.map((item) => (
                  <SearchBarResultsItem
                    key={item.item_code}
                    value={item.item_code.toString()}
                    onSelect={() => {
                      setHasFocus(false);
                      setIsModalOpen(false);
                      setQuery("");
                      window.location.assign(`/item/${slugify(item.item || "")}-${item.item_code}`);
                    }}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-bg-black-50 dark:hover:bg-[#27272A] cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none"
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="text-sm font-semibold text-txt-black-900 dark:text-white truncate tracking-tight group-hover:text-txt-black-600 dark:group-hover:text-txt-black-400 transition-colors">
                        {item.item}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-txt-black-400 dark:text-gray-500">
                          per {item.unit}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-otl-gray-300 dark:bg-gray-700"></span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-txt-black-500 dark:text-gray-400 truncate">
                          {item.item_category}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 min-w-8 min-h-8 rounded-full flex items-center justify-center bg-transparent group-hover:bg-white dark:group-hover:bg-[#3F3F46] shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                      <ChevronRightIcon className="w-4 h-4 text-txt-black-600 dark:text-txt-black-400" />
                    </div>
                  </SearchBarResultsItem>
                ))}

                <div
                  onClick={() => handleSearchSubmit()}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-bg-black-50 dark:hover:bg-[#27272A] cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none"
                >
                  <span className="text-txt-black-500 font-medium text-sm">
                    See all results for "{query}"
                  </span>
                </div>
              </SearchBarResultsList>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-txt-black-900 dark:text-white">
                  No exact matches
                </p>
                <p className="text-xs text-txt-black-400 mt-1">
                  Try a more general search term
                </p>
              </div>
            )}
          </div>
        </SearchBarResults>
      </SearchBar>
    </form>
  );

  if (isMinimal) {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2 h-10 bg-bg-white dark:bg-bg-black-200 border border-otl-gray-200 dark:border-gray-800 rounded-xl hover:bg-white dark:hover:bg-[#27272A] hover:border-otl-gray-300 dark:hover:border-gray-700 transition-all text-txt-black-500 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400"
        >
          <SearchIcon className="w-4 h-4 shrink-0 text-txt-black-400" />
          <span className="text-sm flex-1 text-left truncate text-txt-black-400">
            Search...
          </span>
          <kbd className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-otl-gray-200/80 dark:border-gray-700 bg-bg-black-50 dark:bg-bg-black-200 shadow-sm text-txt-black-500">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        </button>

        {isModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4 sm:px-6">
              <div
                className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => setIsModalOpen(false)}
              />
              <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                {searchInterface}
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto z-[100]">
      {searchInterface}
    </div>
  );
};

export default MydsSearchBar;
