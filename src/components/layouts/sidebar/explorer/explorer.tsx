import { ScrollArea } from "@/components/ui/scroll-area";
import React, { type Dispatch, type SetStateAction, useEffect } from "react";
import FolderItem from "./folder-item";
import FileItem from "./file-item";
import { Button } from "@/components/ui/button";
import type { FileData, FileTab } from "@/lib/types";
import { toast } from "sonner";

const Explorer = ({
	currentDirectory,
	activeTab,
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
	activeTab: FileTab | undefined;
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
	const handleFolderClick = async (path: string) => {
		const normalizedPath = path.replace(/\\/g, "/");

		if (isElectron) {
			toggleFolder(path);

			if (!expandedFolders[normalizedPath]) {
				let localLoading = true;

				const loadingTimeout = setTimeout(() => {
					if (localLoading) setIsLoading(true);
				}, 100);

				try {
					const contents = await window.electron.readDirectory(path);

					if (!contents) throw new Error("Aucun contenu trouvé");

					setFiles((prevFiles) => {
						return updateFilesWithChildren(
							prevFiles,
							normalizedPath,
							contents,
						);
					});
				} catch (error) {
					console.error("Échec de lecture du répertoire:", error);
					toast.error("Impossible de lire le contenu du dossier");

					toggleFolder(path);
				} finally {
					localLoading = false;
					clearTimeout(loadingTimeout);
					setIsLoading(false);
				}
			}
		} else {
			toggleFolder(path);
		}
	};

	const updateFilesWithChildren = (
		files: FileData[],
		targetPath: string,
		children: FileData[],
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
						children,
					),
				};
			}
			return file;
		});
	};
	useEffect(() => {
		const loadAllExpandedFolders = async (
			fileList: FileData[],
			expanded: Record<string, boolean>,
		) => {
			const foldersToProcess = Object.keys(expanded)
				.filter((path) => expanded[path])
				.sort((a, b) => a.split("/").length - b.split("/").length);

			if (foldersToProcess.length === 0) return;

			const processedFolders = new Set<string>();
			let hasUpdates = false;
			const updatedFiles = [...fileList];

			const findAndUpdateItem = async (
				items: FileData[],
				targetPath: string,
			): Promise<boolean> => {
				const normalizedTargetPath = targetPath.replace(/\\/g, "/");

				if (processedFolders.has(normalizedTargetPath)) {
					return false;
				}

				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					const normalizedItemPath = item.path.replace(/\\/g, "/");

					if (
						(normalizedItemPath === normalizedTargetPath ||
							item.path === targetPath) &&
						item.isDirectory
					) {
						processedFolders.add(normalizedTargetPath);

						if (!item.children || item.children.length === 0) {
							try {
								const contents =
									await window.electron.readDirectory(
										item.path,
									);
								if (contents) {
									items[i] = { ...item, children: contents };
									hasUpdates = true;
									return true;
								}
							} catch (error) {
								console.error(
									`Échec de chargement pour ${item.path}:`,
									error,
								);
							}
						}
						return false;
					}

					if (
						item.isDirectory &&
						item.children &&
						normalizedTargetPath.startsWith(
							normalizedItemPath + "/",
						)
					) {
						const found = await findAndUpdateItem(
							item.children,
							targetPath,
						);
						if (found) return true;
					}
				}

				return false;
			};

			const batchSize = 5;
			for (let i = 0; i < foldersToProcess.length; i += batchSize) {
				const batch = foldersToProcess.slice(i, i + batchSize);

				await Promise.all(
					batch.map((folderPath) =>
						findAndUpdateItem(updatedFiles, folderPath),
					),
				);
			}

			if (hasUpdates) {
				setFiles([...updatedFiles]);
			}
		};

		if (isElectron && files.length > 0) {
			void loadAllExpandedFolders(files, expandedFolders);
		}
	}, [expandedFolders, isElectron, files, setFiles]);

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
									activeTab={activeTab}
								/>
							) : (
								<FileItem
									key={item.path}
									item={item}
									level={0}
									onFileSelect={onFileSelect}
									activeTab={activeTab}
								/>
							),
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
