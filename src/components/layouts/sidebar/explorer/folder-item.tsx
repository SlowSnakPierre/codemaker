import type { FileData, FileTab } from "@/lib/types";
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
import IndentationBars from "./indentation-bars";
import { useDirectoryTree } from "@/hooks/useDirectoryTree";

interface FolderItemProps {
	item: FileData;
	level: number;
	activeTab: FileTab | undefined;
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
	activeTab,
	expandedFolders,
	toggleFolder,
	handleFolderClick,
	setSelectedFolder,
	setIsCreatingFile,
	setIsCreatingFolder,
	refreshFolder,
	onFileSelect,
}: FolderItemProps) {
	const { openDirectory } = useDirectoryTree();

	const normalizedPath = React.useMemo(() => {
		return item.path.replace(/\\/g, "/");
	}, [item.path]);

	const isExpanded = React.useMemo(() => {
		return (
			expandedFolders[normalizedPath] ||
			expandedFolders[item.path] ||
			false
		);
	}, [expandedFolders, item.path, normalizedPath]);

	const paddingLeft = level * 16;
	return (
		<div key={item.path} className="folder-container relative">
			<IndentationBars level={level} activeTab={activeTab} item={item} />
			<div
				className="group flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-muted relative"
				onClick={() => handleFolderClick(normalizedPath)}
				style={{ paddingLeft: `${paddingLeft}px` }}
			>
				<span className="text-muted-foreground">
					{isExpanded ? (
						<ChevronDownIcon className="h-4 w-4" />
					) : (
						<ChevronRightIcon className="h-4 w-4" />
					)}
				</span>
				<span className="text-sm truncate flex-grow ml-2 text-neutral-600 dark:text-neutral-200">
					{item.name}
				</span>
				<div className="opacity-0 group-hover:opacity-100 absolute right-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6"
							>
								<PlusIcon className="h-3 w-3 text-neutral-600 dark:text-neutral-200" />
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
						<RefreshCwIcon className="h-3 w-3 text-neutral-600 dark:text-neutral-200" />
					</Button>
				</div>
			</div>
			{isExpanded && (
				<div className="pl-0 relative">
					{/* Debug info pour faciliter le débogage */}
					{!item.children || item.children.length === 0 ? (
						<div className="pl-10 py-1 text-xs text-muted-foreground">
							Chargement...
						</div>
					) : (
						item.children.map((child) =>
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
									activeTab={activeTab}
								/>
							) : (
								<FileItem
									key={child.path}
									item={child}
									level={level + 1}
									onFileSelect={onFileSelect}
									activeTab={activeTab}
								/>
							),
						)
					)}
				</div>
			)}
		</div>
	);
}
