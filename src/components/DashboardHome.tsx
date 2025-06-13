import IndexCard from "./IndexCard";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CarouselDots
} from "../components/Carousel";
import { getWeeklyIndexCategory, getWeeklyIndexGroup } from "../services/apiClient"; // Assuming this returns Promise<IndexData>
import { IndexData } from "../types"; // Import the IndexData type
import { useEffect, useState } from "react";
import IndexChart from "./IndexChart";

const HomeDashboard = () => {
	const [cardData, setCardData] = useState<IndexData | null>(null);
	const [chartData, setChartData] = useState<any | null>(null);

	useEffect(() => {
		const fetchCardData = async () => {
			const card_data = await getWeeklyIndexCategory();
			setCardData(card_data);
		};
		fetchCardData();
	}, []);
	useEffect(() => {
		const fetchData = async () => {
			const chart_data = await getWeeklyIndexGroup();
			setChartData(chart_data);
		};
		fetchData();
	}, []);

	const listitemcategory = cardData ? Object.keys(cardData) : [];

	return (
		<div className="flex flex-col container mx-auto gap-10">
			<div className="mx-4 lg:mx-20">
				<h2 className="text-center py-2 md:py-4 font-semibold text-txt-black-900 md:text-xl">Weekly Indexes</h2>
				<Carousel opts={{ align: "start" }} className="w-full">
					<CarouselContent className="pb-6">
						{listitemcategory.map((i_group) => (
							<CarouselItem key={i_group} className="pl-1 basis-1/2 md:basis-1/4 xl:basis-1/6">
								<div className="flex flex-col p-4 gap-2 border border-otl-gray-200 rounded-md mx-1">
									<h3 className="text-txt-black-900 capitalize font-medium max-sm:text-xs text-nowrap text-ellipsis overflow-hidden">{i_group.toLowerCase()}</h3>
									{cardData && <IndexCard item_group={i_group} period="year" data={cardData} />}
									{/* TODO: SKELETON */}
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="max-sm:hidden" />
					<CarouselNext className="max-sm:hidden" />
					<CarouselDots className="max-sm:hidden" />
				</Carousel>
			</div>
			<div className="mx-4 lg:mx-20 p-8 border-t" >
				<h2 className="text-center py-2 md:py-4 font-semibold text-txt-black-900 md:text-xl">Monthly Index</h2>
				<div className="h-[400px] px-10">
					<IndexChart data={chartData} />
				</div>
			</div>
		</div >
	);
};

export default HomeDashboard;