You are a senior software architect an staff engineer. You produce optimized, maintainable code that follows best practices. 

Your task is to review the current codebase and implement the changes below:
1. remove the curent ducklake architecture
2. use a Micro-Parquet approach: 
Backend Fan-out: DuckDB writes files into a folder structure: /data/item_code=123/data.parquet.
Frontend Routing: The React app maps the URL /item/123 directly to the file path data/item_code=123/data.parquet.
Atomic Fetch: The browser performs one standard GET request. The CDN (Cloudflare) caches this specific file.

Prioritize the UX of frontend.

You also suggest improvements or optimizations for the codebase.

Rules:
- Keep your suggestions concise and focused. Avoid unnecessary explanations or fluff. 
- Your output should be a series of specific, actionable changes.

When approaching this task:
1. Carefully review the provided code.
2. Identify areas that could be improved in terms of efficiency, readability, or maintainability.
3. Consider best practices for the specific programming language used.
4. Think about potential optimizations that could enhance performance.
5. Look for opportunities to refactor or restructure the code for better organization.

For each suggested change, provide:
1. A short description of the change (one line maximum).
2. The modified code block.

Use the following format for your output:

[Short Description]
```[language]:[path/to/file]
[code block]
```

Begin your analysis and provide your suggestions now.

My current front-end codebase:
<current_frontend_codebase>
<source_code>
eslint.config.js
```
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

index.html
```
<!doctype html>
<html lang="en" class="bg-bg-white dark:bg-bg-black-950">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favi.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- HTML Meta Tags -->
    <title>OpenPriceCatcher</title>
    <meta
      name="description"
      content="Track, compare, and analyze Malaysia retail prices instantly. KPDN PriceCatcher data without the mobile app fuss."
    />

    <!-- Facebook Meta Tags -->
    <meta property="og:url" content="https://pricecatcher.civictech.my/" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="OpenPriceCatcher" />
    <meta property="og:description" content="WIP" />
    <meta
      property="og:image"
      content="https://pricecatcher.civictech.my/icon.png"
    />

    <!-- Twitter Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="twitter:domain" content="pricecatcher.civictech.my" />
    <meta property="twitter:url" content="https://pricecatcher.civictech.my/" />
    <meta name="twitter:title" content="OpenPriceCatcher" />
    <meta
      name="twitter:description"
      content="KPDN PriceCatcher without the mobile app fuss."
    />
    <meta
      name="twitter:image"
      content="https://pricecatcher.civictech.my/icon.png"
    />
    <link href="/src/index.css" rel="stylesheet" />

    <script>
      (function () {
        const theme = localStorage.getItem("theme");
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      })();
    </script>
    <link
      rel="preload"
      href="https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1-dev53.0/dist/duckdb-mvp.wasm"
      as="fetch"
      type="application/wasm"
      crossorigin="anonymous"
    />

    <link
      rel="preload"
      href="https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.33.1-dev53.0/dist/duckdb-browser-mvp.worker.js"
      as="script"
      crossorigin="anonymous"
    />
  </head>

  <body
    className="bg-bg-white dark:bg-bg-black-950 text-txt-black-900 dark:text-white transition-colors duration-300"
  >
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

package.json
```
{
  "name": "price-catch",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "pages:dev": "wrangler pages dev --proxy 5173 -- npm run dev"
  },
  "dependencies": {
    "@apache-arrow/ts": "^21.1.0",
    "@duckdb/duckdb-wasm": "^1.33.1-dev53.0",
    "@govtechmy/myds-react": "^0.0.23",
    "@govtechmy/myds-style": "^0.0.10",
    "@tailwindcss/vite": "^4.1.5",
    "@types/d3-scale-chromatic": "^3.1.0",
    "baseline-browser-mapping": "^2.10.24",
    "caniuse-lite": "^1.0.30001791",
    "d3-geo": "^3.1.1",
    "d3-scale-chromatic": "^3.1.0",
    "embla-carousel-react": "^8.6.0",
    "lodash.debounce": "^4.0.8",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.5.3",
    "recharts": "^2.15.3"
  },
  "devDependencies": {
    "@eslint/js": "^9.22.0",
    "@tailwindcss/typography": "^0.5.16",
    "@types/d3-geo": "^3.1.0",
    "@types/lodash.debounce": "^4.0.9",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.22.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.7.2",
    "typescript-eslint": "^8.26.1",
    "vite": "^6.4.1",
    "wrangler": "^4.41.0"
  }
}
```

postcss.config.js
```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

tailwind.config.js
```
/** @type {import('tailwindcss').Config} */
import { preset } from "@govtechmy/myds-style";
export default {
  darkMode: "selector",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx,html}",
    "./node_modules/@govtechmy/myds-react/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  presets: [preset],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', "Inter", "sans-serif"],
        body: ['"Google Sans"', "Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
```

tsconfig.app.json
```
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

tsconfig.json
```
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

tsconfig.node.json
```
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

vite.config.ts
```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  optimizeDeps: {
    exclude: ["@duckdb/duckdb-wasm"],
  },
});
```

public/_redirects
```
```

src/App.tsx
```
import { Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import NavBarHeader from "./components/Navbar";
import FooterBar from "./components/Footer";
import { useTheme } from "@govtechmy/myds-react/hooks";

import HomePage from "./pages/Home";
import { Spinner } from "@govtechmy/myds-react/spinner";

const FullSearchResultsPage = lazy(
  () => import("./pages/FullSearchResultsPage"),
);
const ItemDetailsWrapper = lazy(() => import("./pages/ItemDetailsWrapper"));
const CategoryPage = lazy(() => import("./pages/CategoryCatalog"));
const MarketPulsePage = lazy(() => import("./pages/MarketPulse"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

function App() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "light");
  }, [setTheme]);

  return (
    <div className="w-full min-h-screen bg-bg-white dark:bg-[#18181B] transition-colors duration-300">
      <div className="min-h-screen flex flex-col">
        <NavBarHeader />

        <main className="flex-grow flex flex-col">
          <Suspense
            fallback={
              <div className="flex-grow flex items-center justify-center min-h-[50vh]">
                <Spinner size="large" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/search-results"
                element={<FullSearchResultsPage />}
              />
              <Route path="/item/:itemCode" element={<ItemDetailsWrapper />} />
              <Route path="/pulse" element={<MarketPulsePage />} />
              <Route path="/category" element={<CategoryPage />}>
                <Route path=":group" element={<CategoryPage />}>
                  <Route path=":category" element={<CategoryPage />} />
                </Route>
              </Route>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </main>

        <FooterBar />
      </div>
    </div>
  );
}

export default App;
```

src/index.css
```
@import "@govtechmy/myds-style/full.css";
@import url("https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@theme {
  --font-sans: '"Google Sans"', "Inter", ui-sans-serif, system-ui, sans-serif;
}

@layer base {
  body {
    font-family: "Google Sans", sans-serif;
  }
}

@layer utilities {
  .scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background: rgba(113, 113, 122, 0.3);
    border-radius: 10px;
  }

  .scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(113, 113, 122, 0.6);
  }

  .darkscrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .darkscrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .darkscrollbar::-webkit-scrollbar-thumb {
    background: rgba(161, 161, 170, 0.3);
    border-radius: 10px;
  }

  .darkscrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(161, 161, 170, 0.6);
  }
}
```

src/main.tsx
```
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "@govtechmy/myds-react/hooks";
import { DuckDBProvider } from './contexts/DuckDBContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <DuckDBProvider>
          <App />
        </DuckDBProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)
```

src/types.ts
```
export interface SearchResultInput {
  item_code: number;
  item: string;
  unit: string;
  item_group: string;
  item_category: string;
  item_eng: string;
  item_group_eng: string;
  item_category_eng: string;
  frequency: string;
  status: string;
}

export interface SearchResultItem {
  item_code: number;
  item: string;
  unit: string;
  item_group: string;
  item_category: string;
  similarity_score: number;
  frequency: string;
}

export interface PriceHistoryEntry {
  date: string; // Or Date object if you parse it
  premise: string;
  premise_type: string;
  state: string;
  district: string;
  price: number;
}

export interface ItemDetailsInput {
  item_code: string;
  state?: string; // Optional filters
  district?: string; // Optional filters
}

export interface ItemLatestInput {
  item_code: string;
  state?: string; // Optional filters
  district?: string; // Optional filters
}

export interface ItemMetadata {
  item_code: number;
  item: string;
  unit: string;
  item_group: string;
  item_category: string;
  median: number;
  minimum: number;
  maximum: number;
  q75: number;
  last_updated: string;
  frequency: string;
}

export interface ItemLatest {
  date: string; // Add this line
  premise: string;
  premise_type: string;
  state: string;
  district: string;
  price: number;
}

// Update this interface inside types.ts
export interface ItemPriceHistory {
  date: string;
  median: number;
  p5: number;
  p95: number;
}

export interface CategoryItemData {
  item_code: number;
  item: string;
  unit: string;
  item_group: string;
  item_category: string;
}

export interface CategoryData {
  item_group: string;
  item_category: string;
}

export interface RawDataRow {
  date: string;
  cat_price_index: number;
  pop_change_pct?: number;
}

export interface ProcessedDataRow {
  date: Date;
  cat_price_index: number;
  pop_change_pct?: number;
}

export interface IndexData {
  [itemGroupName: string]: RawDataRow[];
}
export interface IndexChartProps {
  item_group: string;
  period: "month" | "year" | null;
  data: IndexData;
}

export interface IndexChartAgg {
  date: Date;
  "BARANGAN BERBUNGKUS": number | null;
  "BARANGAN KERING": number | null;
  "BARANGAN SEGAR": number | null;
  MINUMAN: number | null;
  "PRODUK KEBERSIHAN": number | null;
  "SUSU DAN BARANGAN BAYI": number | null;
}
```

src/vite-env.d.ts
```
/// <reference types="vite/client" />
```

src/components/Carousel.tsx
```
"use client"

import * as React from "react"
import useEmblaCarousel, {
	type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ChevronRightIcon, ChevronLeftIcon } from "@govtechmy/myds-react/icon"

import { cn } from "../lib/utils"
import { Button } from "@govtechmy/myds-react/button"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
	opts?: CarouselOptions
	plugins?: CarouselPlugin
	orientation?: "horizontal" | "vertical"
	setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
	carouselRef: ReturnType<typeof useEmblaCarousel>[0]
	api: ReturnType<typeof useEmblaCarousel>[1]
	scrollPrev: () => void
	scrollNext: () => void
	scrollTo: (index: number) => void
	canScrollPrev: boolean
	canScrollNext: boolean
	selectedIndex: number
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
	const context = React.useContext(CarouselContext);

	if (!context) {
		throw new Error("useCarousel must be used within a <Carousel />");
	}

	return context;
}

function Carousel({
	orientation = "horizontal",
	opts,
	setApi,
	plugins,
	className,
	children,
	...props
}: React.ComponentProps<"div"> & CarouselProps) {
	const [carouselRef, api] = useEmblaCarousel(
		{
			...opts,
			axis: orientation === "horizontal" ? "x" : "y",
		},
		plugins
	);
	const [canScrollPrev, setCanScrollPrev] = React.useState(false);
	const [canScrollNext, setCanScrollNext] = React.useState(false);
	const [selectedIndex, setSelectedIndex] = React.useState(
		opts?.startIndex || 0
	);

	const onSelect = React.useCallback((api: CarouselApi) => {
		if (!api) return;
		setCanScrollPrev(api.canScrollPrev());
		setCanScrollNext(api.canScrollNext());
		setSelectedIndex(api.selectedScrollSnap());
	}, []);

	const scrollPrev = React.useCallback(() => {
		api?.scrollPrev();
	}, [api]);

	const scrollNext = React.useCallback(() => {
		api?.scrollNext();
	}, [api]);

	const scrollTo = React.useCallback(
		(index: number) => {
			if (index === api?.selectedScrollSnap()) return;
			// const autoplay = api?.plugins()?.autoplay;
			// autoplay?.reset();
			api?.scrollTo(index);
		},
		[api]
	);

	const handleKeyDown = React.useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (event.key === "ArrowLeft") {
				event.preventDefault();
				scrollPrev();
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				scrollNext();
			}
		},
		[scrollPrev, scrollNext]
	);

	React.useEffect(() => {
		if (!api || !setApi) return;
		setApi(api);
	}, [api, setApi]);

	React.useEffect(() => {
		if (!api) return;
		onSelect(api);
		api.on("reInit", onSelect);
		api.on("select", onSelect);

		return () => {
			api?.off("select", onSelect);
		};
	}, [api, onSelect]);

	return (
		<CarouselContext.Provider
			value={{
				carouselRef,
				api,
				opts,
				orientation:
					orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
				scrollPrev,
				scrollNext,
				scrollTo,
				canScrollPrev,
				canScrollNext,
				selectedIndex,
			}}
		>
			<div
				onKeyDownCapture={handleKeyDown}
				className={cn("relative", className)}
				role="region"
				aria-roledescription="carousel"
				data-slot="carousel"
				{...props}
			>
				{children}
			</div>
		</CarouselContext.Provider>
	);
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
	const { carouselRef, orientation } = useCarousel();

	return (
		<div
			ref={carouselRef}
			className="overflow-hidden"
			data-slot="carousel-content"
		>
			<div
				className={cn(
					"flex",
					orientation === "horizontal" ? "flex-row" : "-mt-4 flex-col",
					className
				)}
				{...props}
			/>
		</div>
	);
}

function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
	const { selectedIndex, scrollTo, api } = useCarousel();

	return (
		<div
			role="tablist"
			className={cn(
				"absolute bottom-0 w-full flex items-center justify-center gap-2",
				className
			)}
			{...props}
		>
			{api?.scrollSnapList().map((_, index) => (
				<Button
					size="small"
					key={index}
					role="tab"
					data-slot="carousel-dot"
					aria-selected={index === selectedIndex}
					aria-controls="carousel-item"
					aria-label={`Slide ${index + 1}`}
					className={cn(
						"w-2 h-2 md:w-2 md:h-2 p-0 rounded-full border border-otl-gray-200 cursor-pointer",
						index === selectedIndex ? "bg-bg-black-500 hover:bg-bg-black-500" : "bg-bg-black-300 hover:bg-bg-black-500"
					)}
					onClick={() => scrollTo(index)}
				/>
			))}
		</div>
	);
}


const CarouselItem = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	const { orientation } = useCarousel()

	return (
		<div
			ref={ref}
			role="group"
			aria-roledescription="slide"
			className={cn(
				"min-w-0 shrink-0 grow-0 basis-full",
				orientation === "horizontal" ? "pl-4" : "pt-4",
				className
			)}
			{...props}
		/>
	)
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
	const { orientation, scrollPrev, canScrollPrev } = useCarousel()

	return (
		<Button
			ref={ref}
			variant="default-outline"
			size="large"
			className={cn(
				"absolute  h-10 w-10 rounded-full",
				orientation === "horizontal"
					? "-left-12 top-1/2 -translate-y-1/2"
					: "-top-12 left-1/2 -translate-x-1/2 rotate-90",
				className
			)}
			disabled={!canScrollPrev}
			onClick={scrollPrev}
			iconOnly
			{...props}
		>
			<ChevronLeftIcon className="h-4 w-4" />
			<span className="sr-only">Previous slide</span>
		</Button>
	)
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
	HTMLButtonElement,
	React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
	const { orientation, scrollNext, canScrollNext } = useCarousel()

	return (
		<Button
			ref={ref}
			variant="default-outline"
			size="large"
			className={cn(
				"absolute h-10 w-10 rounded-full",
				orientation === "horizontal"
					? "-right-12 top-1/2 -translate-y-1/2"
					: "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
				className
			)}
			disabled={!canScrollNext}
			onClick={scrollNext}
			iconOnly
			{...props}
		>
			<ChevronRightIcon className="h-4 w-4" />
			<span className="sr-only">Next slide</span>
		</Button>
	)
})
CarouselNext.displayName = "CarouselNext"

export {
	type CarouselApi,
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselPrevious,
	CarouselNext,
	CarouselDots,
}
```

src/components/CategoryTags.tsx
```
import React from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "@govtechmy/myds-react/tag";

interface TagProps {
  size: "small" | "medium" | "large";
  group: string;
  category: string;
  frequency?: string;
}

const CategoryTag: React.FC<TagProps> = ({
  size,
  group,
  category,
  frequency,
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex gap-2">
      <Tag
        size={size}
        variant="warning"
        mode="pill"
        onClick={() => navigate(`/category/${group}`)}
        className={
          frequency ? "max-sm:hidden cursor-pointer" : "cursor-pointer"
        }
        tabIndex={0}
      >
        {group}
      </Tag>
      <Tag
        size={size}
        variant="primary"
        mode="pill"
        onClick={() => navigate(`/category/${group}/${category}`)}
        className="cursor-pointer"
      >
        {category}
      </Tag>

      {frequency && (
        <Tag
          size="small"
          variant={
            frequency === "daily"
              ? "success"
              : frequency === "weekly"
                ? "warning"
                : frequency === "discontinued"
                  ? "default"
                  : "danger"
          }
          mode="default"
        >
          {frequency}
        </Tag>
      )}
    </div>
  );
};

export default CategoryTag;
```

src/components/CategoryTrendCard.tsx
```
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDuckDB } from "../contexts/DuckDBContext";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { RawDataRow } from "../types";
import { ArrowDownIcon, ArrowUpIcon } from "@govtechmy/myds-react/icon";

interface CategoryTrendCardProps {
  category: string;
  data: RawDataRow[];
}

const CategoryTrendCard: React.FC<CategoryTrendCardProps> = ({
  category,
  data,
}) => {
  const navigate = useNavigate();
  const { conn } = useDuckDB();

  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      date: new Date(d.date),
    }));
  }, [data]);

  const latest = data[data.length - 1];
  const pop = latest?.pop_change_pct || 0;

  // Set neutral range between -0.1% and 0.1%
  const isNeutral = pop >= -0.1 && pop <= 0.1;
  const isUp = pop > 0.1;

  // Price increases = bad (danger/red), Price decreases = good (success/green)
  const colorHex = isUp ? "#EF4444" : isNeutral ? "#71717A" : "#22C55E";
  const textColorClass = isUp
    ? "text-[#EF4444]"
    : isNeutral
      ? "text-txt-black-500 dark:text-gray-400"
      : "text-[#22C55E]";

  // Sanitize the category string to ensure a valid SVG ID without spaces
  const safeId = useMemo(
    () => category.replace(/[^a-zA-Z0-9]/g, ""),
    [category],
  );

  const handleClick = async () => {
    if (!conn) return;
    try {
      const stmt = await conn.prepare(
        "SELECT item_group FROM lake.lookup_item WHERE item_category = ? LIMIT 1",
      );
      const result = await stmt.query(category);
      const arr = result.toArray();
      if (arr.length > 0) {
        const group = arr[0].toJSON().item_group;
        navigate(`/category/${group}/${category.replace("/", " | ")}`);
      }
      stmt.close();
    } catch (e) {
      console.error("Failed to route to category", e);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer group flex flex-col h-full p-5 gap-3 border border-otl-gray-300 rounded-lg bg-bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400"
    >
      <div className="flex flex-col">
        <h3 className="text-txt-black-900 dark:text-white capitalize font-semibold text-sm tracking-tight line-clamp-1 transition-colors">
          {category.toLowerCase()}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className={`text-xl md:text-3xl text-nowrap ${textColorClass}`}>
            {isUp ? (
              <ArrowUpIcon className="inline" />
            ) : isNeutral ? (
              ""
            ) : (
              <ArrowDownIcon className="inline" />
            )}{" "}
            {Math.abs(pop).toFixed(1)}%
          </span>
          <span className="text-[11px] text-txt-black-500">WoW</span>
        </div>
      </div>

      <div className="flex-grow h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%" className="rounded-xl">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`grad-${safeId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorHex} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colorHex} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={["auto", "auto"]} hide />
            <Area
              type="monotone"
              dataKey="cat_price_index"
              stroke={colorHex}
              fill={`url(#grad-${safeId})`}
              strokeWidth={2.5}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="text-right text-[9px] text-txt-black-500 uppercase tracking-widest">
          1Y Trend
        </div>
      </div>
    </div>
  );
};

export default CategoryTrendCard;
```

src/components/DashboardHome.tsx
```
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getWeeklyIndexCategory } from "../services/apiClient";
import { IndexData } from "../types";
import CategoryTrendCard from "./CategoryTrendCard";
import { Button, ButtonIcon } from "@govtechmy/myds-react/button";
import { ChevronRightIcon } from "@govtechmy/myds-react/icon";

const cardDataPromise = getWeeklyIndexCategory();

const HomeDashboard = () => {
  const navigate = useNavigate();
  const [cardData, setCardData] = useState<IndexData | null>(null);

  useEffect(() => {
    cardDataPromise.then(setCardData).catch(console.error);
  }, []);

  const topMovers = useMemo(() => {
    if (!cardData) return [];
    return Object.entries(cardData)
      .map(([cat, data]) => {
        const latest = data[data.length - 1];
        return { cat, data, pop: latest?.pop_change_pct || 0 };
      })
      .sort((a, b) => Math.abs(b.pop) - Math.abs(a.pop)) // Sort by highest volatility
      .slice(0, 6);
  }, [cardData]);

  return (
    <div className="flex flex-col container mx-auto gap-6 px-4 md:px-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-4">
        <div>
          <h2 className="text-center md:text-left font-semibold text-txt-black-900 dark:text-white text-2xl tracking-tighter">
            Top Movers
          </h2>
          <p className="text-center md:text-left text-sm text-txt-black-500 dark:text-gray-500">
            Categories with highest week-over-week volatility
          </p>
        </div>
        <Button
          variant="default-outline"
          className="rounded-full shrink-0"
          onClick={() => navigate("/pulse")}
        >
          View Market Pulse
          <ButtonIcon>
            <ChevronRightIcon />
          </ButtonIcon>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cardData
          ? topMovers.map(({ cat, data }) => (
              <CategoryTrendCard key={cat} category={cat} data={data} />
            ))
          : [...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[160px] w-full bg-bg-black-25 dark:bg-[#1D1D21] rounded-[24px] animate-pulse border border-otl-gray-300"
              />
            ))}
      </div>
    </div>
  );
};

export default HomeDashboard;
```

src/components/Footer.tsx
```
import { Footer, SiteInfo, FooterSection } from "@govtechmy/myds-react/footer";
import { Link } from "@govtechmy/myds-react/link";
import { useDuckDB } from "../contexts/DuckDBContext";

export default function FooterBar() {
  const { maxDate } = useDuckDB();

  return (
    <Footer className="mt-auto pt-10 pb-12 bg-transparent border-t border-otl-gray-200/50 dark:border-gray-800/50">
      <FooterSection className="flex flex-col md:flex-row justify-between items-center w-full py-0 border-none gap-8">
        <SiteInfo>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Link
              href="https://github.com/dataryder"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Github link"
              underline="none"
              className="flex items-center gap-2.5 group"
            >
              <img
                src="https://avatars.githubusercontent.com/u/205435790?s=200&v=4"
                width={28}
                height={28}
                alt="logo"
                loading="lazy"
                className="rounded-full select-none grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 shadow-sm"
              />
              <span className="font-bold text-sm text-txt-black-500 dark:text-gray-500 group-hover:text-txt-black-900 dark:group-hover:text-white transition-colors">
                DataRyder
              </span>
            </Link>

            <span className="hidden md:block w-1 h-1 rounded-full bg-otl-gray-300 dark:bg-gray-700"></span>

            <p className="text-[11px] font-bold text-txt-black-400 dark:text-gray-500 text-center tracking-widest uppercase">
              Sourced from{" "}
              <Link
                href="https://pricecatcher.kpdn.gov.my/"
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                className="text-txt-black-600 dark:text-gray-300 hover:text-txt-black-900 dark:hover:text-white transition-colors"
              >
                KPDN
              </Link>{" "}
              via{" "}
              <Link
                href="https://data.gov.my/"
                target="_blank"
                rel="noopener noreferrer"
                underline="none"
                className="text-txt-black-600 dark:text-gray-300 hover:text-txt-black-900 dark:hover:text-white transition-colors"
              >
                data.gov.my
              </Link>
            </p>
          </div>
        </SiteInfo>

        <div className="flex flex-col items-center md:items-end text-txt-black-400 dark:text-gray-500 text-xs gap-1.5 font-medium tracking-tight">
          <p className="font-bold text-txt-black-900 dark:text-white">
            OpenPriceCatcher © {new Date().getFullYear()}
          </p>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 flex items-center gap-1.5">
            Data As Of:{" "}
            {maxDate ? (
              new Date(maxDate).toLocaleDateString("en-MY", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            ) : (
              <span className="h-3 w-16 bg-otl-gray-200 dark:bg-gray-800 rounded animate-pulse inline-block" />
            )}
          </p>
        </div>
      </FooterSection>
    </Footer>
  );
}
```

src/components/HeroPattern.tsx
```
import React, { useMemo } from "react";

const HeroPattern: React.FC<{ className?: string }> = ({ className }) => {
  // Generate random properties for 60 sparkles
  const sparkles = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 15 + 5, // 5px to 20px
      duration: Math.random() * 15 + 10, // 10s to 25s
      delay: Math.random() * -20, // Negative delay so they start at different points
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none text-white dark:text-black fill-white dark:fill-black ${className}`}
    >
      <style>
        {`
          @keyframes hero-float {
            0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
            10% { opacity: var(--op); }
            90% { opacity: var(--op); }
            100% { transform: translateY(-400px) rotate(180deg); opacity: 0; }
          }
          .sparkle-container {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          .sparkle {
            position: absolute;
            fill: rgb(var(--bg-white)); 
            animation: hero-float var(--dur) linear infinite;
            animation-delay: var(--del);
            opacity: 0;
          }
        `}
      </style>

      <div className="sparkle-container">
        {sparkles.map((s) => (
          <svg
            key={s.id}
            viewBox="0 0 24 24"
            className="sparkle"
            style={
              {
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                "--dur": `${s.duration}s`,
                "--del": `${s.delay}s`,
                "--op": s.opacity,
              } as React.CSSProperties
            }
          >
            {/* Elegant 4-pointed twinkle star */}
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        ))}
      </div>
    </div>
  );
};

export default HeroPattern;
```

src/components/IndexCard.tsx
```
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { IndexData, ProcessedDataRow, RawDataRow } from "../types";

interface IndexCardProps {
  item_group: string;
  period: "month" | "year" | null;
  data: IndexData;
}

function formatLabel(tickItem: Date) {
  return tickItem.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

const CustomTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#27272A]/95 backdrop-blur-xl border border-otl-gray-200/80 dark:border-gray-700 p-2.5 rounded-xl shadow-xl flex flex-col gap-1 items-center">
        <p className="text-txt-black-500 dark:text-gray-400 font-bold tracking-widest text-[9px] uppercase">
          {`${formatLabel(label)}`}
        </p>
        <p className="text-txt-black-900 dark:text-white font-black text-sm leading-none">
          {payload[0].value?.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

const IndexCard: React.FC<IndexCardProps> = ({ item_group, period, data }) => {
  const indexdatats: IndexData = data;
  const group_data: RawDataRow[] = indexdatats[item_group];
  const filtered_data: ProcessedDataRow[] = group_data.map(
    (row: RawDataRow): ProcessedDataRow => {
      const dateObject = new Date(row.date);
      return {
        ...row,
        date: dateObject,
      };
    },
  );

  function formatXAxis(tickItem: Date) {
    if (period === "month") {
      return tickItem.toLocaleDateString("en-MY", {
        month: "short",
        day: "numeric",
      });
    }
    return tickItem.toLocaleDateString("en-MY", {
      month: "short",
      year: "2-digit",
    });
  }

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minHeight={120}
      minWidth={50}
      className="text-[10px] text-txt-black-400 dark:text-gray-500 font-semibold"
    >
      <AreaChart
        data={filtered_data}
        margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient
            id={`colorGradient-BAWANG`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--otl-success-500, #22C55E)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--otl-success-500, #22C55E)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          minTickGap={20}
          height={20}
          tickLine={false}
          axisLine={false}
          stroke="currentColor"
          dy={8}
        />
        <YAxis domain={["auto", "auto"]} hide />
        <Area
          type="monotone"
          dataKey="cat_price_index"
          stroke="var(--otl-success-500, #22C55E)"
          fillOpacity={1}
          fill={`url(#colorGradient-BAWANG)`}
          dot={false}
          strokeWidth={2.5}
          activeDot={{
            r: 5,
            strokeWidth: 0,
            fill: "var(--otl-success-600, #16A34A)",
          }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: "currentColor",
            strokeWidth: 1.5,
            opacity: 0.15,
            strokeDasharray: "4 4",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default IndexCard;
```

src/components/IndexChart.tsx
```
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { IndexChartAgg } from "../types";

interface IndexChartProps {
  data: IndexChartAgg[];
}

const listitemgroup = {
  "BARANGAN BERBUNGKUS": "rgb(var(--bg-warning-700))",
  "BARANGAN KERING": "rgb(var(--bg-primary-500))",
  MINUMAN: "rgb(var(--bg-primary-700))",
  "PRODUK KEBERSIHAN": "rgb(var(--bg-success-700))",
  "SUSU DAN BARANGAN BAYI": "rgb(var(--bg-warning-500))",
};

const IndexChart: React.FC<IndexChartProps> = ({ data }) => {
  const indexdatats: IndexChartAgg[] = data;

  function formatXAxis(tickItem: string) {
    const dateObject = new Date(tickItem);
    return dateObject.toLocaleString("en-MY", {
      month: "short",
      year: "2-digit",
    });
  }

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minHeight={200}
      minWidth={200}
      className="text-xs text-txt-black-900"
    >
      <LineChart
        data={indexdatats}
        margin={{
          top: 5,
          right: 0,
          left: -30,
          bottom: 0,
        }}
      >
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          minTickGap={20}
          height={20}
          tickLine={false}
          allowDataOverflow={false}
        />
        <YAxis domain={["auto", "auto"]} />
        {Object.keys(listitemgroup).map((i_group) => (
          <Line
            key={i_group}
            type="natural"
            dataKey={i_group}
            dot={false}
            stroke={listitemgroup[i_group as keyof typeof listitemgroup]}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(var(--bg-dialog))",
            borderRadius: "10px",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          wrapperStyle={{ padding: "10px" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default IndexChart;
```

src/components/ItemMetadata.tsx
```
// @ts-ignore
import React, { useState, useEffect } from "react";
import { ItemMetadata, ItemPriceHistory } from "../types";
// import { Tag } from "@govtechmy/myds-react/tag";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@govtechmy/myds-react/tabs";

import CategoryTag from "./CategoryTags";
import PriceHistoryChart from "./PriceHistoryChart";

interface ItemMetadataDisplayProps {
  metadata: ItemMetadata | null;
  priceHistory: ItemPriceHistory[];
  isLoading: boolean;
  error?: string | null;
}

const formatPrice = (price: number | null): string => {
  if (price === null || typeof price === "undefined") return "N/A";
  return `${price.toFixed(2)}`;
};

function isDateValid(dateStr: string) {
  return !isNaN(new Date(dateStr).getTime());
}

function filter_data(data: ItemPriceHistory[], period: string) {
  const end_period = new Date();
  const start_period = new Date();

  if (period === "month") {
    start_period.setMonth(start_period.getMonth() - 1);
  } else if (period === "sixmonth") {
    start_period.setMonth(start_period.getMonth() - 6);
  } else if (period === "year") {
    start_period.setFullYear(start_period.getFullYear() - 1);
  } else {
    return data; // 'twoyear' or MAX returns all
  }

  const startTime = start_period.getTime();
  const endTime = end_period.getTime();

  return data.filter((item) => {
    const itemTime = new Date(item.date).getTime();
    return itemTime >= startTime && itemTime <= endTime;
  });
}

const ProductCardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[250px]">
      <div className="lg:col-span-5 flex flex-col justify-between border border-otl-gray-200/60 dark:border-otl-gray-800/60 p-8 rounded-[32px] bg-white dark:bg-[#18181B] shadow-sm">
        <div>
          <div className="h-8 bg-bg-gray-200 rounded-lg w-3/4 animate-pulse mb-3"></div>
          <div className="h-4 bg-bg-gray-200 rounded-md w-1/3 animate-pulse mb-8"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-100 dark:bg-[#27272A] rounded-2xl animate-pulse"></div>
          <div className="h-24 bg-gray-100 dark:bg-[#27272A] rounded-2xl animate-pulse"></div>
        </div>
      </div>
      <div className="lg:col-span-7 relative border border-otl-gray-200/60 dark:border-otl-gray-800/60 p-6 rounded-[32px] w-full max-sm:h-[270px] shadow-sm flex flex-col bg-white dark:bg-[#18181B]">
        <div className="flex-grow bg-gray-100 dark:bg-[#27272A] rounded-2xl animate-pulse w-full"></div>
      </div>
    </div>
  );
};

const ItemMetadataDisplay: React.FC<ItemMetadataDisplayProps> = ({
  metadata,
  priceHistory,
  isLoading,
  error,
}) => {
  // const [chartPeriod, setChartPeriod] = useState<string>("month");

  // // Sync default tab when metadata loads
  // useEffect(() => {
  //   if (metadata) {
  //     setChartPeriod(metadata.frequency === "monthly" ? "sixmonth" : "month");
  //   }
  // }, [metadata]);

  // Lazy load: only calculate data for the currently active tab
  // const activeChartData = useMemo(() => {
  //   if (!priceHistory.length) return [];
  //   return filter_data(priceHistory, chartPeriod);
  // }, [priceHistory, chartPeriod]);

  if (isLoading) return <ProductCardSkeleton />;

  if (error || !metadata) {
    return (
      <div className="p-6 bg-bg-danger-50 dark:bg-danger-900/10 border border-otl-danger-200 dark:border-otl-danger-800 text-txt-danger dark:text-danger-400 shadow-sm rounded-2xl mb-6">
        <p className="font-semibold text-sm">
          {error || "Item details not available at this moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-6">
      {/* Product Info & Hero Stats */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 p-8 md:p-10 border border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-white dark:bg-[#18181B] shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="space-y-5">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-3xl md:text-4xl font-semibold text-txt-black-900 dark:text-white tracking-tight leading-[1.1]">
              {metadata.item}
              <span className="px-2 text-xs inline align-top font-normal tracking-normal whitespace-nowrap">
                per {metadata.unit}
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <CategoryTag
                group={metadata.item_group}
                category={metadata.item_category}
                size="small"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDateValid(metadata.last_updated) && (
              <p className="text-[11px] font-semibold text-txt-black-400 dark:text-gray-500 uppercase tracking-widest">
                Last Updated on{" "}
                {new Date(metadata.last_updated).toLocaleDateString("en-MY", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Premium "Best Price" Card */}
          <div className="group relative overflow-hidden p-6 rounded-[24px] bg-gradient-to-br from-bg-success-50 to-emerald-50 dark:from-success-900/20 dark:to-emerald-900/10 border border-otl-success-200 dark:border-success-800 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(34,197,94,0.3)]">
            <p className="text-[10px] font-semibold text-txt-success-700 dark:text-success-400 uppercase tracking-widest mb-1.5">
              Nationwide Low
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-txt-success-600 dark:text-success-500">
                RM
              </span>
              <span className="text-2xl md:text-4xl text-txt-success-800 dark:text-success-400">
                {formatPrice(metadata.minimum)}
              </span>
            </div>
          </div>

          {/* Median Card */}
          <div className="group relative overflow-hidden p-6 rounded-[24px] bg-bg-black-25 dark:bg-[#1D1D21] border border-otl-gray-200 dark:border-gray-800 transition-transform duration-300 hover:-translate-y-1">
            <p className="text-[10px] font-semibold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
              Median Average
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-sm text-txt-black-400 dark:text-gray-500">
                RM
              </span>
              <span className="text-2xl md:text-4xl text-txt-black-900 dark:text-white">
                {formatPrice(metadata.median)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section Container */}
      <div className="lg:col-span-7 flex flex-col p-8 pb-3 border border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <Tabs
          variant="pill"
          defaultValue={metadata.frequency === "monthly" ? "sixmonth" : "month"}
          className="flex flex-col h-full w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div>
              <p className="text-lg font-semibold text-txt-black-900 dark:text-white">
                Price Trend
              </p>
            </div>
            <TabsList className="p-1.5 border-none">
              {metadata.frequency !== "monthly" && (
                <TabsTrigger
                  value="month"
                  className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
                >
                  1M
                </TabsTrigger>
              )}
              <TabsTrigger
                value="sixmonth"
                className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
              >
                6M
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
              >
                1Y
              </TabsTrigger>
              <TabsTrigger
                value="twoyear"
                className="px-4 py-1.5 rounded-xl text-xs transition-all data-[state=active]:border data-[state=active]:border-otl-gray-200"
              >
                MAX
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 min-h-[250px] bg-bg-black-25/50 dark:bg-transparent rounded-2xl relative">
            {metadata.frequency !== "monthly" && (
              <TabsContent
                value="month"
                className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
              >
                <PriceHistoryChart
                  data={filter_data(priceHistory, "month")}
                  period="month"
                />
              </TabsContent>
            )}
            <TabsContent
              value="sixmonth"
              className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
            >
              <PriceHistoryChart
                data={filter_data(priceHistory, "sixmonth")}
                period="month"
              />
            </TabsContent>
            <TabsContent
              value="year"
              className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
            >
              <PriceHistoryChart
                data={filter_data(priceHistory, "year")}
                period="year"
              />
            </TabsContent>
            <TabsContent
              value="twoyear"
              className="absolute inset-0 h-full mt-0 focus-visible:outline-none"
            >
              <PriceHistoryChart
                data={filter_data(priceHistory, "twoyear")}
                period="year"
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ItemMetadataDisplay;
```

src/components/LocalityAnalysis.tsx
```
import React, { useState, useEffect, useMemo } from "react";
import { useDuckDB } from "../contexts/DuckDBContext";
import { getLocalityInsights } from "../services/apiClient";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@govtechmy/myds-react/select";
import { geoMercator, geoPath } from "d3-geo";
import { cn } from "../lib/utils";
import { useColor } from "../hooks/useColor";

import stateDesktop from "../lib/geojson/state/_desktop";
import stateMobile from "../lib/geojson/state/_mobile";
import districtDesktop from "../lib/geojson/district/_desktop";
import districtMobile from "../lib/geojson/district/_mobile";

interface LocalityAnalysisProps {
  itemCode: string;
  targetDate: string;
  onSelectionChange?: (level: "state" | "district", name: string) => void;
}

const normalizeName = (name: string) => {
  if (!name) return "";
  let n = name.toString().toUpperCase().trim();
  n = n.replace(/^W\.?P\.?\s*/, "").replace(/^WILAYAH PERSEKUTUAN\s*/, "");
  if (n === "PENANG") return "PULAU PINANG";
  if (n === "MALACCA") return "MELAKA";
  return n;
};

const getGeoJsonName = (feature: any, level: "state" | "district") => {
  const p = feature.properties;
  return level === "state"
    ? p.NAME_1 || p.name || p.state || ""
    : p.NAME_2 || p.Daerah || p.district || p.name || "";
};

const getTooltipPositionClasses = (x: number, y: number, isMobile: boolean) => {
  let xClass = "-translate-x-1/2";
  let yClass = "-translate-y-[110%]";

  const mapWidth = isMobile ? 400 : 700;
  const mapHeight = isMobile ? 350 : 400;

  if (x < mapWidth * 0.25) xClass = "-translate-x-[10%]";
  else if (x > mapWidth * 0.75) xClass = "-translate-x-[90%]";

  if (y < mapHeight * 0.25) yClass = "translate-y-[10%]";

  return `${xClass} ${yClass}`;
};

export const LocalityAnalysisSkeleton = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const projection = geoMercator().fitSize(
    [isMobile ? 400 : 700, isMobile ? 350 : 400],
    (isMobile ? stateMobile : stateDesktop) as any,
  );
  const pathGenerator = geoPath().projection(projection);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] border border-otl-gray-200/60 dark:border-otl-gray-800/60 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-bg-white relative lg:h-[440px] overflow-hidden">
      {/* 1. HEADER & SELECTS */}
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:border-r border-otl-gray-200/60 dark:border-otl-gray-800/60 dark:border-gray-800/50 p-6 md:p-8 pb-4 lg:pb-3 flex flex-col justify-end z-10 bg-bg-white">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-40 bg-bg-black-200 rounded-lg animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-bg-black-200 rounded-lg animate-pulse"></div>
            <div className="h-8 w-24 bg-bg-black-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 2. MAP */}
      <div className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 relative flex justify-center items-center bg-bg-washed dark:bg-[#1D1D21] p-4 lg:p-6 h-[320px] lg:h-auto border-y lg:border-y-0 border-otl-gray-200/60 dark:border-otl-gray-800/60 dark:border-gray-800/50 z-0">
        <svg
          viewBox={isMobile ? "0 0 400 350" : "0 0 700 400"}
          className="w-full h-full max-h-[350px] lg:max-h-[400px] overflow-visible opacity-50 animate-pulse"
        >
          {/* @ts-ignore */}
          {(isMobile ? stateMobile : stateDesktop).features.map(
            (feature: any, idx: number) => (
              <path
                key={idx}
                d={pathGenerator(feature) || ""}
                fill="rgba(113, 113, 122, 0.05)"
                strokeWidth={0.5}
                className="stroke-otl-gray-300"
              />
            ),
          )}
        </svg>
      </div>

      {/* 3. LIST */}
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:border-r border-otl-gray-200/60 dark:border-otl-gray-800/60 dark:border-gray-800/50 p-6 md:p-8 pt-4 lg:pt-0 flex flex-col h-[260px] lg:h-auto overflow-hidden z-10 bg-bg-white">
        <div className="flex flex-col gap-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-full bg-bg-black-200 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LocalityAnalysis: React.FC<LocalityAnalysisProps> = ({
  itemCode,
  targetDate,
  onSelectionChange,
}) => {
  const { conn, isReady } = useDuckDB();
  const [metric, setMetric] = useState<"median" | "avg" | "p95" | "p5">(
    "median",
  );
  const [level, setLevel] = useState<"state" | "district">("state");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [hoverInfo, setHoverInfo] = useState<any>(null);
  const [pinnedInfo, setPinnedInfo] = useState<any>(null);

  const activeInfo = hoverInfo || pinnedInfo;

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  const { interpolate } = useColor("rdYlGn");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isReady || !conn || !itemCode || !targetDate) return;
    setIsLoading(true);
    setHoverInfo(null);
    setPinnedInfo(null);
    onSelectionChange?.(level, ""); // Clear external selection on metric/level change

    getLocalityInsights(conn, itemCode, targetDate, metric, level)
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [conn, isReady, itemCode, targetDate, metric, level]);

  // Scroll active list item into view when pinned info changes
  useEffect(() => {
    if (pinnedInfo?.name) {
      const el = document.getElementById(`locality-item-${pinnedInfo.name}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [pinnedInfo]);

  const rankingMap = useMemo(() => {
    const map = new Map();
    data?.ranking?.forEach((r: any) => map.set(normalizeName(r.name), r));
    return map;
  }, [data]);

  const mapData = useMemo(() => {
    return level === "state"
      ? isMobile
        ? stateMobile
        : stateDesktop
      : isMobile
        ? districtMobile
        : districtDesktop;
  }, [level, isMobile]);

  const values = useMemo(
    () => data?.ranking?.map((r: any) => r.val) || [],
    [data],
  );
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;

  const projection = useMemo(() => {
    const width = isMobile ? 400 : 700;
    const height = isMobile ? 350 : 400;
    return geoMercator().fitSize([width, height], mapData as any);
  }, [mapData, isMobile]);

  const pathGenerator = useMemo(
    () => geoPath().projection(projection),
    [projection],
  );

  const handleSvgClick = () => {
    setPinnedInfo(null);
    onSelectionChange?.(level, "");
  };

  const colorScale = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "rgba(113, 113, 122, 0.05)";
    return interpolate(val, [maxVal, minVal]);
  };

  const handleSelection = (feature: any, rawName: string, regionData: any) => {
    if (pinnedInfo?.name === rawName) {
      setPinnedInfo(null);
      onSelectionChange?.(level, "");
    } else {
      const centroid = feature ? pathGenerator.centroid(feature) : [350, 200];
      setPinnedInfo({
        x: centroid[0],
        y: centroid[1],
        name: rawName,
        data: regionData,
      });
      onSelectionChange?.(level, rawName);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[auto_1fr] border border-otl-gray-200 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-bg-white relative lg:h-[440px] overflow-hidden">
      {/* 1. HEADER & SELECTS (Top on mobile, Top-Left on desktop) */}
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:border-r border-otl-gray-200 bg-bg-white p-6 md:p-8 pb-4 lg:pb-3 flex flex-col justify-end z-10">
        <div className="flex flex-col gap-4">
          <h4 className="text-lg font-black tracking-tight text-txt-black-900 dark:text-white">
            Geospatial Insight
          </h4>
          <div className="flex gap-2">
            <Select
              variant="outline"
              size="small"
              value={metric}
              onValueChange={(v) => setMetric(v as any)}
            >
              <SelectTrigger className="capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["median", "p5", "avg", "p95"].map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              variant="outline"
              size="small"
              value={level}
              onValueChange={(v) => setLevel(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="state">State</SelectItem>
                <SelectItem value="district">District</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 2. MAP (Middle on mobile, Right on desktop) */}
      <div className="lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 relative flex justify-center items-center bg-[#FAFAFA] dark:bg-[#1D1D21] p-4 lg:p-6 h-[320px] lg:h-auto border-y lg:border-y-0 border-otl-gray-200 z-0">
        <svg
          viewBox={isMobile ? "0 0 400 350" : "0 0 700 400"}
          className="w-full h-full max-h-[350px] lg:max-h-[400px] overflow-visible drop-shadow-sm"
          onClick={handleSvgClick}
        >
          {/* @ts-ignore */}
          {[...(mapData.features || [])]
            .sort((a, b) => {
              const aName = getGeoJsonName(a, level);
              const bName = getGeoJsonName(b, level);
              if (activeInfo?.name === aName) return 1;
              if (activeInfo?.name === bName) return -1;
              return 0;
            })
            .map((feature: any) => {
              const rawName = getGeoJsonName(feature, level);
              const normalizedName = normalizeName(rawName);
              const regionData = rankingMap.get(normalizedName);
              const isActive = activeInfo?.name === rawName;

              return (
                <path
                  key={rawName}
                  d={pathGenerator(feature) || ""}
                  fill={colorScale(regionData?.val)}
                  strokeWidth={isActive ? 2 : 0.5}
                  className={cn(
                    "transition-all duration-300 cursor-pointer outline-none",
                    isActive
                      ? "drop-shadow-lg stroke-[#18181b] dark:stroke-white"
                      : "hover:drop-shadow-sm hover:opacity-80 stroke-otl-gray-300",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelection(feature, rawName, regionData);
                  }}
                  onMouseEnter={() => {
                    if (!pinnedInfo) {
                      const centroid = pathGenerator.centroid(feature);
                      setHoverInfo({
                        x: centroid[0],
                        y: centroid[1],
                        name: rawName,
                        data: regionData,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoverInfo(null)}
                />
              );
            })}
        </svg>

        {activeInfo && (
          <div
            className={cn(
              "absolute bg-bg-white backdrop-blur-2xl border border-otl-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-xl pointer-events-none z-50 w-auto min-w-[180px] max-w-[280px] transform transition-all animate-in fade-in zoom-in-95 duration-200",
              getTooltipPositionClasses(activeInfo.x, activeInfo.y, isMobile),
            )}
            style={{
              left: `${(activeInfo.x / (isMobile ? 400 : 700)) * 100}%`,
              top: `${(activeInfo.y / (isMobile ? 350 : 400)) * 100}%`,
            }}
          >
            <div className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-2 font-medium text-sm text-txt-black-900 tracking-tight">
                <span
                  className="w-2.5 h-2.5 rounded-full shadow-sm border border-black/10 dark:border-white/10 shrink-0"
                  style={{
                    backgroundColor: colorScale(activeInfo.data?.val),
                  }}
                />
                <span className="truncate">{activeInfo.name}</span>
              </span>
              <span className="text-base font-bold text-txt-black-900 whitespace-nowrap">
                {activeInfo.data
                  ? `RM ${activeInfo.data.val.toFixed(2)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. LIST (Bottom on mobile, Bottom-Left on desktop) */}
      <div className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:border-r border-otl-gray-200 bg-bg-white p-6 md:p-8 pt-4 lg:pt-0 flex flex-col h-[280px] lg:h-auto overflow-hidden z-10">
        <div className="flex-1 overflow-y-auto scrollbar pr-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 pt-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full bg-bg-black-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : data?.ranking?.length ? (
            data.ranking.map((item: any) => {
              const isItemActive =
                activeInfo?.name.toUpperCase() === item.name.toUpperCase();
              return (
                <div
                  key={item.name}
                  id={`locality-item-${item.name}`}
                  className={cn(
                    "flex justify-between items-center px-2 py-3 rounded-lg transition-all duration-200 border border-transparent shadow-sm cursor-pointer hover:shadow-md",
                    isItemActive && "border-2 border-otl-gray-200",
                  )}
                  onMouseEnter={() => {
                    const feature = (mapData as any).features.find(
                      (f: any) =>
                        normalizeName(getGeoJsonName(f, level)) ===
                        normalizeName(item.name),
                    );
                    const centroid = feature
                      ? pathGenerator.centroid(feature)
                      : [350, 200];
                    setHoverInfo({
                      x: centroid[0],
                      y: centroid[1],
                      name: item.name,
                      data: item,
                    });
                  }}
                  onMouseLeave={() => setHoverInfo(null)}
                  onClick={() => {
                    const feature = (mapData as any).features.find(
                      (f: any) =>
                        normalizeName(getGeoJsonName(f, level)) ===
                        normalizeName(item.name),
                    );
                    handleSelection(feature, item.name, item);
                  }}
                >
                  <span className="text-sm text-txt-black-900 tracking-tight truncate mr-2 flex items-center">
                    <span className="text-txt-black-500 font-mono text-xs mr-2 font-medium">
                      #{item.rank}
                    </span>
                    {item.name}
                  </span>
                  <span className="text-sm font-medium text-txt-black-900 tracking-tight shrink-0">
                    RM {item.val.toFixed(2)}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-txt-black-500 text-center py-10 font-medium">
              No spatial data available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalityAnalysis;
```

src/components/Navbar.tsx
```
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
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-txt-success-700 dark:text-success-400 bg-bg-success-50 dark:bg-success-900/20 px-3 py-1.5 rounded-full border border-otl-success-200/50 dark:border-success-800/50 shadow-sm transition-all">
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
    <Navbar className="border-b border-otl-gray-200 dark:border-otl-gray-800 bg-bg-white backdrop-blur-2xl sticky top-0 z-[9999] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
      <div
        className="flex h-full w-auto mx-auto px-2 sm:px-6 lg:px-8 items-center gap-3 cursor-pointer shrink-0"
        onClick={() => navigate("/")}
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
        <span className="font-black tracking-tight text-txt-black-900 dark:text-white text-[15px] md:text-lg hidden sm:inline">
          OpenPriceCatcher
        </span>
      </div>

      <NavbarMenu>
        <Button
          onClick={() => navigate("/")}
          variant="default-ghost"
          className={`w-full xl:w-auto transition-all duration-200 rounded-xl px-4 text-sm ${!isNotHome ? "bg-bg-black-50 dark:bg-[#27272A] text-txt-black-900 dark:text-white font-bold shadow-sm" : "font-semibold text-txt-black-500"}`}
        >
          Overview
        </Button>
        <Button
          onClick={() => navigate("/pulse")}
          variant="default-ghost"
          className={`w-full xl:w-auto transition-all duration-200 rounded-xl px-4 text-sm ${location.pathname.startsWith("/pulse") ? "bg-bg-black-50 dark:bg-[#27272A] text-txt-black-900 dark:text-white font-bold shadow-sm" : "font-semibold text-txt-black-500"}`}
        >
          Market Pulse
        </Button>
        <Button
          onClick={() => navigate("/category")}
          variant="default-ghost"
          className={`w-full xl:w-auto transition-all duration-200 rounded-xl px-4 text-sm ${location.pathname.startsWith("/category") ? "bg-bg-black-50 dark:bg-[#27272A] text-txt-black-900 dark:text-white font-bold shadow-sm" : "font-semibold text-txt-black-500"}`}
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
```

src/components/PriceHistoryChart.tsx
```
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ItemPriceHistory } from "../types";

interface ItemPriceHistoryDataProps {
  data: ItemPriceHistory[];
  period: "month" | "year" | null;
}

function formatLabel(tickItem: Date) {
  return tickItem.toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#27272A]/95 backdrop-blur-xl border border-otl-gray-200 dark:border-gray-700 rounded-[20px] shadow-2xl min-w-[160px]">
        <p className="text-[10px] font-semibold text-txt-black-400 dark:text-gray-400 uppercase tracking-widest mb-3 pb-2 border-b border-otl-gray-100 dark:border-gray-700 p-4 ">
          {formatLabel(new Date(label))}
        </p>
        <div className="space-y-2 p-4 pt-1">
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between gap-6"
            >
              <span className="flex items-center gap-2 text-xs font-bold text-txt-black-600 dark:text-gray-300">
                <span
                  className="w-2 h-2 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}
              </span>
              <span className="text-xs text-txt-black-900 dark:text-white">
                RM {Number(entry.value).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const PriceHistoryChart: React.FC<ItemPriceHistoryDataProps> = ({
  data,
  period,
}) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date),
    p95: Number(item.p95.toFixed(2)),
    median: Number(item.median.toFixed(2)),
    p5: Number(item.p5.toFixed(2)),
  }));

  function formatXAxis(tickItem: Date) {
    if (period === "month") {
      return tickItem.toLocaleDateString("en-MY", {
        month: "short",
        day: "numeric",
      });
    }
    return tickItem.toLocaleDateString("en-MY", {
      month: "short",
      year: "2-digit",
    });
  }

  return (
    <ResponsiveContainer
      width="100%"
      height="100%"
      minHeight={250}
      className="text-[11px] font-semibold text-txt-black-400 dark:text-gray-500"
    >
      <LineChart
        data={formattedData}
        margin={{
          top: 20,
          right: 10,
          left: -10,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="currentColor"
          opacity={0.1}
        />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          minTickGap={30}
          axisLine={false}
          tickLine={false}
          dy={15}
        />
        <YAxis
          domain={["auto", "auto"]}
          axisLine={false}
          tickLine={false}
          tickFormatter={(val) => `RM${val}`}
          dx={-10}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{
            stroke: "currentColor",
            strokeWidth: 1.5,
            opacity: 0.15,
            strokeDasharray: "4 4",
          }}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{
            fontSize: "11px",
            fontWeight: 600,
            paddingTop: "20px",
          }}
        />

        <Line
          type="stepAfter"
          name="Lowest (P5)"
          dataKey="p5"
          stroke="var(--otl-success-500, #22C55E)"
          dot={false}
          strokeWidth={2}
          activeDot={{
            r: 3,
            strokeWidth: 0,
            fill: "var(--otl-success-600, #16A34A)",
          }}
        />
        <Line
          type="stepAfter"
          name="Median"
          dataKey="median"
          stroke="currentColor"
          className="text-txt-black-800 dark:text-gray-300"
          dot={false}
          strokeWidth={2}
          activeDot={{ r: 3, strokeWidth: 0, fill: "currentColor" }}
        />
        <Line
          type="stepAfter"
          name="Highest (P95)"
          dataKey="p95"
          stroke="var(--otl-danger-400, #F87171)"
          dot={false}
          strokeWidth={2}
          activeDot={{
            r: 3,
            strokeWidth: 0,
            fill: "var(--otl-danger-500, #EF4444)",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PriceHistoryChart;
```

src/components/SearchBar.tsx
```
import React, { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";
import { useDuckDB } from "../contexts/DuckDBContext";
import { SearchResultInput } from "../types";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarClearButton,
  SearchBarResults,
  SearchBarResultsList,
  SearchBarResultsItem,
} from "@govtechmy/myds-react/search-bar";
import { Spinner } from "@govtechmy/myds-react/spinner";
import { ChevronRightIcon, SearchIcon } from "@govtechmy/myds-react/icon";
import { cn } from "../lib/utils";

interface SearchBarProps {
  variant?: "default" | "minimal";
}

const MydsSearchBar: React.FC<SearchBarProps> = ({ variant = "default" }) => {
  const isMinimal = variant === "minimal";
  const navigate = useNavigate();
  const { conn, isCacheReady } = useDuckDB();
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [liveResults, setLiveResults] = useState<SearchResultInput[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);

  const isMac =
    typeof window !== "undefined" &&
    navigator.userAgent.toLowerCase().includes("mac");

  // Global Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isMinimal) {
          setIsModalOpen(true);
        } else {
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMinimal, isModalOpen]);

  // Autofocus when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isModalOpen]);

  const debouncedSearch = useMemo(() => {
    return debounce(async (searchTerm: string) => {
      if (!conn || !searchTerm) {
        setLiveResults([]);
        setIsSearching(false);
        return;
      }
      const currentReq = ++requestRef.current;
      setIsSearching(true);
      try {
        const queryStr = isCacheReady
          ? `SELECT f.*, COALESCE(s.status, 'active') as status 
             FROM lake.lookup_item f 
             LEFT JOIN memory.item_status s ON f.item_code = s.item_code 
             WHERE f.item ILIKE ? 
                OR f.search_index ILIKE ? 
                OR f.item_category ILIKE ? 
             LIMIT 5`
          : `SELECT *, 'active' as status FROM lake.lookup_item 
             WHERE item ILIKE ? 
                OR search_index ILIKE ? 
                OR item_category ILIKE ? 
             LIMIT 5`;

        const stmt = await conn.prepare(queryStr);
        const term = `%${searchTerm}%`;
        const result = await stmt.query(term, term, term);
        if (currentReq === requestRef.current) {
          setLiveResults(result.toArray().map((r: any) => r.toJSON()));
        }
        stmt.close();
      } catch (e) {
        console.error("Search failed", e);
      } finally {
        if (currentReq === requestRef.current) setIsSearching(false);
      }
    }, 250);
  }, [conn, isCacheReady]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim().length > 0) {
      setIsSearching(true);
      debouncedSearch(newQuery);
    } else {
      setLiveResults([]);
      setIsSearching(false);
      debouncedSearch.cancel();
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setHasFocus(false);
      setIsModalOpen(false);
      navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Update the form wrapper and the SearchBarResults component styling
  const searchInterface = (
    <form onSubmit={handleSearchSubmit} className="w-full relative">
      <SearchBar
        size="large"
        onBlur={(e) => {
          if (
            !e.currentTarget.contains(e.relatedTarget as Node) &&
            !isModalOpen
          ) {
            setHasFocus(false);
          }
        }}
        className=""
      >
        <SearchBarInputContainer
          className={cn(
            "flex items-center gap-3 px-4 transition-all duration-300 shadow-sm",
            "bg-white/90 dark:bg-[#18181B]/90 backdrop-blur-xl border border-otl-gray-200/80 dark:border-[#27272A]",
            "h-14 rounded-2xl",
            (hasFocus || isModalOpen) &&
              "ring-4 ring-success-500/15 has-[input:focus]:ring-success-500 border-otl-success-400 dark:border-otl-success-500 shadow-lg bg-bg-white",
          )}
        >
          <SearchIcon className="text-txt-black-500 h-5 w-5" />

          <SearchBarInput
            ref={inputRef}
            placeholder="Search products, categories..."
            value={query}
            onValueChange={handleQueryChange}
            onFocus={() => setHasFocus(true)}
            className="flex-1 ring-0 focus:ring-0 placeholder:text-txt-black-300 dark:text-white dark:placeholder:text-gray-500 p-0"
          />

          <div className="flex items-center gap-2 shrink-0">
            {query && (
              <SearchBarClearButton
                onClick={() => {
                  setQuery("");
                  setLiveResults([]);
                  inputRef.current?.focus();
                }}
                className="hover:bg-bg-black-50 dark:hover:bg-gray-800 rounded-lg p-1 transition-colors"
              />
            )}
          </div>
        </SearchBarInputContainer>

        <SearchBarResults
          open={query.length > 0 && (hasFocus || isModalOpen)}
          className={cn(
            "rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/95 dark:bg-[#1D1D21]/95 backdrop-blur-2xl border-otl-gray-200/80 dark:border-[#27272A] overflow-hidden",
            isModalOpen
              ? "relative mt-3"
              : "absolute w-full left-0 top-full mt-2 z-[9999]",
          )}
        >
          <div>
            {isSearching ? (
              <div className="flex items-center justify-center p-10">
                <Spinner size="large" />
              </div>
            ) : liveResults.length > 0 ? (
              <SearchBarResultsList className="p-2 scrollbar overflow-y-auto max-h-[400px]">
                {liveResults.map((item) => (
                  <SearchBarResultsItem
                    key={item.item_code}
                    value={item.item_code.toString()}
                    onSelect={() => {
                      setHasFocus(false);
                      setIsModalOpen(false);
                      setQuery("");
                      navigate(`/item/${item.item_code}`);
                    }}
                    className="group flex items-center justify-between p-3 rounded-xl hover:bg-bg-black-50 dark:hover:bg-[#27272A] cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none"
                  >
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="text-sm font-semibold text-txt-black-900 dark:text-white truncate tracking-tight group-hover:text-txt-black-600 dark:group-hover:text-txt-black-400 transition-colors">
                        {item.item}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-txt-black-400 dark:text-gray-500">
                          per {item.unit}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-otl-gray-300 dark:bg-gray-700"></span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-txt-black-500 dark:text-gray-400 truncate">
                          {item.item_category}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8  min-w-8 min-h-8 rounded-full flex items-center justify-center bg-transparent group-hover:bg-white dark:group-hover:bg-[#3F3F46] shadow-sm opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                      <ChevronRightIcon className="w-4 h-4 text-txt-black-600 dark:text-txt-black-400" />
                    </div>
                  </SearchBarResultsItem>
                ))}

                {/* View All Results Button */}
                <div
                  onClick={() => handleSearchSubmit()}
                  className="group flex items-center justify-between p-3 rounded-xl hover:bg-bg-black-50 dark:hover:bg-[#27272A] cursor-pointer transition-all duration-200 active:scale-[0.98] outline-none"
                >
                  <span className="text-txt-black-500">
                    See all results for "{query}"
                  </span>
                </div>
              </SearchBarResultsList>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-semibold text-txt-black-900 dark:text-white">
                  No exact matches
                </p>
                <p className="text-xs text-txt-black-400 mt-1">
                  Try a more general search term
                </p>
              </div>
            )}
          </div>
        </SearchBarResults>
      </SearchBar>
    </form>
  );

  if (isMinimal) {
    return (
      <>
        {/* Fake Input Trigger */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 w-full px-3 py-2 h-10 bg-bg-white dark:bg-[#1D1D21] border border-otl-gray-200 dark:border-gray-800 rounded-xl hover:bg-white dark:hover:bg-[#27272A] hover:border-otl-gray-300 dark:hover:border-gray-700 transition-all text-txt-black-400 dark:text-gray-400 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 text-txt-black-500"
        >
          <SearchIcon className="w-4 h-4 shrink-0" />
          <span className="text-sm flex-1 text-left truncate">Search...</span>
          <kbd className="hidden sm:inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-otl-gray-200/80 dark:border-gray-700 bg-bg-black-50 shadow-sm">
            {isMac ? "⌘" : "Ctrl"} K
          </kbd>
        </button>

        {/* Command Palette Portal */}
        {isModalOpen &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4 sm:px-6">
              <div
                className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={() => setIsModalOpen(false)}
              />
              <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
                {searchInterface}
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto z-[100]">
      {searchInterface}
    </div>
  );
};

export default MydsSearchBar;
```

src/components/SearchResults.tsx
```
import React from "react";
import { SearchResultInput } from "../types";
import { Tag } from "@govtechmy/myds-react/tag";
import { ChevronRightIcon } from "@govtechmy/myds-react/icon";

interface SearchResultsProps {
  results: SearchResultInput[];
  onSelectItem: (item: SearchResultInput) => void;
  isLoading: boolean;
  error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelectItem,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-[#27272A] rounded-[20px] animate-pulse shadow-sm"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return null; // Handled in parent
  }

  if (results.length === 0) {
    return (
      <div className="text-center p-16 flex flex-col items-center justify-center bg-bg-black-25 dark:bg-[#1D1D21]/50 border border-dashed border-otl-gray-200 dark:border-gray-800 rounded-[32px]">
        <h3 className="text-xl font-bold text-txt-black-900 dark:text-white mb-2">
          No items found
        </h3>
        <p className="text-txt-black-500 dark:text-gray-500 font-medium">
          Try checking your spelling or use a more general term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {results.map((item) => (
        <div
          key={item.item_code}
          onClick={() => onSelectItem(item)}
          className={`group p-5 bg-white dark:bg-[#1D1D21] cursor-pointer transition-all duration-300 ease-out border border-otl-gray-200 dark:border-gray-800 hover:border-otl-success-400 dark:hover:border-success-600 rounded-[20px] flex justify-between items-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${item.status === "discontinued" ? "opacity-60 grayscale-[50%]" : ""}`}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-col grow gap-2 overflow-hidden mr-4">
              <h3
                className={`font-black text-base md:text-lg tracking-tight truncate ${item.status === "discontinued" ? "text-txt-black-500 line-through dark:text-gray-500" : "text-txt-black-900 dark:text-white group-hover:text-txt-success-700 dark:group-hover:text-success-400 transition-colors"}`}
              >
                {item.item}
              </h3>
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className="px-2.5 py-1 rounded-md bg-bg-black-50 dark:bg-gray-800 text-[10px] font-bold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest leading-none">
                  per {item.unit}
                </span>

                {item.status === "discontinued" ? (
                  <Tag
                    size="small"
                    variant="default"
                    mode="pill"
                    className="text-[10px] font-bold bg-bg-black-100 dark:bg-gray-800 text-txt-black-500 shadow-sm"
                  >
                    Discontinued
                  </Tag>
                ) : (
                  <>
                    <Tag
                      size="small"
                      variant="warning"
                      mode="pill"
                      className="max-sm:hidden text-[10px] font-bold tracking-wide shadow-sm"
                    >
                      {item.item_group}
                    </Tag>
                    <Tag
                      size="small"
                      variant="primary"
                      mode="pill"
                      className="text-[10px] font-bold tracking-wide shadow-sm"
                    >
                      {item.item_category}
                    </Tag>
                  </>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-bg-black-25 dark:bg-gray-800/80 border border-otl-gray-100 dark:border-gray-700 group-hover:bg-bg-success-50 dark:group-hover:bg-success-900/30 group-hover:border-otl-success-200 dark:group-hover:border-success-800 flex items-center justify-center transition-all shrink-0">
              <ChevronRightIcon className="text-txt-black-400 dark:text-gray-400 group-hover:text-txt-success-600 dark:group-hover:text-success-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SearchResults;
```

src/components/ThemeSwitch.tsx
```
import {
  FunctionComponent,
  isValidElement,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { MoonIcon, SunIcon } from "@govtechmy/myds-react/icon";
import { Button } from "@govtechmy/myds-react/button";
import { useTheme } from "@govtechmy/myds-react/hooks";
import {
  Select,
  SelectValue,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@govtechmy/myds-react/select";
import { Slot } from "@radix-ui/react-slot";

interface Theme {
  label: string;
  value: string;
  icon: ReactNode;
}

interface ThemeSwitch {
  as?: "toggle" | "select";
  themes?: Array<Theme>;
  onChange?: (value: string) => void;
}

const disableTransitionsTemporarily = () => {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `* {
				-webkit-transition: none !important;
				-moz-transition: none !important;
				-o-transition: none !important;
				-ms-transition: none !important;
				transition: none !important;
			}`,
    ),
  );
  document.head.appendChild(css);

  // Force reflow
  (() => window.getComputedStyle(document.body))();

  // Remove after the theme class has safely applied
  setTimeout(() => {
    if (document.head.contains(css)) {
      document.head.removeChild(css);
    }
  }, 50);
};

const ThemeSwitch: FunctionComponent<ThemeSwitch> = ({
  as = "toggle",
  themes = [
    { label: "Light", value: "light", icon: <SunIcon /> },
    { label: "Dark", value: "dark", icon: <MoonIcon /> },
  ],
  onChange,
}) => {
  const { theme, setTheme, defaultTheme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTheme = (value: string) =>
    themes.find((theme) => theme.value === value);

  const displayIcon = (value?: string | null) => {
    if (!value) return null;
    const _theme = getTheme(value);
    if (isValidElement(_theme?.icon))
      return (
        <Slot className={"text-txt-black-900 size-4 flex-shrink-0"}>
          {_theme?.icon}
        </Slot>
      );
    return _theme?.icon;
  };

  /*------------------ as toggle -----------------*/
  const handleChange = (value?: string) => {
    if (themes.length <= 1) return;

    disableTransitionsTemporarily();

    if (as === "toggle") {
      const nextIndex = (currentIndex + 1) % themes.length;
      setCurrentIndex(nextIndex);
      setTheme(themes[nextIndex]!.value);
      if (onChange) onChange(themes[nextIndex]!.value);
    } else if (as === "select") {
      if (!value) return;
      setTheme(value);
      if (onChange) onChange(value);
    }
  };

  useEffect(() => {
    if (as === "toggle") {
      const index = themes.findIndex((t) => t.value === theme);
      setCurrentIndex(index);
    }
  }, [theme]);

  if (as === "toggle")
    return (
      <Button
        variant="default-ghost"
        className="aspect-square flex-shrink-0 rounded-md focus:ring-otl-success-200/40"
        onClick={() => handleChange()}
        size="small"
        aria-label={themes[currentIndex]?.label}
        iconOnly
      >
        {displayIcon(themes[currentIndex]?.value) ||
          themes[currentIndex]?.label}
      </Button>
    );

  /*------------------ as select -----------------*/

  return (
    <Select
      size="small"
      variant="outline"
      value={theme || defaultTheme}
      onValueChange={handleChange}
    >
      <SelectTrigger>
        <SelectValue>
          {(value) => (
            <div className="flex items-center gap-2">
              <div>{displayIcon(value as string)}</div>
              <span>{getTheme(value as string)?.label}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {themes.map((theme) => (
          <SelectItem
            key={theme.value}
            value={theme.value}
            aria-label={theme.label}
          >
            {theme.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

ThemeSwitch.displayName = "ThemeSwitch";

export { ThemeSwitch };
```

src/contexts/DuckDBContext.tsx
```
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

interface DuckDBContextType {
  db: duckdb.AsyncDuckDB | null;
  conn: duckdb.AsyncDuckDBConnection | null;
  isReady: boolean;
  isCacheReady: boolean;
  maxDate: string | null;
  error: string | null;
}

const DuckDBContext = createContext<DuckDBContextType>({
  db: null,
  conn: null,
  isReady: false,
  isCacheReady: false,
  maxDate: null,
  error: null,
});

export const useDuckDB = () => useContext(DuckDBContext);

const DUCKDB_VERSION = "1.33.1-dev53.0";
const CDN_URL = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${DUCKDB_VERSION}/dist`;

const CDN_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: `${CDN_URL}/duckdb-mvp.wasm`,
    mainWorker: `${CDN_URL}/duckdb-browser-mvp.worker.js`,
  },
  eh: {
    mainModule: `${CDN_URL}/duckdb-eh.wasm`,
    mainWorker: `${CDN_URL}/duckdb-browser-eh.worker.js`,
  },
};

const bundlePromise = duckdb.selectBundle(CDN_BUNDLES);

export const DuckDBProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [conn, setConn] = useState<duckdb.AsyncDuckDBConnection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [maxDate, setMaxDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInitializing = useRef(false);

  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    const initDB = async () => {
      try {
        const bundle = await bundlePromise;
        const workerBlob = new Blob(
          [`importScripts("${bundle.mainWorker}");`],
          { type: "text/javascript" },
        );
        const workerUrl = URL.createObjectURL(workerBlob);
        const worker = new Worker(workerUrl);
        const logger = new duckdb.ConsoleLogger();

        const database = new duckdb.AsyncDuckDB(logger, worker);
        await database.instantiate(bundle.mainModule, bundle.pthreadWorker);
        URL.revokeObjectURL(workerUrl);

        const connection = await database.connect();

        await connection.query(`
                    INSTALL ducklake; LOAD ducklake;
                    ATTACH 'https://pricecatcher-lake.iwa.my/catalog.ducklake' AS lake (TYPE DUCKLAKE);
                `);

        setDb(database);
        setConn(connection);
        setIsReady(true);

        // OPTIMIZATION: Filter by last 30 days so DuckDB only opens the most recent Parquet files
        connection
          .query(
            `SELECT CAST(MAX(date) AS VARCHAR) as max_date 
             FROM lake.prices 
             WHERE date >= current_date() - INTERVAL 30 DAY`,
          )
          .then((res) => {
            const val = res.toArray()[0]?.toJSON().max_date;
            if (val) setMaxDate(val);
          })
          .catch(console.error);

        // OPTIMIZATION: Limit the scan to the last 90 days. Anything without a price in 90 days is inactive anyway.
        // This stops DuckDB from downloading the column chunks of years of historical data.
        connection
          .query(
            `
            CREATE TABLE memory.item_status AS 
            SELECT item_code, 
                   CASE WHEN MAX(date) < current_date() - INTERVAL 60 DAY THEN 'discontinued' ELSE 'active' END as status
            FROM lake.prices 
            WHERE date >= current_date() - INTERVAL 90 DAY
            GROUP BY item_code;
        `,
          )
          .then(() => {
            setIsCacheReady(true);
          })
          .catch(console.error);
      } catch (err: any) {
        console.error("DuckDB Init Failed:", err);
        setError(err.message || "Failed to connect to Data Lake.");
      }
    };
    initDB();
  }, []);

  const value = useMemo(
    () => ({ db, conn, isReady, isCacheReady, maxDate, error }),
    [db, conn, isReady, isCacheReady, maxDate, error],
  );

  return (
    <DuckDBContext.Provider value={value}>{children}</DuckDBContext.Provider>
  );
};
```

src/hooks/useColor.ts
```
import { interpolateRgbBasis } from "d3-interpolate";
import {
  // interpolateBlues,
  interpolateBrBG,
  interpolateBuGn,
  interpolateBuPu,
  interpolateCividis,
  interpolateCool,
  interpolateCubehelixDefault,
  interpolateGnBu,
  interpolateGreens,
  interpolateGreys,
  interpolateInferno,
  interpolateMagma,
  interpolateOrRd,
  interpolateOranges,
  interpolatePRGn,
  interpolatePiYG,
  interpolatePlasma,
  interpolatePuBu,
  interpolatePuBuGn,
  interpolatePuOr,
  interpolatePuRd,
  interpolatePurples,
  interpolateRainbow,
  interpolateRdBu,
  interpolateRdGy,
  interpolateRdPu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  interpolateSinebow,
  interpolateSpectral,
  interpolateTurbo,
  interpolateViridis,
  interpolateWarm,
  interpolateYlGn,
  interpolateYlGnBu,
  interpolateYlOrBr,
  interpolateYlOrRd,
} from "d3-scale-chromatic";

export type Color =
  | "blues"
  | "brBG"
  | "buGn"
  | "buPu"
  | "cividis"
  | "cool"
  | "cubehelixDefault"
  | "gnBu"
  | "greens"
  | "greys"
  | "inferno"
  | "magma"
  | "orRd"
  | "oranges"
  | "pRGn"
  | "piYG"
  | "plasma"
  | "puBu"
  | "puBuGn"
  | "puOr"
  | "puRd"
  | "purples"
  | "rainbow"
  | "rdBu"
  | "rdGy"
  | "rdPu"
  | "rdYlBu"
  | "rdYlGn"
  | "reds"
  | "sinebow"
  | "spectral"
  | "turbo"
  | "viridis"
  | "warm"
  | "ylGn"
  | "ylGnBu"
  | "ylOrBr"
  | "ylOrRd";

export const useColor = (key: Color) => {
  // generated by changing lightness based on primary blue (oklch)
  const blueScheme = [
    "#fafcff", // 99%
    "#e6efff", // 95%
    "#cddfff", // 90%
    "#9bbeff", // 80%
    "#699bff", // 70%
    "#3575fe", // 60%
    "#2563EB", // Blue 600
    "#0036b0", // 40%
    "#000e42", // 20%
  ];

  const lookup: { [key: string]: (normalizedValue: number) => string } = {
    blues: (value) => interpolateRgbBasis(blueScheme)(value), // interpolateBlues,
    brBG: interpolateBrBG,
    buGn: interpolateBuGn,
    buPu: interpolateBuPu,
    cividis: interpolateCividis,
    cool: interpolateCool,
    cubehelixDefault: interpolateCubehelixDefault,
    gnBu: interpolateGnBu,
    greens: interpolateGreens,
    greys: interpolateGreys,
    inferno: interpolateInferno,
    magma: interpolateMagma,
    orRd: interpolateOrRd,
    oranges: interpolateOranges,
    pRGn: interpolatePRGn,
    piYG: interpolatePiYG,
    plasma: interpolatePlasma,
    puBu: interpolatePuBu,
    puBuGn: interpolatePuBuGn,
    puOr: interpolatePuOr,
    puRd: interpolatePuRd,
    purples: interpolatePurples,
    rainbow: interpolateRainbow,
    rdBu: interpolateRdBu,
    rgGy: interpolateRdGy,
    rdPu: interpolateRdPu,
    rdYlBu: interpolateRdYlBu,
    rdYlGn: interpolateRdYlGn,
    reds: interpolateReds,
    sinebow: interpolateSinebow,
    spectral: interpolateSpectral,
    turbo: interpolateTurbo,
    viridis: interpolateViridis,
    warm: interpolateWarm,
    ylGn: interpolateYlGn,
    ylGnBu: interpolateYlGnBu,
    ylGnBr: interpolateYlOrBr,
    ylOrRd: interpolateYlOrRd,
  };

  const interpolate = (
    value: number | null,
    domain: [min: number, max: number] | null = null,
  ): string => {
    if (value === null) return "#ffffff00"; // transparent
    if (domain !== null) {
      const normalize = (val: number): number => {
        if (domain[1] === domain[0]) return 0.5; // Prevent NaN division by zero
        return (val - domain[0]) / (domain[1] - domain[0]);
      };
      return lookup[key](normalize(value));
    }
    return lookup[key](value);
  };

  return {
    interpolate,
  };
};
```

src/lib/utils.ts
```
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
```

src/pages/CategoryCatalog.tsx
```
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDuckDB } from "../contexts/DuckDBContext";
import { CategoryData } from "../types";
import {
  getCategoryHierarchy,
  getItemsByCategory,
} from "../services/apiClient";
import { ChevronRightIcon, SearchIcon } from "@govtechmy/myds-react/icon";
import { Tag } from "@govtechmy/myds-react/tag";
import { cn } from "../lib/utils";

const CategoryPage: React.FC = () => {
  const { group, category } = useParams();
  const navigate = useNavigate();
  const { conn, isReady, isCacheReady } = useDuckDB();

  const [hierarchy, setHierarchy] = useState<CategoryData[]>([]);
  const [itemsList, setItemsList] = useState<any[]>([]);

  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(true);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (!isReady || !conn) return;
    setIsLoadingHierarchy(true);
    getCategoryHierarchy(conn)
      .then(setHierarchy)
      .catch(console.error)
      .finally(() => setIsLoadingHierarchy(false));
  }, [isReady, conn]);

  useEffect(() => {
    if (!isReady || !conn || !group || !category) {
      setItemsList([]);
      return;
    }
    setIsLoadingItems(true);
    // Pass isCacheReady to the API client
    getItemsByCategory(conn, group, category, isCacheReady)
      .then(setItemsList)
      .catch(console.error)
      .finally(() => setIsLoadingItems(false));
  }, [isReady, conn, group, category, isCacheReady]);

  const availableGroups = useMemo(() => {
    return Array.from(new Set(hierarchy.map((h) => h.item_group)));
  }, [hierarchy]);

  const availableCategories = useMemo(() => {
    if (!group) return [];
    return hierarchy
      .filter((h) => h.item_group === group)
      .map((h) => h.item_category);
  }, [hierarchy, group]);

  return (
    <div className="flex flex-col container mx-auto 2xl:px-40 pb-20 pt-10 gap-10 px-6 min-h-[70vh]">
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tighter text-txt-black-900">
          Explore Categories
        </h1>
        <p className="text-lg text-txt-black-500">
          Drill down into product groups to find specific items.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* GROUPS SECTION */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-black-500">
            Product Groups
          </h2>

          {!isReady || isLoadingHierarchy ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-28 bg-bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {availableGroups.map((groupName) => {
                const isSelected = groupName === group;
                return (
                  <button
                    key={groupName}
                    className={`capitalize px-5 py-2 rounded-[14px] text-sm transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${
                      isSelected
                        ? "bg-txt-black-900 text-txt-white shadow-md scale-[1.02]"
                        : "bg-white dark:bg-[#1D1D21] text-txt-black-600 dark:text-gray-300 hover:bg-bg-black-25 dark:hover:bg-[#27272A] hover:text-txt-black-900 border border-otl-gray-200 dark:border-gray-800 shadow-sm"
                    }`}
                    onClick={() => navigate(`/category/${groupName}`)}
                  >
                    {groupName.toLowerCase()}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CATEGORIES SECTION */}
        {group && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-top-2 fade-in duration-300">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-txt-black-500">
              Sub-Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((catName) => {
                const urlSafeCatName = catName.replace("/", " | ");
                const isSelected = urlSafeCatName === category;

                return (
                  <button
                    key={catName}
                    className={`capitalize px-4 py-1.5 rounded-xl text-[13px] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-otl-success-400 ${
                      isSelected
                        ? "bg-bg-success-50 dark:bg-success-900/20 text-txt-success-700 dark:text-success-400 border border-otl-success-300 dark:border-success-800 shadow-sm"
                        : "bg-transparent text-txt-black-500 dark:text-gray-400 hover:text-txt-black-900 dark:hover:text-white border border-transparent hover:bg-white dark:hover:bg-gray-800 shadow-none hover:shadow-sm"
                    }`}
                    onClick={() =>
                      navigate(`/category/${group}/${urlSafeCatName}`)
                    }
                  >
                    {catName.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ITEMS LIST SECTION */}
      {group && category && (
        <div className="mt-4 pt-8 border-t border-otl-gray-200/50 dark:border-gray-800/50">
          {isLoadingItems ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white dark:bg-[#1D1D21] border border-otl-gray-200 dark:border-gray-800 rounded-[20px] animate-pulse shadow-sm"
                />
              ))}
            </div>
          ) : itemsList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-otl-gray-200 dark:border-gray-800 rounded-[32px] bg-bg-black-25 dark:bg-[#1D1D21]/50">
              <div className="w-12 h-12 rounded-full bg-bg-black-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                <SearchIcon className="w-5 h-5 text-txt-black-400" />
              </div>
              <h3 className="text-lg font-bold text-txt-black-900 dark:text-white">
                No items found
              </h3>
              <p className="text-txt-black-500 dark:text-gray-500 font-medium text-sm">
                Try selecting a different sub-category above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {itemsList.map((item) => (
                <div
                  key={item.item_code}
                  tabIndex={0}
                  className={cn(
                    "group flex flex-row justify-between items-center p-5 gap-4 rounded-lg border border-otl-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 ease-out active:scale-[0.98] cursor-pointer outline-none shrink-1 overflow-clip",
                    item.status === "discontinued" &&
                      "opacity-60 grayscale-[50%]",
                  )}
                  onClick={() => navigate(`/item/${item.item_code}`)}
                >
                  <div className="flex flex-col gap-2 flex-1  min-w-0">
                    <h4
                      className={cn(
                        "font-semibold tracking-tight truncate",
                        item.status === "discontinued"
                          ? "text-txt-black-500 line-through dark:text-gray-500"
                          : "text-txt-black-900 dark:text-white group-hover:text-txt-black-900 dark:group-hover:text-black-400",
                      )}
                    >
                      {item.item}
                    </h4>

                    <div className="flex gap-2 items-center">
                      <span className="text-[10px] font-bold text-txt-black-500 dark:text-gray-400 uppercase tracking-widest bg-bg-black-50 dark:bg-gray-800 px-2 py-1 rounded-md">
                        per {item.unit}
                      </span>
                      {item.status === "discontinued" ? (
                        <Tag
                          size="small"
                          variant="default"
                          mode="pill"
                          className="text-[10px] font-bold bg-bg-black-100 dark:bg-gray-800 text-txt-black-500 shadow-sm"
                        >
                          Discontinued
                        </Tag>
                      ) : (
                        <Tag
                          size="small"
                          variant="primary"
                          mode="pill"
                          className="text-[10px] font-bold tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75 shadow-sm"
                        >
                          View Prices
                        </Tag>
                      )}
                    </div>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center transition-all">
                    <ChevronRightIcon className="w-4 h-4 text-txt-black-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
```

src/pages/FullSearchResultsPage.tsx
```
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AutoPagination } from "@govtechmy/myds-react/pagination";
import SearchResults from "../components/SearchResults";
import { SearchResultInput } from "../types";
import { useDuckDB } from "../contexts/DuckDBContext";

const ITEMS_PER_PAGE = 10;

const FullSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => searchParams.get("q") || "", [searchParams]);

  const { conn, isReady, isCacheReady } = useDuckDB();

  const [allFilteredResults, setAllFilteredResults] = useState<
    SearchResultInput[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isReady || !conn) return;

    if (!query.trim()) {
      setAllFilteredResults([]);
      setCurrentPage(1);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const queryStr = isCacheReady
          ? `SELECT f.*, COALESCE(s.status, 'active') as status 
             FROM lake.lookup_item f 
             LEFT JOIN memory.item_status s ON f.item_code = s.item_code 
             WHERE item ILIKE ? OR search_index ILIKE ? OR item_category ILIKE ?`
          : `SELECT *, 'active' as status FROM lake.lookup_item 
             WHERE item ILIKE ? OR search_index ILIKE ? OR item_category ILIKE ?`;

        const stmt = await conn.prepare(queryStr);
        const term = `%${query}%`;
        const result = await stmt.query(term, term, term);

        const items = result
          .toArray()
          .map((r: any) => r.toJSON() as SearchResultInput);
        setAllFilteredResults(items);
        setCurrentPage(1);
        stmt.close();
      } catch (e) {
        console.error("Failed to perform full search", e);
        setError("Search functionality encountered an error.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, isReady, conn, isCacheReady]);

  const totalItems = useMemo(
    () => allFilteredResults.length,
    [allFilteredResults],
  );

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allFilteredResults.slice(startIndex, endIndex);
  }, [allFilteredResults, currentPage]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectItem = (item: SearchResultInput) => {
    if (typeof item.item_code !== "undefined") {
      navigate(`/item/${item.item_code}`);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl min-h-[75vh] animate-in fade-in duration-500">
      <div className="flex flex-col gap-8">
        {error && (
          <div className="bg-bg-danger-50 dark:bg-danger-900/10 text-txt-danger dark:text-danger-400 p-5 rounded-2xl text-sm font-semibold border border-otl-danger-200 dark:border-danger-800 shadow-sm">
            Error: {error}
          </div>
        )}

        <div className="flex flex-col gap-2 pb-6 border-b border-otl-gray-200/50 dark:border-gray-800">
          {!error && query ? (
            <>
              <h1 className="text-3xl md:text-4xl font-black text-txt-black-900 dark:text-white tracking-tighter">
                Results for "{query}"
              </h1>
              {!isLoading && (
                <p className="text-sm font-bold text-txt-black-400 dark:text-gray-500 uppercase tracking-widest">
                  {totalItems} items found
                </p>
              )}
            </>
          ) : (
            <h1 className="text-3xl md:text-4xl font-black text-txt-black-900 dark:text-white tracking-tighter">
              Search Database
            </h1>
          )}
        </div>

        <SearchResults
          results={currentItems}
          onSelectItem={handleSelectItem}
          isLoading={isLoading}
          error={null}
        />

        {!isLoading && !error && totalItems > ITEMS_PER_PAGE && (
          <div className="mt-8 flex justify-center pb-10">
            <AutoPagination
              page={currentPage}
              limit={ITEMS_PER_PAGE}
              count={totalItems}
              type="default"
              maxDisplay={5}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FullSearchResultsPage;
```

src/pages/Home.tsx
```
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
```

src/pages/ItemDetailsWrapper.tsx
```
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDuckDB } from "../contexts/DuckDBContext";
import { DataTable } from "@govtechmy/myds-react/data-table";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@govtechmy/myds-react/select";
import { Tag } from "@govtechmy/myds-react/tag";
import { Button, ButtonIcon } from "@govtechmy/myds-react/button";
import { DownloadIcon } from "@govtechmy/myds-react/icon";
import { DatePicker } from "@govtechmy/myds-react/date-picker";
import {
  DateRangePicker,
  DateRange,
} from "@govtechmy/myds-react/daterange-picker";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
} from "@govtechmy/myds-react/dropdown";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { ItemMetadata, ItemLatest, ItemPriceHistory } from "../types";
import {
  getItemMetadata,
  getItemPrices,
  getItemPriceHistory,
} from "../services/apiClient";
import ItemMetadataDisplay from "../components/ItemMetadata";
import LocalityAnalysis, {
  LocalityAnalysisSkeleton,
} from "../components/LocalityAnalysis";
import { Spinner } from "@govtechmy/myds-react/spinner";

const DEFAULT_STATE = "Selangor";
const ALL_DISTRICTS_VALUE = "__ALL_DISTRICTS__";

const CellWrapper = ({
  isCheapest,
  children,
  isFirst,
  isLast,
}: {
  isCheapest: boolean;
  children: React.ReactNode;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  if (!isCheapest)
    return (
      <div className="text-sm font-medium text-txt-black-700 dark:text-gray-300">
        {children}
      </div>
    );
  return (
    <div
      className={`text-sm font-medium text-txt-black-700 dark:text-gray-300 
            ${isFirst ? "rounded-l-2xl ml-0" : ""} 
            ${isLast ? "rounded-r-2xl mr-0" : ""}`}
    >
      {children}
    </div>
  );
};

const ItemDetailsWrapper: React.FC = () => {
  const { itemCode } = useParams<{ itemCode: string }>();
  const { db, conn } = useDuckDB();

  const [itemDetails, setItemDetails] = useState<ItemMetadata | null>(null);
  const [priceHistory, setPriceHistory] = useState<ItemPriceHistory[]>([]);
  const [allPriceData, setAllPriceData] = useState<ItemLatest[]>([]);

  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  const [selectedState, setSelectedState] = useState<string>(DEFAULT_STATE);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [debouncedDate, setDebouncedDate] = useState<Date | undefined>();

  const [downloadDateRange, setDownloadDateRange] = useState<
    DateRange | undefined
  >();
  const [downloadFormat, setDownloadFormat] = useState<"csv" | "parquet">(
    "csv",
  );
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedDate(selectedDate), 400);
    return () => clearTimeout(handler);
  }, [selectedDate]);

  useEffect(() => {
    if (!itemCode || !conn) return;
    setIsLoadingMetadata(true);
    setIsLoadingHistory(true);

    // Fetch Metadata and History concurrently to halve network/DB time
    Promise.all([
      getItemMetadata(conn, itemCode),
      getItemPriceHistory(conn, itemCode),
    ])
      .then(([metaData, historyData]) => {
        if (metaData.length > 0) setItemDetails(metaData[0]);
        setPriceHistory(historyData);

        // Immediately set the date to bypass debounce delay on first load
        if (historyData.length > 0 && !selectedDate) {
          const latestDate = new Date(historyData[historyData.length - 1].date);
          setSelectedDate(latestDate);
          setDebouncedDate(latestDate);
        }
      })
      .finally(() => {
        setIsLoadingMetadata(false);
        setIsLoadingHistory(false);
      });
  }, [itemCode, conn]);

  useEffect(() => {
    // Only fetch prices once we have a definitive date, saving a redundant "MAX(date)" query
    if (!itemCode || !conn || !debouncedDate) return;
    setIsLoadingPrices(true);
    const targetStr = format(debouncedDate, "yyyy-MM-dd");

    getItemPrices(conn, itemCode, targetStr)
      .then(setAllPriceData)
      .finally(() => setIsLoadingPrices(false));
  }, [itemCode, conn, debouncedDate]);

  const filteredPriceLatest = useMemo(() => {
    return allPriceData.filter((entry) => {
      const stateMatch = !selectedState || entry.state === selectedState;
      const districtMatch =
        !selectedDistrict || entry.district === selectedDistrict;
      return stateMatch && districtMatch;
    });
  }, [allPriceData, selectedState, selectedDistrict]);

  const minPrice = useMemo(
    () =>
      filteredPriceLatest.length === 0
        ? null
        : Math.min(...filteredPriceLatest.map((i) => i.price)),
    [filteredPriceLatest],
  );

  const columns = useMemo<ColumnDef<ItemLatest>[]>(
    () => [
      {
        accessorKey: "premise",
        header: "Store Location",
        cell: (info) => (
          <CellWrapper
            isCheapest={info.row.original.price === minPrice}
            isFirst
          >
            <div className="flex flex-col">
              <span className="text-txt-black-900 dark:text-white font-semibold">
                {info.getValue<string>()}
              </span>
              <span className="text-xs text-txt-black-500 dark:text-gray-500 mt-0.5">
                {info.row.original.district}
              </span>
            </div>
          </CellWrapper>
        ),
      },
      {
        accessorKey: "premise_type",
        header: "Format",
        cell: (info) => (
          <CellWrapper isCheapest={info.row.original.price === minPrice}>
            <span>{info.getValue<string>()}</span>
          </CellWrapper>
        ),
      },
      {
        accessorKey: "price",
        header: "Unit Price",
        cell: (info) => {
          const p = info.getValue<number>();
          const isCheapest = p === minPrice;
          return (
            <CellWrapper isCheapest={isCheapest} isLast>
              <div className="flex items-center gap-3">
                <span>RM {p.toFixed(2)}</span>
                {isCheapest && (
                  <Tag
                    variant="success"
                    size="small"
                    mode="pill"
                    className="text-[10px] shadow-sm hidden md:block"
                  >
                    Lowest
                  </Tag>
                )}
              </div>
            </CellWrapper>
          );
        },
      },
    ],
    [minPrice],
  );

  const availableStates = useMemo(
    () => Array.from(new Set(allPriceData.map((p) => p.state))).sort(),
    [allPriceData],
  );
  const availableDistricts = useMemo(
    () =>
      Array.from(
        new Set(
          allPriceData
            .filter((p) => p.state === selectedState)
            .map((p) => p.district),
        ),
      ).sort(),
    [allPriceData, selectedState],
  );

  const minAvailableDate =
    priceHistory.length > 0 ? new Date(priceHistory[0].date) : undefined;
  const maxAvailableDate =
    priceHistory.length > 0
      ? new Date(priceHistory[priceHistory.length - 1].date)
      : undefined;
  const disabledDates =
    minAvailableDate && maxAvailableDate
      ? [{ before: minAvailableDate }, { after: maxAvailableDate }]
      : undefined;

  const handleDownload = async () => {
    if (!db || !conn || !itemCode) return;
    setIsDownloading(true);
    try {
      let dateFilter = "";
      if (downloadDateRange?.from) {
        dateFilter += ` AND p.date >= '${format(downloadDateRange.from, "yyyy-MM-dd")}'`;
      }
      if (downloadDateRange?.to) {
        dateFilter += ` AND p.date <= '${format(downloadDateRange.to, "yyyy-MM-dd")}'`;
      }

      const query = `
        SELECT CAST(p.date AS VARCHAR) as date, pr.premise, pr.premise_type, pr.state, pr.district, p.price
        FROM lake.prices p
        JOIN lake.lookup_premise pr ON p.premise_code = pr.premise_code
        WHERE p.item_code = ${itemCode} AND LOWER(pr.premise) NOT LIKE '%test%' ${dateFilter}
        ORDER BY p.date DESC, p.price ASC
      `;

      const filename = `openpricecatcher_${itemCode}_${Date.now()}.${downloadFormat}`;

      if (downloadFormat === "csv") {
        await conn.query(
          `COPY (${query}) TO '${filename}' (HEADER, DELIMITER ',')`,
        );
      } else {
        await conn.query(`COPY (${query}) TO '${filename}' (FORMAT PARQUET)`);
      }

      const buffer = await db.copyFileToBuffer(filename);
      const blob = new Blob([buffer], {
        type:
          downloadFormat === "csv" ? "text/csv" : "application/octet-stream",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      try {
        await db.dropFile(filename);
      } catch (e) {
        // Ignored
      }
    } catch (err) {
      console.error("Failed to export data", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLocalitySelect = (level: "state" | "district", name: string) => {
    if (!name) {
      setSelectedState(DEFAULT_STATE);
      setSelectedDistrict("");
      return;
    }

    if (level === "state") {
      // Find proper casing from available items if possible, otherwise use passed name
      const match = allPriceData.find(
        (p) =>
          p.state.localeCompare(name, undefined, { sensitivity: "base" }) === 0,
      );
      setSelectedState(match ? match.state : name);
      setSelectedDistrict("");
    } else {
      const match = allPriceData.find(
        (p) =>
          p.district.localeCompare(name, undefined, { sensitivity: "base" }) ===
          0,
      );
      if (match) {
        setSelectedState(match.state);
        setSelectedDistrict(match.district);
      } else {
        setSelectedDistrict(name); // Fallback if no prices exist for that district today
      }
    }
  };
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-4 lg:px-8  flex flex-col gap-4 md:gap-8 pt-6 pb-20 animate-in fade-in duration-500">
      <ItemMetadataDisplay
        metadata={itemDetails}
        priceHistory={priceHistory}
        isLoading={isLoadingMetadata || isLoadingHistory}
      />

      {itemCode && debouncedDate ? (
        <LocalityAnalysis
          itemCode={itemCode}
          targetDate={format(debouncedDate, "yyyy-MM-dd")}
          onSelectionChange={handleLocalitySelect}
        />
      ) : (
        <LocalityAnalysisSkeleton />
      )}

      <section className="bg-bg-white border border-otl-gray-200 dark:border-gray-800 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="p-6 md:p-8 md:pb-6 border-b border-otl-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-lg font-semibold text-txt-black-900 tracking-tight">
            Retail Availability
          </h3>
        </div>

        <div className="px-4 md:px-6 py-5 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col md:flex-row md:space-x-4 md:divide-x md:divide-otl-gray-200 max-sm:justify-between max-sm:gap-4">
            <div className="flex flex-col md:flex-row items-left md:items-center md:justify-between gap-3">
              <span className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-txt-black-500 md:pl-3">
                Observation Date
              </span>
              <DatePicker
                value={selectedDate}
                onValueChange={setSelectedDate}
                disabled={disabledDates}
                size="small"
              />
            </div>
            <div className="flex flex-row gap-4 md:pl-4">
              <Select
                variant="outline"
                size="small"
                value={selectedState || availableStates[0] || ""}
                onValueChange={(v) => {
                  setSelectedState(v);
                  setSelectedDistrict("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                variant="outline"
                size="small"
                value={selectedDistrict || ALL_DISTRICTS_VALUE}
                onValueChange={(v) =>
                  setSelectedDistrict(v === ALL_DISTRICTS_VALUE ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DISTRICTS_VALUE}>
                    All Districts
                  </SelectItem>
                  {availableDistricts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex">
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="default-outline" size="small">
                  <ButtonIcon>
                    <DownloadIcon className="w-4 h-4" />
                  </ButtonIcon>
                  Export
                </Button>
              </DropdownTrigger>
              <DropdownContent
                align="end"
                className="max-sm: p-3 md:p-6 w-[370px] md:w-[400px] rounded-3xl shadow-2xl bg-bg-white dark:bg-bg-washed backdrop-blur-xl border dark:border-2 border-otl-gray-200 dark:border-gray-800  max-sm:relative max-sm:left-[1rem]"
              >
                <div className="flex flex-col gap-3 md:gap-6 p-3 md:p-4">
                  <p className="hidden font-semibold text-sm uppercase text-txt-black-900 dark:text-white">
                    Export Data
                  </p>
                  <div className="">
                    <label className="text-[10px] uppercase font-semibold text-txt-black-500 dark:text-gray-500 tracking-wider">
                      Select Range
                    </label>
                    <DateRangePicker
                      value={downloadDateRange}
                      onValueChange={setDownloadDateRange}
                      disabled={disabledDates}
                      size="small"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-txt-black-500 dark:text-gray-500 tracking-wider">
                      Format
                    </label>
                    <div>
                      <Select
                        variant="outline"
                        size="small"
                        value="csv"
                        // @ts-ignore
                        onValueChange={(v) => setDownloadFormat(v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem key="csv" value="csv">
                            .csv
                          </SelectItem>
                          <SelectItem key="parquet" value="parquet">
                            .parquet
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="default-outline"
                    className="w-full bg-bg-black-900 text-txt-white h-11 rounded-xl shadow-md hover:shadow-lg transition-all"
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading
                      ? "Generating..."
                      : `Download ${downloadFormat.toUpperCase()}`}
                  </Button>
                </div>
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        <div className="bg-white dark:bg-[#18181B]">
          {isLoadingPrices ? (
            <div className="p-24 flex flex-col items-center justify-center gap-4">
              <Spinner size="large" />
              <p className="text-sm font-semibold text-txt-black-400 dark:text-gray-500 animate-pulse">
                Loading premises...
              </p>
            </div>
          ) : filteredPriceLatest.length === 0 ? (
            <div className="p-24 text-center flex flex-col items-center justify-center gap-2">
              <p className="text-lg font-bold text-txt-black-900 dark:text-white">
                No records found
              </p>
              <p className="text-sm font-medium text-txt-black-400 dark:text-gray-500">
                Try adjusting your state or district filters.
              </p>
            </div>
          ) : (
            <div className="px-6 md:px-8 pb-8 ">
              <div className="overflow-auto h-full scrollbar max-h-[600px]">
                <DataTable data={filteredPriceLatest} columns={columns} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ItemDetailsWrapper;
```

src/pages/MarketPulse.tsx
```
import React, { useEffect, useState, useMemo } from "react";
import { getWeeklyIndexCategory } from "../services/apiClient";
import { IndexData } from "../types";
import CategoryTrendCard from "../components/CategoryTrendCard";

const MarketPulsePage: React.FC = () => {
  const [cardData, setCardData] = useState<IndexData | null>(null);

  useEffect(() => {
    getWeeklyIndexCategory().then(setCardData).catch(console.error);
  }, []);

  const sortedCategories = useMemo(() => {
    if (!cardData) return [];
    return Object.entries(cardData)
      .map(([cat, data]) => {
        const latest = data[data.length - 1];
        return { cat, data, pop: latest?.pop_change_pct || 0 };
      })
      .sort((a, b) => b.pop - a.pop); // Sort highest inflation to highest deflation
  }, [cardData]);

  return (
    <div className="flex flex-col container mx-auto 2xl:px-40 pb-20 pt-10 gap-10 px-6 min-h-[70vh] animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tighter text-txt-black-900 dark:text-white">
          Market Pulse
        </h1>
        <p className="text-lg font-medium text-txt-black-500 dark:text-gray-400">
          Week-over-week price index movements across all categories.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cardData
          ? sortedCategories.map(({ cat, data }) => (
              <CategoryTrendCard key={cat} category={cat} data={data} />
            ))
          : [...Array(12)].map((_, i) => (
              <div
                key={i}
                className="h-[160px] w-full bg-bg-black-25 dark:bg-[#1D1D21] rounded-[24px] animate-pulse border border-otl-gray-200 dark:border-gray-800"
              />
            ))}
      </div>
    </div>
  );
};

export default MarketPulsePage;
```

src/pages/PageNotFound.tsx
```
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonIcon } from '@govtechmy/myds-react/button';
import { HomeIcon } from '@govtechmy/myds-react/icon';

const PageNotFound: React.FC = () => {
	const navigate = useNavigate();
	const handleBack = () => navigate('/');
	return (
		<div className="container mx-auto my-10 bg-bg-white 2xl:px-40 text-txt-black-900 justify-center flex flex-col items-center gap-10">
			<div className='font-bold text-3xl text-center'> Page Not Found</div>
			<Button variant='primary-fill' size='medium' onClick={handleBack} className="bg-success-600 border-success-600 hover:bg-success-700">
				<ButtonIcon>
					<HomeIcon />
				</ButtonIcon>
				Back to Home
			</Button>
		</div>
	);
};

export default PageNotFound;
```

src/services/apiClient.ts
```
import * as duckdb from "@duckdb/duckdb-wasm";
import {
  ItemMetadata,
  ItemLatest,
  ItemPriceHistory,
  IndexData,
  IndexChartAgg,
  CategoryData,
} from "../types";

const arrowToArray = (table: any) =>
  table.toArray().map((row: any) => row.toJSON());

export const getItemMetadata = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
): Promise<ItemMetadata[]> => {
  const query = `
        WITH target AS (SELECT ?::INTEGER as code),
        max_date_cte AS (
            SELECT MAX(date) as max_d FROM lake.prices WHERE item_code = (SELECT code FROM target)
        ),
        freq_calc AS (
            SELECT 
                CASE 
                    WHEN m.max_d < current_date() - INTERVAL 60 DAY THEN 'discontinued'
                    WHEN (SELECT COUNT(DISTINCT date) FROM lake.prices WHERE item_code = (SELECT code FROM target) AND date >= current_date() - INTERVAL 30 DAY) >= 20 THEN 'daily'
                    WHEN (SELECT COUNT(DISTINCT date) FROM lake.prices WHERE item_code = (SELECT code FROM target) AND date >= current_date() - INTERVAL 30 DAY) >= 4 THEN 'weekly'
                    ELSE 'monthly'
                END as frequency
            FROM max_date_cte m
        ),
        latest_prices AS (
            SELECT p.price 
            FROM lake.prices p
            WHERE p.item_code = (SELECT code FROM target) 
              AND p.date = (SELECT max_d FROM max_date_cte)
              AND p.premise_code NOT IN (SELECT premise_code FROM lake.lookup_premise WHERE premise ILIKE '%test%')
        )
        SELECT 
            i.item_code, i.item, i.unit, i.item_group, i.item_category,
            (SELECT frequency FROM freq_calc) as frequency,
            quantile_cont(p.price, 0.05) as minimum, 
            quantile_cont(p.price, 0.95) as maximum,
            quantile_cont(p.price, 0.50) as median,
            (SELECT max_d FROM max_date_cte) as last_updated
        FROM latest_prices p
        LEFT JOIN lake.lookup_item i ON i.item_code = (SELECT code FROM target)
        GROUP BY 1, 2, 3, 4, 5, 6, 10;
    `;
  const stmt = await conn.prepare(query);
  const result = await stmt.query(Number(item_code));
  const data = arrowToArray(result);
  stmt.close();
  return data;
};

export const getItemPrices = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
  targetDate: string,
): Promise<ItemLatest[]> => {
  const query = `
        SELECT 
            CAST(p.date AS VARCHAR) as date, 
            pr.premise, pr.premise_type, pr.state, pr.district, p.price
        FROM lake.prices p
        JOIN lake.lookup_premise pr ON p.premise_code = pr.premise_code
        WHERE p.item_code = ? 
          AND p.date = ? 
          AND pr.premise NOT ILIKE '%test%'
        ORDER BY p.price ASC;
    `;

  const stmt = await conn.prepare(query);
  const result = await stmt.query(Number(item_code), targetDate);
  const data = arrowToArray(result);
  stmt.close();
  return data;
};

export const getItemPriceHistory = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
): Promise<ItemPriceHistory[]> => {
  const query = `
        SELECT 
            CAST(p.date AS VARCHAR) as date, 
            quantile_cont(p.price, 0.50) as median, 
            quantile_cont(p.price, 0.05) as p5, 
            quantile_cont(p.price, 0.95) as p95
        FROM lake.prices p
        WHERE p.item_code = ? 
          AND p.premise_code NOT IN (SELECT premise_code FROM lake.lookup_premise WHERE premise ILIKE '%test%')
        GROUP BY p.date
        ORDER BY p.date ASC;
    `;
  const stmt = await conn.prepare(query);
  const result = await stmt.query(Number(item_code));
  const data = arrowToArray(result);
  stmt.close();
  return data;
};

export const getWeeklyIndexGroup = async (): Promise<IndexChartAgg[]> => {
  const response = await fetch(
    "https://pricecatcher-lake.iwa.my/indices/item_group_price_index.json",
  );
  return await response.json();
};

export const getWeeklyIndexCategory = async (): Promise<IndexData> => {
  const response = await fetch(
    "https://pricecatcher-lake.iwa.my/indices/item_category_price_index.json",
  );
  const text = await response.text();
  const safeText = text.replace(/:\s*NaN/g, ": null");
  return JSON.parse(safeText);
};

let categoryHierarchyCache: CategoryData[] | null = null;

export const getCategoryHierarchy = async (
  conn: duckdb.AsyncDuckDBConnection,
) => {
  if (categoryHierarchyCache) return categoryHierarchyCache;

  const query = `
        SELECT DISTINCT item_group, item_category 
        FROM lake.lookup_item 
        WHERE item_group IS NOT NULL
        ORDER BY item_group ASC, item_category ASC;
    `;
  const result = await conn.query(query);
  categoryHierarchyCache = arrowToArray(result) as CategoryData[];
  return categoryHierarchyCache;
};

export const getItemsByCategory = async (
  conn: duckdb.AsyncDuckDBConnection,
  group: string,
  category: string,
  isCacheReady: boolean = false,
): Promise<any[]> => {
  const decodedCategory = category.replace(" | ", "/");

  const query = isCacheReady
    ? `SELECT i.*, 'weekly' as frequency, COALESCE(s.status, 'active') as status
       FROM lake.lookup_item i
       LEFT JOIN memory.item_status s ON i.item_code = s.item_code
       WHERE i.item_group = ? AND i.item_category = ?
       ORDER BY i.item ASC`
    : `SELECT i.*, 'weekly' as frequency, 'active' as status
       FROM lake.lookup_item i
       WHERE i.item_group = ? AND i.item_category = ?
       ORDER BY i.item ASC`;

  const stmt = await conn.prepare(query);
  const result = await stmt.query(group, decodedCategory);
  const data = arrowToArray(result);
  stmt.close();
  return data;
};

export const getLocalityInsights = async (
  conn: duckdb.AsyncDuckDBConnection,
  item_code: string,
  targetDate: string,
  metric: "median" | "avg" | "p95" | "p5" = "median",
  level: "state" | "district" = "state",
): Promise<any> => {
  const metricAgg = {
    median: "QUANTILE_CONT(price, 0.50)",
    avg: "AVG(price)",
    p95: "QUANTILE_CONT(price, 0.95)",
    p5: "QUANTILE_CONT(price, 0.05)",
  }[metric];

  const query = `
        WITH base_data AS (
            SELECT p.price, pr.state, pr.district, pr.premise
            FROM lake.prices p
            JOIN lake.lookup_premise pr ON p.premise_code = pr.premise_code
            WHERE p.item_code = ? 
              AND p.date = ? 
              AND pr.premise NOT ILIKE '%test%'
        ),
        ranked_data AS (
            SELECT 
                ${level} as name,
                ${metricAgg} as val,
                RANK() OVER(ORDER BY ${metricAgg} ASC) as rank
            FROM base_data
            GROUP BY 1
        ),
        region_ranking AS (
            SELECT ${level} as name, premise, district, price,
                   ROW_NUMBER() OVER(PARTITION BY ${level} ORDER BY price ASC) as rn
            FROM base_data
        )
        SELECT 
            (SELECT list({'name': name, 'val': val, 'rank': rank} ORDER BY rank ASC) FROM ranked_data) as ranking,
            (SELECT list({'name': name, 'premise': premise, 'district': district, 'price': price, 'rank': rn} ORDER BY rn ASC) FROM region_ranking WHERE rn <= 10) as cheapest_stores
    `;
  const stmt = await conn.prepare(query);
  const result = await stmt.query(Number(item_code), targetDate);
  const rawRow = arrowToArray(result)[0];
  stmt.close();

  if (!rawRow) return null;

  return {
    ...rawRow,
    ranking: rawRow.ranking ? Array.from(rawRow.ranking) : [],
    cheapest_stores: rawRow.cheapest_stores
      ? Array.from(rawRow.cheapest_stores)
      : [],
  };
};
```

</source_code>
</current_frontend_codebase>

My current backend codebase:
<current_backend_codebase>
<source_code>
generate_indices.py
```
import duckdb
import os
import json
import boto3
from numpy import nan

s3 = boto3.client(
    "s3",
    endpoint_url=f"https://{os.getenv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com",
    aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
    aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
    region_name="auto",
)


def push_to_r2(data, filename):
    s3.put_object(
        Bucket="pricecatcher-lake",
        Key=f"indices/{filename}",
        Body=json.dumps(data),
        ContentType="application/json",
    )


def get_con():
    con = duckdb.connect()
    # Apply Hardware Pragmas
    con.sql("SET threads=4; SET memory_limit='6GB';")
    con.sql(
        "INSTALL httpfs; INSTALL ducklake; INSTALL lindel FROM community; INSTALL icu;"
    )
    con.sql("LOAD httpfs; LOAD ducklake; LOAD lindel; LOAD icu;")

    con.sql(f"""
		CREATE SECRET r2 (
			TYPE S3, 
			KEY_ID '{os.getenv("R2_ACCESS_KEY")}', 
			SECRET '{os.getenv("R2_SECRET_KEY")}',
			ENDPOINT '{os.getenv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com',
			URL_STYLE 'path', 
			REGION 'auto'
		);
	""")

    con.sql("""
		ATTACH 'catalog.ducklake' AS lake (
			TYPE DUCKLAKE, 
			READ_ONLY TRUE,
			DATA_PATH 's3://pricecatcher-lake/data/',
			OVERRIDE_DATA_PATH TRUE
		);
	""")
    return con


def itemgroup_priceindex(item_level):
    con = get_con()

    interval = "week" if item_level == "item_category" else "month"
    lookback_years = 1 if item_level == "item_category" else 2

    query = f"""
    WITH raw_filtered AS (
      -- 1. Initial Filter
      SELECT 
        f.item_code, f.date, f.price, year(f.date) as yr,
        il.{item_level}
      FROM lake.prices f
      JOIN lake.lookup_premise p ON f.premise_code = p.premise_code
      JOIN lake.lookup_item il ON f.item_code = il.item_code
      WHERE LOWER(p.premise) NOT LIKE '%test%'
        AND f.date >= datetrunc('day', current_timestamp AT TIME ZONE 'Asia/Kuching') - INTERVAL {lookback_years} YEARS
        AND il.{item_level} IS NOT NULL
        AND year(f.date) >= year(current_date) - {lookback_years} -- Forces partition pruning
    ),

    active_items AS (
      SELECT item_code
      FROM raw_filtered
      GROUP BY 1
      HAVING MAX(date) >= datetrunc('day', current_timestamp AT TIME ZONE 'Asia/Kuching') - INTERVAL 60 DAYS
    ),

    price_stats AS (
      -- OPTIMIZATION: approx_quantile uses 99% less memory and runs instantly
      SELECT 
        r.item_code, r.yr,
        approx_quantile(r.price, 0.25) as q1,
        approx_quantile(r.price, 0.75) as q3
      FROM raw_filtered r
      JOIN active_items a ON r.item_code = a.item_code
      GROUP BY 1, 2
    ),

    cleaned_prices AS (
      SELECT r.item_code, r.date, r.price, r.{item_level}
      FROM raw_filtered r
      JOIN price_stats s ON r.item_code = s.item_code AND r.yr = s.yr
      WHERE r.price BETWEEN (s.q1 - 3 * (s.q3 - s.q1)) AND (s.q3 + 3 * (s.q3 - s.q1))
        AND r.price > 0
    ),

    ranked_price AS (
      SELECT item_code, date, price,
        ROW_NUMBER() OVER (PARTITION BY item_code ORDER BY date ASC) AS rn
      FROM cleaned_prices
    ),

    base_price AS (
      SELECT item_code, AVG(price) AS base_price 
      FROM ranked_price WHERE rn <= 7 GROUP BY item_code
    ),

    time_agg AS (
      SELECT item_code, {item_level}, DATE_TRUNC('{interval}', date) AS interval_start, AVG(price) AS raw_avg_price
      FROM cleaned_prices GROUP BY 1, 2, 3
    ),

    smoothed_items AS (
      SELECT
        item_code,
        {item_level},
        interval_start,
        AVG(raw_avg_price) OVER (
            PARTITION BY item_code 
            ORDER BY interval_start 
            ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
        ) AS smoothed_avg_price
      FROM time_agg
    ),

    item_index AS (
      SELECT
        si.{item_level}, 
        si.interval_start, 
        (si.smoothed_avg_price / bp.base_price) * 100 AS price_index
      FROM smoothed_items si
      JOIN base_price bp ON si.item_code = bp.item_code
    ),

    final_rollup AS (
      SELECT
        {item_level},
        interval_start as date,
        ROUND(AVG(price_index), 2) AS cat_price_index
      FROM item_index
      GROUP BY 1, 2
    )

    -- Return Index and WoW/MoM % Change
    SELECT
      {item_level},
      date,
      cat_price_index,
      ROUND(
        ((cat_price_index - LAG(cat_price_index) OVER (PARTITION BY {item_level} ORDER BY date)) 
        / LAG(cat_price_index) OVER (PARTITION BY {item_level} ORDER BY date)) * 100
      , 2) AS pop_change_pct
    FROM final_rollup
    ORDER BY 1, 2
    """

    print(f"Executing query for {item_level}...")
    result = con.sql(query).df()
    result["date"] = result["date"].dt.strftime("%Y-%m-%d %H:%M:%S")

    if item_level == "item_category":
        to_loop = result["item_category"].unique()
        return {
            str(i): result[result["item_category"] == i][
                ["date", "cat_price_index", "pop_change_pct"]
            ].to_dict(orient="records")
            for i in to_loop
        }

    if item_level == "item_group":
        # Note: pop_change_pct is intentionally left out of the monthly pivot to keep it 2D,
        # but you can calculate it on the frontend, or include it if your frontend handles 3D JSONs.
        result = result.pivot(
            index="date", columns="item_group", values="cat_price_index"
        ).reset_index()
        result = result.replace(nan, None)
        return result.to_dict(orient="records")


if __name__ == "__main__":
    # result_item_group = itemgroup_priceindex("item_group")
    # push_to_r2(result_item_group, "item_group_price_index.json")

    result_item_category = itemgroup_priceindex("item_category")
    push_to_r2(result_item_category, "item_category_price_index.json")
```

ingest.sql
```
-- 1. Hardware Optimizations for GitHub Actions
SET threads = 4;
SET memory_limit = '6GB';
SET preserve_insertion_order = false; -- Huge speedup for inserts

-- 2. Install and Load
INSTALL httpfs; LOAD httpfs;
INSTALL ducklake; LOAD ducklake;
INSTALL lindel FROM community; LOAD lindel;

CREATE SECRET r2 (
    TYPE S3, 
    KEY_ID getenv('R2_ACCESS_KEY'), SECRET getenv('R2_SECRET_KEY'),
    ENDPOINT getenv('DUCKDB_ENDPOINT'), URL_STYLE 'path', REGION 'auto'
);

ATTACH 'catalog.ducklake' AS lake (
    TYPE DUCKLAKE, 
    DATA_PATH 's3://pricecatcher-lake/data/',
    OVERRIDE_DATA_PATH TRUE
);

-- DROP TABLE IF EXISTS lake.lookup_item;
-- 3. Overwrite Lookup Tables with Flattened Search Index
CREATE OR REPLACE TABLE lake.lookup_item WITH (inline = true) AS 
SELECT 
    d.item_code, d.item AS item,
    d.item_category, d.item_group, d.unit,
    LOWER(concat_ws(' ', d.item, COALESCE(m.item_en, ''), array_to_string(COALESCE(m.search, []), ' '))) AS search_index
FROM read_parquet('https://storage.data.gov.my/pricecatcher/lookup_item.parquet') d
LEFT JOIN read_json_auto('item_mapping.json') m ON d.item_code = m.item_code;

CREATE OR REPLACE TABLE lake.lookup_premise WITH (inline = true) AS 
SELECT * FROM read_parquet('https://storage.data.gov.my/pricecatcher/lookup_premise.parquet');

-- 4. Append New Daily Prices
-- OPTIMIZATION: Only scan the current year partition to find max_date!
SELECT 'ROW COUNT BEFORE:' AS log_msg, COUNT(*) FROM lake.prices;

-- 8. UPSERT New Daily Prices (Native DuckLake MERGE)
MERGE INTO lake.prices AS tgt
USING (
    SELECT 
        date::DATE AS date, 
        premise_code::INTEGER AS premise_code, 
        item_code::INTEGER AS item_code, 
        price::DOUBLE AS price
    FROM read_parquet('https://storage.data.gov.my/pricecatcher/pricecatcher_' || strftime(current_date, '%Y-%m') || '.parquet')
) AS s
ON (
    tgt.date = s.date AND 
    tgt.premise_code = s.premise_code AND 
    tgt.item_code = s.item_code
)
-- If DOSM fixed a typo in an old price this month, update it
WHEN MATCHED THEN UPDATE SET price = s.price
-- If it's a brand new daily price, insert it
WHEN NOT MATCHED THEN INSERT;

-- 9. CHECK RESULT (For logging)
SELECT 'ROW COUNT AFTER:' AS log_msg, COUNT(*) FROM lake.prices;
CHECKPOINT;
VACUUM; 
DETACH lake;
```

init_lake.py
```
import os
import duckdb
import datetime

from dotenv import load_dotenv

load_dotenv()

CF_ACCESS_KEY = os.getenv("CF_ACCESS_KEY")
CF_SECRET_KEY = os.getenv("CF_SECRET_KEY")
CF_ACCOUNT_ID = os.getenv("CF_ACCOUNT_ID")


# 1. Generate the list of OpenDOSM URLs from Jan 2022 to Current Month using Python
urls = []
current_year = datetime.datetime.now().year
current_month = datetime.datetime.now().month

for year in range(2022, current_year + 1):
    for month in range(1, 13):
        # Stop if we hit future months in the current year
        if year == current_year and month > current_month:
            break
        urls.append(
            f"'https://storage.data.gov.my/pricecatcher/pricecatcher_{year}-{month:02d}.parquet'"
        )

# Join them into a SQL-friendly array format: ['url1', 'url2', ...]
urls_sql_array = f"[{', '.join(urls)}]"


# 2. Define your SQL Query and inject the URLs
query = f"""
-- 1. Load extensions
INSTALL httpfs; LOAD httpfs;
INSTALL ducklake; LOAD ducklake;
INSTALL lindel FROM community; LOAD lindel;

-- 2. Authenticate with Cloudflare R2
CREATE SECRET r2 (
    TYPE S3, 
    KEY_ID '{CF_ACCESS_KEY}', 
    SECRET '{CF_SECRET_KEY}',
    ENDPOINT '{CF_ACCOUNT_ID}.r2.cloudflarestorage.com',
    URL_STYLE 'path', 
    REGION 'auto'
);

-- 3. Create the DuckLake catalog
ATTACH 'catalog.ducklake' AS lake (
    TYPE DUCKLAKE, 
    DATA_PATH 's3://pricecatcher-lake/data/'
);

-- 4. Inline Lookup Tables
CREATE TABLE lake.lookup_item AS 
SELECT * FROM read_parquet('https://storage.data.gov.my/pricecatcher/lookup_item.parquet');

CREATE TABLE lake.lookup_premise AS 
SELECT * FROM read_parquet('https://storage.data.gov.my/pricecatcher/lookup_premise.parquet');

-- 5. Create and Cluster Fact Table
CREATE TABLE lake.prices (
    date DATE,
    premise_code INTEGER,
    item_code INTEGER,
    price DOUBLE
);

-- FIX: Cast the list to a fixed-size array INTEGER[3]
ALTER TABLE lake.prices SET SORTED BY (
    hilbert_encode([
        (date - '2022-01-01'::DATE), 
        premise_code, 
        item_code
    ]::SMALLINT[3])
);

ALTER TABLE lake.prices SET PARTITIONED BY (
    year(date)
);

-- Insert Historical Data
INSERT INTO lake.prices
SELECT 
    date::DATE, 
    premise_code::INTEGER, 
    item_code::INTEGER, 
    price::DOUBLE
FROM read_parquet({urls_sql_array});

UPDATE __ducklake_metadata_lake.ducklake_metadata 
SET value = 'https://pricecatcher-lake.iwa.my/data/' 
WHERE key = 'data_path';

-- 7. Flush and close
CHECKPOINT;
DETACH lake;
"""

# 3. Execute the query
print("Starting historical backfill. This may take a few minutes...")
duckdb.execute(query)
print("Success! catalog.ducklake has been created, and Parquet data is in R2.")
```

pyproject.toml
```
[project]
name = "new-pricecatcher-be"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "boto3>=1.43.0",
    "duckdb>=1.5.2",
    "ipykernel>=7.2.0",
    "numpy>=2.4.4",
    "pandas>=3.0.2",
    "pyarrow>=24.0.0",
    "python-dotenv>=1.2.2",
    "requests>=2.33.1",
]
```

update_mapping.py
```
import duckdb
import json
import os
import requests

# 1. Load the existing local mapping
mapping_file = "item_mapping.json"
try:
    with open(mapping_file, "r") as f:
        existing_mapping = json.load(f)
except FileNotFoundError:
    existing_mapping = []

existing_item_codes = {item["item_code"] for item in existing_mapping}

# 2. Query DuckDB to find ACTIVE items missing from the mapping
con = duckdb.connect()
con.sql("INSTALL httpfs; INSTALL ducklake; LOAD httpfs; LOAD ducklake;")
con.sql(f"""
    CREATE SECRET r2 (
        TYPE S3, KEY_ID '{os.getenv("R2_ACCESS_KEY")}', SECRET '{os.getenv("R2_SECRET_KEY")}',
        ENDPOINT '{os.getenv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com', URL_STYLE 'path', REGION 'auto'
    );
""")
con.sql(
    "ATTACH 's3://pricecatcher-lake/catalog.ducklake' AS lake (TYPE DUCKLAKE, OVERRIDE_DATA_PATH TRUE);"
)

# Get items updated in the last 60 days
active_items_query = """
    SELECT l.item_code, l.item as malay_name
    FROM lake.prices p
    JOIN lake.lookup_item l ON p.item_code = l.item_code
    GROUP BY 1, 2
    HAVING MAX(p.date) >= current_date - INTERVAL 60 DAYS
"""
active_items = con.sql(active_items_query).df()

# 3. Filter for items we haven't translated yet
new_items_to_translate = []
for _, row in active_items.iterrows():
    if row["item_code"] not in existing_item_codes:
        new_items_to_translate.append(
            {"item_code": row["item_code"], "item": row["malay_name"]}
        )

# 4. If no new items, exit successfully and save API money!
if not new_items_to_translate:
    print("No new active items found. Exiting.")
    exit(0)

print(f"Found {len(new_items_to_translate)} new items. Calling DeepSeek API...")

# 5. Call DeepSeek API (OpenAI Compatible)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
prompt = f"""
You are a Malaysian grocery translation expert. Translate these items to English and provide a list of eight to nine common search aliases (including Malay slang, misspellings, and English synonyms).
Output ONLY valid JSON in this exact format:
[
  {{"item_code": 123, "item": "Malay Name", "item_en": "English Name", "search": ["alias1", "alias2"]}}
]
Here are the items to translate:
{json.dumps(new_items_to_translate, indent=2)}
"""

response = requests.post(
    "https://api.deepseek.com/chat/completions",
    headers={
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "model": "deepseek-v4-flash",  # Replace with your specific flash model if needed
        "messages": [{"role": "user", "content": prompt}],
        "response_format": {"type": "json_object"},  # Forces valid JSON
    },
)

# 6. Parse and append the new mappings
try:
    llm_output = response.json()["choices"][0]["message"]["content"]
    new_mappings = json.loads(llm_output)

    # Ensure it's a list and append to our existing data
    if isinstance(new_mappings, dict) and "items" in new_mappings:
        new_mappings = new_mappings["items"]

    existing_mapping.extend(new_mappings)

    # Save back to the local file
    with open(mapping_file, "w") as f:
        json.dump(existing_mapping, f, indent=2)
    print("Successfully updated item_mapping.json!")

except Exception as e:
    print(f"Failed to parse LLM response: {e}")
    print(response.text)
    exit(1)
```

.github/workflows/daily-ingest.yml
```
name: Daily Pricecatcher Ingestion

on:
  schedule:
    - cron: "30 0 * * *" # Runs daily at 00:00 UTC (8:00 AM MYT)
      timezone: "Asia/Kuala_Lumpur"
  workflow_dispatch: # Adds a button in GitHub UI to run it manually for testing

jobs:
  ingest:
    runs-on: ubuntu-latest

    # Set up environment variables dynamically for AWS CLI and DuckDB
    env:
      AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY }}
      AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_KEY }}
      AWS_ENDPOINT_URL: https://${{ secrets.R2_ACCOUNT_ID }}.r2.cloudflarestorage.com
      AWS_REGION: auto

      # DuckDB requires these specific variables to be passed into the SQL script
      R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
      R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
      DUCKDB_ENDPOINT: ${{ secrets.R2_ACCOUNT_ID }}.r2.cloudflarestorage.com

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v6

      - name: Install DuckDB CLI
        uses:  opt-nc/setup-duckdb-action@v1.2.6

      - name: astral-sh/setup-uv
        uses: astral-sh/setup-uv@v8.1.0

      - name: Auto-Translate New Items (DeepSeek)
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
          R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
          R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
        run: uv run update_mapping.py

      - name: Check for Mapping Changes
        id: git-check
        run: |
          if [ -n "$(git status --porcelain item_mapping.json)" ]; then
            echo "changed=true" >> $GITHUB_OUTPUT
            echo "Changes detected in item_mapping.json"
          else
            echo "changed=false" >> $GITHUB_OUTPUT
            echo "No changes in item_mapping.json"
          fi

      - name: Commit Updated Mapping to Repo
        # Only runs if the previous step detected a change
        if: steps.git-check.outputs.changed == 'true'
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: auto-translated new DOSM items"
          file_pattern: 'item_mapping.json'

      - name: Download Latest Catalog from R2
        run: |
          aws s3 cp s3://pricecatcher-lake/catalog.ducklake ./catalog.ducklake \
            --endpoint-url ${{ env.AWS_ENDPOINT_URL }}

      - name: Run DuckDB Ingestion
        run: duckdb < ingest.sql

      - name: Upload Updated Catalog to R2
        run: |
          # The cache-control headers ensure the CDN serves the new data within 5 minutes
          aws s3 cp ./catalog.ducklake s3://pricecatcher-lake/catalog.ducklake \
            --endpoint-url ${{ env.AWS_ENDPOINT_URL }} \
            --cache-control "public, max-age=300, stale-while-revalidate=60"
```

.github/workflows/weekly-indeices.yml
```
name: Weekly Index Generation

on:
  schedule:
    - cron: "50 0 * * *" # Runs daily at 00:00 UTC (8:00 AM MYT)
      timezone: "Asia/Kuala_Lumpur"
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    env:
      R2_ACCOUNT_ID: ${{ secrets.R2_ACCOUNT_ID }}
      R2_ACCESS_KEY: ${{ secrets.R2_ACCESS_KEY }}
      R2_SECRET_KEY: ${{ secrets.R2_SECRET_KEY }}
      AWS_ENDPOINT_URL: https://${{ secrets.R2_ACCOUNT_ID }}.r2.cloudflarestorage.com

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: astral-sh/setup-uv
        uses: astral-sh/setup-uv@v8.1.0

      - name: Download Latest Catalog from R2
        run: |
          aws s3 cp s3://pricecatcher-lake/catalog.ducklake ./catalog.ducklake \
            --endpoint-url ${{ env.AWS_ENDPOINT_URL }} \
            --region auto
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_KEY }}

      - name: Run Index Generation
        run: uv run generate_indices.py
```

</source_code>
</current_backend_codebase>
