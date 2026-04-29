import IndexCard from "./IndexCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "../components/Carousel";
import { getWeeklyIndexCategory } from "../services/apiClient";
import { IndexData } from "../types";
import { useEffect, useState } from "react";

const HomeDashboard = () => {
  const [cardData, setCardData] = useState<IndexData | null>(null);

  useEffect(() => {
    const fetchCardData = async () => {
      const card_data = await getWeeklyIndexCategory();
      setCardData(card_data);
    };
    fetchCardData();
  }, []);

  const listitemcategory = cardData ? Object.keys(cardData) : [];

  return (
    <div className="flex flex-col container mx-auto gap-4 md:gap-10 pb-16">
      <div className="mx-4 md:mx-10 lg:mx-20 relative">
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <h2 className="text-center font-black text-txt-black-900 dark:text-white text-3xl tracking-tighter">
            Market Pulse
          </h2>
          <p className="text-sm font-bold text-txt-black-400 dark:text-gray-500 uppercase tracking-widest">
            Weekly Category Indexes
          </p>
        </div>

        <Carousel opts={{ align: "start" }} className="w-full relative z-10">
          <CarouselContent className="pb-10 pt-4">
            {listitemcategory.map((i_group) => (
              <CarouselItem
                key={i_group}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 xl:basis-1/4"
              >
                <div className="group flex flex-col h-full p-6 gap-4 border border-otl-gray-200/80 dark:border-gray-800 rounded-[24px] bg-white dark:bg-[#1D1D21] shadow-[0_2px_10px_rgba(0,0,0,0.02)] mx-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] hover:border-otl-success-300 dark:hover:border-success-800 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <h3 className="text-txt-black-900 dark:text-white capitalize font-black text-sm tracking-tight text-nowrap text-ellipsis overflow-hidden group-hover:text-txt-success-600 dark:group-hover:text-success-400 transition-colors">
                      {i_group.toLowerCase()}
                    </h3>
                    <div className="w-2 h-2 rounded-full bg-otl-success-400/40 dark:bg-success-900/50 group-hover:bg-otl-success-500 dark:group-hover:bg-success-500 transition-colors shadow-sm"></div>
                  </div>
                  <div className="flex-grow pt-2">
                    {cardData ? (
                      <IndexCard
                        item_group={i_group}
                        period="year"
                        data={cardData}
                      />
                    ) : (
                      <div className="h-[120px] w-full bg-bg-black-25 dark:bg-gray-800/50 rounded-xl animate-pulse" />
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-5 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-[#1D1D21]/90 backdrop-blur-md border border-otl-gray-200 dark:border-gray-800 shadow-md hover:bg-white dark:hover:bg-[#27272A] hover:scale-110 transition-all text-txt-black-900 dark:text-white" />
            <CarouselNext className="absolute -right-5 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-[#1D1D21]/90 backdrop-blur-md border border-otl-gray-200 dark:border-gray-800 shadow-md hover:bg-white dark:hover:bg-[#27272A] hover:scale-110 transition-all text-txt-black-900 dark:text-white" />
          </div>
          <CarouselDots className="mt-4" />
        </Carousel>
      </div>
    </div>
  );
};

export default HomeDashboard;
