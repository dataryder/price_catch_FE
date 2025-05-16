// src/components/ItemMetadataDisplay.tsx

import React from "react";
import { ItemMetadata, ItemPriceHistory } from "../types"; // Assuming ItemMetadata has name, unit, group, category
import { Tag } from "@govtechmy/myds-react/tag";
import { CalendarIcon, QuestionCircleIcon } from "@govtechmy/myds-react/icon";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@govtechmy/myds-react/tooltip";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@govtechmy/myds-react/tabs";

import PriceHistoryChart from "./PriceHistoryChart";
import CategoryTag from "./CategoryTags";

interface ItemMetadataDisplayProps {
  metadata: ItemMetadata | null;
  priceHistory: ItemPriceHistory[];
  isLoading: boolean; // Combined loading state for metadata/stats
  error?: string | null; // Any relevant error message
}

// Helper to format price or show placeholder
const formatPrice = (price: number | null): string => {
  if (price === null || typeof price === "undefined") {
    return "N/A";
  }
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
  }
  return data.filter(data => new Date(data.date).getTime() >= new Date(start_period).getTime() && new Date(data.date).getTime() <= new Date(end_period).getTime()
  );
}

const SkeletonIcon = ({ className = "h-4 w-4" }) => (
  <div className={`bg-bg-black-300 rounded-full animate-pulse ${className}`}></div>
);

const ProductCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 items-center md:items-stretch justify-between gap-2 md:gap-4 min-h-[400px] md:min-h-[300px]">
      <div className="flex flex-col gap-2 md:gap-4 items-center md:border md:border-otl-gray-200 p-4 rounded-md md:shadow-md">
        <div className="h-6 md:h-7 bg-bg-black-300 rounded w-3/4 animate-pulse mb-1"></div>
        <div className="h-6 md:h-7 mx-5 bg-bg-black-300 rounded w-3/4 animate-pulse mb-1"></div>
        <div className="h-6 md:h-7 bg-bg-black-300 rounded w-3/4 animate-pulse mb-1"></div>

        <div className="grid grid-cols-2 gap-4 w-100">
          <div className="flex flex-col border border-otl-gray-200 rounded-md p-3 md:p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-bg-black-300 rounded w-8 animate-pulse"></div>
              <SkeletonIcon className="h-4 w-4" />
            </div>
            <div className="h-8 bg-bg-black-300 rounded w-3/4 mx-auto animate-pulse my-2"></div>
            <div className="h-4 bg-bg-black-300 rounded w-full mx-auto animate-pulse mt-2 pt-2 border-t border-otl-gray-300"></div>
          </div>
          <div className="flex flex-col border border-otl-gray-200 rounded-md p-3 md:p-4 space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-bg-black-300 rounded w-8 animate-pulse"></div>
              <SkeletonIcon className="h-4 w-4" />
            </div>
            <div className="h-8 bg-bg-black-300 rounded w-3/4 mx-auto animate-pulse my-2"></div>
            <div className="h-4 bg-bg-black-300 rounded w-full mx-auto animate-pulse mt-2 pt-2 border-t border-otl-gray-300"></div>
          </div>
        </div>
      </div>

      <div className="relative border border-otl-gray-200 p-4 rounded-md w-full max-sm:h-[270px] md:flex-auto md:shadow-md flex flex-col">
        <div className="mb-4">
          <div className="flex items-center justify-between pb-2 px-1 md:px-4">
            <div className="flex space-x-1 md:space-x-2">
              <div className="h-7 md:h-8 w-10 md:w-12 bg-bg-black-300 rounded-md animate-pulse"></div>
              <div className="h-7 md:h-8 w-10 md:w-12 bg-bg-black-300 rounded-md animate-pulse"></div>
              <div className="h-7 md:h-8 w-10 md:w-12 bg-bg-black-300 rounded-md animate-pulse"></div>
              <div className="h-7 md:h-8 w-10 md:w-12 bg-bg-black-300 rounded-md animate-pulse"></div>
            </div>
            <div className="h-5 md:h-6 bg-bg-black-300 rounded w-24 md:w-32 animate-pulse max-sm:hidden"></div>
          </div>
        </div>

        <div className="flex-grow bg-bg-black-300 rounded animate-pulse w-full min-h-[180px] md:min-h-0">
        </div>
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
  if (isLoading) {
    return (
      <ProductCardSkeleton />
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-bg-danger-50 border border-otl-danger-200 text-txt-danger shadow rounded-lg mb-6">
        <p>Error loading item details: {error}</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="p-4 bg-bg-warning-50 border border-otl-warning-200 text-warning shadow rounded-lg mb-6">
        <p>Item details not available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 items-center md:items-stretch justify-between gap-2 md:gap-4 min-h-100">
      <div className="flex flex-col gap-2 md:gap-4 items-center md:border md:border-otl-gray-200 p-4 rounded-md md:shadow-card">
        <h3 className="text-lg md:text-xl font-semibold text-txt-black-700 text-center md:pb-1">
          {metadata.item}
          <span className="px-2 text-xs inline align-top">
            per {metadata.unit}
          </span>
        </h3>

        <div className="flex flex-col gap-1 md:gap-4 items-center">
          <CategoryTag group={metadata.item_group} category={metadata.item_category} size="small" />
          {isDateValid(metadata.last_updated) && (
            <div className="flex items-center gap-1">
              <CalendarIcon className="text-txt-black-500 h-4 w-4" />
              <div className="italic text-txt-black-500 text-xs">
                <span className="max-sm:hidden">Data updates {" "}</span>
                <Tag size='small'
                  variant={(metadata.frequency === "daily") ? "success" : (metadata.frequency === "weekly") ? "warning" : "danger"}
                  mode='default'>
                  {metadata.frequency}
                </Tag> {" | "}
                {new Date(metadata.last_updated).toLocaleDateString(
                  "en-MY",
                  {}
                )}
              </div>
            </div>
          )}
          {!isDateValid(metadata.last_updated) && (
            <div>
              <p className="italic text-txt-black-500 text-xs text-center">
                Data not available
              </p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col border border-otl-gray-200 rounded-md max-w-30 max-h-50 text-txt-success p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm">RM</div>
              <Tooltip>
                <TooltipTrigger>
                  <QuestionCircleIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Aggregated from prices nationwide
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-3xl font-semibold text-center">
              {formatPrice(metadata.minimum)}
            </div>
            <div className="text-sm text-center border-t border-otl-gray-300 mt-2 pt-2">
              Lowest Price
            </div>
          </div>
          <div className="flex flex-col border border-otl-gray-200 rounded-md max-w-30 max-h-50 text-txt-black-900 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm">RM</div>
              <Tooltip>
                <TooltipTrigger>
                  <QuestionCircleIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  Aggregated from prices nationwide
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-3xl font-semibold text-center">
              {formatPrice(metadata.median)}
            </div>
            <div className="text-sm text-center border-t border-otl-gray-300 mt-2 pt-2">
              Median Price
            </div>
          </div>
        </div>
      </div>
      <div className="relative border border-otl-gray-200 p-4 rounded-md w-full max-sm:h-[270px] md:flex-auto md:shadow-card">
        <div>
          <Tabs defaultValue={!(metadata.frequency === "monthly") ? "month" : "sixmonth"} size="small" variant="pill">
            <TabsList className="px-4" width="full">
              {!(metadata.frequency === "monthly") ? <TabsTrigger value="month">1m</TabsTrigger> : []}
              <TabsTrigger value="sixmonth">6m</TabsTrigger>
              <TabsTrigger value="year">1y</TabsTrigger>
              <TabsTrigger value="twoyear">2y</TabsTrigger>
              <h3 className="md:text-xl text-txt-black-900 font-semibold text-center max-sm:hidden grow text-end">Price History</h3>
            </TabsList>
            {!(metadata.frequency === "monthly") ? <TabsContent value="month" className="p-1">
              <PriceHistoryChart data={filter_data(priceHistory, "month")} period="month" />
            </TabsContent> : []}
            <TabsContent value="sixmonth">
              <PriceHistoryChart data={filter_data(priceHistory, "sixmonth")} period="month" />
            </TabsContent>
            <TabsContent value="year">
              <PriceHistoryChart data={filter_data(priceHistory, "year")} period="year" />
            </TabsContent>
            <TabsContent value="twoyear">
              <PriceHistoryChart data={priceHistory} period="year" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div >
  );
};

export default ItemMetadataDisplay;
