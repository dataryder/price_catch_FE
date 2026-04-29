import React from "react";
import MydsSearchBar from "../components/SearchBar";
import HomeDashboard from "../components/DashboardHome";
import { Tag } from "@govtechmy/myds-react/tag";

const HomePage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center overflow-x-hidden min-h-screen bg-bg-white dark:bg-bg-black-950">
      {/* Premium Atmospheric Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-otl-success-400/20 to-transparent dark:from-otl-success-600/15 blur-[100px] rounded-[100%] pointer-events-none -z-10" />

      {/* Subtle Micro-Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="flex gap-6 md:gap-8 py-20 px-6 md:py-32 md:px-8 w-full justify-center flex-col items-center relative z-10">
        <div className="container mx-auto 2xl:px-40 flex flex-col gap-6 relative w-full max-w-3xl items-center">
          {/* Elevated Status Badge */}
          <Tag
            variant="default"
            size="medium"
            mode="pill"
            className="shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-bottom-4 duration-700"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-bg-success-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-bg-success-500"></span>
            </span>
            <span className="text-[11px] font-bold text-txt-black-700 dark:text-gray-300 tracking-widest uppercase">
              Live KPDN Data Stream
            </span>
          </Tag>

          <h1 className="text-5xl md:text-7xl text-center text-txt-black-900 dark:text-white font-black tracking-tighter drop-shadow-sm leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Smart grocery pricing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bg-success-600 to-emerald-400 dark:from-bg-success-400 dark:to-emerald-300">
              Zero guesswork.
            </span>
          </h1>

          <p className="text-txt-black-500 dark:text-gray-400 text-center max-w-xl text-lg md:text-xl font-medium tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Search thousands of items, track historical trends, and instantly
            find the absolute lowest prices in your district.
          </p>

          <div className="w-full max-w-2xl mx-auto mt-6 relative animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            {/* Search Bar Halo Effect */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-otl-success-400/20 to-emerald-400/20 rounded-3xl blur-md opacity-0 hover:opacity-100 transition duration-500"></div>
            <MydsSearchBar />
          </div>
        </div>
      </div>

      <div className="w-full bg-transparent border-t border-otl-gray-200/40 dark:border-otl-gray-800/40 pt-16 pb-24 relative z-10">
        <HomeDashboard />
      </div>
    </div>
  );
};

export default HomePage;
