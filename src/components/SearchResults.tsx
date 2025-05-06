// src/components/SearchResults.tsx
import React from 'react';
import { SearchResultItem } from '../types';
import { Tag } from '@govtechmy/myds-react/tag';
import { AutoPagination } from "@govtechmy/myds-react/pagination";

import { ChevronRightIcon } from '@govtechmy/myds-react/icon';

interface SearchResultsProps {
	results: SearchResultItem[];
	onSelectItem: (item: SearchResultItem) => void;
	isLoading: boolean;
	error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelectItem, isLoading, error }) => {
	if (isLoading) {
		return <div className="text-center p-4">Loading search results...</div>;
	}

	if (error) {
		return <div className="text-center p-4 text-txt-danger">Error searching: {error}</div>;
	}

	if (results.length === 0) {
		return <div className="text-center p-4 text-txt-black-500">No items found. Try a different search term.</div>;
	}

	return (
		<div className="bg-bg-white rounded-lg overflow-hidden z-0">
			<ul className="">
				{results.map((item) => (
					<li
						key={item.item}
						onClick={() => onSelectItem(item)}
						className="p-4 hover:bg-bg-white-hover hover:fr-primary cursor-pointer transition duration-150 ease-in-out flex justify-between items-center border border-otl-gray-200 my-2 rounded-md shadow text-xs md:text-sm"
					>
						<div className='flex justify-between items-center w-full'>
							<div className='flex flex-col gap-1'>
								<p className="font-semibold text-txt-primary">{item.item}</p>
								<div className='flex gap-4'>
									<Tag size='small' variant='warning' mode='default' className='max-sm:hidden'>{item.item_category}</Tag>
									<Tag size='small' variant='primary' mode='pill'>{item.item_group}</Tag>
								</div>
							</div>
							<ChevronRightIcon className='text-txt-black-500' />
						</div>
					</li>
				))}
			</ul>
		</div>
	);
};

export default SearchResults;