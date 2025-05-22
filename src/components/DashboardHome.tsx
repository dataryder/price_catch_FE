import IndexChart from "./IndexCard";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	CarouselDots
} from "../components/Carousel"

const HomeDashboard = () => {
	const listitemgroup = ['BARANGAN BERBUNGKUS', 'BARANGAN KERING', 'BARANGAN SEGAR', 'MINUMAN', 'PRODUK KEBERSIHAN', 'SUSU DAN BARANGAN BAYI'];

	return (
		<div className="flex flex-col container mx-auto gap-4">
			<div className="mx-4 lg:mx-20">
				<h2 className="text-center py-2 md:py-4 font-semibold text-txt-black-900 md:text-xl">Weekly Indexes</h2>
				<Carousel opts={{ align: "start" }} className="w-full">
					<CarouselContent className="pb-6">
						{listitemgroup.map((i_group) => (
							<CarouselItem key={i_group} className="pl-1 basis-1/2 md:basis-1/3 xl:basis-1/4  ">
								<div className="flex flex-col p-4 gap-2 border border-otl-gray-200 rounded-md mx-1">
									<h3 className="text-txt-black-900 capitalize font-medium max-sm:text-xs text-nowrap text-ellipsis overflow-hidden">{i_group.toLowerCase()}</h3>
									<IndexChart item_group={i_group} period="year" />
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
					<CarouselPrevious className="max-sm:hidden" />
					<CarouselNext className="max-sm:hidden" />
					<CarouselDots />
				</Carousel>
			</div>
			{/* <div className="bg-bg-primary-100 h-[1000px]" ></div> // placeholder */}
		</div >
	);
};

export default HomeDashboard;