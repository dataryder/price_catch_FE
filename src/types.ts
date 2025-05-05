export interface SearchResultItem {
	item_code: number;
	item: string;
	unit: string;
	item_group: string;
	item_category: string;
	similarity_score: number;
}

export interface PriceHistoryEntry {
	date: string; // Or Date object if you parse it
	premise: string;
	premise_type: string;
	state: string;
	district: string;
	price: number;
}

export interface ItemDetailsInput {
	item_code: string;
	state?: string; // Optional filters
	district?: string; // Optional filters
}

export interface ItemLatestInput {
	item_code: string;
	state?: string; // Optional filters
	district?: string; // Optional filters
}


export interface ItemMetadata {
	item_code: number;
	item: string;
	unit: string;
	item_group: string;
	item_category: string;
	median: number;
	minimum: number;
	maximum: number;
	q75: number;
}

export interface ItemLatest {
	premise: string;
	premise_type: string;
	state: string;
	district: string;
	price: number;
}