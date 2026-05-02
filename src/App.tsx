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
