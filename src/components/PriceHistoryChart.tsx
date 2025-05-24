import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ItemPriceHistory } from '../types';
interface ItemPriceHistoryDataProps {
	data: ItemPriceHistory[];
	period: "month" | "year" | null;
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
	period
}) => {
	const formattedData = data.map(item => ({
		...item,
		date: new Date(item.date),
		average: item.average.toFixed(2),
	}));

	function formatXAxis(tickItem: Date) {

		if (period === "month") {
			return tickItem.toLocaleDateString('en-MY', {
				month: 'short',
				day: 'numeric',
			});
		}
		return tickItem.toLocaleDateString('en-MY', {
			month: 'short',
			year: 'numeric',
		});
	}


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
				<Tooltip labelFormatter={formatLabel} separator=' RM' contentStyle={{ backgroundColor: "rgba(var(--bg-white) /0.9)", backdropFilter: 'blur(8px)', border: 0 }} />
				<Legend iconType='plainline' />
				<Line type="stepAfter" dataKey="maximum" stroke="rgb(var(--txt-danger))" dot={false} strokeWidth={3} />
				<Line type="stepAfter" dataKey="median" stroke="rgb(var(--txt-black-900))" dot={false} strokeWidth={3} />
				<Line type="stepAfter" dataKey="average" stroke="rgb(var(--txt-primary))" dot={false} strokeWidth={3} />
				<Line type="stepAfter" dataKey="minimum" stroke="rgb(var(--txt-success))" dot={false} strokeWidth={3} />
			</LineChart>
		</ResponsiveContainer>
	);
};

export default PriceHistoryChart;
