import { useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarAction, NavbarMenu } from "@govtechmy/myds-react/navbar";
import { ThemeSwitch } from "../components/ThemeSwitch";
import { Button } from "@govtechmy/myds-react/button";
import { useDuckDB } from "../contexts/DuckDBContext";
import MydsSearchBar from "./SearchBar";

const LakeStatusBadge = () => {
  const { isReady, error } = useDuckDB();

  if (error) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-txt-danger bg-bg-danger-50 dark:bg-bg-danger-900/20 px-3 py-1.5 rounded-full border border-otl-danger-200/50 dark:border-otl-danger-800/50">
        <div className="w-1.5 h-1.5 rounded-full bg-bg-danger-500"></div>
        <span className="hidden sm:inline">Offline</span>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-txt-warning bg-bg-warning-50 dark:bg-bg-warning-900/20 px-3 py-1.5 rounded-full border border-otl-warning-200/50 dark:border-otl-warning-800/50">
        <div className="w-1.5 h-1.5 rounded-full bg-bg-warning-500 animate-pulse"></div>
        <span className="hidden sm:inline">Syncing Data</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-txt-success-700 dark:text-success-400 bg-bg-success-50 dark:bg-success-900/20 px-3 py-1.5 rounded-full border border-otl-success-200/50 dark:border-success-800/50 shadow-sm transition-all hover:bg-bg-success-100">
      <div className="w-1.5 h-1.5 rounded-full bg-bg-success-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
      <span className="hidden sm:inline">Synced</span>
    </div>
  );
};

export default function NavBarHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNotHome = location.pathname !== "/";

  return (
    <Navbar className="h-16 md:h-[72px] border-b border-otl-gray-200 dark:border-otl-gray-800 bg-white/60 dark:bg-[#18181B]/60 backdrop-blur-2xl sticky top-0 z-[9999] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
      <div
        className="flex h-full w-auto mx-auto px-4 sm:px-6 lg:px-8 items-center gap-3 cursor-pointer shrink-0 transition-opacity hover:opacity-75"
        onClick={() => navigate("/")}
      >
        <div className="rounded-lg p-1.5 shadow-sm">
          <img
            src="/icon.png"
            alt="Logo"
            width={22}
            height={22}
            className="aspect-square select-none"
          />
        </div>
        <span className="font-black tracking-tight text-txt-black-900 dark:text-white text-[15px] md:text-lg hidden sm:inline">
          OpenPriceCatcher
        </span>
      </div>

      <NavbarMenu className="gap-1 md:gap-2">
        <Button
          onClick={() => navigate("/")}
          variant="default-ghost"
          className={`w-full xl:w-auto transition-all duration-200 rounded-xl px-4 text-sm ${!isNotHome ? "bg-bg-black-50 dark:bg-[#27272A] text-txt-black-900 dark:text-white font-bold shadow-sm" : "font-semibold text-txt-black-500 hover:text-txt-black-900"}`}
        >
          Overview
        </Button>
        <Button
          onClick={() => navigate("/category")}
          variant="default-ghost"
          className={`w-full xl:w-auto transition-all duration-200 rounded-xl px-4 text-sm ${location.pathname.startsWith("/category") ? "bg-bg-black-50 dark:bg-[#27272A] text-txt-black-900 dark:text-white font-bold shadow-sm" : "font-semibold text-txt-black-500 hover:text-txt-black-900"}`}
        >
          Categories
        </Button>
      </NavbarMenu>

      <NavbarAction className="flex items-center gap-3 md:gap-4">
        {isNotHome && (
          <div className="w-48 md:w-64">
            <MydsSearchBar variant="minimal" />
          </div>
        )}
        <div className="hidden sm:block">
          <LakeStatusBadge />
        </div>
        <div className="">
          <ThemeSwitch as="toggle" />
        </div>
      </NavbarAction>
    </Navbar>
  );
}
