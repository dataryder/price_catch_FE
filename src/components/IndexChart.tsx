import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { IndexChartAgg } from "../types";

interface IndexChartProps {
  data: IndexChartAgg[];
}

const listitemgroup = {
  "BARANGAN BERBUNGKUS": "rgb(var(--bg-warning-700))",
  "BARANGAN KERING": "rgb(var(--bg-primary-500))",
  "BARANGAN SEGAR": "rgb(var(--bg-success-500))",
  MINUMAN: "rgb(var(--bg-primary-700))",
  "PRODUK KEBERSIHAN": "rgb(var(--bg-success-700))",
  "SUSU DAN BARANGAN BAYI": "rgb(var(--bg-warning-500))",
};

const IndexChart: React.FC<IndexChartProps> = ({ data }) => {
  const indexdatats: IndexChartAgg[] = data;

  function formatXAxis(tickItem: string) {
    const dateObject = new Date(tickItem);
    return dateObject.toLocaleString("en-MY", {
      month: "short",
      year: "2-digit",
    });
  }

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minHeight={200}
      minWidth={200}
      className="text-xs text-txt-black-900"
    >
      <LineChart
        data={indexdatats}
        margin={{
          top: 5,
          right: 0,
          left: -30,
          bottom: 0,
        }}
      >
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          minTickGap={20}
          height={20}
          tickLine={false}
          allowDataOverflow={false}
        />
        <YAxis domain={["auto", "auto"]} />
        {Object.keys(listitemgroup).map((i_group) => (
          <Line
            key={i_group}
            type="natural"
            dataKey={i_group}
            dot={false}
            stroke={listitemgroup[i_group as keyof typeof listitemgroup]}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(var(--bg-dialog))",
            borderRadius: "10px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ padding: "10px" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IndexChart;
