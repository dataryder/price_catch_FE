import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
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
import {
  getItemMetadata,
  getItemPrices,
  getItemPriceHistory,
} from "../services/apiClient";
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

const ItemDetailsWrapper: React.FC = () => {
  const { itemCode } = useParams<{ itemCode: string }>();
  const { globalSearchData, isReady } = useData(); // <-- Changed

  const [itemDetails, setItemDetails] = useState<ItemMetadata | null>(null);
  const [priceHistory, setPriceHistory] = useState<ItemPriceHistory[]>([]);
  const [allPriceData, setAllPriceData] = useState<ItemLatest[]>([]);

  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  const [selectedState, setSelectedState] = useState<string>("");
  const [hasAutoSelectedState, setHasAutoSelectedState] =
    useState<boolean>(false);

  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [debouncedDate, setDebouncedDate] = useState<Date | undefined>();

  const [downloadDateRange, setDownloadDateRange] = useState<
    DateRange | undefined
  >();
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "parquet">(
    "csv",
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDate(selectedDate), 400);
    return () => clearTimeout(handler);
  }, [selectedDate]);

  useEffect(() => {
    if (!itemCode || !isReady) return; // Wait for context
    setIsLoadingMetadata(true);
    setIsLoadingHistory(true);

    Promise.all([
      getItemMetadata(globalSearchData, itemCode),
      getItemPriceHistory(itemCode),
    ])
      .then(([metaData, historyData]) => {
        if (metaData.length > 0) setItemDetails(metaData[0]);

        // 1. Force sort the history by date ascending, ensuring the last item is ALWAYS the latest
        const sortedHistory = [...historyData].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        setPriceHistory(sortedHistory);

        if (sortedHistory.length > 0 && !selectedDate) {
          // 2. Extract the string "YYYY-MM-DD"
          const rawDateStr = sortedHistory[sortedHistory.length - 1].date;

          // 3. Parse safely into local time to avoid UTC-shift bugs (e.g., 8:00 AM Local instead of Midnight UTC)
          const [yyyy, mm, dd] = rawDateStr.split("-").map(Number);
          const latestDate = new Date(yyyy, mm - 1, dd);

          setSelectedDate(latestDate);
          setDebouncedDate(latestDate);
        }
      })
      .finally(() => {
        setIsLoadingMetadata(false);
        setIsLoadingHistory(false);
      });
  }, [itemCode, isReady, globalSearchData]);

  useEffect(() => {
    if (!itemCode || !debouncedDate) return;
    setIsLoadingPrices(true);
    const targetStr = format(debouncedDate, "yyyy-MM-dd");

    getItemPrices(itemCode, targetStr)
      .then(setAllPriceData)
      .finally(() => setIsLoadingPrices(false));
  }, [itemCode, debouncedDate]);

  const filteredPriceLatest = useMemo(() => {
    if (!hasAutoSelectedState) return [];
    return allPriceData
      .filter((entry) => {
        const stateMatch = !selectedState || entry.state === selectedState;
        const districtMatch =
          !selectedDistrict || entry.district === selectedDistrict;
        return stateMatch && districtMatch;
      })
      .sort((a, b) => a.price - b.price); // <-- Added sort by lowest price
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

  useEffect(() => {
    if (availableStates.length === 0 || hasAutoSelectedState) return;

    const determineState = async () => {
      try {
        const res = await fetch("/api/geo");
        if (res.ok) {
          const { country, region } = await res.json();

          if (country === "MY" && region) {
            const mappedRegion = normalizeCloudflareRegion(region);

            // Check if the user's state actually has retail data for this item today
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
        }
      } catch (e) {
        console.error("Geo lookup failed, falling back to default.", e);
      }

      // Fallback Logic:
      // 1. If not in Malaysia or API fails, default to Selangor if available
      if (availableStates.includes(DEFAULT_STATE)) {
        setSelectedState(DEFAULT_STATE);
      } else {
        // 2. If Selangor isn't available for this item, pick whatever is first
        setSelectedState(availableStates[0] || "");
      }
      setHasAutoSelectedState(true);
    };

    determineState();
  }, [availableStates, hasAutoSelectedState]);

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

        // Correct conversion API
        const wasmTable = readParquet(buffer);
        const table = tableFromIPC(wasmTable.intoIPCStream());
        let data = table.toArray().map((row) => row.toJSON());

        wasmTable.free(); // Crucial: Free Wasm memory

        // Apply Date Filters
        if (downloadDateRange?.from) {
          const fromStr = format(downloadDateRange.from, "yyyy-MM-dd");
          data = data.filter((d: any) => d.date >= fromStr);
        }
        if (downloadDateRange?.to) {
          const toStr = format(downloadDateRange.to, "yyyy-MM-dd");
          data = data.filter((d: any) => d.date <= toStr);
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
      // Find proper casing from available items if possible, otherwise use passed name
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
        setSelectedDistrict(name); // Fallback if no prices exist for that district today
      }
    }
  };
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-4 lg:px-8  flex flex-col gap-4 md:gap-8 pt-6 pb-20 animate-in fade-in duration-500">
      <ItemMetadataDisplay
        metadata={itemDetails}
        priceHistory={priceHistory}
        isLoading={isLoadingMetadata || isLoadingHistory}
      />

      {itemCode && debouncedDate ? (
        <LocalityAnalysis
          itemCode={itemCode}
          targetDate={format(debouncedDate, "yyyy-MM-dd")}
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
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-txt-black-500 md:pl-3">
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
                        value="csv"
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
          {/* CHANGED: Show spinner while waiting for both prices AND the Geo lookup */}
          {isLoadingPrices || !hasAutoSelectedState ? (
            <div className="p-24 flex flex-col items-center justify-center gap-4">
              <Spinner size="large" />
              <p className="text-sm font-semibold text-txt-black-400 dark:text-gray-500 animate-pulse">
                Loading premises...
              </p>
            </div>
          ) : filteredPriceLatest.length === 0 ? (
            <div className="p-24 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-bold text-txt-black-900 dark:text-white">
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
