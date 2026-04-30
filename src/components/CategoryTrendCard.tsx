import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDuckDB } from "../contexts/DuckDBContext";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { RawDataRow } from "../types";
import { ArrowDownIcon, ArrowUpIcon } from "@govtechmy/myds-react/icon";

interface CategoryTrendCardProps {
  category: string;
  data: RawDataRow[];
}

const CategoryTrendCard: React.FC<CategoryTrendCardProps> = ({
  category,
  data,
}) => {
  const navigate = useNavigate();
  const { conn } = useDuckDB();

  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      date: new Date(d.date),
    }));
  }, [data]);

  const latest = data[data.length - 1];
  const pop = latest?.pop_change_pct || 0;

  // Set neutral range between -0.1% and 0.1%
  const isNeutral = pop >= -0.1 && pop <= 0.1;
  const isUp = pop > 0.1;

  // Price increases = bad (danger/red), Price decreases = good (success/green)
  const colorHex = isUp ? "#EF4444" : isNeutral ? "#71717A" : "#22C55E";
  const textColorClass = isUp
    ? "text-[#EF4444]"
    : isNeutral
      ? "text-txt-black-500 dark:text-gray-400"
      : "text-[#22C55E]";

  // Sanitize the category string to ensure a valid SVG ID without spaces
  const safeId = useMemo(
    () => category.replace(/[^a-zA-Z0-9]/g, ""),
    [category],
  );

  const handleClick = async () => {
    if (!conn) return;
    try {
      const stmt = await conn.prepare(
        "SELECT item_group FROM lake.lookup_item WHERE item_category = ? LIMIT 1",
      );
      const result = await stmt.query(category);
      const arr = result.toArray();
      if (arr.length > 0) {
        const group = arr[0].toJSON().item_group;
        navigate(`/category/${group}/${category.replace("/", " | ")}`);
      }
      stmt.close();
    } catch (e) {
      console.error("Failed to route to category", e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer group flex flex-col h-full p-5 gap-3 border border-otl-gray-300 rounded-lg bg-bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400"
    >
      <div className="flex flex-col">
        <h3 className="text-txt-black-900 dark:text-white capitalize font-semibold text-sm tracking-tight line-clamp-1 transition-colors">
          {category.toLowerCase()}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-xl md:text-3xl text-nowrap ${textColorClass}`}>
            {isUp ? (
              <ArrowUpIcon className="inline" />
            ) : isNeutral ? (
              ""
            ) : (
              <ArrowDownIcon className="inline" />
            )}{" "}
            {Math.abs(pop).toFixed(1)}%
          </span>
          <span className="text-[11px] text-txt-black-500">WoW</span>
        </div>
      </div>

      <div className="flex-grow h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%" className="rounded-xl">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`grad-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorHex} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colorHex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["auto", "auto"]} hide />
            <Area
              type="monotone"
              dataKey="cat_price_index"
              stroke={colorHex}
              fill={`url(#grad-${safeId})`}
              strokeWidth={2.5}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="text-right text-[9px] text-txt-black-500 uppercase tracking-widest">
          1Y Trend
        </div>
      </div>
    </div>
  );
};

export default CategoryTrendCard;
