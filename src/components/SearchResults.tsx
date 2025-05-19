import React from 'react';
import { SearchResultInput } from '../types';
import { Tag } from '@govtechmy/myds-react/tag';

import { ChevronRightIcon } from '@govtechmy/myds-react/icon';

interface SearchResultsProps {
	results: SearchResultInput[];
	onSelectItem: (item: SearchResultInput) => void;
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
		<div className="bg-bg-white rounded-lg overflow-hidden">
			<ul className="">
				{results.map((item) => (
					<li
						key={item.item_code}
						onClick={() => onSelectItem(item)}
						className="p-4 hover:bg-bg-white-hover hover:fr-primary cursor-pointer transition duration-150 ease-in-out flex justify-between items-center border border-otl-gray-200 my-2 rounded-md shadow"
					>
						<div className='flex justify-between items-center w-full'>
							<div className='flex flex-col grow gap-1 overflow-auto mr-3'>
								<p className="font-semibold text-txt-primary text-xs md:text-sm">{item.item}
									<sup className="px-1 text-[10px] inline">
										per {item.unit}
									</sup>
								</p>
								<div className='flex gap-2'>
									<Tag size='small' variant='warning' mode='pill' className='max-sm:hidden'>{item.item_group}</Tag>
									<Tag size='small' variant='primary' mode='pill'>{item.item_category}</Tag>
									<Tag size='small' variant={(item.frequency === "daily") ? "success" : (item.frequency === "weekly") ? "warning" : "danger"} mode='default'>{item.frequency}</Tag>

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