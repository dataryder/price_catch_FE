// Increase the z-index of the Hero section (from z-10 to z-20) so the search dropdown overflows above the Dashboard section
import React from "react";
import MydsSearchBar from "../components/SearchBar";
import HomeDashboard from "../components/DashboardHome";
import HeroPattern from "../components/HeroPattern";

const HomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center overflow-x-hidden min-h-screen">
      {/* Changed relative z-10 to z-20 to ensure it stacks above the dashboard below */}
      <div className="flex gap-6 md:gap-8 py-20 px-6 md:py-32 md:px-8 w-full justify-center flex-col items-center relative z-20">
        <HeroPattern className="bg-gradient-to-b from-bg-success-600 dark:from-bg-success-400/90 to-bg-bg-white" />
        <div className="container mx-auto 2xl:px-40 flex flex-col gap-6 relative w-full max-w-3xl items-center">
          <h1 className="text-5xl md:text-7xl text-center text-txt-black-900 dark:text-white font-black tracking-tighter drop-shadow-sm leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Malaysia's prices <br />
            <span className="text-transparent bg-clip-text text-txt-white">
              made easier.
            </span>
          </h1>

          <p className="text-txt-black-700 text-center max-w-xl text-lg md:text-xl font-medium tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Search thousands of items, track historical trends, and instantly
            find the absolute lowest prices in your district.
          </p>

          {/* Add z-50 to the search bar container wrapper */}
          <div className="w-full max-w-2xl mx-auto mt-6 relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 z-50">
            {/* Search Bar Halo Effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-otl-success-400/20 to-emerald-400/20 rounded-3xl blur-md opacity-0 hover:opacity-100 transition duration-500"></div>
            <MydsSearchBar />
          </div>
        </div>
      </div>

      <div className="w-full bg-transparent border-t border-otl-gray-300 pt-8 md:pt-16 pb-8 md:pb-24 relative z-10">
        <HomeDashboard />
      </div>
    </div>
  );
};

export default HomePage;
