import { Routes, Route } from 'react-router-dom';

import NavBarHeader from './components/Navbar';
import FullSearchResultsPage from './pages/FullSearchResultsPage';
import ItemDetailsWrapper from './pages/ItemDetailsWrapper';
import HomePage from './pages/Home';
import FooterBar from './components/Footer';
import CategoryPage from './pages/CategoryCatalog';

function App() {

  return (
    <div className="container mx-auto w-full min-h-screen">
      <div className='w-md md:w-xl 2xl:w-6xl mx-auto min-h-screen md:border border-otl-gray-200 flex flex-col flex-grow'>
        <header >
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
              element={<ItemDetailsWrapper searchResults={[]} />}
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