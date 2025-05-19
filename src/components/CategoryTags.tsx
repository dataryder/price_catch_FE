import React from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "@govtechmy/myds-react/tag";

interface TagProps {
	size: "small" | "medium" | "large";
	group: string;
	category: string;
	frequency?: string;
}


const CategoryTag: React.FC<TagProps> = ({
	size,
	group,
	category,
	frequency,
}) => {
	const navigate = useNavigate();
	return (
		<div className="flex gap-2">
			<Tag size={size} variant="warning" mode="pill" onClick={() => navigate(`/category/${group}`)} className={(frequency) ? 'max-sm:hidden cursor-pointer' : "cursor-pointer"} tabIndex={0}>
				{group}
			</Tag>
			<Tag size={size} variant="primary" mode="pill" onClick={() => navigate(`/category/${group}/${category.replace("\/", " | ")}`)} className="cursor-pointer">
				{category}
			</Tag>
			{
				(frequency) &&
				< Tag size='small' variant={(frequency === "daily") ? "success" : (frequency === "weekly") ? "warning" : "danger"} mode='default'>{frequency}</Tag>
			}
		</div >
	);
};

export default CategoryTag;