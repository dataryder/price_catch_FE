import React from 'react';
import MydsSearchBar from '../components/SearchBar';

const HomePage: React.FC = () => {
	return (
		<div className="flex gap-4 md:gap-6 py-2 px-6 md:py-4 md:px-8 bg-gradient-to-b from-bg-success-700 via-bg-success-300 to-bg-bg-white min-h-[200px] justify-center flex flex-col">
			<h1 className='text-xl md:text-2xl text-center text-txt-white font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]'>PRICES GOIN CRAZY?</h1>
			<MydsSearchBar />
		</div>
	);
};

export default HomePage;