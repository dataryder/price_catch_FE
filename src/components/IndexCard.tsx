import React from "react";
// import indexdata from "../data/indexdata.json"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { IndexData, ProcessedDataRow, RawDataRow } from "../types";

interface IndexCardProps {
	item_group: string;
	period: "month" | "year" | null;
	data: IndexData;
}

function formatLabel(tickItem: Date) {
	return tickItem.toLocaleDateString('en-MY', {
		day: 'numeric',
		month: 'short',
		year: '2-digit',
	});
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div className="custom-tooltip bg-bg-dialog/80 rounded-lg p-2">
				<p className="label text-txt-black-900 text-sm">
					{`${formatLabel(label)} : `}
					{
						payload.map((entry, index) => (
							<span key={`item-${index}`} className="inline">
								{`${entry.value}`}
							</span>
						))
					}
				</p>
			</div>
		);
	}

	return null;
};

const IndexCard: React.FC<IndexCardProps> = ({ item_group, period, data }) => {
	const indexdatats: IndexData = data;
	const group_data: RawDataRow[] = indexdatats[item_group];
	const filtered_data: ProcessedDataRow[] = group_data.map((row: RawDataRow): ProcessedDataRow => {
		const dateObject = new Date(row.date);
		return {
			...row,
			date: dateObject
		};
	})

	function formatXAxis(tickItem: Date) {
		if (period === "month") {
			return tickItem.toLocaleDateString('en-MY', {
				month: 'short',
				day: 'numeric',
			});
		}
		return tickItem.toLocaleDateString('en-MY', {
			month: 'short',
			year: '2-digit',
		});
	}

	return (
		<ResponsiveContainer width="100%" height="100%" minHeight={100} minWidth={50} className="text-xs text-txt-black-900">
			<AreaChart
				data={filtered_data}
				margin={{
					top: 5,
					right: 0,
					left: 0,
					bottom: 0,
				}}

			>
				<XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={20} height={20} tickLine={false} strokeWidth={0} allowDataOverflow={false} />
				<YAxis domain={[0, 'auto']} hide />
				<Area type="monotone" dataKey="cat_price_index" stroke="rgb(var(--txt-success))" fillOpacity={1} fill="rgba(var(--bg-success-100)  / 0.7)" dot={false} strokeWidth={2} />
				<Tooltip content={<CustomTooltip />} />

			</AreaChart >
		</ResponsiveContainer >
	);
};

export default IndexCard;