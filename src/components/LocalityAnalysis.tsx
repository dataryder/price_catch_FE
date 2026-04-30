import React, { useState, useEffect, useMemo } from "react";
import { useDuckDB } from "../contexts/DuckDBContext";
import { getLocalityInsights } from "../services/apiClient";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@govtechmy/myds-react/select";
import { geoMercator, geoPath } from "d3-geo";
import { cn } from "../lib/utils";
import { useColor } from "../hooks/useColor";

import stateDesktop from "../lib/geojson/state/_desktop";
import stateMobile from "../lib/geojson/state/_mobile";
import districtDesktop from "../lib/geojson/district/_desktop";
import districtMobile from "../lib/geojson/district/_mobile";

interface LocalityAnalysisProps {
  itemCode: string;
  targetDate: string;
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

const getTooltipPositionClasses = (x: number, y: number) => {
  let xClass = "-translate-x-1/2";
  let yClass = "-translate-y-[110%]";

  if (x < 160) xClass = "-translate-x-[10%]";
  else if (x > 540) xClass = "-translate-x-[90%]";

  if (y < 100) yClass = "translate-y-[10%]";

  return `${xClass} ${yClass}`;
};

export const LocalityAnalysisSkeleton = () => {
  const projection = geoMercator().fitSize([700, 400], stateDesktop as any);
  const pathGenerator = geoPath().projection(projection);

  return (
    <div className="flex flex-col border border-otl-gray-300 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white dark:bg-[#18181B] relative md:h-[440px] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-4 flex flex-col h-[440px] border-r border-otl-gray-200/50 dark:border-gray-800/50 p-6 md:p-8">
          <div className="flex flex-col gap-4 mb-5">
            <div className="h-6 w-40 bg-gray-200 dark:bg-[#27272A] rounded-lg animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#27272A] rounded-lg animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-[#27272A] rounded-lg animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-full bg-gray-200 dark:bg-[#27272A] rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 relative flex justify-center items-center bg-bg-washed p-6">
          <svg
            viewBox="0 0 700 400"
            className="w-full h-full max-h-[400px] overflow-visible opacity-50 animate-pulse"
          >
            {/* @ts-ignore */}
            {stateDesktop.features.map((feature: any, idx: number) => (
              <path
                key={idx}
                d={pathGenerator(feature) || ""}
                fill="var(--otl-gray-200, rgba(113, 113, 122, 0.15))"
                stroke="var(--otl-gray-300, rgba(113, 113, 122, 0.3))"
                strokeWidth={0.5}
                className="dark:fill-gray-800 dark:stroke-gray-700"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};

const LocalityAnalysis: React.FC<LocalityAnalysisProps> = ({
  itemCode,
  targetDate,
  onSelectionChange,
}) => {
  const { conn, isReady } = useDuckDB();
  const [metric, setMetric] = useState<"median" | "avg" | "p95" | "p5">(
    "median",
  );
  const [level, setLevel] = useState<"state" | "district">("state");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (!isReady || !conn || !itemCode || !targetDate) return;
    setIsLoading(true);
    setHoverInfo(null);
    setPinnedInfo(null);
    onSelectionChange?.(level, ""); // Clear external selection on metric/level change

    getLocalityInsights(conn, itemCode, targetDate, metric, level)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [conn, isReady, itemCode, targetDate, metric, level]);

  // Scroll active list item into view when pinned info changes
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

  const mapData = useMemo(() => {
    return level === "state"
      ? isMobile
        ? stateMobile
        : stateDesktop
      : isMobile
        ? districtMobile
        : districtDesktop;
  }, [level, isMobile]);

  const values = useMemo(
    () => data?.ranking?.map((r: any) => r.val) || [],
    [data],
  );
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;

  const projection = useMemo(() => {
    return geoMercator().fitSize([700, 400], mapData as any);
  }, [mapData]);

  const pathGenerator = useMemo(
    () => geoPath().projection(projection),
    [projection],
  );

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
      const centroid = feature ? pathGenerator.centroid(feature) : [350, 200];
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
    <div className="flex flex-col border border-otl-gray-200  rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-bg-white relative md:max-h-[440px] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-4 flex flex-col h-[440px] border-r border-otl-gray-200 bg-bg-white p-6 md:p-8">
          <div className="flex flex-col gap-4 mb-3">
            <h4 className="text-lg font-black tracking-tight text-txt-black-900 dark:text-white">
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

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar pr-2">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="w-6 h-6 border-2 border-otl-gray-200 dark:border-gray-700 border-t-otl-success-500 rounded-full animate-spin" />
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
                      <span className="text-sm text-txt-black-900 tracking-tight shrink-0">
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

        <div className="lg:col-span-8 relative flex justify-center items-center bg-[#FAFAFA] dark:bg-[#1D1D21] p-6">
          <svg
            viewBox="0 0 700 400"
            className="w-full h-full max-h-[400px] overflow-visible drop-shadow-sm"
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

          {activeInfo && (
            <div
              className={cn(
                "absolute bg-bg-white backdrop-blur-2xl border border-otl-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-xl pointer-events-none z-50 w-auto min-w-[200px] transform transition-all animate-in fade-in zoom-in-95 duration-200",
                getTooltipPositionClasses(activeInfo.x, activeInfo.y),
              )}
              style={{
                left: `${(activeInfo.x / 700) * 100}%`,
                top: `${(activeInfo.y / 400) * 100}%`,
              }}
            >
              <div className="flex justify-between items-center gap-4">
                <span className="flex items-center gap-2 font-medium text-sm text-txt-black-900 tracking-tight">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-sm border border-black/10 dark:border-white/10"
                    style={{
                      backgroundColor: colorScale(activeInfo.data?.val),
                    }}
                  />
                  {activeInfo.name}
                </span>
                <span className="text-base font-bold text-txt-black-900 whitespace-nowrap">
                  {activeInfo.data
                    ? `RM ${activeInfo.data.val.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalityAnalysis;
