import React, { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@govtechmy/myds-react/select";
import { Spinner } from "@govtechmy/myds-react/spinner";
import { geoMercator, geoPath } from "d3-geo";
import { cn } from "../lib/utils";
import { useColor } from "../hooks/useColor";
import { ItemLatest } from "../types";

interface LocalityAnalysisProps {
  rawData: ItemLatest[];
  isLoading: boolean;
  onSelectionChange?: (level: "state" | "district", name: string) => void;
}

const normalizeName = (name: string) => {
  if (!name) return "";
  let n = name.toString().toUpperCase().trim();
  n = n.replace(/^W\.?P\.?\s*/, "").replace(/^WILAYAH PERSEKUTUAN\s*/, "");
  if (n === "PENANG") return "PULAU PINANG";
  if (n === "MALACCA") return "MELAKA";
  return n;
};

const getGeoJsonName = (feature: any, level: "state" | "district") => {
  const p = feature.properties;
  return level === "state"
    ? p.NAME_1 || p.name || p.state || ""
    : p.NAME_2 || p.Daerah || p.district || p.name || "";
};

const getTooltipPositionClasses = (x: number, y: number, isMobile: boolean) => {
  let xClass = "-translate-x-1/2";
  let yClass = "-translate-y-[110%]";

  const mapWidth = isMobile ? 400 : 700;
  const mapHeight = isMobile ? 350 : 400;

  if (x < mapWidth * 0.25) xClass = "-translate-x-[10%]";
  else if (x > mapWidth * 0.75) xClass = "-translate-x-[90%]";

  if (y < mapHeight * 0.25) yClass = "translate-y-[10%]";

  return `${xClass} ${yClass}`;
};

const quantile = (arr: number[], q: number) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

export const LocalityAnalysisSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] border border-otl-gray-200/60 dark:border-otl-gray-800/60 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-bg-white relative lg:h-[440px] overflow-hidden">
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:border-r border-otl-gray-200/60 dark:border-otl-gray-800/60 dark:border-gray-800/50 p-6 md:p-8 pb-4 lg:pb-3 flex flex-col justify-end z-10 bg-bg-white">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-40 bg-bg-black-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-bg-black-200 rounded-lg animate-pulse"></div>
            <div className="h-8 w-24 bg-bg-black-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 relative flex justify-center items-center bg-bg-washed dark:bg-[#1D1D21] p-4 lg:p-6 h-[320px] lg:h-auto border-y lg:border-y-0 border-otl-gray-200/60 dark:border-otl-gray-800/60 dark:border-gray-800/50 z-0">
        <div className="w-full h-full max-h-[350px] lg:max-h-[400px] flex items-center justify-center animate-pulse">
          <span className="text-sm font-semibold text-txt-black-400 dark:text-gray-500">Loading map analysis...</span>
        </div>
      </div>
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:border-r border-otl-gray-200/60 dark:border-otl-gray-800/60 dark:border-gray-800/50 p-6 md:p-8 pt-4 lg:pt-0 flex flex-col h-[260px] lg:h-auto overflow-hidden z-10 bg-bg-white">
        <div className="flex flex-col gap-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-full bg-bg-black-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LocalityAnalysis: React.FC<LocalityAnalysisProps> = ({
  rawData,
  isLoading,
  onSelectionChange,
}) => {
  const [metric, setMetric] = useState<"median" | "avg" | "p95" | "p5">(
    "median",
  );
  const [level, setLevel] = useState<"state" | "district">("state");

  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [pinnedInfo, setPinnedInfo] = useState<any>(null);

  const activeInfo = hoverInfo || pinnedInfo;

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  const { interpolate } = useColor("rdYlGn");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute metrics synchronously entirely in-memory (0 API Calls)
  const data = useMemo(() => {
    if (!rawData || rawData.length === 0) return null;

    const grouped = rawData.reduce((acc: any, row: any) => {
      const key = row[level];
      if (!key) return acc;
      if (!acc[key]) acc[key] = { prices: [] };
      acc[key].prices.push(row.price);
      return acc;
    }, {});

    const ranking = Object.entries(grouped).map(([name, group]: any) => {
      const prices = group.prices;
      let val = 0;
      if (metric === "avg")
        val = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
      if (metric === "median") val = quantile(prices, 0.5);
      if (metric === "p5") val = quantile(prices, 0.05);
      if (metric === "p95") val = quantile(prices, 0.95);
      return { name, val };
    });

    ranking.sort((a, b) => a.val - b.val);
    ranking.forEach((r, idx) => ((r as any).rank = idx + 1));

    return { ranking };
  }, [rawData, metric, level]);

  useEffect(() => {
    setHoverInfo(null);
    setPinnedInfo(null);
    onSelectionChange?.(level, "");
  }, [rawData, metric, level]);

  useEffect(() => {
    if (pinnedInfo?.name) {
      const el = document.getElementById(`locality-item-${pinnedInfo.name}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [pinnedInfo]);

  const rankingMap = useMemo(() => {
    const map = new Map();
    data?.ranking?.forEach((r: any) => map.set(normalizeName(r.name), r));
    return map;
  }, [data]);

  const [mapData, setMapData] = useState<any>(null);

  useEffect(() => {
    let active = true;
    const loadGeoJson = async () => {
      let data;
      if (level === "state") {
        data = isMobile
          ? (await import("../lib/geojson/state/_mobile")).default
          : (await import("../lib/geojson/state/_desktop")).default;
      } else {
        data = isMobile
          ? (await import("../lib/geojson/district/_mobile")).default
          : (await import("../lib/geojson/district/_desktop")).default;
      }
      if (active) setMapData(data);
    };
    loadGeoJson();
    return () => {
      active = false;
    };
  }, [level, isMobile]);

  const values = useMemo(
    () => data?.ranking?.map((r: any) => r.val) || [],
    [data],
  );
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;

  const projection = useMemo(() => {
    if (!mapData) return null;
    const width = isMobile ? 400 : 700;
    const height = isMobile ? 350 : 400;
    return geoMercator().fitSize([width, height], mapData as any);
  }, [mapData, isMobile]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return geoPath().projection(projection);
  }, [projection]);

  const handleSvgClick = () => {
    setPinnedInfo(null);
    onSelectionChange?.(level, "");
  };

  const colorScale = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "rgba(113, 113, 122, 0.05)";
    return interpolate(val, [maxVal, minVal]);
  };

  const handleSelection = (feature: any, rawName: string, regionData: any) => {
    if (pinnedInfo?.name === rawName) {
      setPinnedInfo(null);
      onSelectionChange?.(level, "");
    } else {
      const centroid = feature && pathGenerator ? pathGenerator.centroid(feature) : [350, 200];
      setPinnedInfo({
        x: centroid[0],
        y: centroid[1],
        name: rawName,
        data: regionData,
      });
      onSelectionChange?.(level, rawName);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] border border-otl-gray-200 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-bg-white relative lg:h-[440px] overflow-hidden">
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:border-r border-otl-gray-200 bg-bg-white p-6 md:p-8 pb-4 lg:pb-3 flex flex-col justify-end z-10">
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-semibold tracking-tight text-txt-black-900 dark:text-white">
            Geospatial Insight
          </h4>
          <div className="flex gap-2">
            <Select
              variant="outline"
              size="small"
              value={metric}
              onValueChange={(v) => setMetric(v as any)}
            >
              <SelectTrigger className="capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["median", "p5", "avg", "p95"].map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              variant="outline"
              size="small"
              value={level}
              onValueChange={(v) => setLevel(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="district">District</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 relative flex justify-center items-center bg-[#FAFAFA] dark:bg-[#1D1D21] p-4 lg:p-6 h-[320px] lg:h-auto border-y lg:border-y-0 border-otl-gray-200 z-0">
        {!mapData || !pathGenerator ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20">
            <Spinner size="large" />
            <span className="text-xs font-semibold text-txt-black-400 dark:text-gray-500">Loading map data...</span>
          </div>
        ) : (
          <svg
            viewBox={isMobile ? "0 0 400 350" : "0 0 700 400"}
            className="w-full h-full max-h-[350px] lg:max-h-[400px] overflow-visible drop-shadow-sm"
            onClick={handleSvgClick}
          >
            {/* @ts-ignore */}
            {[...(mapData.features || [])]
              .sort((a, b) => {
                const aName = getGeoJsonName(a, level);
                const bName = getGeoJsonName(b, level);
                if (activeInfo?.name === aName) return 1;
                if (activeInfo?.name === bName) return -1;
                return 0;
              })
              .map((feature: any) => {
                const rawName = getGeoJsonName(feature, level);
                const normalizedName = normalizeName(rawName);
                const regionData = rankingMap.get(normalizedName);
                const isActive = activeInfo?.name === rawName;

                return (
                  <path
                    key={rawName}
                    d={pathGenerator(feature) || ""}
                    fill={colorScale(regionData?.val)}
                    strokeWidth={isActive ? 2 : 0.5}
                    className={cn(
                      "transition-all duration-300 cursor-pointer outline-none",
                      isActive
                        ? "drop-shadow-lg stroke-[#18181b] dark:stroke-white"
                        : "hover:drop-shadow-sm hover:opacity-80 stroke-otl-gray-300",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelection(feature, rawName, regionData);
                    }}
                    onMouseEnter={() => {
                      if (!pinnedInfo) {
                        const centroid = pathGenerator.centroid(feature);
                        setHoverInfo({
                          x: centroid[0],
                          y: centroid[1],
                          name: rawName,
                          data: regionData,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoverInfo(null)}
                  />
                );
              })}
          </svg>
        )}

        {activeInfo && (
          <div
            className={cn(
              "absolute bg-bg-white backdrop-blur-2xl border border-otl-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-xl pointer-events-none z-50 w-auto min-w-[180px] max-w-[280px] transform transition-all animate-in fade-in zoom-in-95 duration-200",
              getTooltipPositionClasses(activeInfo.x, activeInfo.y, isMobile),
            )}
            style={{
              left: `${(activeInfo.x / (isMobile ? 400 : 700)) * 100}%`,
              top: `${(activeInfo.y / (isMobile ? 350 : 400)) * 100}%`,
            }}
          >
            <div className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-2 font-medium text-sm text-txt-black-900 tracking-tight">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm border border-black/10 dark:border-white/10 shrink-0"
                  style={{
                    backgroundColor: colorScale(activeInfo.data?.val),
                  }}
                />
                <span className="truncate">{activeInfo.name}</span>
              </span>
              <span className="text-base font-semibold text-txt-black-900 whitespace-nowrap">
                {activeInfo.data
                  ? `RM ${activeInfo.data.val.toFixed(2)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:border-r border-otl-gray-200 bg-bg-white p-6 md:p-8 pt-4 lg:pt-0 flex flex-col h-[280px] lg:h-auto overflow-hidden z-10">
        <div className="flex-1 overflow-y-auto scrollbar pr-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 pt-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-bg-black-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : data?.ranking?.length ? (
            data.ranking.map((item: any) => {
              const isItemActive =
                activeInfo?.name.toUpperCase() === item.name.toUpperCase();
              return (
                <div
                  key={item.name}
                  id={`locality-item-${item.name}`}
                  className={cn(
                    "flex justify-between items-center px-2 py-3 rounded-lg transition-all duration-200 border border-transparent shadow-sm cursor-pointer hover:shadow-md",
                    isItemActive && "border-2 border-otl-gray-200",
                  )}
                  onMouseEnter={() => {
                    if (!mapData || !pathGenerator) return;
                    const feature = (mapData as any).features.find(
                      (f: any) =>
                        normalizeName(getGeoJsonName(f, level)) ===
                        normalizeName(item.name),
                    );
                    const centroid = feature
                      ? pathGenerator.centroid(feature)
                      : [350, 200];
                    setHoverInfo({
                      x: centroid[0],
                      y: centroid[1],
                      name: item.name,
                      data: item,
                    });
                  }}
                  onMouseLeave={() => setHoverInfo(null)}
                  onClick={() => {
                    if (!mapData || !pathGenerator) return;
                    const feature = (mapData as any).features.find(
                      (f: any) =>
                        normalizeName(getGeoJsonName(f, level)) ===
                        normalizeName(item.name),
                    );
                    handleSelection(feature, item.name, item);
                  }}
                >
                  <span className="text-sm text-txt-black-900 tracking-tight truncate mr-2 flex items-center">
                    <span className="text-txt-black-500 font-mono text-xs mr-2 font-medium">
                      #{item.rank}
                    </span>
                    {item.name}
                  </span>
                  <span className="text-sm font-medium text-txt-black-900 tracking-tight shrink-0">
                    RM {item.val.toFixed(2)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-txt-black-500 text-center py-10 font-medium">
              No spatial data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalityAnalysis;
