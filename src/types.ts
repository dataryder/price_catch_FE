export interface SearchResultInput {
	item_code: number;
	item: string;
	unit: string;
	item_group: string;
	item_category: string;
	item_eng: string;
	item_group_eng: string;
	item_category_eng: string;
	frequency: string;
}

export interface SearchResultItem {
	item_code: number;
	item: string;
	unit: string;
	item_group: string;
	item_category: string;
	similarity_score: number;
	frequency: string;
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
	last_updated: string;
	frequency: string;
}

export interface ItemLatest {
	premise: string;
	premise_type: string;
	state: string;
	district: string;
	price: number;
}

export interface ItemPriceHistory {
	date: string;
	average: number;
	median: number;
	minimum: number;
	maximum: number;
}

export interface CategoryItemData {
	item_code: number;
	item: string;
	unit: string;
	item_group: string;
	item_category: string;
}

export interface CategoryData {
	item_group: string;
	item_category: string
}

export interface RawDataRow {
	date: string;
	cat_price_index: number;
}

export interface ProcessedDataRow {
	date: Date;
	cat_price_index: number;
}

export interface IndexData {
	[itemGroupName: string]: RawDataRow[];
}
export interface IndexChartProps {
	item_group: string;
	period: "month" | "year" | null;
	data: IndexData
}

export interface IndexChartAgg {
	date: Date;
	'BARANGAN BERBUNGKUS': number | null;
	'BARANGAN KERING': number | null;
	'BARANGAN SEGAR': number | null;
	'MINUMAN': number | null;
	'PRODUK KEBERSIHAN': number | null;
	'SUSU DAN BARANGAN BAYI': number | null;
}