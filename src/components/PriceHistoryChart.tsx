import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ItemPriceHistory } from '../types';
import { useTheme } from "@govtechmy/myds-react/hooks";

interface ItemPriceHistoryDataProps {
	data: ItemPriceHistory[];
}

function formatXAxis(tickItem: Date) {
	return tickItem.toLocaleDateString('en-MY', {
		month: 'short',
		day: 'numeric',
	});
}

function formatLabel(tickItem: Date) {
	return tickItem.toLocaleDateString('en-MY', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

const PriceHistoryChart: React.FC<ItemPriceHistoryDataProps> = ({
	data,
}) => {
	const { theme } = useTheme();
	const colorAvg = theme === "dark" ? "#2563EB" : "#6394FF"
	const colorMedian = theme === "dark" ? "#E4E4E7" : "#27272A"
	const colorMin = theme === "dark" ? "#4ADE80" : "#16A34A"
	const colorMax = theme === "dark" ? "#F87171" : "#DC2626"
	const colorbg = theme === "dark" ? "#1D1D2190" : "#FFFFFF90"

	const formattedData = data.map(item => ({
		...item,
		date: new Date(item.date),
		average: item.average.toFixed(2),
	}));


	return (
		<ResponsiveContainer width="100%" height="100%" minHeight={200} className="text-xs text-txt-black-900">
			<LineChart
				data={formattedData}
				margin={{
					top: 5,
					right: 30,
					left: 20,
					bottom: 5,
				}}
			>

				<XAxis dataKey="date" tickFormatter={formatXAxis} minTickGap={20} />
				<YAxis label={{ value: 'RM', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} hide />
				<Tooltip labelFormatter={formatLabel} separator=' RM' contentStyle={{ backgroundColor: colorbg, backdropFilter: 'blur(8px)', border: 0 }} />
				<Legend iconType='plainline' />
				<Line type="stepAfter" dataKey="maximum" stroke={colorMax} dot={false} strokeWidth={3} />
				<Line type="stepAfter" dataKey="median" stroke={colorMedian} dot={false} strokeWidth={3} />
				<Line type="stepAfter" dataKey="average" stroke={colorAvg} dot={false} strokeWidth={3} />
				<Line type="stepAfter" dataKey="minimum" stroke={colorMin} dot={false} strokeWidth={3} />
			</LineChart>
		</ResponsiveContainer>
	);
};

export default PriceHistoryChart;
