"use client";

import React, { useEffect, useState } from "react";
import TitleBar from "./title-bar";
import { FileData, FileTab } from "@/lib/types";
import EditorPanel from "@/components/editor/editor-panel";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { toast } from "sonner";
import Sidebar from "./sidebar";
import StatusBar from "./status-bar";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
	const [isAppClosing, setIsAppClosing] = useState(false);

	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		setIsClient(false);

		if (isElectron) {
			setIsClient(true);
			window.electron
				.getSettings("lastOpenDirectory")
				.then((dir: string) => {
					if (dir) setCurrentDirectory(dir);
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
			window.electron.setSettings({
				key: "lastOpenDirectory",
				value: currentDirectory,
			});
		}
	}, [currentDirectory, isElectron]);

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
				toast.success(
					`Opened directory: ${dirPath.split(/[/\\]/).pop()}`
				);
			}
		} catch (error) {
			toast.error("Failed to open directory");
			console.error(error);
		}
	};

	const handleFileSave = async (tabId: string) => {
		if (!isElectron) return;

		const tab = tabs.find((t) => t.id === tabId);
		if (!tab) return;

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
									originalContent: t.content,
							  }
							: t
					)
				);
				toast.success(`Saved ${fileName}`);
			}
		} catch (error) {
			toast.error("Failed to save file");
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
				if (!content) throw new Error("Failed to read file");
				const newTab: FileTab = {
					id: `tab-${Date.now()}`,
					name: fileData.name,
					path: fileData.path,
					content,
					originalContent: content,
					active: true,
					language: getLanguageFromFilename(fileData.name),
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

	const getLanguageFromFilename = (filename: string) => {
		const ext = filename.split(".").pop()?.toLocaleLowerCase() || "";

		const languageMap: Record<string, string> = {
			js: "javascript",
			jsx: "javascript",
			ts: "typescript",
			tsx: "typescript",
			html: "html",
			htm: "html",
			css: "css",
			scss: "scss",
			sass: "scss",
			json: "json",
			md: "markdown",
			py: "python",
			rb: "ruby",
			go: "go",
			rs: "rust",
			java: "java",
			cpp: "cpp",
			c: "c",
			cs: "csharp",
			php: "php",
			swift: "swift",
			kt: "kotlin",
			xml: "xml",
			yml: "yaml",
			yaml: "yaml",
		};

		return languageMap[ext] || "plaintext";
	};

	const handleCursorPositionChange = (line: number, column: number) => {
		setCursorPosition({ line, column });
	};
	const handleUndo = () => {
		if (
			activeTab &&
			typeof window !== "undefined" &&
			(window as any).__MONACO_EDITOR_INSTANCE__
		) {
			(window as any).__MONACO_EDITOR_INSTANCE__.trigger(
				"keyboard",
				"undo",
				null
			);

			setTimeout(() => {
				if (activeTab && (window as any).__MONACO_EDITOR_INSTANCE__) {
					const currentContent = (
						window as any
					).__MONACO_EDITOR_INSTANCE__.getValue();

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
			(window as any).__MONACO_EDITOR_INSTANCE__
		) {
			(window as any).__MONACO_EDITOR_INSTANCE__.trigger(
				"keyboard",
				"redo",
				null
			);

			setTimeout(() => {
				if (activeTab && (window as any).__MONACO_EDITOR_INSTANCE__) {
					const currentContent = (
						window as any
					).__MONACO_EDITOR_INSTANCE__.getValue();

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
			<ResizablePanelGroup direction="horizontal" className="flex-grow">
				{!sidebarCollapsed && (
					<ResizablePanel
						defaultSize={15}
						minSize={12.5}
						maxSize={30}
						className="bg-card border-r border-border"
					>
						<Sidebar
							currentDirectory={currentDirectory}
							onFileSelect={handleFileSelect}
							onDirectoryOpen={handleDirectoryOpen}
						/>
					</ResizablePanel>
				)}
				<ResizableHandle />
				<ResizablePanel defaultSize={80} minSize={30}>
					<EditorPanel
						tabs={tabs}
						activeTabId={activeTab}
						onTabClick={handleTabClick}
						onTabClose={handleTabClose}
						onContentChange={handleContentChange}
						onSaveFile={handleFileSave}
						onCursorPositionChange={handleCursorPositionChange}
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
				cursorPosition={cursorPosition}
				tabSize={2}
				useTabs={false}
			/>{" "}
			{/* Boîte de dialogue de confirmation pour la fermeture d'onglet */}
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
						{isAppClosing ? (
							"Des fichiers ont été modifiés. Voulez-vous enregistrer les modifications avant de fermer l'onglet ?"
						) : (
							<>
								Le fichier{" "}
								{
									tabs.find((tab) => tab.id === tabToClose)
										?.name
								}{" "}
								a été modifié. Voulez-vous enregistrer les
								modifications avant de fermer l'onglet ?
							</>
						)}
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
