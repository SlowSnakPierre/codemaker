"use client";

import React, { useCallback, useEffect, useState } from "react";
import TitleBar from "./topbar";
import type {
	FileData,
	FileTab,
	FileChangeEvent,
	RecentProject,
} from "@/lib/types";
import EditorPanel from "@/components/editor/editor-panel";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import Sidebar from "../sidebar";
import StatusBar from "../status-bar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getLanguageFromFilename } from "@/lib/editor-utils";
import {
	startWatcherHealthCheck,
	stopWatcherHealthCheck,
} from "@/lib/watcher-utils";
import PageSelector from "../sidebar/page-selector";

const ElectronLayout = () => {
	const [isClient, setIsClient] = useState(false);
	const [activeTab, setActiveTab] = useState<string | null>(null);
	const [tabs, setTabs] = useState<FileTab[]>([]);
	const [currentDirectory, setCurrentDirectory] = useState<string | null>(
		null
	);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [cursorPosition, setCursorPosition] = useState({
		line: 1,
		column: 1,
	});
	const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
	const [tabToClose, setTabToClose] = useState<string | null>(null);
	const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

	const isElectron = typeof window !== "undefined" && window.electron;

	const savedRecentProjects = useCallback(
		async (projects: RecentProject[]) => {
			if (!isElectron) return;

			try {
				await window.electron.setSettings({
					key: "recentProjects",
					value: projects,
				});
			} catch (error) {
				console.error("Failed to save recent projects:", error);
			}
		},
		[isElectron]
	);

	const addRecentProject = async (directoryPath: string) => {
		if (!isElectron) return;

		try {
			const dirName = directoryPath.split(/[/\\]/).pop() || "Unknown";
			const newProject: RecentProject = {
				name: dirName,
				path: directoryPath,
				lastOpened: new Date().toISOString(),
			};

			setRecentProjects((prevProjects) => {
				const filteredProjects = prevProjects.filter(
					(p) => p.path !== directoryPath
				);
				const updatedProjects = [newProject, ...filteredProjects].slice(
					0,
					10
				);
				savedRecentProjects(updatedProjects);
				return updatedProjects;
			});
		} catch (error) {
			console.error("Failed to add recent project:", error);
		}
	};

	const toggleSidebar = () => {
		setSidebarCollapsed((prev) => !prev);
	};

	const handleFileOpen = async () => {
		if (!isElectron) return;

		try {
			const result = await window.electron.openFile();
			if (result) {
				const { path, content } = result;
				const fileName = path.split(/[/\\]/).pop() || "Untitled";
				if (tabs.some((tab) => tab.path === path)) {
					setActiveTab(
						tabs.find((tab) => tab.path === path)?.id || null
					);
					return;
				}

				const newTab: FileTab = {
					id: `tab-${Date.now()}`,
					name: fileName,
					path,
					content,
					active: true,
					language: getLanguageFromFilename(fileName),
				};

				setTabs((prevTabs) => [
					...prevTabs.map((tab) => ({ ...tab, active: false })),
					newTab,
				]);

				setActiveTab(newTab.id);
				toast.success(`Opened ${fileName}`);
			}
		} catch (error) {
			toast.error("Failed to open file");
			console.error(error);
		}
	};

	const handleDirectoryOpen = async () => {
		if (!isElectron) return;

		try {
			const dirPath = await window.electron.openDirectory();
			if (dirPath) {
				setCurrentDirectory(dirPath);
				await addRecentProject(dirPath);
				toast.success(
					`Opened directory: ${dirPath.split(/[/\\]/).pop()}`
				);
			}
		} catch (error) {
			toast.error("Failed to open directory");
			console.error(error);
		}
	};

	const handleSpecificDirectoryOpen = async (dir: string) => {
		if (!isElectron) return;

		try {
			setCurrentDirectory(dir);
			await addRecentProject(dir);

			window.electron
				.restartWatcher(dir)
				.then(() => console.log("Watcher redémarré pour:", dir))
				.catch((err) =>
					console.error("Échec du redémarrage du watcher:", err)
				);

			toast.success(`Opened directory: ${dir.split(/[/\\]/).pop()}`);
		} catch (error) {
			toast.error("Failed to open directory");
			console.error(error);
		}
	};

	const handleDirectoryClose = () => {
		setCurrentDirectory(null);
		if (isElectron) {
			window.electron.setSettings({
				key: "lastOpenDirectory",
				value: null,
			});
		}
	};

	const handleFileSave = async (tabId: string) => {
		if (!isElectron) return;

		const tab = tabs.find((t) => t.id === tabId);
		if (!tab) return;

		if (tab.externallyModified && tab.path) {
			const confirmSave = window.confirm(
				`Le fichier "${tab.name}" a été modifié en dehors de l'éditeur. Voulez-vous vraiment l'écraser ?`
			);

			if (!confirmSave) {
				const confirmReload = window.confirm(
					"Voulez-vous recharger le fichier depuis le disque ?"
				);

				if (confirmReload) {
					try {
						const content = await window.electron.readFile(
							tab.path
						);
						if (content !== null) {
							setTabs((prevTabs) =>
								prevTabs.map((t) =>
									t.id === tabId
										? {
												...t,
												content,
												originalContent: content,
												modified: false,
												externallyModified: false,
										  }
										: t
								)
							);
							toast.success(`Fichier ${tab.name} rechargé`);
						}
					} catch (error) {
						toast.error(
							`Impossible de recharger le fichier ${tab.name}`
						);
						console.error(error);
					}
				}
				return;
			}
		}

		try {
			const savedPath = await window.electron.saveFile({
				path: tab.path || "",
				content: tab.content,
			});

			if (savedPath) {
				const fileName = savedPath.split(/[/\\]/).pop();
				setTabs((prevTabs) =>
					prevTabs.map((t) =>
						t.id === tabId
							? {
									...t,
									path: savedPath,
									name: fileName || "Untitled",
									modified: false,
									externallyModified: false,
									originalContent: t.content,
							  }
							: t
					)
				);
				toast.success(`Sauvegardé: ${fileName}`);
			}
		} catch (error) {
			toast.error("Échec de la sauvegarde du fichier");
			console.error(error);
		}
	};

	const handleTabClick = async (tabId: string) => {
		setActiveTab(tabId);
		setTabs((prevTabs) =>
			prevTabs.map((tab) => ({
				...tab,
				active: tab.id === tabId,
			}))
		);
	};

	const handleTabClose = async (tabId: string) => {
		const tabToClose = tabs.find((tab) => tab.id === tabId);

		if (tabToClose?.modified) {
			setTabToClose(tabId);
			setIsCloseDialogOpen(true);
			return;
		}

		closeTab(tabId);
	};

	const closeTab = (tabId: string) => {
		const isActiveTab = tabs.find((tab) => tab.id === tabId)?.active;

		setTabs((prevTabs) => {
			const filtered = prevTabs.filter((tab) => tab.id !== tabId);

			if (isActiveTab && filtered.length > 0) {
				const newActiveIndex = Math.min(
					prevTabs.findIndex((tab) => tab.id === tabId),
					filtered.length - 1
				);
				filtered[newActiveIndex].active = true;
				setActiveTab(filtered[newActiveIndex].id);
			} else if (filtered.length === 0) {
				setActiveTab(null);
			}

			return filtered;
		});
	};

	const handleContentChange = async (tabId: string, newContent: string) => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) => {
				if (tab.id === tabId) {
					const isOriginalContent =
						tab.originalContent === newContent;
					return {
						...tab,
						content: newContent,
						modified: !isOriginalContent,
					};
				}
				return tab;
			})
		);
	};

	const handleFileSelect = async (fileData: FileData) => {
		if (!isElectron) return;
		if (fileData.isDirectory) return;

		if (tabs.some((tab) => tab.path == fileData.path)) {
			setActiveTab(
				tabs.find((tab) => tab.path === fileData.path)?.id || null
			);
			return;
		}

		window.electron
			.readFile(fileData.path)
			.then((content: string | null) => {
				if (content === null) throw new Error("Failed to read file");
				const detectedLanguage = getLanguageFromFilename(fileData.name);

				const newTab: FileTab = {
					id: `tab-${Date.now()}`,
					name: fileData.name,
					path: fileData.path,
					content,
					originalContent: content,
					active: true,
					language: detectedLanguage,
					languageOverride: null,
				};

				setTabs((prevTabs) => [
					...prevTabs.map((tab) => ({ ...tab, active: false })),
					newTab,
				]);
				setActiveTab(newTab.id);
			})
			.catch((error) => {
				toast.error(`Failed to open ${fileData.name}`);
				console.error(error);
			});
	};

	const handleCursorPositionChange = (line: number, column: number) => {
		setCursorPosition({ line, column });
	};

	const handleLanguageChange = (language: string) => {
		if (!activeTab) return;

		setTabs((prevTabs) =>
			prevTabs.map((tab) => {
				if (tab.id === activeTab) {
					const finalLanguage =
						language === "auto"
							? getLanguageFromFilename(tab.name)
							: language;

					return {
						...tab,
						language: finalLanguage,

						languageOverride: language === "auto" ? null : language,
					};
				}
				return tab;
			})
		);
	};

	const handleUndo = () => {
		if (
			activeTab &&
			typeof window !== "undefined" &&
			window.__MONACO_EDITOR_INSTANCE__
		) {
			window.__MONACO_EDITOR_INSTANCE__.trigger("keyboard", "undo", null);

			setTimeout(() => {
				if (activeTab && window.__MONACO_EDITOR_INSTANCE__) {
					const currentContent =
						window.__MONACO_EDITOR_INSTANCE__.getValue();

					setTabs((prevTabs) =>
						prevTabs.map((tab) => {
							if (tab.id === activeTab) {
								const isOriginalContent =
									tab.originalContent === currentContent;
								return { ...tab, modified: !isOriginalContent };
							}
							return tab;
						})
					);
				}
			}, 0);
		}
	};

	const handleRedo = () => {
		if (
			activeTab &&
			typeof window !== "undefined" &&
			window.__MONACO_EDITOR_INSTANCE__
		) {
			window.__MONACO_EDITOR_INSTANCE__.trigger("keyboard", "redo", null);

			setTimeout(() => {
				if (activeTab && window.__MONACO_EDITOR_INSTANCE__) {
					const currentContent =
						window.__MONACO_EDITOR_INSTANCE__.getValue();

					setTabs((prevTabs) =>
						prevTabs.map((tab) => {
							if (tab.id === activeTab) {
								const isOriginalContent =
									tab.originalContent === currentContent;
								return { ...tab, modified: !isOriginalContent };
							}
							return tab;
						})
					);
				}
			}, 0);
		}
	};

	const handleSaveAndClose = async () => {
		if (tabToClose) {
			await handleFileSave(tabToClose);
			closeTab(tabToClose);
			setIsCloseDialogOpen(false);
			setTabToClose(null);
		}
	};

	const handleCloseWithoutSaving = () => {
		if (tabToClose) {
			closeTab(tabToClose);
			setIsCloseDialogOpen(false);
			setTabToClose(null);
		}
	};

	const handleCancelClose = () => {
		setIsCloseDialogOpen(false);
		setTabToClose(null);
	};

	useEffect(() => {
		const loadRecentProjects = async () => {
			if (!isElectron) return;

			try {
				const savedRecentProjects = await window.electron.getSettings(
					"recentProjects"
				);
				if (savedRecentProjects && Array.isArray(savedRecentProjects)) {
					setRecentProjects(savedRecentProjects);
				}
			} catch (error) {
				console.error("Failed to load recent projects:", error);
			}
		};

		setIsClient(false);

		if (isElectron) {
			setIsClient(true);

			loadRecentProjects();

			window.electron
				.getSettings("lastOpenDirectory")
				.then((dir: string) => {
					if (dir) {
						setCurrentDirectory(dir);

						window.electron
							.restartWatcher(dir)
							.then(() =>
								console.log("Watcher redémarré pour:", dir)
							)
							.catch((err) =>
								console.error(
									"Échec du redémarrage du watcher:",
									err
								)
							);
					}
				});

			window.electron.getSettings("tabs").then((savedTabs: FileTab[]) => {
				if (savedTabs?.length) {
					setTabs(savedTabs);
					if (savedTabs.length > 0) {
						const lastActiveTab =
							savedTabs.find((tab) => tab.active)?.id ||
							savedTabs[0].id;
						setActiveTab(lastActiveTab);
					}
				}
			});
		}
	}, [isElectron]);

	useEffect(() => {
		if (isElectron && tabs.length > 0) {
			window.electron.setSettings({ key: "tabs", value: tabs });
		}
	}, [tabs, isElectron]);

	useEffect(() => {
		if (isElectron && currentDirectory) {
			startWatcherHealthCheck(currentDirectory, 60000);
		} else {
			stopWatcherHealthCheck();
		}

		return () => {
			stopWatcherHealthCheck();
		};
	}, [isElectron, currentDirectory]);

	useEffect(() => {
		if (!isElectron || !currentDirectory) return;

		window.electron.setSettings({
			key: "lastOpenDirectory",
			value: currentDirectory,
		});

		window.electron
			.restartWatcher(currentDirectory)
			.catch((err) =>
				console.error("Erreur lors du redémarrage du watcher:", err)
			);

		const handleFileChange = (data: FileChangeEvent) => {
			const fileName = data.path.split(/[/\\]/).pop() || "";
			if (data.type === "add" || data.type === "change") {
				const tabToUpdate = tabs.find((t) => t.path === data.path);
				if (tabToUpdate) {
					setTabs((prevTabs) =>
						prevTabs.map((t) =>
							t.id === tabToUpdate.id
								? {
										...t,
										externallyModified: true,
								  }
								: t
						)
					);

					toast.info(
						`Le fichier ${fileName} a été modifié en dehors de l'éditeur.`,
						{
							action: {
								label: "Recharger",
								onClick: () => {
									(async () => {
										try {
											const content =
												await window.electron.readFile(
													data.path
												);
											if (content !== null) {
												setTabs((prevTabs) =>
													prevTabs.map((t) =>
														t.id === tabToUpdate.id
															? {
																	...t,
																	content,
																	originalContent:
																		content,
																	modified:
																		false,
																	externallyModified:
																		false,
															  }
															: t
													)
												);
												toast.success(
													`Fichier ${fileName} rechargé`
												);
											}
										} catch (error) {
											toast.error(
												`Impossible de recharger le fichier ${fileName}`
											);
											console.error(error);
										}
									})();
								},
							},
						}
					);
				}
			}

			if (data.type === "unlink") {
				const tabToUpdate = tabs.find((t) => t.path === data.path);
				if (tabToUpdate) {
					toast.warning(`Le fichier ${fileName} a été supprimé.`, {
						action: {
							label: "Fermer l'onglet",
							onClick: () => {
								const isActiveTab = tabs.find(
									(tab) => tab.id === tabToUpdate.id
								)?.active;

								setTabs((prevTabs) => {
									const filtered = prevTabs.filter(
										(tab) => tab.id !== tabToUpdate.id
									);

									if (isActiveTab && filtered.length > 0) {
										const newActiveIndex = Math.min(
											prevTabs.findIndex(
												(tab) =>
													tab.id === tabToUpdate.id
											),
											filtered.length - 1
										);
										filtered[newActiveIndex].active = true;
										setActiveTab(
											filtered[newActiveIndex].id
										);
									} else if (filtered.length === 0) {
										setActiveTab(null);
									}

									return filtered;
								});
							},
						},
					});

					setTabs((prevTabs) =>
						prevTabs.map((t) =>
							t.id === tabToUpdate.id
								? {
										...t,
										modified: true,
										externallyModified: true,
								  }
								: t
						)
					);
				}
			}
		};

		window.electron.on("fs:fileChanged", handleFileChange);

		return () => {
			window.electron.off("fs:fileChanged");
		};
	}, [currentDirectory, isElectron, tabs]);

	useEffect(() => {
		const validateRecentProject = async (directoryPath: string) => {
			if (!isElectron) return false;

			console.log(directoryPath);

			try {
				const result = await window.electron.directoryExists(
					directoryPath
				);
				console.log(result);
				return result;
			} catch (error) {
				console.error("Failed to validate recent project:", error);
				return false;
			}
		};

		const cleanupRecentProjects = async () => {
			if (!isElectron || recentProjects.length === 0) return;

			const validProjects: RecentProject[] = [];
			for (const project of recentProjects) {
				const isValid = await validateRecentProject(project.path);
				if (isValid) {
					validProjects.push(project);
				}
			}

			if (validProjects.length !== recentProjects.length) {
				setRecentProjects(validProjects);
				await savedRecentProjects(validProjects);
			}
		};

		if (isElectron && recentProjects.length > 0) {
			cleanupRecentProjects();
		}
	}, [
		isElectron,
		recentProjects,
		recentProjects.length,
		savedRecentProjects,
	]);

	if (!isClient) {
		return null;
	}

	return (
		<div className="flex flex-col h-screen overflow-hidden">
			<TitleBar
				isElectron={isClient}
				onOpenFile={handleFileOpen}
				onOpenDirectory={handleDirectoryOpen}
				onSaveFile={() => activeTab && handleFileSave(activeTab)}
				onToggleSidebar={toggleSidebar}
				onUndo={handleUndo}
				onRedo={handleRedo}
			/>
			<ResizablePanelGroup direction="horizontal">
				{!sidebarCollapsed && (
					<>
						<PageSelector />
						<ResizablePanel
							defaultSize={15}
							minSize={15}
							maxSize={20}
						>
							<Sidebar
								currentDirectory={currentDirectory}
								onFileSelect={handleFileSelect}
								onDirectoryOpen={handleDirectoryOpen}
								onDirectoryClose={handleDirectoryClose}
								activeTab={tabs.find(
									(tab) => tab.id === activeTab
								)}
							/>
						</ResizablePanel>
					</>
				)}
				<ResizableHandle />
				<ResizablePanel defaultSize={80} minSize={30}>
					<EditorPanel
						tabs={tabs}
						activeTabId={activeTab}
						recentProjects={recentProjects}
						onTabClick={handleTabClick}
						onTabClose={handleTabClose}
						onContentChange={handleContentChange}
						onSaveFile={handleFileSave}
						onCursorPositionChange={handleCursorPositionChange}
						onOpenFile={handleFileOpen}
						onDirectoryOpen={handleDirectoryOpen}
						onSpecificDirectoryOpen={handleSpecificDirectoryOpen}
						onUndo={handleUndo}
						onRedo={handleRedo}
					/>
				</ResizablePanel>
			</ResizablePanelGroup>
			<StatusBar
				activeFile={
					tabs.find((tab) => tab.id === activeTab)?.name || null
				}
				language={
					tabs.find((tab) => tab.id === activeTab)?.language || null
				}
				languageOverride={
					tabs.find((tab) => tab.id === activeTab)?.languageOverride
				}
				cursorPosition={cursorPosition}
				tabSize={2}
				useTabs={false}
				onLanguageChange={handleLanguageChange}
				currentDirectory={currentDirectory}
			/>
			<Dialog
				open={isCloseDialogOpen}
				onOpenChange={setIsCloseDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Enregistrer les modifications ?
						</DialogTitle>
					</DialogHeader>
					<div className="py-3">
						Le fichier{" "}
						{tabs.find((tab) => tab.id === tabToClose)?.name} a été
						modifié. Voulez-vous enregistrer les modifications avant
						de fermer l&apos;onglet ?
					</div>
					<DialogFooter className="flex justify-between sm:justify-between">
						<Button variant="outline" onClick={handleCancelClose}>
							Annuler
						</Button>
						<div className="flex gap-2">
							<Button
								variant="destructive"
								onClick={handleCloseWithoutSaving}
							>
								Fermer sans enregistrer
							</Button>
							<Button onClick={handleSaveAndClose}>
								Sauvegarder
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default ElectronLayout;
