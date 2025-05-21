"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { FileData, FileChangeEvent, FileTab } from "@/lib/types";
import { toast } from "sonner";
import SidebarHeader from "./sidebar/sidebar-header";
import Explorer from "./sidebar/explorer";
import SidebarDialogs from "./sidebar/sidebar-dialogs";

interface SidebarProps {
	activeTab: FileTab | undefined;
	currentDirectory: string | null;
	onFileSelect: (file: FileData) => void;
	onDirectoryOpen: () => void;
	onDirectoryClose?: () => void;
}

export default function Sidebar({
	activeTab,
	currentDirectory,
	onFileSelect,
	onDirectoryOpen,
	onDirectoryClose = () => {},
}: SidebarProps) {
	const [files, setFiles] = useState<FileData[]>([]);
	const [expandedFolders, setExpandedFolders] = useState<
		Record<string, boolean>
	>({});
	const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
	const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
	const [newFileName, setNewFileName] = useState<string>("");
	const [newFolderName, setNewFolderName] = useState<string>("");
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [manuallyClosedFolders, setManuallyClosedFolders] = useState<
		string[]
	>([]);

	const isMounted = useRef(true);

	const isElectron = typeof window !== "undefined" && window.electron;

	const updateNestedFilesWithChildren = useCallback(
		(
			files: FileData[],
			targetPath: string,
			newChildren: FileData[]
		): FileData[] => {
			return files.map((file) => {
				if (file.path === targetPath) {
					return { ...file, children: newChildren };
				} else if (file.children) {
					return {
						...file,
						children: updateNestedFilesWithChildren(
							file.children,
							targetPath,
							newChildren
						),
					};
				}
				return file;
			});
		},
		[]
	);

	const updateFilesTree = useCallback(
		(dirPath: string, newContents: FileData[]) => {
			const normalizedPath = dirPath.replace(/\\/g, "/");

			if (normalizedPath === currentDirectory?.replace(/\\/g, "/")) {
				setFiles(newContents);
				console.log(
					`Mise à jour du contenu racine avec ${newContents.length} éléments`
				);
				return;
			}

			setFiles((prevFiles) => {
				const updatedFiles = updateNestedFilesWithChildren(
					prevFiles,
					normalizedPath,
					newContents
				);
				console.log(
					`Mise à jour de ${normalizedPath} avec ${newContents.length} éléments`
				);
				return updatedFiles;
			});
		},
		[currentDirectory, updateNestedFilesWithChildren]
	);

	const refreshFolder = useCallback(
		async (path: string, showNotification = true) => {
			if (!isElectron) return;

			if (showNotification) {
				setIsLoading(true);
			}

			try {
				const result = await window.electron.refreshDirectory(path);
				if (result.success) {
					updateFilesTree(path, result.files || []);

					await new Promise((resolve) => setTimeout(resolve, 100));

					if (Object.keys(expandedFolders).length > 0) {
						const foldersToRestore = { ...expandedFolders };

						for (const [folderPath, isExpanded] of Object.entries(
							foldersToRestore
						)) {
							if (isExpanded) {
								setExpandedFolders((prevState) => ({
									...prevState,
									[folderPath]: true,
								}));

								await new Promise((resolve) =>
									setTimeout(resolve, 10)
								);
							}
						}
					}

					if (showNotification) {
						toast.success("Dossier rafraîchi avec succès");
					}
				} else {
					if (showNotification) {
						toast.error(
							`Erreur lors du rafraîchissement: ${result.message}`
						);
					}
				}
			} catch (error) {
				console.error("Échec du rafraîchissement:", error);
				if (showNotification) {
					toast.error("Impossible de rafraîchir le dossier");
				}
			} finally {
				if (showNotification) {
					setIsLoading(false);
				}
			}
		},
		[expandedFolders, isElectron, updateFilesTree]
	);
	const toggleFolder = useCallback((path: string) => {
		const normalizedPath = path.replace(/\\/g, "/");
		console.log(`Basculement manuel du dossier: ${normalizedPath}`);

		setExpandedFolders((prev) => {
			const newValue = !prev[normalizedPath];
			console.log(
				`Dossier ${normalizedPath} est maintenant ${
					newValue ? "DÉVELOPPÉ" : "FERMÉ"
				}`
			);

			const newState = { ...prev };
			newState[normalizedPath] = newValue;

			if (newValue) {
				console.log(
					`Dossiers développés après ajout: ${Object.keys(newState)
						.filter((k) => newState[k])
						.join(", ")}`
				);

				setManuallyClosedFolders((prev) =>
					prev.filter((folder) => folder !== normalizedPath)
				);
			} else {
				setManuallyClosedFolders((prev) => [...prev, normalizedPath]);
			}

			return newState;
		});
	}, []);
	const closeAllFolders = useCallback(() => {
		console.log("Fermeture de tous les dossiers");

		const openedFolders = Object.keys(expandedFolders).filter(
			(folder) => expandedFolders[folder]
		);

		const potentialRequiredFolders: string[] = [];
		if (activeTab?.path && currentDirectory) {
			const normalizedPath = activeTab.path.replace(/\\/g, "/");
			const normalizedCurrentDir = currentDirectory.replace(/\\/g, "/");

			let relativePath = normalizedPath.slice(
				normalizedCurrentDir.length
			);
			if (relativePath.startsWith("/")) {
				relativePath = relativePath.substring(1);
			}

			const pathSegments = relativePath.split("/").slice(0, -1);
			let currentPathBuild = normalizedCurrentDir;

			for (const segment of pathSegments) {
				if (!segment) continue;
				currentPathBuild = `${currentPathBuild}/${segment}`;
				potentialRequiredFolders.push(currentPathBuild);
			}
		}

		console.log(
			"Dossiers potentiellement requis:",
			potentialRequiredFolders
		);

		setExpandedFolders({});

		setManuallyClosedFolders((prev) => {
			const newClosedFolders = [...prev];

			openedFolders.forEach((folder) => {
				if (!newClosedFolders.includes(folder)) {
					newClosedFolders.push(folder);
				}
			});

			potentialRequiredFolders.forEach((folder) => {
				if (!newClosedFolders.includes(folder)) {
					newClosedFolders.push(folder);
				}
			});

			console.log(
				"Nouvelle liste de dossiers fermés manuellement:",
				newClosedFolders
			);
			return newClosedFolders;
		});

		toast.success("Tous les dossiers sont fermés");
	}, [expandedFolders, activeTab?.path, currentDirectory]);

	const closeDirectory = useCallback(() => {
		setFiles([]);
		setExpandedFolders({});
		setSelectedFolder(null);

		onDirectoryClose();

		toast.success("Dossier fermé");
	}, [onDirectoryClose]);
	const expandToFile = useCallback(
		async (filePath: string) => {
			if (!filePath || !currentDirectory || !isElectron) {
				console.log(
					"Impossible d'étendre vers le fichier: paramètres invalides",
					{
						filePath,
						currentDirectory,
						isElectron,
					}
				);
				return;
			}

			if (!filePath.startsWith(currentDirectory)) {
				console.log(
					`Le chemin ${filePath} ne commence pas par ${currentDirectory}`
				);
				return;
			}

			console.log(`Développement des dossiers pour: ${filePath}`);

			const normalizedPath = filePath.replace(/\\/g, "/");
			const normalizedCurrentDir = currentDirectory.replace(/\\/g, "/");

			let relativePath = normalizedPath.slice(
				normalizedCurrentDir.length
			);
			if (relativePath.startsWith("/")) {
				relativePath = relativePath.substring(1);
			}

			const pathSegments = relativePath.split("/");
			console.log("Segments du chemin:", pathSegments);

			const pathsToProcess = [];
			let currentPathBuild = normalizedCurrentDir;

			for (let i = 0; i < pathSegments.length - 1; i++) {
				if (!pathSegments[i]) continue;
				currentPathBuild = `${currentPathBuild}/${pathSegments[i]}`;
				pathsToProcess.push(currentPathBuild);
			}
			const expandedPaths = Object.keys(expandedFolders).filter(
				(path) => expandedFolders[path]
			);

			const pathsToLoad = pathsToProcess.filter((path) => {
				return !expandedPaths.includes(path);
			});

			console.log("Chemins à charger:", pathsToLoad);

			if (pathsToLoad.length > 0) {
				console.log(
					`Chargement de ${pathsToLoad.length} dossiers en parallèle`
				);

				await Promise.all(
					pathsToLoad.map(async (path) => {
						try {
							const contents =
								await window.electron.readDirectory(path);
							if (contents && contents.length > 0) {
								updateFilesTree(path, contents);
							}
						} catch (error) {
							console.error(
								`Erreur de chargement: ${path}`,
								error
							);
						}
					})
				);

				await new Promise((resolve) => setTimeout(resolve, 100));
			} else {
				console.log("Tous les dossiers nécessaires sont déjà chargés");
			}

			const foldersToExpand: Record<string, boolean> = {};
			for (const path of pathsToProcess) {
				foldersToExpand[path] = true;
			}

			setExpandedFolders((prevState) => ({
				...prevState,
				...foldersToExpand,
			}));
		},
		[currentDirectory, isElectron, updateFilesTree, expandedFolders]
	);

	useEffect(() => {
		isMounted.current = true;

		return () => {
			isMounted.current = false;
			if (isElectron) {
				window.electron.off("fs:fileChanged");
			}
		};
	}, [isElectron]);

	useEffect(() => {
		const handleFileChange = async (event: FileChangeEvent) => {
			console.log("Événement de changement de fichier:", event);
			if (!currentDirectory) return;

			if (!event.path.startsWith(currentDirectory)) return;

			const dirPath = event.path
				.split(/[\/\\]/)
				.slice(0, -1)
				.join("/");

			console.log(`Fichier modifié: ${event.type} - ${event.path}`);

			if (event.type === "addDir" || event.type === "unlinkDir") {
				await refreshFolder(dirPath, false);
			} else if (event.type === "add" || event.type === "unlink") {
				await refreshFolder(dirPath, false);
			}
		};

		if (isElectron && currentDirectory) {
			window.electron.on("fs:fileChanged", (event: FileChangeEvent) => {
				void handleFileChange(event);
			});
		}

		return () => {
			if (isElectron) {
				window.electron.off("fs:fileChanged");
			}
		};
	}, [isElectron, currentDirectory, refreshFolder]);

	useEffect(() => {
		const loadDirectoryContents = async (dirPath: string) => {
			try {
				if (!isElectron) return;

				const contents = await window.electron.readDirectory(dirPath);
				if (!contents) throw new Error("Aucun contenu trouvé");

				if (dirPath === currentDirectory) {
					setFiles(contents);
				}

				return contents;
			} catch (error) {
				console.error("Échec de lecture du répertoire:", error);
				toast.error("Impossible de lire le contenu du dossier");
			}
		};

		if (currentDirectory && isElectron) {
			setIsLoading(true);
			loadDirectoryContents(currentDirectory).finally(() => {
				if (isMounted.current) {
					setIsLoading(false);
				}
			});
		}
	}, [currentDirectory, isElectron]);
	useEffect(() => {
		const expandedPaths = Object.keys(expandedFolders).filter(
			(path) => expandedFolders[path]
		);

		console.log(
			`État des dossiers (${expandedPaths.length} dossiers développés):`,
			expandedPaths
		);

		if (activeTab?.path && currentDirectory) {
			const normalizedPath = activeTab.path.replace(/\\/g, "/");
			const normalizedCurrentDir = currentDirectory.replace(/\\/g, "/");

			let relativePath = normalizedPath.slice(
				normalizedCurrentDir.length
			);
			if (relativePath.startsWith("/")) {
				relativePath = relativePath.substring(1);
			}

			const pathSegments = relativePath.split("/").slice(0, -1);

			const requiredFolders = [];
			let currentPathBuild = normalizedCurrentDir;

			for (const segment of pathSegments) {
				if (!segment) continue;
				currentPathBuild = `${currentPathBuild}/${segment}`;
				requiredFolders.push(currentPathBuild);
			}

			const isPathExpanded =
				requiredFolders.length === 0 ||
				requiredFolders.every((folder) =>
					expandedPaths.includes(folder)
				);

			if (isPathExpanded) {
				console.log(
					`Chemin vers le fichier actif '${activeTab.path}' est correctement développé.`
				);
			}
		}
	}, [expandedFolders, activeTab?.path, currentDirectory]);

	const lastActiveTabPathRef = useRef<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		const handleActiveTabChange = async () => {
			if (activeTab?.path && isMounted) {
				const isTabChanged =
					lastActiveTabPathRef.current !== activeTab.path;

				lastActiveTabPathRef.current = activeTab.path;

				console.log(
					"Tentative de développement vers:",
					activeTab.path,
					isTabChanged ? "(nouvel onglet)" : "(même onglet)"
				);

				if (isTabChanged) {
					setManuallyClosedFolders([]);
				}

				await new Promise((resolve) => setTimeout(resolve, 100));

				if (!isMounted) return;
				const normalizedPath = activeTab.path.replace(/\\/g, "/");
				const normalizedCurrentDir = currentDirectory?.replace(
					/\\/g,
					"/"
				);

				let relativePath = normalizedPath.slice(
					normalizedCurrentDir?.length
				);
				if (relativePath.startsWith("/")) {
					relativePath = relativePath.substring(1);
				}

				const pathSegments = relativePath.split("/").slice(0, -1);

				const requiredFolders = [];
				let currentPathBuild = normalizedCurrentDir;

				for (const segment of pathSegments) {
					if (!segment) continue;
					currentPathBuild = `${currentPathBuild}/${segment}`;
					requiredFolders.push(currentPathBuild);
				}

				const expandedPaths = Object.keys(expandedFolders).filter(
					(path) => expandedFolders[path]
				);

				if (requiredFolders.length === 0) {
					console.log("Pas de dossiers parents à développer");
					return;
				}

				const foldersToExpand = requiredFolders.filter((folder) => {
					if (isTabChanged) {
						return !expandedPaths.includes(folder);
					} else {
						return (
							!expandedPaths.includes(folder) &&
							!manuallyClosedFolders.includes(folder)
						);
					}
				});

				if (foldersToExpand.length === 0) {
					console.log(
						"Tous les dossiers nécessaires sont déjà développés ou fermés manuellement"
					);
					return;
				}

				console.log("Dossiers à développer:", foldersToExpand);

				try {
					const expandedFoldersCount = Object.keys(
						expandedFolders
					).filter((key) => expandedFolders[key]).length;
					console.log(
						`État avant expansion: ${expandedFoldersCount} dossiers développés`
					);

					const foldersToExpandObj: Record<string, boolean> = {};
					foldersToExpand.forEach((folder) => {
						foldersToExpandObj[folder] = true;
					});

					setExpandedFolders((prev) => ({
						...prev,
						...foldersToExpandObj,
					}));

					console.log("Expansion des dossiers terminée avec succès");
				} catch (error) {
					console.error(
						"Erreur lors de l'expansion des dossiers:",
						error
					);
				}
			}
		};

		void handleActiveTabChange();

		return () => {
			isMounted = false;
		};
	}, [
		activeTab?.path,
		expandToFile,
		expandedFolders,
		currentDirectory,
		manuallyClosedFolders,
	]);

	return (
		<div className="flex flex-col h-full select-none group/sidebar">
			{" "}
			<SidebarHeader
				isLoading={isLoading}
				currentDirectory={currentDirectory}
				refreshFolder={refreshFolder}
				setSelectedFolder={setSelectedFolder}
				setIsCreatingFile={setIsCreatingFile}
				setIsCreatingFolder={setIsCreatingFolder}
				closeDirectory={closeDirectory}
				closeAllFolders={closeAllFolders}
			/>
			<Explorer
				currentDirectory={currentDirectory}
				files={files}
				isLoading={isLoading}
				expandedFolders={expandedFolders}
				toggleFolder={toggleFolder}
				setSelectedFolder={setSelectedFolder}
				setIsCreatingFile={setIsCreatingFile}
				setIsCreatingFolder={setIsCreatingFolder}
				refreshFolder={refreshFolder}
				onFileSelect={onFileSelect}
				onDirectoryOpen={onDirectoryOpen}
				closeDirectory={closeDirectory}
				setIsLoading={setIsLoading}
				setFiles={setFiles}
				activeTab={activeTab}
			/>
			<SidebarDialogs
				isLoading={isLoading}
				isCreatingFile={isCreatingFile}
				isCreatingFolder={isCreatingFolder}
				newFileName={newFileName}
				newFolderName={newFolderName}
				setIsCreatingFile={setIsCreatingFile}
				setIsCreatingFolder={setIsCreatingFolder}
				setNewFileName={setNewFileName}
				setNewFolderName={setNewFolderName}
				selectedFolder={selectedFolder}
				refreshFolder={refreshFolder}
				setIsLoading={setIsLoading}
			/>
		</div>
	);
}
