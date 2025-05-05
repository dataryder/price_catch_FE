// src/pages/FullSearchResultsPage.tsx (New File)

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchResults from '../components/SearchResults';
import { searchItems } from '../services/apiClient';
import { SearchResultItem } from '../types';

const FullSearchResultsPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const query = useMemo(() => searchParams.get('q') || '', [searchParams]);

	const [results, setResults] = useState<SearchResultItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!query) {
			setResults([]);
			setIsLoading(false);
			setError(null);
			return;
		}

		const fetchFullResults = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const data = await searchItems(query);
				setResults(data);
			} catch (err) {
				console.error("Full search failed:", err);
				setError(err instanceof Error ? err.message : 'Failed to load search results');
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFullResults();
	}, [query]);

	const handleSelectItem = (item: SearchResultItem) => {
		navigate(`/item/${item.item_code}`);
	};

	return (
		<div className='p-4'>
			<h2 className="text-2xl mb-4 text-txt-black-900">
				Search Results for: <span className="font-bold italic">{query}</span>
			</h2>

			<SearchResults
				results={results}
				onSelectItem={handleSelectItem}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
};

export default FullSearchResultsPage;