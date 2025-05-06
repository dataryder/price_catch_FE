import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
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

import { searchItems } from '../services/apiClient';
import { SearchResultItem } from '../types';
import { Tag } from '@govtechmy/myds-react/tag';
import { Button } from '@govtechmy/myds-react/button';

const MydsSearchBar: React.FC = () => {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [hasFocus, setHasFocus] = useState(false);
	const [liveResults, setLiveResults] = useState<SearchResultItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const hasQuery = query.trim().length > 0;
	const showResultsDropdown = hasQuery && hasFocus;

	const debouncedSearchRef = useRef(
		debounce(async (searchTerm: string) => {
			if (searchTerm.trim().length < 1) {
				setLiveResults([]);
				setIsLoading(false);
				setError(null);
				return;
			}
			setIsLoading(true);
			setError(null);
			try {
				const results = await searchItems(searchTerm);
				setLiveResults(results.slice(0, 10));
			} catch (err) {
				console.error("Live search failed:", err);
				setError(err instanceof Error ? err.message : 'Search failed');
				setLiveResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 300)
	);


	useEffect(() => {
		if (hasQuery) {
			debouncedSearchRef.current(query);
		} else {
			setLiveResults([]);
			setIsLoading(false);
			setError(null);
			debouncedSearchRef.current.cancel();
		}
		return () => {
			debouncedSearchRef.current.cancel();
		};
	}, [query, hasQuery]);

	const navigateToFullResults = useCallback(() => {
		if (query.trim()) {
			setHasFocus(false);
			navigate(`/search-results?q=${encodeURIComponent(query.trim())}`);
		}
	}, [query, navigate]);

	const handleResultItemClick = useCallback((item: SearchResultItem) => {
		if (!item || typeof item.item_code === 'undefined') {
			return;
		}
		const targetPath = `/item/${item.item_code}`;
		setHasFocus(false);
		setQuery('');

		try {
			navigate(targetPath);
		} catch (e) {
			console.error("[DEBUG] Error during navigate call:", e);
		}
	}, [navigate]);

	const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		navigateToFullResults();
	};

	const handleClear = () => {
		setQuery('');
	};

	const handleFocus = () => {
		setHasFocus(true);
	}

	const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {

		const blurredToChild = e.currentTarget.contains(e.relatedTarget);
		if (blurredToChild) {
			return;
		}

		setHasFocus(false);
	}


	return (
		<form onSubmit={handleFormSubmit} className="relative z-10">
			<SearchBar
				size="large"
				onBlur={handleBlur}
			>
				<SearchBarInputContainer>
					<SearchBarInput
						placeholder="Search (e.g., Ayam, Roti)"
						value={query}
						onValueChange={setQuery}
						onFocus={handleFocus}
					/>
					{query && <SearchBarClearButton onClick={handleClear} />}
					<SearchBarSearchButton type="submit" />
				</SearchBarInputContainer>

				<SearchBarResults open={showResultsDropdown}>
					{isLoading && (
						<p className="text-txt-black-500 text-center p-4">Loading...</p>
					)}
					{error && !isLoading && (
						<p className="text-danger-500 text-center p-4">Error: {error}</p>
					)}
					{!isLoading && !error && hasQuery && !liveResults.length && (
						<p className="text-txt-black-900 text-center p-4">No results found</p>
					)}
					{!isLoading && !error && liveResults.length > 0 && (
						<>
							<SearchBarResultsList className="max-h-[300px] overflow-y-auto">
								{liveResults.map((item) => (
									<SearchBarResultsItem
										key={item.item}
										value={item.item_code.toString()}
										// *** Attach the click handler ***
										onSelect={() => {
											handleResultItemClick(item);
										}}
										role="button"
										tabIndex={0}
										className="cursor-pointer flex gap-3 items-center"
									>
										<p className="line-clamp-1 flex-1 text-sm">
											{item.item}
										</p>
										<Tag size='small' variant='warning' mode='default' className='max-sm:hidden'>{item.item_category}</Tag>
										<Tag size='small' variant='primary' mode='pill' className='max-sm:hidden'>{item.item_group}</Tag>
										<ChevronRightIcon className="text-gray-400" />
									</SearchBarResultsItem>
								))}
							</SearchBarResultsList>
							<Button variant="default-ghost" onClick={navigateToFullResults} asChild>
								<div
									className="p-3 text-center cursor-pointer w-full"
								>
									See all results for "{query}"
								</div>
							</Button>
						</>
					)}
				</SearchBarResults>
			</SearchBar>
		</form>
	);
};

export default MydsSearchBar;