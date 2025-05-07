import { Routes, Route } from 'react-router-dom';

import NavBarHeader from './components/Navbar';
import FullSearchResultsPage from './pages/FullSearchResultsPage';
import ItemDetailsWrapper from './components/ItemDetailsWrapper';
import MydsSearchBar from './components/SearchBar';
import FooterBar from './components/Footer';

function App() {

  return (
    <div className="container mx-auto w-full min-h-screen">
      <div className='w-md md:w-xl 2xl:w-6xl mx-auto min-h-screen md:border border-otl-gray-200 flex flex-col flex-grow'>
        <header className="text-center">
          <NavBarHeader />
        </header>

        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex gap-4 md:gap-6 py-2 px-6 md:py-4 md:px-8 bg-gradient-to-b from-bg-success-700 via-bg-success-300 to-bg-bg-white min-h-[200px] justify-center flex flex-col">
                  <h1 className='text-xl md:text-2xl text-center text-txt-white font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]'>PRICES GOIN CRAZY?</h1>
                  <MydsSearchBar />
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