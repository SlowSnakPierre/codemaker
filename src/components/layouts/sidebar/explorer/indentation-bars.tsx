import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { FileData, FileTab } from "@/core/types";

interface IndentationBarsProps {
	level: number;
	activeTab: FileTab | undefined;
	item: FileData;
}

const IndentationBars: React.FC<IndentationBarsProps> = ({
	level,
	activeTab,
	item,
}) => {
	const [isActive, setIsActive] = useState<boolean>(false);
	useEffect(() => {
		const itemDirectory = item?.path?.split(/[/\\]/).slice(0, -1).join("/");
		const activeTabDirectory = activeTab?.path
			?.split(/[/\\]/)
			.slice(0, -1)
			.join("/");

		setIsActive(itemDirectory === activeTabDirectory);
	}, [activeTab, item.path]);

	if (level <= 0) return null;

	const left = (level - 1) * 16 + 7;

	return (
		<div
			className={cn("absolute h-full", {
				"border-neutral-400 border-l dark:border-white": isActive,
				"group-hover/sidebar:border-neutral-200 dark:group-hover/sidebar:border-neutral-700 group-hover/sidebar:border-l":
					!isActive,
			})}
			style={{
				left: `${left}px`,
				top: 0,
				bottom: 0,
				width: "1px",
			}}
		/>
	);
};

export default IndentationBars;
