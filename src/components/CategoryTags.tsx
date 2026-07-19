import React from "react";
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
  return (
    <div className="flex gap-2 flex-wrap">
      <Tag
        size={size}
        variant="warning"
        mode="pill"
        onClick={() => window.location.assign(`/category/${group}`)}
        className={
          frequency ? "max-sm:hidden cursor-pointer" : "cursor-pointer"
        }
        tabIndex={0}
      >
        {group}
      </Tag>
      <Tag
        size={size}
        variant="primary"
        mode="pill"
        onClick={() => window.location.assign(`/category/${group}/${category.replace(/\//g, "--")}`)}
        className="cursor-pointer"
      >
        {category}
      </Tag>

      {frequency && (
        <Tag
          size="small"
          variant={
            frequency === "daily"
              ? "success"
              : frequency === "weekly"
                ? "warning"
                : frequency === "discontinued"
                  ? "default"
                  : "danger"
          }
          mode="default"
        >
          {frequency}
        </Tag>
      )}
    </div>
  );
};

export default CategoryTag;
