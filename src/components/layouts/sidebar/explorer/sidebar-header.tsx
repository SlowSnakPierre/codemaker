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
			<h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
				Explorateur
			</h2>

			<div className="flex">
				{currentDirectory && (
					<>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1"
							onClick={() => {
								setSelectedFolder(currentDirectory);
								setIsCreatingFile(true);
							}}
						>
							<FilePlusIcon className="h-4 w-4 mr-2" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1"
							onClick={() => {
								setSelectedFolder(currentDirectory);
								setIsCreatingFolder(true);
							}}
						>
							<FolderPlusIcon className="h-4 w-4 mr-2" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1"
							onClick={() => refreshFolder(currentDirectory)}
							title="Rafraîchir"
							disabled={isLoading}
						>
							<RefreshCwIcon
								className={cn("h-4 w-4", {
									"animate-spin": isLoading,
								})}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1"
							onClick={closeAllFolders}
							title="Fermer tous les dossiers"
						>
							<FoldersIcon className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={closeDirectory}
						>
							<XIcon className="h-4 w-4" />
						</Button>
					</>
				)}
			</div>
		</div>
	);
};

export default SidebarHeader;
