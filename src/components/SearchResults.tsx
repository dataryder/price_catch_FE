import React from "react";
import { SearchResultInput } from "../types";
import { Tag } from "@govtechmy/myds-react/tag";
import { ChevronRightIcon } from "@govtechmy/myds-react/icon";

interface SearchResultsProps {
  results: SearchResultInput[];
  onSelectItem: (item: SearchResultInput) => void;
  isLoading: boolean;
  error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelectItem,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-[#27272A] rounded-[20px] animate-pulse shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return null; // Handled in parent
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-16 flex flex-col items-center justify-center bg-bg-black-25 dark:bg-[#1D1D21]/50 border border-dashed border-otl-gray-200 dark:border-gray-800 rounded-[32px]">
        <h3 className="text-xl font-bold text-txt-black-900 dark:text-white mb-2">
          No items found
        </h3>
        <p className="text-txt-black-500 dark:text-gray-500 font-medium">
          Try checking your spelling or use a more general term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((item) => (
        <div
          key={item.item_code}
          onClick={() => onSelectItem(item)}
          className={`group p-5 bg-white dark:bg-[#1D1D21] cursor-pointer transition-all duration-300 ease-out border border-otl-gray-200 dark:border-gray-800 hover:border-otl-success-400 dark:hover:border-success-600 rounded-[20px] flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${item.status === "discontinued" ? "opacity-60 grayscale-[50%]" : ""}`}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col grow gap-2 overflow-hidden mr-4">
              <h3
                className={`font-black text-base md:text-lg tracking-tight truncate ${item.status === "discontinued" ? "text-txt-black-500 line-through dark:text-gray-500" : "text-txt-black-900 dark:text-white group-hover:text-txt-success-700 dark:group-hover:text-success-400 transition-colors"}`}
              >
                {item.item}
              </h3>
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className="px-2.5 py-1 rounded-md bg-bg-black-50 dark:bg-gray-800 text-[10px] font-bold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                  per {item.unit}
                </span>

                {item.status === "discontinued" ? (
                  <Tag
                    size="small"
                    variant="default"
                    mode="pill"
                    className="text-[10px] font-bold bg-bg-black-100 dark:bg-gray-800 text-txt-black-500 shadow-sm"
                  >
                    Discontinued
                  </Tag>
                ) : (
                  <>
                    <Tag
                      size="small"
                      variant="warning"
                      mode="pill"
                      className="max-sm:hidden text-[10px] font-bold tracking-wide shadow-sm"
                    >
                      {item.item_group}
                    </Tag>
                    <Tag
                      size="small"
                      variant="primary"
                      mode="pill"
                      className="text-[10px] font-bold tracking-wide shadow-sm"
                    >
                      {item.item_category}
                    </Tag>
                  </>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-bg-black-25 dark:bg-gray-800/80 border border-otl-gray-100 dark:border-gray-700 group-hover:bg-bg-success-50 dark:group-hover:bg-success-900/30 group-hover:border-otl-success-200 dark:group-hover:border-success-800 flex items-center justify-center transition-all shrink-0">
              <ChevronRightIcon className="text-txt-black-400 dark:text-gray-400 group-hover:text-txt-success-600 dark:group-hover:text-success-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
