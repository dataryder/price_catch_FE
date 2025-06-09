import axios from 'axios';
import { ItemDetailsInput, ItemMetadata, ItemLatest, ItemPriceHistory } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';
const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
});

export const getItemMetadata = async ({
	item_code,
}: ItemDetailsInput): Promise<ItemMetadata[]> => {
	try {
		const response = await fetch(`/api/metadata/${item_code}`);
		const postResp = await response.json();
		return postResp;
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
		// const params: Record<string, string> = { item_code };
		const response = await fetch(`/api/price/${item_code}`);
		const postResp = await response.json();
		return postResp;
	} catch (error) {
		console.error('API Client: Error fetching item latest:', error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Fetching metadata failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred while fetching latest.');
	}
};

export const getItemPriceHistory = async ({
	item_code,
}: ItemDetailsInput): Promise<ItemPriceHistory[]> => {
	try {
		const params: Record<string, string> = { item_code };
		const response = await apiClient.get<ItemPriceHistory[]>('/api/itempricehistorymonth', { params });
		return response.data;
	} catch (error) {
		console.error('API Client: Error fetching history:', error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(`Fetching history failed: ${error.response.data.detail || error.message}`);
		}
		throw new Error('An unknown error occurred while fetching history.');
	}
};