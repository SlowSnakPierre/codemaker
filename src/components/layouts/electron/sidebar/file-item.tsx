import type { FileData, FileTab } from "@/lib/types";
import { renderFileIcon } from "./file-utils";
import React from "react";
import IndentationBars from "./indentation-bars";

interface FileItemProps {
	item: FileData;
	level: number;
	activeTab: FileTab | undefined;
	onFileSelect: (file: FileData) => void;
}

export default function FileItem({
	item,
	level,
	activeTab,
	onFileSelect,
}: FileItemProps) {
	const paddingLeft = level * 16 + 4;

	const isActive = React.useMemo(() => {
		return activeTab?.path === item.path;
	}, [activeTab?.path, item.path]);

	return (
		<div
			key={item.path}
			className={`flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-muted relative file-item ${
				isActive ? "bg-muted" : ""
			}`}
			onClick={() => onFileSelect(item)}
			style={{ paddingLeft: `${paddingLeft}px` }}
		>
			<IndentationBars level={level} activeTab={activeTab} item={item} />
			{renderFileIcon(item.name)}
			<span
				className={`text-sm truncate ${
					isActive ? "font-medium" : ""
				} text-neutral-600 dark:text-neutral-200`}
			>
				{item.name}
			</span>
		</div>
	);
}
