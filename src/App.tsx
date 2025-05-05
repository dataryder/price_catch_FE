import { Routes, Route } from 'react-router-dom';

import NavBarHeader from './components/Navbar';
import FullSearchResultsPage from './pages/FullSearchResultsPage';
import ItemDetailsWrapper from './components/ItemDetailsWrapper';
import MydsSearchBar from './components/SearchBar';
import FooterBar from './components/Footer';

function App() {

  return (
    <div className="bg-bg-white container mx-auto w-full min-h-screen">
      <div className='w-sm md:w=md lg:w-5xl mx-auto min-h-screen border border-otl-gray-200 flex flex-col flex-gro'>
        <header className="mb-8 text-center">
          <NavBarHeader />
        </header>

        <div className="p-4">
          <MydsSearchBar />
        </div>


        <main className="flex-grow">
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