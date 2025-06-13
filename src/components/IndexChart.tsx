import React from "react";
// import indexdata from "../data/indexdata.json"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { IndexChartAgg } from "../types";

interface IndexChartProps {
	data: IndexChartAgg[];
}

// function formatLabel(tickItem: Date) {
// 	return tickItem.toLocaleDateString('en-MY', {
// 		day: 'numeric',
// 		month: 'short',
// 		year: '2-digit',
// 	});
// }

// const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
// 	if (active && payload && payload.length) {
// 		return (
// 			<div className="custom-tooltip bg-bg-dialog/80 rounded-lg p-2">
// 				<p className="label text-txt-black-900 text-sm">
// 					{`${formatLabel(label)} : `}
// 					{
// 						payload.map((entry, index) => (
// 							<span key={`item-${index}`} className="inline">
// 								{`${entry.value}`}
// 							</span>
// 						))
// 					}
// 				</p>
// 			</div>
// 		);
// 	}

// 	return null;
// };

const IndexChart: React.FC<IndexChartProps> = ({ data }) => {
	const listitemgroup = {
		'BARANGAN BERBUNGKUS': "rgb(var(--bg-warning-700))",
		'BARANGAN KERING': "rgb(var(--bg-primary-500))",
		'BARANGAN SEGAR': "rgb(var(--bg-success-500))",
		'MINUMAN': "rgb(var(--bg-primary-700))",
		'PRODUK KEBERSIHAN': "rgb(var(--bg-success-700))",
		'SUSU DAN BARANGAN BAYI': "rgb(var(--bg-warning-500))"
	};
	const indexdatats: IndexChartAgg[] = data;

	function formatXAxis(tickItem: string) {
		const dateObject = new Date(tickItem);
		return dateObject.toLocaleString('en-MY', {
			month: 'short',
			year: '2-digit',
		});
	}

	return (
		<ResponsiveContainer width="100%" height="100%" minHeight={200} minWidth={200} className="text-xs text-txt-black-900">
			<LineChart
				data={indexdatats}
				margin={{
					top: 5,
					right: 0,
					left: -30,
					bottom: 0,
				}}

			>
				<XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={20} height={20} tickLine={false} allowDataOverflow={false} />
				<YAxis domain={['auto', 'auto']} />
				{Object.keys(listitemgroup).map((i_group) => (
					<Line type="natural" dataKey={i_group} dot={false} stroke={listitemgroup[i_group as keyof typeof listitemgroup]} strokeWidth={2} />
				))}
				{/* <Line type="monotone" dataKey="MINUMAN" dot={false} strokeWidth={2} /> */}
				{/* <Area type="monotone" dataKey="cat_price_index" stroke="rgb(var(--txt-success))" fillOpacity={1} fill="rgba(var(--bg-success-100)  / 0.7)" dot={false} strokeWidth={2} /> */}
				<Tooltip contentStyle={{ backgroundColor: "rgba(var(--bg-dialog))", borderRadius: "10px" }} />
				<Legend verticalAlign="bottom" height={36} />

			</LineChart >
		</ResponsiveContainer >
	);
};

export default IndexChart;