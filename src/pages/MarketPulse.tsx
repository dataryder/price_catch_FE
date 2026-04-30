import React, { useEffect, useState, useMemo } from "react";
import { getWeeklyIndexCategory } from "../services/apiClient";
import { IndexData } from "../types";
import CategoryTrendCard from "../components/CategoryTrendCard";

const MarketPulsePage: React.FC = () => {
  const [cardData, setCardData] = useState<IndexData | null>(null);

  useEffect(() => {
    getWeeklyIndexCategory().then(setCardData).catch(console.error);
  }, []);

  const sortedCategories = useMemo(() => {
    if (!cardData) return [];
    return Object.entries(cardData)
      .map(([cat, data]) => {
        const latest = data[data.length - 1];
        return { cat, data, pop: latest?.pop_change_pct || 0 };
      })
      .sort((a, b) => b.pop - a.pop); // Sort highest inflation to highest deflation
  }, [cardData]);

  return (
    <div className="flex flex-col container mx-auto 2xl:px-40 pb-20 pt-10 gap-10 px-6 min-h-[70vh] animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-txt-black-900 dark:text-white">
          Market Pulse
        </h1>
        <p className="text-lg font-medium text-txt-black-500 dark:text-gray-400">
          Week-over-week price index movements across all categories.
        </p>
      </div>

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
