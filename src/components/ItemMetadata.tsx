// src/components/ItemMetadataDisplay.tsx

import React from 'react';
import { ItemMetadata } from '../types'; // Assuming ItemMetadata has name, unit, group, category
import { Tag } from '@govtechmy/myds-react/tag';
import { QuestionCircleIcon } from "@govtechmy/myds-react/icon";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@govtechmy/myds-react/tooltip";

interface ItemMetadataDisplayProps {
	metadata: ItemMetadata | null;
	isLoading: boolean; // Combined loading state for metadata/stats
	error?: string | null; // Any relevant error message
}

// Helper to format price or show placeholder
const formatPrice = (price: number | null): string => {
	if (price === null || typeof price === 'undefined') {
		return 'N/A';
	}
	return `${price.toFixed(2)}`;
};

const ItemMetadataDisplay: React.FC<ItemMetadataDisplayProps> = ({
	metadata,
	isLoading,
	error,
}) => {

	if (isLoading) {
		return (
			<div className="p-4 bg-bg-white shadow rounded-lg animate-pulse mb-6">
				<div className="h-6 bg-bg-black-200 rounded w-3/4 mb-4"></div>
				<div className="space-y-2">
					<div className="h-4 bg-bg-black-200 rounded w-1/2"></div>
					<div className="h-4 bg-bg-black-200 rounded w-1/3"></div>
					<div className="h-4 bg-bg-black-200 rounded w-1/2"></div>
					<div className="h-4 bg-bg-black-200 rounded w-1/4"></div>
					<div className="h-4 bg-bg-black-200 rounded w-1/3"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 bg-bg-danger-50 border border-otl-danger-200 text-txt-danger shadow rounded-lg mb-6">
				<p>Error loading item details: {error}</p>
			</div>
		);
	}

	if (!metadata) {
		return (
			<div className="p-4 bg-bg-warning-50 border border-otl-warning-200 text-warning shadow rounded-lg mb-6">
				<p>Item details not available.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 items-center">
			<h2 className="text-xl font-semibold mb-3 text-txt-black-700 flex">
				{metadata.item}
				<p className='px-2 text-xs'>per {metadata.unit}</p>
			</h2>

			<div className="flex gap-2">
				<Tag size='small' variant='warning' mode='default'>{metadata.item_category}</Tag>
				<Tag size='small' variant='primary' mode='pill'>{metadata.item_group}</Tag>
			</div>

			<div className='flex gap-4'>
				<div className='flex flex-col border border-otl-gray-200 rounded-md max-w-30 max-h-50 shadow-card text-txt-success p-4'>
					<div className="flex justify-between items-center">
						<div className='text-sm'>
							RM
						</div>
						<Tooltip>
							<TooltipTrigger>
								<QuestionCircleIcon className='h-4 w-4' />
							</TooltipTrigger>
							<TooltipContent>Aggregated from prices nationwide</TooltipContent>
						</Tooltip>
					</div>
					<div className='text-3xl font-semibold text-center'>
						{formatPrice(metadata.minimum)}
					</div>
					<div className='text-sm text-center border-t border-otl-gray-300 mt-2 pt-2'>
						Lowest Price
					</div>
				</div>
				<div className='flex flex-col border border-otl-gray-200 rounded-md max-w-30 max-h-50 shadow-card text-txt-black-900 p-4'>
					<div className="flex justify-between items-center">
						<div className='text-sm'>
							RM
						</div>
						<Tooltip>
							<TooltipTrigger>
								<QuestionCircleIcon className='h-4 w-4' />
							</TooltipTrigger>
							<TooltipContent>Aggregated from prices nationwide</TooltipContent>
						</Tooltip>
					</div>
					<div className='text-3xl font-semibold text-center'>
						{formatPrice(metadata.median)}
					</div>
					<div className='text-sm text-center border-t border-otl-gray-300 mt-2 pt-2'>
						Median Price
					</div>
				</div>
			</div>
		</div >
	);
};

export default ItemMetadataDisplay;