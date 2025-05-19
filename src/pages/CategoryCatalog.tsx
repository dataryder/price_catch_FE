import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import categoriesData from "../data/category.json";
import itemsData from "../data/items.json";
import { CategoryData } from '../types';
import { Button } from '@govtechmy/myds-react/button';
import { ChevronRightIcon } from '@govtechmy/myds-react/icon';
import { Tag } from '@govtechmy/myds-react/tag';

const groups = ['MINUMAN',
	'BARANGAN KERING',
	'BARANGAN SEGAR',
	'BARANGAN BERBUNGKUS',
	'SUSU DAN BARANGAN BAYI',
	'PRODUK KEBERSIHAN']
const typedCategoriesData: Array<CategoryData> = categoriesData;

const CategoryPage: React.FC = () => {
	const { group, category } = useParams();
	const navigate = useNavigate();

	return (
		<div className='grid container mx-auto 2xl:px-40'>
			<div className='grid gap-4 border-b border-otl-gray-200 p-4 max-sm:p-2'>
				<h2 className='font-semibold text-lg text-center text-txt-black-900'>Groups</h2>
				<div className='flex flex-wrap gap-4 max-sm:gap-2 justify-center'>

					{
						groups.map((category_item) => (
							(category_item === group || !group) ? (
								< Button key={category_item} variant="primary-fill" size="small" className="capitalize bg-bg-warning-500 border-none hover:bg-bg-warning-600 focus:ring-otl-warning-disabled" onClick={() => navigate(`/category/${category_item}`)} >
									{category_item.toLowerCase()}
								</Button>
							)
								:
								(
									< Button key={category_item} variant="primary-ghost" size="small" className="capitalize text-txt-warning-disabled hover:bg-bg-warning-500 hover:text-txt-white focus:ring-otl-warning-disabled" onClick={() => navigate(`/category/${category_item}`)}>
										{category_item.toLowerCase()}
									</Button>
								)

						)
						)

					}
				</div >
			</div>
			{
				(group) ?
					<div className='grid gap-4 border-b border-otl-gray-200 p-4'>
						<h2 className='font-semibold text-lg text-center text-txt-black-900'>Categories</h2>
						<div className='flex flex-wrap gap-4 max-sm:gap-2 justify-center'>
							{
								typedCategoriesData.map((category_item) => (
									category_item.item_group === group && (
										(category_item.item_category === category || !category) ? (
											<Button key={category_item.item_category} variant="primary-fill" size="small" className="capitalize" onClick={() => navigate(`/category/${group}/${category_item.item_category}`)}>
												{category_item.item_category.toLowerCase()}
											</Button>
										) :
											(
												<Button key={category_item.item_category} variant="primary-ghost" size="small" className="capitalize text-txt-primary-disabled" onClick={() => navigate(`/category/${group}/${category_item.item_category}`)}>
													{category_item.item_category.toLowerCase()}
												</Button>
											)
									)
								)
								)
							}
						</div>
					</div>
					: null
			}
			{
				(group && category) ?
					<div className='p-6 md:p-8'>
						<ul className='grid grid-cols-1 md:grid-cols-2 gap-x-4'>
							{
								itemsData.map((item) => (
									item.item_group === group && item.item_category === category.replace(" | ", "\/") && (
										<li key={item.item_code} tabIndex={0} className="p-4 hover:bg-bg-white-hover hover:ring-otl-success-300/40 cursor-pointer transition duration-150 ease-in-out flex justify-between items-center border border-otl-gray-200 my-2 rounded-md shadow focus:ring focus:ring-otl-success-300/40 focus:outline-none"
											onClick={() => navigate(`/item/${item.item_code}`)}>
											<div className='flex justify-between items-center w-full'>
												<div className='flex flex-col gap-1'>
													<h4 className="font-semibold text-txt-black-900 text-xs md:text-sm">{item.item}
														<sup className="px-1 text-[10px] inline-block">
															per {item.unit}
														</sup>
													</h4>

													<div className='flex gap-2'>
														<Tag size='small' variant='warning' mode='pill' className='max-sm:hidden'>{item.item_group}</Tag>
														<Tag size='small' variant='primary' mode='pill'>{item.item_category}</Tag>
													</div>
												</div>
												<ChevronRightIcon className='text-txt-black-500' />
											</div>
										</li>
									)
								)
								)
							}
						</ul>
					</div> : null
			}
		</div >

	);
};

export default CategoryPage;