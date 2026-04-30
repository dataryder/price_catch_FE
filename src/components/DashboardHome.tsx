import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getWeeklyIndexCategory } from "../services/apiClient";
import { IndexData } from "../types";
import CategoryTrendCard from "./CategoryTrendCard";
import { Button, ButtonIcon } from "@govtechmy/myds-react/button";
import { ChevronRightIcon } from "@govtechmy/myds-react/icon";

const cardDataPromise = getWeeklyIndexCategory();

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<IndexData | null>(null);

  useEffect(() => {
    cardDataPromise.then(setCardData).catch(console.error);
  }, []);

  const topMovers = useMemo(() => {
    if (!cardData) return [];
    return Object.entries(cardData)
      .map(([cat, data]) => {
        const latest = data[data.length - 1];
        return { cat, data, pop: latest?.pop_change_pct || 0 };
      })
      .sort((a, b) => Math.abs(b.pop) - Math.abs(a.pop)) // Sort by highest volatility
      .slice(0, 6);
  }, [cardData]);

  return (
    <div className="flex flex-col container mx-auto gap-6 px-4 md:px-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-4">
        <div>
          <h2 className="text-center md:text-left font-semibold text-txt-black-900 dark:text-white text-2xl tracking-tighter">
            Top Movers
          </h2>
          <p className="text-center md:text-left text-sm text-txt-black-500 dark:text-gray-500">
            Categories with highest week-over-week volatility
          </p>
        </div>
        <Button
          variant="default-outline"
          className="rounded-full shrink-0"
          onClick={() => navigate("/pulse")}
        >
          View Market Pulse
          <ButtonIcon>
            <ChevronRightIcon />
          </ButtonIcon>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cardData
          ? topMovers.map(({ cat, data }) => (
              <CategoryTrendCard key={cat} category={cat} data={data} />
            ))
          : [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[160px] w-full bg-bg-black-25 dark:bg-[#1D1D21] rounded-[24px] animate-pulse border border-otl-gray-300"
              />
            ))}
      </div>
    </div>
  );
};

export default HomeDashboard;
