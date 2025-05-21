"use client";

import { useState, useEffect } from "react";
import {
	FolderIcon,
	FileIcon,
	ChevronDownIcon,
	ChevronRightIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileData } from "@/lib/types";

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

	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		if (currentDirectory && isElectron) {
			loadDirectoryContents(currentDirectory);
		}
	}, [currentDirectory, isElectron]);

	const loadDirectoryContents = async (dirPath: string) => {
		try {
			const contents = await window.electron.readDirectory(dirPath);
			if (!contents) throw new Error("No contents found");
			setFiles(contents);
		} catch (error) {
			console.error("Failed to read directory:", error);
		}
	};

	const toggleFolder = async (path: string) => {
		setExpandedFolders((prev) => {
			const newState = { ...prev };
			newState[path] = !prev[path];
			return newState;
		});
	};

	const handleFolderClick = async (path: string) => {
		if (!expandedFolders[path] && isElectron) {
			try {
				const contents = await window.electron.readDirectory(path);

				if (!contents) throw new Error("No contents found");

				setFiles((prevFiles) => {
					return updateFilesWithChildren(prevFiles, path, contents);
				});
			} catch (error) {
				console.error("Failed to read directory:", error);
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
		<div className="flex flex-col h-full select-none">
			<div className="p-2 border-b border-border flex items-center justify-between">
				<h2 className="text-sm font-semibold">Explorer</h2>
				<Button
					variant="ghost"
					size="icon"
					className="h-6 w-6"
					onClick={onDirectoryOpen}
					title="Open Folder"
				>
					<FolderIcon className="h-4 w-4" />
				</Button>
			</div>

			<ScrollArea className="flex-grow">
				{currentDirectory ? (
					<div className="p-1">
						{files.map((item) => {
							const isExpanded =
								expandedFolders[item.path] || false;

							if (item.isDirectory) {
								return (
									<div key={item.path}>
										<div
											className="flex items-center py-1 px-2 cursor-pointer hover:bg-muted"
											onClick={() =>
												handleFolderClick(item.path)
											}
										>
											<span className="mr-1 text-muted-foreground">
												{isExpanded ? (
													<ChevronDownIcon className="h-4 w-4" />
												) : (
													<ChevronRightIcon className="h-4 w-4" />
												)}
											</span>
											<FolderIcon className="h-4 w-4 mr-2 text-yellow-400" />
											<span className="text-sm truncate">
												{item.name}
											</span>
										</div>

										{isExpanded && item.children && (
											<div>
												{item.children.map((child) => {
													if (child.isDirectory) {
														const childExpanded =
															expandedFolders[
																child.path
															] || false;
														return (
															<div
																key={child.path}
															>
																<div
																	className="flex items-center py-1 px-2 ml-4 cursor-pointer hover:bg-muted"
																	onClick={(
																		e
																	) => {
																		e.stopPropagation();
																		handleFolderClick(
																			child.path
																		);
																	}}
																>
																	<span className="mr-1 text-muted-foreground">
																		{childExpanded ? (
																			<ChevronDownIcon className="h-4 w-4" />
																		) : (
																			<ChevronRightIcon className="h-4 w-4" />
																		)}
																	</span>
																	<FolderIcon className="h-4 w-4 mr-2 text-yellow-400" />
																	<span className="text-sm truncate">
																		{
																			child.name
																		}
																	</span>
																</div>

																{childExpanded &&
																	child.children && (
																		<div>
																			{child.children.map(
																				(
																					grandchild
																				) => (
																					<div
																						key={
																							grandchild.path
																						}
																						className="flex items-center py-1 px-2 ml-8 cursor-pointer hover:bg-muted"
																						onClick={(
																							e
																						) => {
																							e.stopPropagation();
																							if (
																								grandchild.isDirectory
																							) {
																								handleFolderClick(
																									grandchild.path
																								);
																							} else {
																								onFileSelect(
																									grandchild
																								);
																							}
																						}}
																					>
																						{grandchild.isDirectory ? (
																							<>
																								<span className="mr-1 text-muted-foreground">
																									{expandedFolders[
																										grandchild
																											.path
																									] ? (
																										<ChevronDownIcon className="h-4 w-4" />
																									) : (
																										<ChevronRightIcon className="h-4 w-4" />
																									)}
																								</span>
																								<FolderIcon className="h-4 w-4 mr-2 text-yellow-400" />
																							</>
																						) : (
																							<>
																								<span className="w-4 mr-1"></span>
																								<FileIcon className="h-4 w-4 mr-2 text-blue-400" />
																							</>
																						)}
																						<span className="text-sm truncate">
																							{
																								grandchild.name
																							}
																						</span>
																					</div>
																				)
																			)}
																		</div>
																	)}
															</div>
														);
													} else {
														return (
															<div
																key={child.path}
																className="flex items-center py-1 px-2 ml-4 cursor-pointer hover:bg-muted"
																onClick={(
																	e
																) => {
																	e.stopPropagation();
																	onFileSelect(
																		child
																	);
																}}
															>
																<span className="w-4 mr-1"></span>
																<FileIcon className="h-4 w-4 mr-2 text-blue-400" />
																<span className="text-sm truncate">
																	{child.name}
																</span>
															</div>
														);
													}
												})}
											</div>
										)}
									</div>
								);
							} else {
								return (
									<div
										key={item.path}
										className="flex items-center py-1 px-2 cursor-pointer hover:bg-muted"
										onClick={() => onFileSelect(item)}
									>
										<span className="w-4 mr-1"></span>
										<FileIcon className="h-4 w-4 mr-2 text-blue-400" />
										<span className="text-sm truncate">
											{item.name}
										</span>
									</div>
								);
							}
						})}
					</div>
				) : (
					<div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
						<p className="text-sm text-center mb-4">
							No folder opened
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={onDirectoryOpen}
						>
							Open Folder
						</Button>
					</div>
				)}
			</ScrollArea>
		</div>
	);
}
