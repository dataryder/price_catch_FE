import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useData } from "../contexts/DataContext";
import { CategoryData } from "../types";
import {
  getCategoryHierarchy,
  getItemsByCategory,
} from "../services/apiClient";
import { ChevronRightIcon, SearchIcon } from "@govtechmy/myds-react/icon";
import { Tag } from "@govtechmy/myds-react/tag";
import { cn } from "../lib/utils";

const CategoryPage: React.FC = () => {
  const { group, category } = useParams();
  const currentCategory = category ? category.replace(/\|/g, "/") : group;

  useDocumentTitle(
    currentCategory ? `Categories - ${currentCategory}` : "Categories",
  );

  const navigate = useNavigate();
  const { isReady, globalSearchData } = useData();

  const [hierarchy, setHierarchy] = useState<CategoryData[]>([]);
  const [itemsList, setItemsList] = useState<any[]>([]);

  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (!isReady) return;
    setIsLoadingHierarchy(true);
    getCategoryHierarchy(globalSearchData)
      .then(setHierarchy)
      .catch(console.error)
      .finally(() => setIsLoadingHierarchy(false));
  }, [isReady, globalSearchData]);

  useEffect(() => {
    if (!isReady || !group || !category) {
      setItemsList([]);
      return;
    }
    setIsLoadingItems(true);
    getItemsByCategory(globalSearchData, group, category)
      .then(setItemsList)
      .catch(console.error)
      .finally(() => setIsLoadingItems(false));
  }, [isReady, globalSearchData, group, category]);

  const availableGroups = useMemo(() => {
    return Array.from(new Set(hierarchy.map((h) => h.item_group)));
  }, [hierarchy]);

  const availableCategories = useMemo(() => {
    if (!group) return [];
    return hierarchy
      .filter((h) => h.item_group === group)
      .map((h) => h.item_category);
  }, [hierarchy, group]);

  // Separate the items into Active and Discontinued arrays
  const activeItems = useMemo(
    () => itemsList.filter((i) => i.status !== "discontinued"),
    [itemsList],
  );
  const discontinuedItems = useMemo(
    () => itemsList.filter((i) => i.status === "discontinued"),
    [itemsList],
  );

  const renderItemCard = (item: any) => (
    <div
      key={item.item_code}
      tabIndex={0}
      className={cn(
        "group flex flex-row justify-between items-center p-5 gap-4 rounded-lg border border-otl-gray-200 dark:border-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer outline-none shrink-1 overflow-clip bg-white dark:bg-[#1D1D21]",
        item.status === "discontinued" && "opacity-60 grayscale-[50%]",
      )}
      onClick={() => navigate(`/item/${item.item_code}`)}
    >
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <h4
          className={cn(
            "font-semibold tracking-tight truncate",
            item.status === "discontinued"
              ? "text-txt-black-500 line-through dark:text-gray-500"
              : "text-txt-black-900 dark:text-white group-hover:text-txt-black-900 dark:group-hover:text-black-400",
          )}
        >
          {item.item}
        </h4>

        <div className="flex gap-2 items-center">
          <span className="text-[10px] font-bold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest bg-bg-black-50 dark:bg-gray-800 px-2 py-1 rounded-md">
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
            <Tag
              size="small"
              variant="primary"
              mode="pill"
              className="text-[10px] font-bold tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75 shadow-sm"
            >
              View Prices
            </Tag>
          )}
        </div>
      </div>
      <div className="w-10 h-10 flex items-center justify-center transition-all">
        <ChevronRightIcon className="w-4 h-4 text-txt-black-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col container mx-auto 2xl:px-40 pb-20 pt-10 gap-10 px-6 min-h-[70vh]">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tighter text-txt-black-900 dark:text-white">
          Explore Categories
        </h1>
        <p className="text-lg text-txt-black-500 dark:text-gray-400">
          Drill down into product groups to find specific items.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* GROUPS SECTION */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-black-500 dark:text-gray-500">
            Product Groups
          </h2>

          {!isReady || isLoadingHierarchy ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-28 bg-bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {availableGroups.map((groupName) => {
                const isSelected = groupName === group;
                return (
                  <button
                    key={groupName}
                    className={`capitalize px-5 py-2 rounded-[14px] text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${
                      isSelected
                        ? "bg-txt-black-900 text-txt-white shadow-md scale-[1.02]"
                        : "bg-white dark:bg-[#1D1D21] text-txt-black-600 dark:text-gray-300 hover:bg-bg-black-25 dark:hover:bg-[#27272A] hover:text-txt-black-900 border border-otl-gray-200 dark:border-gray-800 shadow-sm"
                    }`}
                    onClick={() => navigate(`/category/${groupName}`)}
                  >
                    {groupName.toLowerCase()}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CATEGORIES SECTION */}
        {group && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-black-500 dark:text-gray-500">
              Sub-Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((catName) => {
                const urlSafeCatName = catName
                  .replace("/", "|")
                  .replace("/", "|");
                const isSelected = urlSafeCatName === category;

                return (
                  <button
                    key={catName}
                    className={`capitalize px-4 py-1.5 rounded-xl text-[13px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${
                      isSelected
                        ? "bg-bg-success-50 dark:bg-success-900/20 text-txt-success-700 dark:text-success-400 border border-otl-success-300 dark:border-success-800 shadow-sm"
                        : "bg-transparent text-txt-black-500 dark:text-gray-400 hover:text-txt-black-900 dark:hover:text-white border border-transparent hover:bg-white dark:hover:bg-gray-800 shadow-none hover:shadow-sm"
                    }`}
                    onClick={() =>
                      navigate(`/category/${group}/${urlSafeCatName}`)
                    }
                  >
                    {catName.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ITEMS LIST SECTION */}
      {group && category && (
        <div className="mt-4 pt-8 border-t border-otl-gray-200/50 dark:border-gray-800/50">
          {isLoadingItems ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white dark:bg-[#1D1D21] border border-otl-gray-200 dark:border-gray-800 rounded-[20px] animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : itemsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-bg-black-25 dark:bg-[#1D1D21]/50">
              <div className="w-12 h-12 rounded-full bg-bg-black-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                <SearchIcon className="w-5 h-5 text-txt-black-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-txt-black-900 dark:text-white">
                No items found
              </h3>
              <p className="text-txt-black-500 dark:text-gray-500 font-medium text-sm">
                Try selecting a different sub-category above.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {/* Active Items Section */}
              {activeItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activeItems.map(renderItemCard)}
                  </div>
                </div>
              )}

              {/* Discontinued Items Section */}
              {discontinuedItems.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-txt-black-400 dark:text-gray-500 border-b border-otl-gray-200 dark:border-gray-800 pb-2">
                    Discontinued Items
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {discontinuedItems.map(renderItemCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
