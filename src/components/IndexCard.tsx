import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { IndexData, ProcessedDataRow, RawDataRow } from "../types";

interface IndexCardProps {
  item_group: string;
  period: "month" | "year" | null;
  data: IndexData;
}

function formatLabel(tickItem: Date) {
  return tickItem.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#27272A]/95 backdrop-blur-xl border border-otl-gray-200/80 dark:border-gray-700 p-2.5 rounded-xl shadow-xl flex flex-col gap-1 items-center">
        <p className="text-txt-black-500 dark:text-gray-400 font-bold tracking-widest text-[9px] uppercase">
          {`${formatLabel(label)}`}
        </p>
        <p className="text-txt-black-900 dark:text-white font-black text-sm leading-none">
          {payload[0].value?.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

const IndexCard: React.FC<IndexCardProps> = ({ item_group, period, data }) => {
  const indexdatats: IndexData = data;
  const group_data: RawDataRow[] = indexdatats[item_group];
  const filtered_data: ProcessedDataRow[] = group_data.map(
    (row: RawDataRow): ProcessedDataRow => {
      const dateObject = new Date(row.date);
      return {
        ...row,
        date: dateObject,
      };
    },
  );

  function formatXAxis(tickItem: Date) {
    if (period === "month") {
      return tickItem.toLocaleDateString("en-MY", {
        month: "short",
        day: "numeric",
      });
    }
    return tickItem.toLocaleDateString("en-MY", {
      month: "short",
      year: "2-digit",
    });
  }

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minHeight={120}
      minWidth={50}
      className="text-[10px] text-txt-black-400 dark:text-gray-500 font-semibold"
    >
      <AreaChart
        data={filtered_data}
        margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient
            id={`colorGradient-${item_group}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--otl-success-500, #22C55E)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--otl-success-500, #22C55E)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          minTickGap={20}
          height={20}
          tickLine={false}
          axisLine={false}
          stroke="currentColor"
          dy={8}
        />
        <YAxis domain={["auto", "auto"]} hide />
        <Area
          type="monotone"
          dataKey="cat_price_index"
          stroke="var(--otl-success-500, #22C55E)"
          fillOpacity={1}
          fill={`url(#colorGradient-${item_group})`}
          dot={false}
          strokeWidth={2.5}
          activeDot={{
            r: 5,
            strokeWidth: 0,
            fill: "var(--otl-success-600, #16A34A)",
          }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: "currentColor",
            strokeWidth: 1.5,
            opacity: 0.15,
            strokeDasharray: "4 4",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IndexCard;
