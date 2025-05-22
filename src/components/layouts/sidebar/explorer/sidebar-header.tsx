import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	RefreshCwIcon,
	FilePlusIcon,
	FolderPlusIcon,
	XIcon,
	FoldersIcon,
} from "lucide-react";
import React from "react";

type Props = {
	isLoading: boolean;
	currentDirectory: string | null;
	refreshFolder: (path: string) => void;
	setSelectedFolder: (path: string) => void;
	setIsCreatingFile: (creating: boolean) => void;
	setIsCreatingFolder: (creating: boolean) => void;
	closeDirectory: () => void;
	closeAllFolders: () => void;
};

const SidebarHeader = ({
	isLoading,
	currentDirectory,
	refreshFolder,
	setSelectedFolder,
	setIsCreatingFile,
	setIsCreatingFolder,
	closeDirectory,
	closeAllFolders,
}: Props) => {
	return (
		<div className="p-2 border-b border-border flex items-center justify-between">
			<h2 className="text-xs font-normal uppercase tracking-wider text-neutral-500 dark:text-neutral-200">
				Explorateur
			</h2>

			<div className="flex">
				{currentDirectory && (
					<>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1 hover:bg-neutral-200"
							onClick={() => {
								setSelectedFolder(currentDirectory);
								setIsCreatingFile(true);
							}}
						>
							<FilePlusIcon className="h-4 w-4 text-neutral-500" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1 hover:bg-neutral-200"
							onClick={() => {
								setSelectedFolder(currentDirectory);
								setIsCreatingFolder(true);
							}}
						>
							<FolderPlusIcon className="h-4 w-4 text-neutral-500" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1 hover:bg-neutral-200"
							onClick={() => refreshFolder(currentDirectory)}
							title="Rafraîchir"
							disabled={isLoading}
						>
							<RefreshCwIcon
								className={cn("h-4 w-4 text-neutral-500", {
									"animate-spin": isLoading,
								})}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1 hover:bg-neutral-200"
							onClick={closeAllFolders}
							title="Fermer tous les dossiers"
						>
							<FoldersIcon className="h-4 w-4 text-neutral-500" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 hover:bg-neutral-200"
							onClick={closeDirectory}
						>
							<XIcon className="h-4 w-4 text-neutral-500" />
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default SidebarHeader;
