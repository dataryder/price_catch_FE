import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { DataTable } from "@govtechmy/myds-react/data-table";
import {
	Select,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from "@govtechmy/myds-react/select";
import { Tag } from "@govtechmy/myds-react/tag";
import {
	Button,
	ButtonIcon,
} from "@govtechmy/myds-react/button";
import {
	ArrowBackIcon,
} from "@govtechmy/myds-react/icon";
import { ColumnDef } from "@tanstack/react-table";

import { SearchResultItem, ItemMetadata, ItemLatest, ItemPriceHistory } from '../types';
import { getItemMetadata, getItemLatest, getItemPriceHistory } from '../services/apiClient';
import ItemMetadataDisplay from './ItemMetadata';
import PriceHistoryChart from './PriceHistoryChart';

interface ItemDetailsWrapperProps {
	searchResults: SearchResultItem[];
}

const DEFAULT_STATE = "Selangor";
const ALL_DISTRICTS_VALUE = "__ALL_DISTRICTS__";

const getFilterOptionsFromLatest = (data: ItemLatest[]) => {
	const states = new Set<string>();
	const districtsByState: Record<string, Set<string>> = {};
	data.forEach(entry => {
		states.add(entry.state);
		if (!districtsByState[entry.state]) { districtsByState[entry.state] = new Set<string>(); }
		districtsByState[entry.state].add(entry.district);
	});
	const sortedStates = Array.from(states).sort();
	const sortedDistrictsByState: Record<string, string[]> = {};
	for (const state in districtsByState) {
		sortedDistrictsByState[state] = Array.from(districtsByState[state]).sort();
	}
	return { states: sortedStates, districtsByState: sortedDistrictsByState };
};


const ItemDetailsWrapper: React.FC<ItemDetailsWrapperProps> = () => {
	const { itemCode } = useParams<{ itemCode: string }>();
	const navigate = useNavigate();
	const location = useLocation();
	const [itemDetails, setItemDetails] = useState<ItemMetadata | null>(null);
	const [allPriceLatest, setAllPriceLatest] = useState<ItemLatest[]>([]);
	const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
	const [isLoadingAndFilters, setIsLoadingAndFilters] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [availableFilters, setAvailableFilters] = useState<{ states: string[]; districtsByState: Record<string, string[]>; }>({ states: [], districtsByState: {} });
	const initialFilters = useMemo(() => {
		const params = new URLSearchParams(location.search);
		return { state: params.get('state') || '', district: params.get('district') || '' };
	}, [location.search]);
	const [selectedState, setSelectedState] = useState<string>(initialFilters.state);
	const [selectedDistrict, setSelectedDistrict] = useState<string>(initialFilters.district);
	const [priceHistory, setPriceHistory] = useState<ItemPriceHistory[]>([]);

	const updateUrlFilters = useCallback((newState: string, newDistrict: string) => {
		const params = new URLSearchParams();
		if (newState) params.set('state', newState);
		if (newState && newDistrict) params.set('district', newDistrict);
		navigate({ search: params.toString() }, { replace: true, state: location.state });
	}, [navigate, location.state]);

	useEffect(() => {
		if (!itemCode) return;
		setIsLoadingMetadata(true); setItemDetails(null); setError(null);
		const fetchMetadata = async () => {
			try {
				const metadataResult = await getItemMetadata({ item_code: itemCode });
				if (metadataResult && metadataResult.length > 0) { setItemDetails(metadataResult[0]); }
				else { throw new Error(`Metadata not found for item code ${itemCode}`); }
			} catch (err) {
				console.error("Failed to fetch item metadata:", err);
				setError(err instanceof Error ? `Metadata error: ${err.message}` : `Could not load details for ${itemCode}`);
			} finally { setIsLoadingMetadata(false); }
		};
		fetchMetadata();
	}, [itemCode]);

	useEffect(() => {
		if (!itemCode) return;
		const fetchHistory = async () => {
			try {
				const priceHistory = await getItemPriceHistory({ item_code: itemCode });
				if (priceHistory && priceHistory.length > 0) { setPriceHistory(priceHistory); }
				else { throw new Error(`History not found for item code ${itemCode}`); }
			} catch (err) {
				console.error("Failed to fetch history:", err);
				setError(err instanceof Error ? `History error: ${err.message}` : `Could not load history for ${itemCode}`);
			} finally { setIsLoadingMetadata(false); }
		};
		fetchHistory();
	}, [itemCode]);


	useEffect(() => {
		if (!itemCode || isLoadingMetadata || !itemDetails) return;
		setIsLoadingAndFilters(true); setError(null);
		const fetchAllData = async () => {
			try {
				const data = await getItemLatest({ item_code: itemCode });
				setAllPriceLatest(data);
				const filterOptions = getFilterOptionsFromLatest(data);
				setAvailableFilters(filterOptions);
			} catch (err) {
				console.error("Failed to fetch latest price:", err);
				setError(err instanceof Error ? `Data fetch error: ${err.message}` : 'Could not load latest item');
				setAllPriceLatest([]); setAvailableFilters({ states: [], districtsByState: {} });
			} finally { setIsLoadingAndFilters(false); }
		};
		fetchAllData();
	}, [itemCode, isLoadingMetadata, itemDetails]);

	useEffect(() => {
		if (!isLoadingAndFilters && !initialFilters.state && availableFilters.states.length > 0) {
			if (availableFilters.states.includes(DEFAULT_STATE)) {
				setSelectedState(DEFAULT_STATE); setSelectedDistrict('');
				updateUrlFilters(DEFAULT_STATE, '');
			} else if (availableFilters.states.length > 0) {
				setSelectedState(availableFilters.states[0]); setSelectedDistrict('');
				updateUrlFilters(availableFilters.states[0], '');
			}
		} else if (!isLoadingAndFilters && initialFilters.state && initialFilters.district) {
			setSelectedDistrict(initialFilters.district);
		} else if (!isLoadingAndFilters && initialFilters.state && !initialFilters.district) {
			setSelectedDistrict('');
		}
	}, [isLoadingAndFilters, initialFilters.state, initialFilters.district, availableFilters.states, itemCode, updateUrlFilters]);

	const filteredPriceLatest = useMemo(() => {
		if (isLoadingAndFilters || !allPriceLatest) return [];
		return allPriceLatest.filter(entry => {
			const stateMatch = !selectedState || entry.state === selectedState;
			const districtMatch = !selectedState || !selectedDistrict || entry.district === selectedDistrict;
			return stateMatch && districtMatch;
		});
	}, [allPriceLatest, selectedState, selectedDistrict, isLoadingAndFilters]);

	const sortedAndFilteredPriceLatest = useMemo(() => {
		return [...filteredPriceLatest].sort((a, b) => {
			if (a.state < b.state) return -1; if (a.state > b.state) return 1;
			if (a.district < b.district) return -1; if (a.district > b.district) return 1;
			return 0;
		});
	}, [filteredPriceLatest]);

	const minPrice = useMemo(() => {
		if (!sortedAndFilteredPriceLatest || sortedAndFilteredPriceLatest.length === 0) {
			return null;
		}
		return Math.min(...sortedAndFilteredPriceLatest.map(item => item.price));
	}, [sortedAndFilteredPriceLatest]);

	const handleStateChange = (value: string) => {
		if (!value) return;
		setSelectedState(value);
		setSelectedDistrict('');
		updateUrlFilters(value, '');
	};
	const handleDistrictChange = (value: string) => {
		const newDistrictState = value === ALL_DISTRICTS_VALUE ? "" : value;
		setSelectedDistrict(newDistrictState);
		updateUrlFilters(selectedState, newDistrictState);
	};
	const handleBack = () => navigate('/');

	const districtsForSelectedState = useMemo(() => {
		if (isLoadingAndFilters || !selectedState) return [];
		return availableFilters.districtsByState[selectedState] || [];
	}, [selectedState, availableFilters, isLoadingAndFilters]);

	const columns = useMemo<ColumnDef<ItemLatest>[]>(() => [
		{
			accessorKey: 'district', header: 'District', id: 'district',
			meta: { sortable: true },
		},
		{
			accessorKey: 'premise', header: 'Premise', id: 'premise',
			meta: { sortable: true, expandable: true },
		},
		{
			accessorKey: 'premise_type', header: 'Premise Type', id: 'premise_type', cell: info => {
				return (<Tag variant="default" size="small" mode="pill">{info.getValue<string>()}</Tag>);
			},
			meta: { sortable: true },
		},
		{
			accessorKey: 'price', header: 'Price', id: 'price',
			cell: info => {
				const price = info.getValue<number>();
				const isCheapest = price === minPrice;

				return (
					<span className={isCheapest ? 'font-bold text-txt-success' : ''}>
						RM {price.toFixed(2)}
						{isCheapest && (
							<Tag variant="success" size="small" className="ml-2">
								Lowest Price
							</Tag>
						)}
					</span>
				);
			},
			meta: { sortable: true },
		},
	], [minPrice]); // *** Add minPrice as a dependency for the price column ***

	const isPageLoading = isLoadingMetadata || isLoadingAndFilters;

	if (isPageLoading && !itemDetails) { return <div className="text-center p-6">Loading item data...</div>; }
	if (error) {
		return (<div className="p-6 bg-white shadow-md rounded-lg"> <button onClick={handleBack} className="mb-4 text-blue-600 hover:text-blue-800 hover:underline"> ← Back to Search </button> <p className="text-red-600">{error}</p> </div>);
	}
	if (!itemDetails) {
		return (<div className="p-6 bg-white shadow-md rounded-lg"> <button onClick={handleBack} className="mb-4 text-blue-600 hover:text-blue-800 hover:underline"> ← Back to Search </button> <p className="text-orange-600">Item details could not be determined.</p> </div>);
	}

	return (
		<div className="px-4 md:px-6 bg-bg-white">
			<Button variant="primary-ghost" onClick={handleBack} className="mb-4 text-txt-primary hover:text-blue-800 hover:underline">
				<ButtonIcon>
					<ArrowBackIcon />
				</ButtonIcon>
				<span>Go back</span>
			</Button >

			<ItemMetadataDisplay metadata={itemDetails} isLoading={isLoadingMetadata} error={error} />


			<div className='flex flex-col gap-4 border border-otl-gray-200 p-4 rounded-md shadow-card mt-4'>
				<h3 className="text-xl text-txt-black-900 font-semibold mb-1 text-center">Latest Prices in {selectedState}{selectedDistrict ? ` - ${selectedDistrict}` : ''}</h3>
				<div className="flex flex-col md:flex-row gap-4 items-center">
					<Select
						variant="outline" size="small"
						value={selectedState}
						onValueChange={handleStateChange}
						disabled={isLoadingAndFilters || availableFilters.states.length === 0}
					>
						<SelectTrigger id="state-select-trigger">
							<SelectValue label="State:" placeholder="Select State" />
						</SelectTrigger>
						<SelectContent>
							{availableFilters.states.map(state => (<SelectItem key={state} value={state}>{state}</SelectItem>))}
						</SelectContent>
					</Select>
					<Select
						variant="outline" size="small"
						value={selectedDistrict === "" ? ALL_DISTRICTS_VALUE : selectedDistrict}
						onValueChange={handleDistrictChange}
						disabled={!selectedState || isLoadingAndFilters || districtsForSelectedState.length === 0}
					>
						<SelectTrigger id="district-select-trigger">
							<SelectValue label="District:" placeholder="All Districts" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={ALL_DISTRICTS_VALUE}>All Districts</SelectItem>
							{districtsForSelectedState.map(district => (<SelectItem key={district} value={district}>{district}</SelectItem>))}
						</SelectContent>
					</Select>
				</div>

				{(isLoadingAndFilters) && (<DataTable data={[]} columns={columns} loading className='' />)}
				{!isLoadingAndFilters && sortedAndFilteredPriceLatest.length === 0 && (
					<div className="text-center p-4 text-gray-500 border rounded-md">No latest price found for the selected criteria.</div>
				)}
				{!isLoadingAndFilters && sortedAndFilteredPriceLatest.length > 0 && (
					<div>
						<div className="overflow-x-auto overflow-y-auto max-h-[500px]">
							<DataTable data={sortedAndFilteredPriceLatest} columns={columns} className='p-2 rounded-md text-xs md:text-md' />
						</div>

						<div>
							<PriceHistoryChart data={priceHistory} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ItemDetailsWrapper;