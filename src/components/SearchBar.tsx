import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';
import {
	SearchBar,
	SearchBarInput,
	SearchBarInputContainer,
	SearchBarSearchButton,
	SearchBarClearButton,
	SearchBarResults,
	SearchBarResultsList,
	SearchBarResultsItem,
} from "@govtechmy/myds-react/search-bar";
import { ChevronRightIcon } from "@govtechmy/myds-react/icon";
import { Tag } from '@govtechmy/myds-react/tag';
import { Button } from '@govtechmy/myds-react/button';
import { SearchResultInput } from '../types';
import itemsDataFromFile from '../data/items.json';

const allSearchableItems: SearchResultInput[] = itemsDataFromFile as SearchResultInput[];

const fuseOptions: object = {
	keys: [
		{ name: 'item', weight: 0.4 },
		{ name: 'item_group', weight: 0.05 },
		{ name: 'item_category', weight: 0.05 },
		{ name: 'item_eng', weight: 0.4 },
		{ name: 'item_group_eng', weight: 0.05 },
		{ name: 'item_category_eng', weight: 0.05 },
	],
	threshold: 0.2,
	ignoreLocation: true
};

const MydsSearchBar: React.FC = () => {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [hasFocus, setHasFocus] = useState(false);
	const [liveResults, setLiveResults] = useState<SearchResultInput[]>([]);

	const [fuseInstance, _setFuseInstance] = useState<Fuse<SearchResultInput> | null>(() => {
		if (allSearchableItems && allSearchableItems.length > 0) {
			return new Fuse(allSearchableItems, fuseOptions);
		}
		console.warn("Search items data is empty or not available.");
		return null;
	});

	const hasQuery = query.trim().length > 0;
	const showResultsDropdown = hasQuery && hasFocus && !!fuseInstance;

	const debouncedSearch = useRef(
		debounce((searchTerm: string, currentFuse: Fuse<SearchResultInput> | null) => {
			if (!currentFuse || searchTerm.trim().length === 0) {
				setLiveResults([]);
				return;
			}
			const results = currentFuse.search(searchTerm.trim());
			setLiveResults(results.map(result => result.item).slice(0, 10));
		}, 300)
	).current;

	const handleQueryChange = (newQuery: string) => {
		setQuery(newQuery);

		if (newQuery.trim().length > 0 && fuseInstance) {
			debouncedSearch(newQuery, fuseInstance);
		} else {
			setLiveResults([]);
			if (typeof debouncedSearch.cancel === 'function') {
				debouncedSearch.cancel();
			}
		}
	};

	const navigateToFullResults = useCallback(() => {
		if (query.trim()) {
			setHasFocus(false);
			navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
		}
	}, [query, navigate]);

	const handleResultItemClick = useCallback((item: SearchResultInput) => {
		if (!item || typeof item.item_code === 'undefined') {
			return;
		}
		const targetPath = `/item/${item.item_code}`;
		setHasFocus(false);
		setQuery('');
		setLiveResults([]);

		try {
			navigate(targetPath);
		} catch (e) {
			console.error("[DEBUG] Error during navigate call:", e);
		}
	}, [navigate, debouncedSearch]);

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		navigateToFullResults();
	};

	const handleClear = () => {
		setQuery('');
		setLiveResults([]);
		if (typeof debouncedSearch.cancel === 'function') {
			debouncedSearch.cancel();
		}
	};

	const handleFocus = () => {
		setHasFocus(true);
	};

	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
		const blurredToChild = e.currentTarget.contains(e.relatedTarget as Node);
		if (blurredToChild) {
			return;
		}
		setHasFocus(false);
	};

	let resultsContent;
	if (!fuseInstance) {
		resultsContent = <p className="text-txt-black-500 text-center p-4">Search is currently unavailable.</p>;
	} else if (hasQuery && liveResults.length === 0) {
		resultsContent = <p className="text-txt-black-900 text-center p-4">No results found for "{query}"</p>;
	} else if (liveResults.length > 0) {
		resultsContent = (
			<>
				<SearchBarResultsList className="max-h-[300px] overflow-y-auto px-1 scrollbar dark:darkscrollbar">
					{liveResults.map((item) => (
						<SearchBarResultsItem
							key={`${item.item_code}-${item.item}`}
							value={item.item_code.toString()}
							onSelect={() => handleResultItemClick(item)}
							role="button"
							tabIndex={0}
							className="cursor-pointer flex gap-3 items-center focus:ring focus:ring-otl-success-300/40 focus:outline-none my-1"
						>
							<p className="line-clamp-1 flex-1 text-sm">
								{item.item}
							</p>
							<Tag size='small' variant='warning' mode='pill' className='max-sm:hidden'>{item.item_group}</Tag>
							<Tag size='small' variant='primary' mode='pill' className='max-sm:hidden'>{item.item_category}</Tag>
							<Tag size='small' variant={(item.frequency === "daily") ? "success" : (item.frequency === "weekly") ? "warning" : "danger"} mode='default' className='max-sm:hidden'>{item.frequency}</Tag>
							<ChevronRightIcon className="text-gray-400" />
						</SearchBarResultsItem>
					))}
				</SearchBarResultsList>
				<Button variant="default-ghost" onClick={navigateToFullResults} asChild>
					<div
						className="p-3 text-center cursor-pointer w-full focus:ring-otl-success-300/40"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => e.key === 'Enter' && navigateToFullResults()}
					>
						See all results for "{query}"
					</div>
				</Button>
			</>
		);
	}

	return (
		<form onSubmit={handleFormSubmit} className="relative z-10">
			<SearchBar
				size="large"
				onBlur={handleBlur}
			>
				<SearchBarInputContainer className='has-[input:focus]:ring-otl-success-200/40 has-[input:focus]:border-otl-success-300'>
					<SearchBarInput
						placeholder="Search (e.g., Ayam, Roti)"
						value={query}
						onValueChange={handleQueryChange}
						onFocus={handleFocus}
						disabled={!fuseInstance}
					/>
					{query && <SearchBarClearButton onClick={handleClear} />}
					<SearchBarSearchButton type="submit" disabled={!fuseInstance} className='"border-bg-success-600 from-bg-success-400 to-bg-success-600 rounded-full border-otl-success-300 bg-gradient-to-b p-1' />
				</SearchBarInputContainer>

				<SearchBarResults open={showResultsDropdown}>
					{resultsContent}
				</SearchBarResults>
			</SearchBar>
		</form>
	);
};

export default MydsSearchBar;