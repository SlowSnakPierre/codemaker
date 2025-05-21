"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
	FolderIcon,
	FileIcon,
	ChevronDownIcon,
	ChevronRightIcon,
	RefreshCwIcon,
	PlusIcon,
	FilePlusIcon,
	FolderPlusIcon,
	ImageIcon,
	FileTextIcon,
	FileCodeIcon,
	FileCogIcon,
	Code2Icon,
	CogIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileData, FileChangeEvent } from "@/lib/types";
import { getFileIcon, getFileIconColor } from "@/lib/file-icons";
import { toast } from "sonner";

interface SidebarProps {
	currentDirectory: string | null;
	onFileSelect: (file: FileData) => void;
	onDirectoryOpen: () => void;
}

export default function Sidebar({
	currentDirectory,
	onFileSelect,
	onDirectoryOpen,
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

	// Référence pour suivre si le composant est monté
	const isMounted = useRef(true);

	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		// Configuration de l'état de montage
		isMounted.current = true;

		// Nettoyage au démontage
		return () => {
			isMounted.current = false;
			if (isElectron) {
				window.electron.off("fs:fileChanged");
			}
		};
	}, [isElectron]);

	// Configurer l'écouteur de changements de fichiers
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

	// Charger le contenu du répertoire initial
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

	// Gérer les changements de fichiers (ajout, suppression, etc.)
	const handleFileChange = async (event: FileChangeEvent) => {
		if (!currentDirectory) return;

		// Si le chemin n'est pas dans le répertoire courant, ignorer
		if (!event.path.startsWith(currentDirectory)) return;

		// Déterminer le répertoire parent du fichier modifié
		const dirPath = event.path
			.split(/[\/\\]/)
			.slice(0, -1)
			.join("/");

		// Rafraîchir le répertoire parent
		if (isElectron) {
			const result = await window.electron.refreshDirectory(dirPath);
			if (result.success) {
				updateFilesTree(dirPath, result.files || []);
			}
		}
	};

	// Mettre à jour l'arborescence des fichiers avec de nouvelles données
	const updateFilesTree = (dirPath: string, newContents: FileData[]) => {
		// Si c'est le répertoire principal
		if (dirPath === currentDirectory) {
			setFiles(newContents);
			return;
		}

		// Sinon, mettre à jour le sous-dossier spécifique
		setFiles((prevFiles) => {
			return updateNestedFilesWithChildren(
				prevFiles,
				dirPath,
				newContents
			);
		});
	};

	// Fonction récursive pour mettre à jour une arborescence imbriquée
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

	// Charger le contenu d'un répertoire
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

	// Rafraîchir explicitement un dossier
	const refreshFolder = async (path: string) => {
		if (!isElectron) return;

		setIsLoading(true);
		try {
			const result = await window.electron.refreshDirectory(path);
			if (result.success) {
				updateFilesTree(path, result.files || []);
				toast.success("Dossier rafraîchi avec succès");
			} else {
				toast.error(
					`Erreur lors du rafraîchissement: ${result.message}`
				);
			}
		} catch (error) {
			console.error("Échec du rafraîchissement:", error);
			toast.error("Impossible de rafraîchir le dossier");
		} finally {
			setIsLoading(false);
		}
	};

	// Basculer l'état d'expansion d'un dossier
	const toggleFolder = useCallback((path: string) => {
		setExpandedFolders((prev) => {
			const newState = { ...prev };
			newState[path] = !prev[path];
			return newState;
		});
	}, []);

	// Gérer le clic sur un dossier
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

	// Mettre à jour l'arborescence des fichiers avec les enfants
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

	// Créer un nouveau fichier
	const handleCreateFile = async () => {
		if (!selectedFolder || !isElectron || !newFileName.trim()) return;

		setIsLoading(true);
		try {
			const result = await window.electron.createFile({
				dirPath: selectedFolder,
				fileName: newFileName.trim(),
			});

			if (result.success) {
				// Mettre à jour l'arborescence avec le nouveau fichier
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

	// Créer un nouveau dossier
	const handleCreateFolder = async () => {
		if (!selectedFolder || !isElectron || !newFolderName.trim()) return;

		setIsLoading(true);
		try {
			const result = await window.electron.createDirectory({
				dirPath: selectedFolder,
				folderName: newFolderName.trim(),
			});

			if (result.success) {
				// Mettre à jour l'arborescence avec le nouveau dossier
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

	// Choisir l'icône appropriée pour un fichier
	const renderFileIcon = (fileName: string) => {
		const iconType = getFileIcon(fileName);
		const iconColor = getFileIconColor(fileName);

		switch (iconType) {
			case "image":
				return <ImageIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			case "file-text":
				return <FileTextIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			case "file-code":
				return <FileCodeIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			case "file-css":
				return <FileCogIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			case "file-js":
				return <Code2Icon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			case "file-json":
				return <FileCogIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			case "file-config":
				return <CogIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
			default:
				return <FileIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		}
	}; // Rendre récursivement les éléments du dossier
	const renderFolderItems = (items: FileData[], level = 0) => {
		return items.map((item) => {
			const isExpanded = expandedFolders[item.path] || false;
			const paddingLeft = level * 16; // Fonction pour rendre les barres d'indentation
			const renderIndentationBars = (isLast: boolean = false) => {
				const bars = [];
				for (let i = 0; i < level; i++) {
					const isLastBar = i === level - 1;
					// Couleur plus claire pour la dernière barre, plus foncée pour les autres
					const borderColor = isLastBar
						? "border-gray-200 dark:border-gray-700"
						: "border-gray-300 dark:border-gray-800";
					bars.push(
						<div
							key={i}
							className={`absolute h-full w-px ${borderColor} left-[${
								i * 16 + 8
							}px] top-0`}
							style={{
								left: `${i * 16 + 8}px`,
								width: "1px",
								background: isLastBar ? undefined : undefined,
							}}
						></div>
					);
				}
				return bars;
			};

			if (item.isDirectory) {
				return (
					<div key={item.path} className="folder-container relative">
						{level > 0 && renderIndentationBars()}
						{/* Nous supprimons également le connecteur horizontal pour les dossiers */}{" "}
						<div
							className="group flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-muted relative"
							onClick={() => handleFolderClick(item.path)}
							style={{ paddingLeft: `${paddingLeft}px` }}
						>
							{" "}
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
							{/* Actions du dossier (visible au survol) */}
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
							</div>{" "}
						</div>{" "}
						{isExpanded && item.children && (
							<div className="pl-0 relative">
								{" "}
								{/* Ligne verticale qui connecte le dossier à ses enfants */}
								<div
									className="absolute border-l border-gray-300 dark:border-gray-700"
									style={{
										left: `${level * 16 + 8}px`,
										top: "0",
										bottom: "0",
									}}
								></div>
								{renderFolderItems(item.children, level + 1)}
							</div>
						)}
					</div>
				);
			} else {
				return (
					<div
						key={item.path}
						className="flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-muted relative file-item"
						onClick={() => onFileSelect(item)}
						style={{ paddingLeft: `${paddingLeft + 16}px` }}
					>
						{level > 0 && renderIndentationBars()}
						{/* On n'affiche plus le connecteur horizontal pour les fichiers */}
						{renderFileIcon(item.name)}
						<span className="text-sm truncate">{item.name}</span>
					</div>
				);
			}
		});
	};
	return (
		<div className="flex flex-col h-full select-none">
			{/* Nous supprimons les styles CSS globaux qui ne sont plus nécessaires */}
			<div className="p-2 border-b border-border flex items-center justify-between">
				<h2 className="text-sm font-semibold">Explorateur</h2>

				<div className="flex">
					{currentDirectory && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 mr-1"
							onClick={() => refreshFolder(currentDirectory)}
							title="Rafraîchir"
							disabled={isLoading}
						>
							<RefreshCwIcon
								className={`h-4 w-4 ${
									isLoading ? "animate-spin" : ""
								}`}
							/>
						</Button>
					)}
					{currentDirectory && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-6 w-6 mr-1"
									title="Créer nouveau"
								>
									<PlusIcon className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={() => {
										setSelectedFolder(currentDirectory);
										setIsCreatingFile(true);
									}}
								>
									<FilePlusIcon className="h-4 w-4 mr-2" />
									Nouveau fichier
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => {
										setSelectedFolder(currentDirectory);
										setIsCreatingFolder(true);
									}}
								>
									<FolderPlusIcon className="h-4 w-4 mr-2" />
									Nouveau dossier
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}{" "}
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onDirectoryOpen}
						title="Ouvrir un dossier"
					>
						Ouvrir
					</Button>
				</div>
			</div>{" "}
			<ScrollArea className="flex-grow">
				{currentDirectory ? (
					<div className="p-1 relative file-explorer">
						{files.length > 0 ? (
							renderFolderItems(files)
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
			{/* Dialog pour la création de fichier */}
			<Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Créer un nouveau fichier</DialogTitle>
						<DialogDescription>
							Entrez le nom du fichier à créer dans le dossier
							sélectionné.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="fileName">Nom du fichier</Label>
						<Input
							id="fileName"
							value={newFileName}
							onChange={(e) => setNewFileName(e.target.value)}
							placeholder="exemple.txt"
							className="mt-2"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateFile();
								}
							}}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setIsCreatingFile(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateFile}
							disabled={!newFileName.trim() || isLoading}
						>
							{isLoading ? "Création..." : "Créer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			{/* Dialog pour la création de dossier */}
			<Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Créer un nouveau dossier</DialogTitle>
						<DialogDescription>
							Entrez le nom du dossier à créer.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="folderName">Nom du dossier</Label>
						<Input
							id="folderName"
							value={newFolderName}
							onChange={(e) => setNewFolderName(e.target.value)}
							placeholder="nouveau-dossier"
							className="mt-2"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateFolder();
								}
							}}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setIsCreatingFolder(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateFolder}
							disabled={!newFolderName.trim() || isLoading}
						>
							{isLoading ? "Création..." : "Créer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
