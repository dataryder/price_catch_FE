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
  } else if (period === "year") {
    start_period.setFullYear(start_period.getFullYear() - 1);
  }
  return data.filter(data => 
     new Date(data.date).getTime() >= new Date(start_period).getTime() &&
      new Date(data.date).getTime() <= new Date(end_period).getTime()
  );
}

const ItemMetadataDisplay: React.FC<ItemMetadataDisplayProps> = ({
  metadata,
  priceHistory,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="p-4 bg-bg-white shadow rounded-lg animate-pulse mb-6">
        <div className="h-6 bg-bg-black-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-bg-black-200 rounded w-1/2"></div>
          <div className="h-4 bg-bg-black-200 rounded w-1/3"></div>
          <div className="h-4 bg-bg-black-200 rounded w-1/2"></div>
          <div className="h-4 bg-bg-black-200 rounded w-1/4"></div>
          <div className="h-4 bg-bg-black-200 rounded w-1/3"></div>
        </div>
      </div>
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
          <div className="flex gap-2">
            <Tag size="small" variant="warning" mode="default">
              {metadata.item_category}
            </Tag>
            <Tag size="small" variant="primary" mode="pill">
              {metadata.item_group}
            </Tag>
          </div>
          {isDateValid(metadata.last_updated) && (
            <div className="flex items-center gap-1 max-sm:hidden">
              <CalendarIcon className="text-txt-black-500 h-4 w-4" />
              <p className="italic text-txt-black-500 text-xs">
                Data updated on{" "}
                {new Date(metadata.last_updated).toLocaleDateString(
                  "en-MY",
                  {}
                )}
              </p>
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
        <h3 className="text-xl text-txt-black-900 font-semibold text-center absolute top-0 right-0 z-10 px-10 py-6">
          Price History
        </h3>
        <div>
          <Tabs defaultValue="month" size="small" variant="pill">
            <TabsList>
              <TabsTrigger value="month">month</TabsTrigger>
              <TabsTrigger value="year">1y</TabsTrigger>
              <TabsTrigger value="twoyear">2y</TabsTrigger>
            </TabsList>
            <TabsContent value="month" className="p-1">
              <PriceHistoryChart data={filter_data(priceHistory, "month")} />
            </TabsContent>
            <TabsContent value="year">
              <PriceHistoryChart data={filter_data(priceHistory, "year")} />
            </TabsContent>
            <TabsContent value="twoyear">
              <PriceHistoryChart data={priceHistory} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ItemMetadataDisplay;
