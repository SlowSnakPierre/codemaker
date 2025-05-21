"use client";

import {
	useState,
	useEffect,
	useCallback,
	useRef,
	SetStateAction,
} from "react";
import { FileData, FileChangeEvent } from "@/lib/types";
import { toast } from "sonner";
import SidebarHeader from "./sidebar/sidebar-header";
import Explorer from "./sidebar/explorer";
import SidebarDialogs from "./sidebar/sidebar-dialogs";

interface SidebarProps {
	currentDirectory: string | null;
	onFileSelect: (file: FileData) => void;
	onDirectoryOpen: () => void;
	onDirectoryClose?: () => void;
}

export default function Sidebar({
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

	const isMounted = useRef(true);

	const isElectron = typeof window !== "undefined" && window.electron;

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
		if (isElectron && currentDirectory) {
			window.electron.on("fs:fileChanged", handleFileChange);
		}

		return () => {
			if (isElectron) {
				window.electron.off("fs:fileChanged");
			}
		};
	}, [isElectron, currentDirectory, files]);

	useEffect(() => {
		if (currentDirectory && isElectron) {
			setIsLoading(true);
			loadDirectoryContents(currentDirectory).finally(() => {
				if (isMounted.current) {
					setIsLoading(false);
				}
			});
		}
	}, [currentDirectory, isElectron]);

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

	const updateFilesTree = (dirPath: string, newContents: FileData[]) => {
		if (dirPath === currentDirectory) {
			setFiles(newContents);
			return;
		}

		setFiles((prevFiles) => {
			return updateNestedFilesWithChildren(
				prevFiles,
				dirPath,
				newContents
			);
		});
	};

	const updateNestedFilesWithChildren = (
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
	};

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

	const refreshFolder = async (path: string, showNotification = true) => {
		if (!isElectron) return;

		if (showNotification) {
			setIsLoading(true);
		}

		try {
			const result = await window.electron.refreshDirectory(path);
			if (result.success) {
				updateFilesTree(path, result.files || []);
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
	};

	const toggleFolder = useCallback((path: string) => {
		setExpandedFolders((prev) => {
			const newState = { ...prev };
			newState[path] = !prev[path];
			return newState;
		});
	}, []);

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

	const handleCreateFile = async () => {
		if (!selectedFolder || !isElectron || !newFileName.trim()) return;

		setIsLoading(true);
		try {
			const result = await window.electron.createFile({
				dirPath: selectedFolder,
				fileName: newFileName.trim(),
			});

			if (result.success) {
				refreshFolder(selectedFolder);
				toast.success(`Fichier "${newFileName}" créé avec succès`);
				setNewFileName("");
				setIsCreatingFile(false);
			} else {
				toast.error(
					`Erreur lors de la création du fichier: ${result.message}`
				);
			}
		} catch (error) {
			console.error("Échec de création du fichier:", error);
			toast.error("Impossible de créer le fichier");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateFolder = async () => {
		if (!selectedFolder || !isElectron || !newFolderName.trim()) return;

		setIsLoading(true);
		try {
			const result = await window.electron.createDirectory({
				dirPath: selectedFolder,
				folderName: newFolderName.trim(),
			});

			if (result.success) {
				refreshFolder(selectedFolder);
				toast.success(`Dossier "${newFolderName}" créé avec succès`);
				setNewFolderName("");
				setIsCreatingFolder(false);
			} else {
				toast.error(
					`Erreur lors de la création du dossier: ${result.message}`
				);
			}
		} catch (error) {
			console.error("Échec de création du dossier:", error);
			toast.error("Impossible de créer le dossier");
		} finally {
			setIsLoading(false);
		}
	};

	const closeDirectory = useCallback(() => {
		setFiles([]);
		setExpandedFolders({});
		setSelectedFolder(null);

		onDirectoryClose();

		toast.success("Dossier fermé");
	}, [onDirectoryClose]);

	return (
		<div className="flex flex-col h-full select-none">
			<SidebarHeader
				isLoading={isLoading}
				currentDirectory={currentDirectory}
				refreshFolder={refreshFolder}
				setSelectedFolder={setSelectedFolder}
				setIsCreatingFile={setIsCreatingFile}
				setIsCreatingFolder={setIsCreatingFolder}
				closeDirectory={closeDirectory}
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
				updateFilesWithChildren={updateFilesWithChildren}
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
				handleCreateFile={handleCreateFile}
				handleCreateFolder={handleCreateFolder}
			/>
		</div>
	);
}
