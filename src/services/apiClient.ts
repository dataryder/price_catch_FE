import axios from 'axios';
import { SearchResultItem, PriceHistoryEntry, ItemDetailsInput, ItemMetadata, ItemLatest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const searchItems = async (query: string): Promise<SearchResultItem[]> => {
	try {
		const response = await apiClient.get<SearchResultItem[]>('/api/search', {
			params: { query }, // FastAPI expects query params
		});
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Search failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred during search.');
	}
};

export const searchItemsFull = async (query: string): Promise<SearchResultItem[]> => {
	try {
		const response = await apiClient.get<SearchResultItem[]>('/api/search_full', {
			params: { query }, // FastAPI expects query params
		});
		return response.data;
	} catch (error) {
		console.error('API Client: Error searching items:', error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Search failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred during search.');
	}
};

export const getItemPriceHistory = async ({
	item_code,
}: ItemDetailsInput): Promise<PriceHistoryEntry[]> => {
	try {
		const params: Record<string, string> = { item_code };
		const response = await apiClient.get<PriceHistoryEntry[]>('/api/itemdailyfull', { params });
		return response.data;
	} catch (error) {
		console.error('API Client: Error fetching price history:', error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Fetching history failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred while fetching history.');
	}
};

export const getItemMetadata = async ({
	item_code,
}: ItemDetailsInput): Promise<ItemMetadata[]> => {
	try {
		const params: Record<string, string> = { item_code };
		const response = await apiClient.get<ItemMetadata[]>('/api/itemmetadata', { params });
		return response.data;
	} catch (error) {
		console.error('API Client: Error fetching item metadata:', error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Fetching metadata failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred while fetching history.');
	}
};

export const getItemLatest = async ({
	item_code,
}: ItemDetailsInput): Promise<ItemLatest[]> => {
	try {
		const params: Record<string, string> = { item_code };
		const response = await apiClient.get<ItemLatest[]>('/api/itemlatest', { params });
		return response.data;
	} catch (error) {
		console.error('API Client: Error fetching item latest:', error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Fetching metadata failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred while fetching latest.');
	}
};