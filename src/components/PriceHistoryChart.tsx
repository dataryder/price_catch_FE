import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ItemPriceHistory } from "../types";

interface ItemPriceHistoryDataProps {
  data: ItemPriceHistory[];
  period: "month" | "year" | null;
}

function formatLabel(tickItem: Date) {
  return tickItem.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#27272A]/95 backdrop-blur-xl border border-otl-gray-200 dark:border-gray-700 rounded-[20px] shadow-2xl min-w-[160px]">
        <p className="text-[10px] font-semibold text-txt-black-400 dark:text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-otl-gray-100 dark:border-gray-700 p-4 ">
          {formatLabel(new Date(label))}
        </p>
        <div className="space-y-2 p-4 pt-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-6"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-txt-black-600 dark:text-gray-300">
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="text-xs text-txt-black-900 dark:text-white">
                RM {Number(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PriceHistoryChart: React.FC<ItemPriceHistoryDataProps> = ({
  data,
  period,
}) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date),
    p95: Number(item.p95.toFixed(2)),
    median: Number(item.median.toFixed(2)),
    p5: Number(item.p5.toFixed(2)),
  }));

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
      minHeight={250}
      className="text-[11px] font-semibold text-txt-black-400 dark:text-gray-500"
    >
      <LineChart
        data={formattedData}
        margin={{
          top: 20,
          right: 10,
          left: -10,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="currentColor"
          opacity={0.1}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          minTickGap={30}
          axisLine={false}
          tickLine={false}
          dy={15}
        />
        <YAxis
          domain={["auto", "auto"]}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `RM${val}`}
          dx={-10}
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
        <Legend
          iconType="circle"
          wrapperStyle={{
            fontSize: "11px",
            fontWeight: 600,
            paddingTop: "20px",
          }}
        />

        <Line
          type="stepAfter"
          name="Lowest (P5)"
          dataKey="p5"
          stroke="var(--otl-success-500, #22C55E)"
          dot={false}
          strokeWidth={2}
          activeDot={{
            r: 3,
            strokeWidth: 0,
            fill: "var(--otl-success-600, #16A34A)",
          }}
        />
        <Line
          type="stepAfter"
          name="Median"
          dataKey="median"
          stroke="currentColor"
          className="text-txt-black-800 dark:text-gray-300"
          dot={false}
          strokeWidth={2}
          activeDot={{ r: 3, strokeWidth: 0, fill: "currentColor" }}
        />
        <Line
          type="stepAfter"
          name="Highest (P95)"
          dataKey="p95"
          stroke="var(--otl-danger-400, #F87171)"
          dot={false}
          strokeWidth={2}
          activeDot={{
            r: 3,
            strokeWidth: 0,
            fill: "var(--otl-danger-500, #EF4444)",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceHistoryChart;
