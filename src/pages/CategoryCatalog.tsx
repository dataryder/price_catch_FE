import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDuckDB } from "../contexts/DuckDBContext";
import { CategoryData } from "../types";
import {
  getCategoryHierarchy,
  getItemsByCategory,
} from "../services/apiClient";
import { ChevronRightIcon } from "@govtechmy/myds-react/icon";
import { Tag } from "@govtechmy/myds-react/tag";

const CategoryPage: React.FC = () => {
  const { group, category } = useParams();
  const navigate = useNavigate();
  const { conn, isReady } = useDuckDB();

  const [hierarchy, setHierarchy] = useState<CategoryData[]>([]);
  const [itemsList, setItemsList] = useState<any[]>([]);

  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (!isReady || !conn) return;
    setIsLoadingHierarchy(true);
    getCategoryHierarchy(conn)
      // @ts-ignore
      .then(setHierarchy)
      .catch(console.error)
      .finally(() => setIsLoadingHierarchy(false));
  }, [isReady, conn]);

  useEffect(() => {
    if (!isReady || !conn || !group || !category) {
      setItemsList([]);
      return;
    }
    setIsLoadingItems(true);
    getItemsByCategory(conn, group, category)
      .then(setItemsList)
      .catch(console.error)
      .finally(() => setIsLoadingItems(false));
  }, [isReady, conn, group, category]);

  const availableGroups = useMemo(() => {
    return Array.from(new Set(hierarchy.map((h) => h.item_group)));
  }, [hierarchy]);

  const availableCategories = useMemo(() => {
    if (!group) return [];
    return hierarchy
      .filter((h) => h.item_group === group)
      .map((h) => h.item_category);
  }, [hierarchy, group]);

  return (
    <div className="flex flex-col container mx-auto 2xl:px-40 pb-20 pt-10 gap-10 px-4 min-h-[70vh]">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-txt-black-900 dark:text-white">
          Explore Categories
        </h1>
        <p className="text-lg font-medium text-txt-black-500 dark:text-gray-400">
          Drill down into product groups to find specific items.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* GROUPS SECTION */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-txt-black-400 dark:text-gray-500">
            Product Groups
          </h2>

          {!isReady || isLoadingHierarchy ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-28 bg-gray-200 dark:bg-[#27272A] rounded-xl animate-pulse"
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
                    className={`capitalize px-5 py-2 rounded-[14px] text-sm font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${
                      isSelected
                        ? "bg-txt-black-900 dark:bg-white text-white dark:text-black shadow-md scale-[1.02]"
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
            <h2 className="text-[11px] font-black uppercase tracking-widest text-txt-black-400 dark:text-gray-500">
              Sub-Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((catName) => {
                const urlSafeCatName = catName.replace("/", " | ");
                const isSelected = urlSafeCatName === category;

                return (
                  <button
                    key={catName}
                    className={`capitalize px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${
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
                  className="h-24 bg-gray-100 dark:bg-[#27272A] rounded-[20px] animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : itemsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-bg-black-25 dark:bg-[#1D1D21]/50">
              <div className="w-12 h-12 rounded-full bg-bg-black-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                <span className="text-xl opacity-50">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-txt-black-900 dark:text-white">
                No items found
              </h3>
              <p className="text-txt-black-500 dark:text-gray-500 font-medium text-sm">
                Try selecting a different sub-category above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {itemsList.map((item) => (
                <div
                  key={item.item_code}
                  tabIndex={0}
                  className="group relative flex justify-between items-center p-5 bg-white dark:bg-[#1D1D21] rounded-[20px] border border-otl-gray-200 dark:border-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-otl-success-300 dark:hover:border-success-700 hover:-translate-y-1 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400"
                  onClick={() => navigate(`/item/${item.item_code}`)}
                >
                  <div className="flex flex-col gap-2 w-full pr-4">
                    <h4 className="font-black text-txt-black-900 dark:text-white text-base tracking-tight truncate group-hover:text-txt-success-700 dark:group-hover:text-success-400 transition-colors">
                      {item.item}
                    </h4>

                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest bg-bg-black-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        per {item.unit}
                      </span>
                      <Tag
                        size="small"
                        variant="primary"
                        mode="pill"
                        className="text-[10px] font-bold tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75 shadow-sm"
                      >
                        View Prices
                      </Tag>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-bg-black-25 dark:bg-gray-800/80 border border-otl-gray-100 dark:border-gray-700 group-hover:bg-bg-success-50 dark:group-hover:bg-success-900/30 group-hover:border-otl-success-200 dark:group-hover:border-success-800 flex items-center justify-center transition-all shrink-0">
                    <ChevronRightIcon className="w-4 h-4 text-txt-black-400 dark:text-gray-400 group-hover:text-txt-success-600 dark:group-hover:text-success-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
