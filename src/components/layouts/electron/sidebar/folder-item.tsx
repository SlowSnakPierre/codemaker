import { FileData } from "@/lib/types";
import FileItem from "./file-item";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	ChevronDownIcon,
	ChevronRightIcon,
	PlusIcon,
	FilePlusIcon,
	FolderPlusIcon,
	RefreshCwIcon,
} from "lucide-react";
import React from "react";

interface FolderItemProps {
	item: FileData;
	level: number;
	expandedFolders: Record<string, boolean>;
	toggleFolder: (path: string) => void;
	handleFolderClick: (path: string) => void;
	setSelectedFolder: (path: string) => void;
	setIsCreatingFile: (b: boolean) => void;
	setIsCreatingFolder: (b: boolean) => void;
	refreshFolder: (path: string) => void;
	onFileSelect: (file: FileData) => void;
}

export default function FolderItem({
	item,
	level,
	expandedFolders,
	toggleFolder,
	handleFolderClick,
	setSelectedFolder,
	setIsCreatingFile,
	setIsCreatingFolder,
	refreshFolder,
	onFileSelect,
}: FolderItemProps) {
	const isExpanded = expandedFolders[item.path] || false;
	const paddingLeft = level * 16;

	const renderIndentationBars = () => {
		const bars = [];
		for (let i = 0; i < level; i++) {
			const isLastBar = i === level - 1;
			const borderColor = isLastBar
				? "border-gray-200 dark:border-gray-700"
				: "border-gray-300 dark:border-gray-800";
			bars.push(
				<div
					key={i}
					className={`absolute h-full w-px ${borderColor} left-[${
						i * 16 + 8
					}px] top-0`}
					style={{ left: `${i * 16 + 8}px`, width: "1px" }}
				></div>
			);
		}
		return bars;
	};

	return (
		<div key={item.path} className="folder-container relative">
			{level > 0 && renderIndentationBars()}
			<div
				className="group flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-muted relative"
				onClick={() => handleFolderClick(item.path)}
				style={{ paddingLeft: `${paddingLeft}px` }}
			>
				<span className="text-muted-foreground">
					{isExpanded ? (
						<ChevronDownIcon className="h-4 w-4" />
					) : (
						<ChevronRightIcon className="h-4 w-4" />
					)}
				</span>
				<span className="text-sm truncate flex-grow ml-2 text-yellow-400">
					{item.name}
				</span>
				<div className="opacity-0 group-hover:opacity-100 absolute right-2 bg-background">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6"
							>
								<PlusIcon className="h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setSelectedFolder(item.path);
									setIsCreatingFile(true);
								}}
							>
								<FilePlusIcon className="h-4 w-4 mr-2" />
								Nouveau fichier
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={(e) => {
									e.stopPropagation();
									setSelectedFolder(item.path);
									setIsCreatingFolder(true);
								}}
							>
								<FolderPlusIcon className="h-4 w-4 mr-2" />
								Nouveau dossier
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={(e) => {
							e.stopPropagation();
							refreshFolder(item.path);
						}}
					>
						<RefreshCwIcon className="h-3 w-3" />
					</Button>
				</div>
			</div>
			{isExpanded && item.children && (
				<div className="pl-0 relative">
					<div
						className="absolute border-l border-gray-300 dark:border-gray-700"
						style={{
							left: `${level * 16 + 8}px`,
							top: 0,
							bottom: 0,
						}}
					></div>
					{item.children.map((child) =>
						child.isDirectory ? (
							<FolderItem
								key={child.path}
								item={child}
								level={level + 1}
								expandedFolders={expandedFolders}
								toggleFolder={toggleFolder}
								handleFolderClick={handleFolderClick}
								setSelectedFolder={setSelectedFolder}
								setIsCreatingFile={setIsCreatingFile}
								setIsCreatingFolder={setIsCreatingFolder}
								refreshFolder={refreshFolder}
								onFileSelect={onFileSelect}
							/>
						) : (
							<FileItem
								key={child.path}
								item={child}
								level={level + 1}
								onFileSelect={onFileSelect}
							/>
						)
					)}
				</div>
			)}
		</div>
	);
}
