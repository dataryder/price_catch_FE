import { Routes, Route } from 'react-router-dom';

import NavBarHeader from './components/Navbar';
import FullSearchResultsPage from './pages/FullSearchResultsPage';
import ItemDetailsWrapper from './components/ItemDetailsWrapper';
import MydsSearchBar from './components/SearchBar';
import FooterBar from './components/Footer';

function App() {

  return (
    <div className="container mx-auto w-full min-h-screen">
      <div className='w-md md:w-xl 2xl:w-6xl mx-auto min-h-screen border border-otl-gray-200 flex flex-col flex-grow'>
        <header className="mb-4 md:mb-8 text-center">
          <NavBarHeader />
        </header>

        <div className="py-2 px-6 md:py-4 md:px-8">
          <MydsSearchBar />
        </div>


        <main className="flex-grow px-2 md:px-4">
          <Routes>
            <Route
              path="/"
              element={
                <div className="text-center text-gray-600 mt-8">
                  Use the search bar above to find grocery items.
                </div>
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
          </Routes>
        </main>

        <FooterBar />
      </div>
    </div>
  );
}

export default App;