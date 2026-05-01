// @ts-ignore
import React, { useState, useEffect } from "react";
import { ItemMetadata, ItemPriceHistory } from "../types";
// import { Tag } from "@govtechmy/myds-react/tag";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@govtechmy/myds-react/tabs";

import CategoryTag from "./CategoryTags";
import PriceHistoryChart from "./PriceHistoryChart";

interface ItemMetadataDisplayProps {
  metadata: ItemMetadata | null;
  priceHistory: ItemPriceHistory[];
  isLoading: boolean;
  error?: string | null;
}

const formatPrice = (price: number | null): string => {
  if (price === null || typeof price === "undefined") return "N/A";
  return `${price.toFixed(2)}`;
};

function isDateValid(dateStr: string) {
  return !isNaN(new Date(dateStr).getTime());
}

function filter_data(data: ItemPriceHistory[], period: string) {
  const end_period = new Date();
  end_period.setDate(end_period.getDate() - 1);
  const start_period = new Date();
  start_period.setDate(start_period.getDate() - 1);

  if (period === "month") {
    start_period.setMonth(start_period.getMonth() - 1);
  } else if (period === "sixmonth") {
    start_period.setMonth(start_period.getMonth() - 6);
  } else if (period === "year") {
    start_period.setFullYear(start_period.getFullYear() - 1);
  } else {
    return data; // 'twoyear' or MAX returns all
  }

  const startTime = start_period.getTime();
  const endTime = end_period.getTime();

  return data.filter((item) => {
    const itemTime = new Date(item.date).getTime();
    return itemTime >= startTime && itemTime <= endTime;
  });
}

const ProductCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[250px]">
      <div className="lg:col-span-5 flex flex-col justify-between border border-otl-gray-200/60 dark:border-otl-gray-800/60 p-8 rounded-[32px] bg-white dark:bg-[#18181B] shadow-sm">
        <div>
          <div className="h-8 bg-bg-gray-200 rounded-lg w-3/4 animate-pulse mb-3"></div>
          <div className="h-4 bg-bg-gray-200 rounded-md w-1/3 animate-pulse mb-8"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-100 dark:bg-[#27272A] rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-gray-100 dark:bg-[#27272A] rounded-2xl animate-pulse"></div>
        </div>
      </div>
      <div className="lg:col-span-7 relative border border-otl-gray-200/60 dark:border-otl-gray-800/60 p-6 rounded-[32px] w-full max-sm:h-[270px] shadow-sm flex flex-col bg-white dark:bg-[#18181B]">
        <div className="flex-grow bg-gray-100 dark:bg-[#27272A] rounded-2xl animate-pulse w-full"></div>
      </div>
    </div>
  );
};

const ItemMetadataDisplay: React.FC<ItemMetadataDisplayProps> = ({
  metadata,
  priceHistory,
  isLoading,
  error,
}) => {
  // const [chartPeriod, setChartPeriod] = useState<string>("month");

  // // Sync default tab when metadata loads
  // useEffect(() => {
  //   if (metadata) {
  //     setChartPeriod(metadata.frequency === "monthly" ? "sixmonth" : "month");
  //   }
  // }, [metadata]);

  // Lazy load: only calculate data for the currently active tab
  // const activeChartData = useMemo(() => {
  //   if (!priceHistory.length) return [];
  //   return filter_data(priceHistory, chartPeriod);
  // }, [priceHistory, chartPeriod]);

  if (isLoading) return <ProductCardSkeleton />;

  if (error || !metadata) {
    return (
      <div className="p-6 bg-bg-danger-50 dark:bg-danger-900/10 border border-otl-danger-200 dark:border-otl-danger-800 text-txt-danger dark:text-danger-400 shadow-sm rounded-2xl mb-6">
        <p className="font-semibold text-sm">
          {error || "Item details not available at this moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-6">
      {/* Product Info & Hero Stats */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 p-8 md:p-10 border border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-white dark:bg-[#18181B] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="space-y-5">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-3xl md:text-4xl font-semibold text-txt-black-900 dark:text-white tracking-tight leading-[1.1]">
              {metadata.item}
              <span className="px-2 text-xs inline align-top font-normal tracking-normal whitespace-nowrap">
                per {metadata.unit}
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <CategoryTag
                group={metadata.item_group}
                category={metadata.item_category}
                size="small"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDateValid(metadata.last_updated) && (
              <p className="text-[11px] font-semibold text-txt-black-400 dark:text-gray-500 uppercase tracking-widest">
                Last Updated on{" "}
                {new Date(metadata.last_updated).toLocaleDateString("en-MY", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Premium "Best Price" Card */}
          <div className="group relative overflow-hidden p-6 rounded-[24px] bg-gradient-to-br from-bg-success-50 to-emerald-50 dark:from-success-900/20 dark:to-emerald-900/10 border border-otl-success-200 dark:border-success-800 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)]">
            <p className="text-[10px] font-semibold text-txt-success-700 dark:text-success-400 uppercase tracking-widest mb-1.5">
              Nationwide Low
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-txt-success-600 dark:text-success-500">
                RM
              </span>
              <span className="text-4xl text-txt-success-800 dark:text-success-400">
                {formatPrice(metadata.minimum)}
              </span>
            </div>
          </div>

          {/* Median Card */}
          <div className="group relative overflow-hidden p-6 rounded-[24px] bg-bg-black-25 dark:bg-[#1D1D21] border border-otl-gray-200 dark:border-gray-800 transition-transform duration-300 hover:-translate-y-1">
            <p className="text-[10px] font-semibold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
              Median Average
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-txt-black-400 dark:text-gray-500">
                RM
              </span>
              <span className="text-4xl text-txt-black-900 dark:text-white">
                {formatPrice(metadata.median)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section Container */}
      <div className="lg:col-span-7 flex flex-col p-8 pb-3 border border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <Tabs
          variant="pill"
          defaultValue={metadata.frequency === "monthly" ? "sixmonth" : "month"}
          className="flex flex-col h-full w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-lg font-semibold text-txt-black-900 dark:text-white">
                Price Trend
              </p>
            </div>
            <TabsList className="p-1.5 border-none">
              {metadata.frequency !== "monthly" && (
                <TabsTrigger
                  value="month"
                  className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
                >
                  1M
                </TabsTrigger>
              )}
              <TabsTrigger
                value="sixmonth"
                className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
              >
                6M
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
              >
                1Y
              </TabsTrigger>
              <TabsTrigger
                value="twoyear"
                className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
              >
                MAX
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 min-h-[250px] bg-bg-black-25/50 dark:bg-transparent rounded-2xl relative">
            {metadata.frequency !== "monthly" && (
              <TabsContent
                value="month"
                className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
              >
                <PriceHistoryChart
                  data={filter_data(priceHistory, "month")}
                  period="month"
                />
              </TabsContent>
            )}
            <TabsContent
              value="sixmonth"
              className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
            >
              <PriceHistoryChart
                data={filter_data(priceHistory, "sixmonth")}
                period="month"
              />
            </TabsContent>
            <TabsContent
              value="year"
              className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
            >
              <PriceHistoryChart
                data={filter_data(priceHistory, "year")}
                period="year"
              />
            </TabsContent>
            <TabsContent
              value="twoyear"
              className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
            >
              <PriceHistoryChart
                data={filter_data(priceHistory, "twoyear")}
                period="year"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ItemMetadataDisplay;
