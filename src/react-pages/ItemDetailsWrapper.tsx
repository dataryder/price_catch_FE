import React, { useState, useEffect, useMemo } from "react";

import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useSEO } from "../hooks/useSEO";
import { useData } from "../contexts/DataContext";
import { DataTable } from "@govtechmy/myds-react/data-table";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@govtechmy/myds-react/select";
import { Tag } from "@govtechmy/myds-react/tag";
import { Button, ButtonIcon } from "@govtechmy/myds-react/button";
import { DownloadIcon } from "@govtechmy/myds-react/icon";
import { DatePicker } from "@govtechmy/myds-react/date-picker";
import {
  DateRangePicker,
  DateRange,
} from "@govtechmy/myds-react/daterange-picker";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
} from "@govtechmy/myds-react/dropdown";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { ItemMetadata, ItemLatest, ItemPriceHistory } from "../types";
import { getItemPrices, getItemPriceHistory } from "../services/apiClient";
import ItemMetadataDisplay from "../components/ItemMetadata";
import LocalityAnalysis, {
  LocalityAnalysisSkeleton,
} from "../components/LocalityAnalysis";
import { Spinner } from "@govtechmy/myds-react/spinner";

const DEFAULT_STATE = "Selangor";
const ALL_DISTRICTS_VALUE = "__ALL_DISTRICTS__";

// Helper to map Cloudflare's ISO region names to DOSM's exact state names
const normalizeCloudflareRegion = (region: string): string => {
  const r = region.toLowerCase();
  if (r.includes("penang")) return "Pulau Pinang";
  if (r.includes("malacca")) return "Melaka";
  if (r.includes("kuala lumpur")) return "W.P. Kuala Lumpur";
  if (r.includes("labuan")) return "W.P. Labuan";
  if (r.includes("putrajaya")) return "W.P. Putrajaya";
  if (r.includes("negeri sembilan")) return "Negeri Sembilan";
  return region; // Fallback for names that match (e.g., "Johor", "Selangor", "Sabah")
};

const CellWrapper = ({
  isCheapest,
  children,
  isFirst,
  isLast,
}: {
  isCheapest: boolean;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  if (!isCheapest)
    return (
      <div className="text-sm font-medium text-txt-black-700 dark:text-gray-300">
        {children}
      </div>
    );
  return (
    <div
      className={`text-sm font-medium text-txt-black-700 dark:text-gray-300 
            ${isFirst ? "rounded-l-2xl ml-0" : ""} 
            ${isLast ? "rounded-r-2xl mr-0" : ""}`}
    >
      {children}
    </div>
  );
};

interface PreloadedItemData {
  preloadedHistory?: ItemPriceHistory[];
  preloadedPrices?: ItemLatest[];
}

const ItemDetailsWrapper: React.FC<{ itemCode?: string } & PreloadedItemData> = ({
  itemCode: propItemCode,
  preloadedHistory,
  preloadedPrices,
}) => {
  const itemCode = propItemCode;
  const { globalSearchData, isReady, userRegion } = useData();

  // 1. Sync metadata instantly from memory
  const itemDetails = useMemo(() => {
    if (!isReady || !globalSearchData.length || !itemCode) return null;
    const item = globalSearchData.find((i) => i.item_code === Number(itemCode));
    if (!item) return null;
    return {
      ...item,
      frequency: "weekly",
      minimum: item.minimum || 0,
      maximum: item.maximum || 0,
      median: item.median || 0,
    } as ItemMetadata;
  }, [isReady, globalSearchData, itemCode]);

  useSEO({
    title: itemDetails?.item,
    description: itemDetails
      ? `Compare prices for ${itemDetails.item}. Lowest price: RM${itemDetails.minimum.toFixed(2)}.`
      : undefined,
  });

  useDocumentTitle(itemDetails?.item);

  const [priceHistory, setPriceHistory] = useState<ItemPriceHistory[]>([]);
  const [allPriceData, setAllPriceData] = useState<ItemLatest[]>([]);

  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  const [selectedState, setSelectedState] = useState<string>("");
  const [hasAutoSelectedState, setHasAutoSelectedState] =
    useState<boolean>(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [targetDateStr, setTargetDateStr] = useState<string | null>(null);

  const [downloadDateRange, setDownloadDateRange] = useState<
    DateRange | undefined
  >();
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "parquet">(
    "csv",
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // 2. Initialize Date instantly from metadata (skips the 400ms debounce delay on load)
  useEffect(() => {
    if (itemDetails?.last_updated && !selectedDate) {
      const [yyyy, mm, dd] = itemDetails.last_updated.split("-").map(Number);
      const latestDate = new Date(yyyy, mm - 1, dd);
      setSelectedDate(latestDate);
      setTargetDateStr(itemDetails.last_updated);
    }
  }, [itemDetails?.last_updated, selectedDate]);

  // 3. Debounce subsequent user date selections
  useEffect(() => {
    if (!selectedDate) return;
    const str = format(selectedDate, "yyyy-MM-dd");
    if (str === targetDateStr) return; // Prevent initial double fetch

    const handler = setTimeout(() => setTargetDateStr(str), 400);
    return () => clearTimeout(handler);
  }, [selectedDate, targetDateStr]);

  // 4. Fetch History in parallel
  useEffect(() => {
    if (!itemCode || !isReady) return;
    if (preloadedHistory && preloadedHistory.length > 0) {
      setPriceHistory(preloadedHistory);
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    getItemPriceHistory(itemCode)
      .then((historyData) => {
        setPriceHistory(
          [...historyData].sort((a, b) => a.date.localeCompare(b.date)),
        );
      })
      .finally(() => setIsLoadingHistory(false));
  }, [itemCode, isReady, preloadedHistory]);

  // 5. Fetch Prices in parallel (Triggers immediately once targetDateStr is set)
  useEffect(() => {
    if (!itemCode || !targetDateStr) return;
    if (preloadedPrices && preloadedPrices.length > 0 && itemDetails?.last_updated === targetDateStr) {
      setAllPriceData(preloadedPrices);
      setIsLoadingPrices(false);
      return;
    }
    setIsLoadingPrices(true);
    getItemPrices(itemCode, targetDateStr)
      .then(setAllPriceData)
      .finally(() => setIsLoadingPrices(false));
  }, [itemCode, targetDateStr, preloadedPrices, itemDetails?.last_updated]);

  const filteredPriceLatest = useMemo(() => {
    if (!hasAutoSelectedState) return [];
    return allPriceData
      .filter((entry) => {
        const stateMatch = !selectedState || entry.state === selectedState;
        const districtMatch =
          !selectedDistrict || entry.district === selectedDistrict;
        return stateMatch && districtMatch;
      })
      .sort((a, b) => a.price - b.price); // Sort by lowest price
  }, [allPriceData, selectedState, selectedDistrict, hasAutoSelectedState]);

  const minPrice = useMemo(
    () =>
      filteredPriceLatest.length === 0
        ? null
        : Math.min(...filteredPriceLatest.map((i) => i.price)),
    [filteredPriceLatest],
  );

  const columns = useMemo<ColumnDef<ItemLatest>[]>(
    () => [
      {
        accessorKey: "premise",
        header: "Store Location",
        cell: (info) => (
          <CellWrapper
            isCheapest={info.row.original.price === minPrice}
            isFirst
          >
            <div className="flex flex-col">
              <span className="text-txt-black-900 dark:text-white font-semibold">
                {info.getValue<string>()}
              </span>
              <span className="text-xs text-txt-black-500 dark:text-gray-500 mt-0.5">
                {info.row.original.district}
              </span>
            </div>
          </CellWrapper>
        ),
      },
      {
        accessorKey: "premise_type",
        header: "Format",
        cell: (info) => (
          <CellWrapper isCheapest={info.row.original.price === minPrice}>
            <span>{info.getValue<string>()}</span>
          </CellWrapper>
        ),
      },
      {
        accessorKey: "price",
        header: "Unit Price",
        cell: (info) => {
          const p = info.getValue<number>();
          const isCheapest = p === minPrice;
          return (
            <CellWrapper isCheapest={isCheapest} isLast>
              <div className="flex items-center gap-3">
                <span>RM {p.toFixed(2)}</span>
                {isCheapest && (
                  <Tag
                    variant="success"
                    size="small"
                    mode="pill"
                    className="text-[10px] shadow-sm hidden md:block"
                  >
                    Lowest
                  </Tag>
                )}
              </div>
            </CellWrapper>
          );
        },
      },
    ],
    [minPrice],
  );

  const availableStates = useMemo(
    () => Array.from(new Set(allPriceData.map((p) => p.state))).sort(),
    [allPriceData],
  );

  // Geo lookup auto select mapped from pre-fetched context
  useEffect(() => {
    if (availableStates.length === 0 || hasAutoSelectedState) return;

    if (userRegion) {
      const mappedRegion = normalizeCloudflareRegion(userRegion);
      const exactMatch = availableStates.find(
        (s) =>
          s.localeCompare(mappedRegion, undefined, {
            sensitivity: "base",
          }) === 0,
      );

      if (exactMatch) {
        setSelectedState(exactMatch);
        setHasAutoSelectedState(true);
        return;
      }
    }

    // Fallback Logic
    if (availableStates.includes(DEFAULT_STATE)) {
      setSelectedState(DEFAULT_STATE);
    } else {
      setSelectedState(availableStates[0] || "");
    }
    setHasAutoSelectedState(true);
  }, [availableStates, hasAutoSelectedState, userRegion]);

  const availableDistricts = useMemo(
    () =>
      Array.from(
        new Set(
          allPriceData
            .filter((p) => p.state === selectedState)
            .map((p) => p.district),
        ),
      ).sort(),
    [allPriceData, selectedState],
  );

  const minAvailableDate =
    priceHistory.length > 0 ? new Date(priceHistory[0].date) : undefined;
  const maxAvailableDate =
    priceHistory.length > 0
      ? new Date(priceHistory[priceHistory.length - 1].date)
      : undefined;
  const disabledDates =
    minAvailableDate && maxAvailableDate
      ? [{ before: minAvailableDate }, { after: maxAvailableDate }]
      : undefined;

  const handleDownload = async () => {
    if (!itemCode) return;
    setIsDownloading(true);
    try {
      const res = await fetch(
        `https://pricecatcher-lake.iwa.my/data/prices/item_code=${itemCode}/data.parquet`,
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      const buffer = new Uint8Array(await res.arrayBuffer());

      let exportBlob: Blob;
      let filename = `openpricecatcher_${itemCode}_${Date.now()}`;

      if (downloadFormat === "parquet") {
        exportBlob = new Blob([buffer], { type: "application/octet-stream" });
        filename += ".parquet";
      } else {
        const { default: initParquetWasm, readParquet } =
          await import("parquet-wasm");
        const { tableFromIPC } = await import("apache-arrow");

        // Ensure WASM is initialized (safe to call multiple times)
        await initParquetWasm();

        const wasmTable = readParquet(buffer);
        const table = tableFromIPC(wasmTable.intoIPCStream());

        const fromStr = downloadDateRange?.from
          ? format(downloadDateRange.from, "yyyy-MM-dd")
          : null;
        const toStr = downloadDateRange?.to
          ? format(downloadDateRange.to, "yyyy-MM-dd")
          : null;

        // Iterate and filter Arrow Table directly to prevent out-of-memory crashes on large exports
        const data = [];
        for (const row of table) {
          const d = row.date;
          if (fromStr && d < fromStr) continue;
          if (toStr && d > toStr) continue;
          data.push(row.toJSON());
        }

        const headers = [
          "date",
          "premise",
          "premise_type",
          "state",
          "district",
          "price",
        ];
        const csvContent = [
          headers.join(","),
          ...data.map((row: any) =>
            headers
              .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
              .join(","),
          ),
        ].join("\n");

        exportBlob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        filename += ".csv";
      }

      const url = URL.createObjectURL(exportBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLocalitySelect = (level: "state" | "district", name: string) => {
    if (!name) {
      setSelectedState(DEFAULT_STATE);
      setSelectedDistrict("");
      return;
    }

    if (level === "state") {
      const match = allPriceData.find(
        (p) =>
          p.state.localeCompare(name, undefined, { sensitivity: "base" }) === 0,
      );
      setSelectedState(match ? match.state : name);
      setSelectedDistrict("");
    } else {
      const match = allPriceData.find(
        (p) =>
          p.district.localeCompare(name, undefined, { sensitivity: "base" }) ===
          0,
      );
      if (match) {
        setSelectedState(match.state);
        setSelectedDistrict(match.district);
      } else {
        setSelectedDistrict(name);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-4 lg:px-8 flex flex-col gap-4 md:gap-8 pt-6 pb-20 animate-in fade-in duration-500">
      <ItemMetadataDisplay
        metadata={itemDetails}
        priceHistory={priceHistory}
        isLoading={!itemDetails || isLoadingHistory}
      />

      {itemCode && targetDateStr ? (
        <LocalityAnalysis
          rawData={allPriceData}
          isLoading={isLoadingPrices}
          onSelectionChange={handleLocalitySelect}
        />
      ) : (
        <LocalityAnalysisSkeleton />
      )}

      <section className="bg-bg-white border border-otl-gray-200 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="p-6 md:p-8 md:pb-6 border-b border-otl-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-semibold text-txt-black-900 tracking-tight">
            Retail Availability
          </h3>
        </div>

        <div className="px-4 md:px-6 py-5 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row md:space-x-4 md:divide-x md:divide-otl-gray-200 max-sm:justify-between max-sm:gap-4">
            <div className="flex flex-col md:flex-row items-left md:items-center md:justify-between gap-3">
              <span className="hidden md:block text-[10px] font-semibold uppercase tracking-widest text-txt-black-500 md:pl-3">
                Observation Date
              </span>
              <DatePicker
                value={selectedDate}
                onValueChange={setSelectedDate}
                disabled={disabledDates}
                size="small"
              />
            </div>
            <div className="flex flex-row gap-4 md:pl-4">
              <Select
                variant="outline"
                size="small"
                value={selectedState || availableStates[0] || ""}
                onValueChange={(v) => {
                  setSelectedState(v);
                  setSelectedDistrict("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                variant="outline"
                size="small"
                value={selectedDistrict || ALL_DISTRICTS_VALUE}
                onValueChange={(v) =>
                  setSelectedDistrict(v === ALL_DISTRICTS_VALUE ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DISTRICTS_VALUE}>
                    All Districts
                  </SelectItem>
                  {availableDistricts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="default-outline" size="small">
                  <ButtonIcon>
                    <DownloadIcon className="w-4 h-4" />
                  </ButtonIcon>
                  Export
                </Button>
              </DropdownTrigger>
              <DropdownContent
                align="end"
                className="max-sm: p-3 w-[370px] md:w-[400px] rounded-3xl shadow-2xl bg-bg-white dark:bg-bg-washed backdrop-blur-xl border dark:border-2 border-otl-gray-200 dark:border-gray-800  max-sm:relative max-sm:left-[1rem]"
              >
                <div className="flex flex-col gap-3 md:gap-6 p-3 md:p-4">
                  <p className="hidden font-semibold text-sm uppercase text-txt-black-900 dark:text-white">
                    Export Data
                  </p>
                  <div className="">
                    <label className="text-[10px] uppercase font-semibold text-txt-black-500 dark:text-gray-500 tracking-wider">
                      Select Range
                    </label>
                    <DateRangePicker
                      value={downloadDateRange}
                      onValueChange={setDownloadDateRange}
                      disabled={disabledDates}
                      size="small"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-txt-black-500 dark:text-gray-500 tracking-wider">
                      Format
                    </label>
                    <div>
                      <Select
                        variant="outline"
                        size="small"
                        value={downloadFormat}
                        // @ts-ignore
                        onValueChange={(v) => setDownloadFormat(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key="csv" value="csv">
                            .csv
                          </SelectItem>
                          <SelectItem key="parquet" value="parquet">
                            .parquet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="default-outline"
                    className="w-full bg-bg-black-900 text-txt-white h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading
                      ? "Generating..."
                      : `Download ${downloadFormat.toUpperCase()}`}
                  </Button>
                </div>
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B]">
          {isLoadingPrices || !hasAutoSelectedState ? (
            <div className="p-24 flex flex-col items-center justify-center gap-4">
              <Spinner size="large" />
              <p className="text-sm font-semibold text-txt-black-400 dark:text-gray-500 animate-pulse">
                Loading premises...
              </p>
            </div>
          ) : filteredPriceLatest.length === 0 ? (
            <div className="p-24 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-semibold text-txt-black-900 dark:text-white">
                No records found
              </p>
              <p className="text-sm font-medium text-txt-black-400 dark:text-gray-500">
                Try adjusting your state or district filters.
              </p>
            </div>
          ) : (
            <div className="px-6 md:px-8 pb-8 ">
              <div className="overflow-auto h-full scrollbar max-h-[600px]">
                <DataTable data={filteredPriceLatest} columns={columns} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ItemDetailsWrapper;
