import { ScrollArea } from "@/components/ui/scroll-area";
import React, { Dispatch, SetStateAction, useEffect } from "react";
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
}) => {
	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		if (isElectron && files.length > 0) {
			loadAllExpandedFolders(files, expandedFolders);
		}
	}, [expandedFolders, isElectron]);

	const loadAllExpandedFolders = async (
		fileList: FileData[],
		expanded: Record<string, boolean>
	) => {
		let hasUpdates = false;
		const updatedFiles = [...fileList];

		const processFolder = async (items: FileData[]) => {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];

				if (item.isDirectory && expanded[item.path]) {
					if (!item.children || item.children.length === 0) {
						try {
							const contents =
								await window.electron.readDirectory(item.path);
							if (contents) {
								hasUpdates = true;
								items[i] = { ...item, children: contents };

								await processFolder(contents);
							}
						} catch (error) {
							console.error(
								`Échec de chargement pour ${item.path}:`,
								error
							);
						}
					} else if (item.children) {
						await processFolder(item.children);
					}
				}
			}
		};

		await processFolder(updatedFiles);

		if (hasUpdates) {
			setFiles([...updatedFiles]);
		}
	};

	const handleFolderClick = async (path: string) => {
		if (isElectron) {
			if (!expandedFolders[path]) {
				setIsLoading(true);
				try {
					const contents = await window.electron.readDirectory(path);
					if (!contents) throw new Error("Aucun contenu trouvé");

					setFiles((prevFiles) => {
						return updateFilesWithChildren(
							prevFiles,
							path,
							contents
						);
					});
				} catch (error) {
					console.error("Échec de lecture du répertoire:", error);
					toast.error("Impossible de lire le contenu du dossier");
				} finally {
					setIsLoading(false);
				}
			}
		}
		toggleFolder(path);
	};

	const updateFilesWithChildren = (
		files: FileData[],
		targetPath: string,
		children: FileData[]
	): FileData[] => {
		return files.map((file) => {
			if (file.path === targetPath) {
				return { ...file, children };
			} else if (file.children) {
				return {
					...file,
					children: updateFilesWithChildren(
						file.children,
						targetPath,
						children
					),
				};
			}
			return file;
		});
	};

	return (
		<ScrollArea className="flex h-full flex-col">
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
