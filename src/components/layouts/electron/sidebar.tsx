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
	SearchIcon,
	MoreVerticalIcon,
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
	const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(
		{}
	);
	const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
	const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
	const [newFileName, setNewFileName] = useState<string>("");
	const [newFolderName, setNewFolderName] = useState<string>("");
	const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [searchQuery, setSearchQuery] = useState<string>("");

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
		if (!currentDirectory) return;
		if (!event.path.startsWith(currentDirectory)) return;

		const dirPath = event.path.split(/[\/\\]/).slice(0, -1).join("/");

		if (isElectron) {
			const result = await window.electron.refreshDirectory(dirPath);
			if (result.success) {
				updateFilesTree(dirPath, result.files || []);
			}
		}
	};

	const updateFilesTree = (dirPath: string, newContents: FileData[]) => {
		if (dirPath === currentDirectory) {
			setFiles(newContents);
			return;
		}

		setFiles((prevFiles) => {
			return updateNestedFilesWithChildren(prevFiles, dirPath, newContents);
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
			if (!contents) throw new Error("No content found");

			if (dirPath === currentDirectory) {
				setFiles(contents);
			}

			return contents;
		} catch (error) {
			console.error("Failed to read directory:", error);
			toast.error("Unable to read folder contents");
		}
	};

	const refreshFolder = async (path: string) => {
		if (!isElectron) return;

		setIsLoading(true);
		try {
			const result = await window.electron.refreshDirectory(path);
			if (result.success) {
				updateFilesTree(path, result.files || []);
				toast.success("Folder refreshed successfully");
			} else {
				toast.error(`Refresh error: ${result.message}`);
			}
		} catch (error) {
			console.error("Refresh failed:", error);
			toast.error("Unable to refresh folder");
		} finally {
			setIsLoading(false);
		}
	};

	const toggleFolder = useCallback((path: string) => {
		setExpandedFolders((prev) => {
			const newState = { ...prev };
			newState[path] = !prev[path];
			return newState;
		});
	}, []);

	const handleFolderClick = async (path: string) => {
		if (!expandedFolders[path] && isElectron) {
			setIsLoading(true);
			try {
				const contents = await window.electron.readDirectory(path);
				if (!contents) throw new Error("No content found");

				setFiles((prevFiles) => {
					return updateFilesWithChildren(prevFiles, path, contents);
				});
			} catch (error) {
				console.error("Failed to read directory:", error);
				toast.error("Unable to read folder contents");
			} finally {
				setIsLoading(false);
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
					children: updateFilesWithChildren(file.children, targetPath, children),
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
				toast.success(`File "${newFileName}" created successfully`);
				setNewFileName("");
				setIsCreatingFile(false);
			} else {
				toast.error(`Error creating file: ${result.message}`);
			}
		} catch (error) {
			console.error("Failed to create file:", error);
			toast.error("Unable to create file");
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
				toast.success(`Folder "${newFolderName}" created successfully`);
				setNewFolderName("");
				setIsCreatingFolder(false);
			} else {
				toast.error(`Error creating folder: ${result.message}`);
			}
		} catch (error) {
			console.error("Failed to create folder:", error);
			toast.error("Unable to create folder");
		} finally {
			setIsLoading(false);
		}
	};

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
	};

	const filteredFiles = (items: FileData[]): FileData[] => {
		if (!searchQuery) return items;

		return items.filter((item) => {
			const matchesSearch = item.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase());

			if (item.isDirectory && item.children) {
				const filteredChildren = filteredFiles(item.children);
				return matchesSearch || filteredChildren.length > 0;
			}

			return matchesSearch;
		});
	};

	const renderFolderItems = (items: FileData[], level = 0) => {
		const filteredItems = filteredFiles(items);

		return filteredItems.map((item) => {
			const isExpanded = expandedFolders[item.path] || false;
			const paddingLeft = level * 12;

			if (item.isDirectory) {
				return (
					<div key={item.path} className="folder-container relative">
						<div
							className="group flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-accent/50 relative"
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
							<FolderIcon className="h-4 w-4 ml-1 mr-2 text-yellow-400" />
							<span className="text-sm truncate flex-grow">{item.name}</span>
							<div className="opacity-0 group-hover:opacity-100 absolute right-2 bg-background flex">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-6 w-6">
											<MoreVerticalIcon className="h-3.5 w-3.5" />
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
											New File
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={(e) => {
												e.stopPropagation();
												setSelectedFolder(item.path);
												setIsCreatingFolder(true);
											}}
										>
											<FolderPlusIcon className="h-4 w-4 mr-2" />
											New Folder
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
									<RefreshCwIcon className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>
						{isExpanded && item.children && (
							<div className="pl-0 relative">
								{renderFolderItems(item.children, level + 1)}
							</div>
						)}
					</div>
				);
			} else {
				return (
					<div
						key={item.path}
						className="flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-accent/50 relative"
						onClick={() => onFileSelect(item)}
						style={{ paddingLeft: `${paddingLeft + 16}px` }}
					>
						{renderFileIcon(item.name)}
						<span className="text-sm truncate">{item.name}</span>
					</div>
				);
			}
		});
	};

	return (
		<div className="flex flex-col h-full select-none">
			<div className="p-2 border-b border-border">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-sm font-semibold uppercase tracking-wider">
						Explorer
					</h2>
					<div className="flex">
						{currentDirectory && (
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 mr-1"
								onClick={() => refreshFolder(currentDirectory)}
								title="Refresh"
								disabled={isLoading}
							>
								<RefreshCwIcon
									className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
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
										title="New..."
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
										New File
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() => {
											setSelectedFolder(currentDirectory);
											setIsCreatingFolder(true);
										}}
									>
										<FolderPlusIcon className="h-4 w-4 mr-2" />
										New Folder
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}
					</div>
				</div>
				<div className="relative">
					<SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						className="pl-8 h-8"
						placeholder="Search files..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>
			<ScrollArea className="flex-grow">
				{currentDirectory ? (
					<div className="p-1 relative file-explorer">
						{files.length > 0 ? (
							renderFolderItems(files)
						) : (
							<div className="py-2 px-2 text-sm text-muted-foreground">
								{isLoading ? "Loading..." : "Empty folder"}
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
						<p className="text-sm text-center mb-4">No folder opened</p>
						<Button variant="outline" size="sm" onClick={onDirectoryOpen}>
							Open Folder
						</Button>
					</div>
				)}
			</ScrollArea>

			<Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create new file</DialogTitle>
						<DialogDescription>
							Enter the name of the file to create in the selected folder.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="fileName">File name</Label>
						<Input
							id="fileName"
							value={newFileName}
							onChange={(e) => setNewFileName(e.target.value)}
							placeholder="example.txt"
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
							Cancel
						</Button>
						<Button
							onClick={handleCreateFile}
							disabled={!newFileName.trim() || isLoading}
						>
							{isLoading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create new folder</DialogTitle>
						<DialogDescription>Enter the name of the folder.</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="folderName">Folder name</Label>
						<Input
							id="folderName"
							value={newFolderName}
							onChange={(e) => setNewFolderName(e.target.value)}
							placeholder="new-folder"
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
							Cancel
						</Button>
						<Button
							onClick={handleCreateFolder}
							disabled={!newFolderName.trim() || isLoading}
						>
							{isLoading ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}