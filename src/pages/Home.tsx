import React from 'react';
import MydsSearchBar from '../components/SearchBar';
import HeroPattern from '../components/HeroPattern';

const HomePage: React.FC = () => {
	return (
		<div className='flex flex-col'>
			<div className="relative flex gap-4 md:gap-6 py-2 px-6 md:py-4 md:px-8 bg-gradient-to-b from-bg-success-700 via-bg-success-300 to-bg-bg-white min-h-[200px] md:min-h-[300px] h-200 md:h-300 justify-center flex flex-col">
				<div className='absolute top-0 left-1/2 transform -translate-x-1/2 h-200 md:h-300 w-full h-full overflow-hidden justify-items-center'>
					<HeroPattern className="object-none" />
				</div>
				<div className='container mx-auto 2xl:px-40 grid grid-col gap-4'>
					<h1 className='text-xl md:text-2xl text-center text-txt-white font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]'>PRICES GOIN CRAZY?</h1>
					<MydsSearchBar />
				</div>
			</div>
			{/* <div className='bg-bg-white'></div> */}
		</div>
	);
};

export default HomePage;