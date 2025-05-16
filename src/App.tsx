import { Routes, Route } from 'react-router-dom';

import NavBarHeader from './components/Navbar';
import FullSearchResultsPage from './pages/FullSearchResultsPage';
import ItemDetailsWrapper from './pages/ItemDetailsWrapper';
import HomePage from './pages/Home';
import FooterBar from './components/Footer';
import CategoryPage from './pages/CategoryCatalog';
import { useTheme } from "@govtechmy/myds-react/hooks";



function App() {
  const { theme, setTheme } = useTheme();
  setTheme(localStorage.getItem("theme") || "light")
  console.log(theme);
  return (
    <div className="mx-auto w-md md:w-xl lg:w-6xl min-h-screen">
      <div className='mx-auto min-h-screen flex flex-col flex-grow'>
        <header>
          <NavBarHeader />
        </header>

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage />
              }
            />

            <Route
              path="/search-results"
              element={<FullSearchResultsPage />}
            />

            <Route
              path="/item/:itemCode"
              element={<ItemDetailsWrapper />}
            />
            <Route
              path="/category"
              element={<CategoryPage />}
            >
              <Route
                path=":group"
                element={<CategoryPage />}
              >
                <Route
                  path=":category"
                  element={<CategoryPage />}
                ></Route>

              </Route>
            </Route>
          </Routes>
        </main>

        <FooterBar />
      </div>
    </div>

  );
}

export default App;