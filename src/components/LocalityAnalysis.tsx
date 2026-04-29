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

// Smart positioning to keep tooltip inside map boundaries
const getTooltipPositionClasses = (x: number, y: number) => {
  let xClass = "-translate-x-1/2";
  let yClass = "-translate-y-[105%]"; // Default: centered above

  // viewBox width is 700, Tooltip width is 320 (w-80)
  if (x < 160)
    xClass = "-translate-x-[10%]"; // Push right
  else if (x > 540) xClass = "-translate-x-[90%]"; // Push left

  // viewBox height is 400, Tooltip height is roughly ~220
  if (y < 220) yClass = "translate-y-[5%]"; // Show below if too close to top

  return `${xClass} ${yClass}`;
};

const LocalityAnalysis: React.FC<LocalityAnalysisProps> = ({
  itemCode,
  targetDate,
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

  // Initialize the D3 color interpolator hook
  // We use rdYlGn so Red = Expensive, Green = Cheap
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

    getLocalityInsights(conn, itemCode, targetDate, metric, level)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [conn, isReady, itemCode, targetDate, metric, level]);

  const rankingMap = useMemo(() => {
    const map = new Map();
    data?.ranking?.forEach((r: any) => map.set(normalizeName(r.name), r));
    return map;
  }, [data]);

  const cheapestMap = useMemo(() => {
    const map = new Map<string, any[]>();
    data?.cheapest_stores?.forEach((s: any) => {
      const normalized = normalizeName(s.name);
      if (!map.has(normalized)) map.set(normalized, []);
      map.get(normalized)?.push(s);
    });
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
  };

  const colorScale = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "rgba(113, 113, 122, 0.05)"; // Empty slate color
    // We invert the domain so maxVal (Expensive) = 0 (Red), minVal (Cheap) = 1 (Green)
    return interpolate(val, [maxVal, minVal]);
  };

  return (
    <div className="flex flex-col border border-otl-gray-200/80 dark:border-gray-800 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white dark:bg-[#18181B] relative md:max-h-[440px] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
        <div className="lg:col-span-4 flex flex-col h-[440px] border-r border-otl-gray-200/50 dark:border-gray-800/50 bg-bg-black-25/30 dark:bg-[#1D1D21]/50 p-6 md:p-8">
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
                <SelectContent className="">
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
                      className={cn(
                        "flex justify-between items-center px-2 py-3 rounded-lg transition-all duration-200 border border-transparent bg-white dark:bg-[#27272A]/50 shadow-sm cursor-pointer hover:shadow-md",
                        isItemActive &&
                          "bg-bg-success-50 dark:bg-success-900/20 border-otl-success-200",
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
                          cheapest: cheapestMap.get(normalizeName(item.name)),
                        });
                      }}
                      onMouseLeave={() => setHoverInfo(null)}
                      onClick={() => {
                        if (pinnedInfo?.name === item.name) {
                          setPinnedInfo(null);
                        } else {
                          const feature = (mapData as any).features.find(
                            (f: any) =>
                              normalizeName(getGeoJsonName(f, level)) ===
                              normalizeName(item.name),
                          );
                          const centroid = feature
                            ? pathGenerator.centroid(feature)
                            : [350, 200];
                          setPinnedInfo({
                            x: centroid[0],
                            y: centroid[1],
                            name: item.name,
                            data: item,
                            cheapest: cheapestMap.get(normalizeName(item.name)),
                          });
                        }
                      }}
                    >
                      <span className="text-sm text-txt-black-900 tracking-tight truncate mr-2 flex items-center">
                        <span className="text-txt-black-400 dark:text-gray-500 font-mono text-xs mr-2 font-medium">
                          #{item.rank}
                        </span>
                        {item.name}
                      </span>
                      <span className="text-sm ftext-txt-black-900 tracking-tight shrink-0">
                        RM {item.val.toFixed(2)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-txt-black-400 dark:text-gray-500 text-center py-10 font-medium">
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
                if (activeInfo?.name === aName) return 1; // Bring to front
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
                    stroke={
                      isActive
                        ? "var(--otl-black-900, #18181b)"
                        : "rgba(113, 113, 122, 0.15)"
                    }
                    strokeWidth={isActive ? 2 : 0.5}
                    className={cn(
                      "transition-all duration-300 cursor-pointer outline-none",
                      isActive
                        ? "drop-shadow-lg"
                        : "hover:drop-shadow-sm hover:opacity-80",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pinnedInfo?.name === rawName) {
                        setPinnedInfo(null);
                      } else {
                        const centroid = pathGenerator.centroid(feature);
                        setPinnedInfo({
                          x: centroid[0],
                          y: centroid[1],
                          name: rawName,
                          data: regionData,
                          cheapest: cheapestMap.get(normalizedName),
                        });
                      }
                    }}
                  />
                );
              })}
          </svg>

          {activeInfo && (
            <div
              className={cn(
                "absolute bg-bg-white backdrop-blur-2xl border border-otl-gray-200 dark:border-gray-700 p-5 rounded-[24px] shadow-2xl pointer-events-auto z-50 w-80 transform transition-all animate-in fade-in zoom-in-95 duration-200",
                getTooltipPositionClasses(activeInfo.x, activeInfo.y),
              )}
              style={{
                left: `${(activeInfo.x / 700) * 100}%`,
                top: `${(activeInfo.y / 400) * 100}%`,
              }}
            >
              <div className="flex justify-between items-start mb-4 border-b border-otl-gray-100 dark:border-gray-700 pb-3">
                <span className="flex items-center gap-2 font-medium text-base text-txt-black-900 leading-tight pr-2 tracking-tight">
                  <span
                    className="w-3 h-3 rounded-full shadow-sm border border-black/10 dark:border-white/10"
                    style={{
                      backgroundColor: colorScale(activeInfo.data?.val),
                    }}
                  />
                  {activeInfo.name}
                </span>
                <span className="text-base font-medium text-txt-black-900 whitespace-nowrap">
                  {activeInfo.data
                    ? `RM ${activeInfo.data.val.toFixed(2)}`
                    : "N/A"}
                </span>
              </div>
              <div className="space-y-3">
                {/* <div className="flex justify-between items-center">
                  <p className="text-[10px] text-txt-black-400 uppercase tracking-widest">
                    Top 10 Cheapest Stores
                  </p>
                </div> */}
                <div className="space-y-2.5 max-h-[200px] overflow-auto scrollbar">
                  {activeInfo.cheapest
                    ?.slice(0, 10)
                    .map((store: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center gap-3 text-xs leading-tight border-b border-bg-black-25 dark:border-gray-700/50 pb-2 last:border-0"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-txt-black-900  truncate">
                            <span className="text-txt-black-400 font-mono mr-2 text-[10px]">
                              #{store.rank}
                            </span>
                            {store.premise}
                          </span>
                          <span className="text-txt-black-500 truncate mt-0.5 text-[10px] uppercase tracking-wider ml-5">
                            {store.district}
                          </span>
                        </div>
                        <span className=" text-txt-success-600 dark:text-success-400 whitespace-nowrap">
                          RM {store.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  {!activeInfo.cheapest?.length && (
                    <p className="text-xs text-txt-black-400 dark:text-gray-500  italic">
                      No stores found.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalityAnalysis;
