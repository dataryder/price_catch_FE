import React, { useEffect, useState, useMemo } from "react";
import { getWeeklyIndexCategory } from "../services/apiClient";
import { IndexData } from "../types";
import CategoryTrendCard from "../components/CategoryTrendCard";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@govtechmy/myds-react/select";

type SortOrder = "desc" | "asc" | "absolute";

const MarketPulsePage: React.FC = () => {
  const [cardData, setCardData] = useState<IndexData | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    getWeeklyIndexCategory().then(setCardData).catch(console.error);
  }, []);

  const sortedCategories = useMemo(() => {
    if (!cardData) return [];

    const mapped = Object.entries(cardData).map(([cat, data]) => {
      const latest = data[data.length - 1];
      return { cat, data, pop: latest?.pop_change_pct || 0 };
    });

    return mapped.sort((a, b) => {
      if (sortOrder === "absolute") {
        return Math.abs(b.pop) - Math.abs(a.pop); // Largest magnitude first
      } else if (sortOrder === "asc") {
        return a.pop - b.pop; // Highest deflation first
      } else {
        return b.pop - a.pop; // Highest inflation first (Default)
      }
    });
  }, [cardData, sortOrder]);

  return (
    <div className="flex flex-col container mx-auto 2xl:px-40 pb-20 pt-10 gap-10 px-6 min-h-[70vh] animate-in fade-in duration-500">
      {/* Header & Controls Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tighter text-txt-black-900 dark:text-white">
            Market Pulse
          </h1>
          <p className="text-lg font-medium text-txt-black-500 dark:text-gray-400">
            Week-over-week price index movements across all categories.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="w-full sm:w-auto shrink-0 flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-semibold text-txt-black-500 dark:text-gray-500 tracking-wider">
            Sort By
          </label>
          <Select
            variant="outline"
            size="small"
            value={sortOrder}
            onValueChange={(val) => setSortOrder(val as SortOrder)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="desc">Highest Inflation</SelectItem>
              <SelectItem value="asc">Highest Deflation</SelectItem>
              <SelectItem value="absolute">Largest Movers (Abs)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cardData
          ? sortedCategories.map(({ cat, data }) => (
              <CategoryTrendCard key={cat} category={cat} data={data} />
            ))
          : [...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-[160px] w-full bg-bg-black-25 dark:bg-[#1D1D21] rounded-[24px] animate-pulse border border-otl-gray-200 dark:border-gray-800"
              />
            ))}
      </div>
    </div>
  );
};

export default MarketPulsePage;
