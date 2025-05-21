import { ScrollArea } from "@/components/ui/scroll-area";
import React, { Dispatch, SetStateAction } from "react";
import FolderItem from "./folder-item";
import FileItem from "./file-item";
import { Button } from "@/components/ui/button";
import { FileData } from "@/lib/types";
import { toast } from "sonner";

const Explorer = ({
	currentDirectory,
	files,
	expandedFolders,
	isLoading,
	toggleFolder,
	setIsLoading,
	setFiles,
	setSelectedFolder,
	setIsCreatingFile,
	setIsCreatingFolder,
	refreshFolder,
	onFileSelect,
	onDirectoryOpen,
	updateFilesWithChildren,
}: {
	currentDirectory: string | null;
	files: FileData[];
	expandedFolders: Record<string, boolean>;
	isLoading: boolean;
	toggleFolder: (path: string) => void;
	setIsLoading: (loading: boolean) => void;
	setFiles: Dispatch<SetStateAction<FileData[]>>;
	setSelectedFolder: (path: string) => void;
	setIsCreatingFile: (creating: boolean) => void;
	setIsCreatingFolder: (creating: boolean) => void;
	refreshFolder: (path: string) => void;
	onFileSelect: (file: FileData) => void;
	onDirectoryOpen: () => void;
	closeDirectory: () => void;
	updateFilesWithChildren: (
		files: FileData[],
		path: string,
		contents: FileData[]
	) => FileData[];
}) => {
	const isElectron = typeof window !== "undefined" && window.electron;

	const handleFolderClick = async (path: string) => {
		if (!expandedFolders[path] && isElectron) {
			setIsLoading(true);
			try {
				const contents = await window.electron.readDirectory(path);
				if (!contents) throw new Error("Aucun contenu trouvé");

				setFiles((prevFiles) => {
					return updateFilesWithChildren(prevFiles, path, contents);
				});
			} catch (error) {
				console.error("Échec de lecture du répertoire:", error);
				toast.error("Impossible de lire le contenu du dossier");
			} finally {
				setIsLoading(false);
			}
		}
		toggleFolder(path);
	};

	return (
		<ScrollArea className="flex-grow">
			{currentDirectory ? (
				<div className="p-1 relative file-explorer">
					{files.length > 0 ? (
						files.map((item) =>
							item.isDirectory ? (
								<FolderItem
									key={item.path}
									item={item}
									level={0}
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
									key={item.path}
									item={item}
									level={0}
									onFileSelect={onFileSelect}
								/>
							)
						)
					) : (
						<div className="py-2 px-2 text-sm text-muted-foreground">
							{isLoading ? "Chargement..." : "Dossier vide"}
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
					<p className="text-sm text-center mb-4">
						Aucun dossier ouvert
					</p>
					<Button
						variant="outline"
						size="sm"
						onClick={onDirectoryOpen}
					>
						Ouvrir un dossier
					</Button>
				</div>
			)}
		</ScrollArea>
	);
};

export default Explorer;
