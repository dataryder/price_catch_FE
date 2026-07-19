
import {
  Navbar,
  NavbarAction,
  NavbarMenu,
  NavbarMenuItem,
} from "@govtechmy/myds-react/navbar";
import { ThemeSwitch } from "../components/ThemeSwitch";
import MydsSearchBar from "./SearchBar";
import { cn } from "../lib/utils";

export default function NavBarHeader({ pathname = "/" }: { pathname?: string }) {
  const isNotHome = pathname !== "/";

  return (
    <Navbar className="">
      <a
        href="/"
        className="flex h-full w-auto mx-auto px-2 sm:px-6 lg:px-8 items-center gap-3 cursor-pointer shrink-0"
      >
        <div className="rounded-lg shadow-sm">
          <img
            src="/icon.png"
            alt="Logo"
            width={30}
            height={30}
            className="aspect-square select-none"
          />
        </div>
        <span
          className={cn(
            "font-semibold tracking-tight text-txt-black-900 dark:text-white text-lg transition-all",
            isNotHome ? "hidden md:inline" : "inline",
          )}
        >
          OpenPriceCatcher
        </span>
      </a>

      <NavbarMenu>
        <NavbarMenuItem href="/">Overview</NavbarMenuItem>
        <NavbarMenuItem href="/pulse">Market Pulse</NavbarMenuItem>
        <NavbarMenuItem href="/category">Browse by Categories</NavbarMenuItem>
      </NavbarMenu>

      <NavbarAction className="">
        {isNotHome && (
          <div className="w-48 md:w-64">
            <MydsSearchBar variant="minimal" />
          </div>
        )}
        <ThemeSwitch as="toggle" />
      </NavbarAction>
    </Navbar>
  );
}
