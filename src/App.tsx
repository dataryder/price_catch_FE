import { Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import NavBarHeader from "./components/Navbar";
import FooterBar from "./components/Footer";
import { useTheme } from "@govtechmy/myds-react/hooks";

import HomePage from "./pages/Home";
import { Spinner } from "@govtechmy/myds-react/spinner";
import { Masthead, MastheadTitle } from "@govtechmy/myds-react/masthead";
import { InfoIcon } from "@govtechmy/myds-react/icon";
const FullSearchResultsPage = lazy(
  () => import("./pages/FullSearchResultsPage"),
);
const ItemDetailsWrapper = lazy(() => import("./pages/ItemDetailsWrapper"));
const CategoryPage = lazy(() => import("./pages/CategoryCatalog"));
const MarketPulsePage = lazy(() => import("./pages/MarketPulse"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));

const CustomMastheadHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-4.5 flex items-center gap-2 overflow-x-hidden py-2 outline-none sm:py-1 md:px-6 max-w-screen-xl">
    {/* Swapping the MalaysiaFlagIcon for InfoIcon */}
    <div className="text-txt-black-700 text-[12px] flex w-full items-center justify-between truncate sm:justify-start">
      <div className="px-1.5 pl-2 sm:pl-6 lg:pl-8">
        <InfoIcon className="hidden md:inline-block text-txt-black-700" />
      </div>
      {children}
    </div>
  </div>
);

function App() {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "light");
  }, [setTheme]);

  return (
    <div className="w-full min-h-screen bg-bg-white dark:bg-[#18181B] transition-colors duration-300">
      <Masthead>
        <CustomMastheadHeader>
          <MastheadTitle>
            This is a community project using built on official open data.
          </MastheadTitle>
        </CustomMastheadHeader>
      </Masthead>
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
