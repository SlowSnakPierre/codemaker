"use client";

import { useRef, useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileTab } from "@/lib/types";
import CodeEditor from "@/components/editor/code-editor";
import { toast } from "sonner";
import { XIcon, CircleIcon, SaveIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorPanelProps {
	tabs: FileTab[];
	activeTabId: string | null;
	onTabClick: (tabId: string) => void;
	onTabClose: (tabId: string) => void;
	onContentChange: (tabId: string, content: string) => void;
	onSaveFile: (tabId: string) => void;
	onCursorPositionChange: (line: number, column: number) => void;
}

export default function EditorPanel({
	tabs,
	activeTabId,
	onTabClick,
	onTabClose,
	onContentChange,
	onSaveFile,
	onCursorPositionChange,
}: EditorPanelProps) {
	const tabsRef = useRef<HTMLDivElement>(null);
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
	const isElectron = typeof window !== "undefined" && window.electron;

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Save file with Cmd/Ctrl+S
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				if (activeTabId) {
					onSaveFile(activeTabId);
					toast.success("File saved successfully");
				}
			}
			
			// Close tab with Cmd/Ctrl+W
			if ((e.metaKey || e.ctrlKey) && e.key === "w") {
				e.preventDefault();
				if (activeTabId) {
					onTabClose(activeTabId);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeTabId, onSaveFile, onTabClose]);

	// Scroll active tab into view
	useEffect(() => {
		if (tabsRef.current && activeTabId) {
			const activeTabElement = tabsRef.current.querySelector(
				`[data-tab-id="${activeTabId}"]`
			);
			if (activeTabElement) {
				activeTabElement.scrollIntoView({
					behavior: "smooth",
					block: "nearest",
					inline: "nearest",
				});
			}
		}
	}, [activeTabId]);

	// Handle cursor position change
	const handleCursorPositionChange = (line: number, column: number) => {
		setCursorPosition({ line, column });
		onCursorPositionChange(line, column);
	};

	// Find active tab
	const activeTab = tabs.find(tab => tab.id === activeTabId);

	return (
		<div className="flex flex-col h-full">
			{tabs.length > 0 ? (
				<>
					<div className="border-b border-border">
						<ScrollArea
							orientation="horizontal"
							className="max-w-full"
						>
							<div className="flex" ref={tabsRef}>
								{tabs.map((tab) => (
									<div
										key={tab.id}
										data-tab-id={tab.id}
										className={cn(
											"flex items-center h-9 px-4 border-r border-border cursor-pointer group whitespace-nowrap transition-colors",
											tab.id === activeTabId
												? "bg-background text-foreground"
												: "bg-muted text-muted-foreground hover:bg-muted/80"
										)}
										onClick={() => onTabClick(tab.id)}
									>
										<span className="max-w-[140px] truncate flex-1 flex items-center">
											{tab.name}
											{tab.modified && (
												<CircleIcon className="h-2 w-2 ml-1 inline-flex fill-current text-orange-500" />
											)}
										</span>
										<button
											className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/10 p-0.5 rounded transition-opacity"
											onClick={(e) => {
												e.stopPropagation();
												onTabClose(tab.id);
											}}
											title="Close tab (Cmd+W)"
										>
											<XIcon className="h-3.5 w-3.5" />
										</button>
									</div>
								))}
							</div>
						</ScrollArea>
					</div>

					<div className="flex-grow relative overflow-hidden">
						{tabs.map((tab) => (
							<div
								key={tab.id}
								className={`h-full ${
									tab.id === activeTabId ? "block" : "hidden"
								}`}
							>
								<CodeEditor
									path={tab.path}
									content={tab.content}
									language={tab.language}
									onChange={(value) =>
										onContentChange(tab.id, value)
									}
									onSave={() => onSaveFile(tab.id)}
									onCursorPositionChange={handleCursorPositionChange}
								/>
							</div>
						))}
					</div>

					{/* Status bar */}
					<div className="h-6 border-t border-border bg-muted text-muted-foreground text-xs flex items-center px-4 justify-between">
						<div className="flex items-center space-x-4">
							<span>
								Ln {cursorPosition.line}, Col {cursorPosition.column}
							</span>
							{activeTab && (
								<span className="capitalize">{activeTab.language}</span>
							)}
						</div>
						<div className="flex items-center">
							{activeTab?.modified && (
								<button 
									onClick={() => activeTabId && onSaveFile(activeTabId)}
									className="flex items-center hover:text-foreground transition-colors"
									title="Save file (Cmd+S)"
								>
									<SaveIcon className="h-3.5 w-3.5 mr-1" />
									<span>Save</span>
								</button>
							)}
						</div>
					</div>
				</>
			) : (
				<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
					<div className="max-w-md text-center">
						<h3 className="text-xl font-semibold mb-4">
							Welcome to Next Electron Code Editor
						</h3>
						<p className="mb-6">
							Open a file or folder to get started
						</p>
						<div className="flex gap-4 justify-center">
							<button
								className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
								onClick={() => {
									if (isElectron) {
										window.electron.openFile();
									} else {
										toast.error(
											"File system access is only available in the Electron app"
										);
									}
								}}
							>
								Open File
							</button>
							<button
								className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90 transition-colors"
								onClick={() => {
									if (isElectron) {
										window.electron.openDirectory();
									} else {
										toast.error(
											"File system access is only available in the Electron app"
										);
									}
								}}
							>
								Open Folder
							</button>
						</div>
						<p className="mt-6 text-sm flex justify-center gap-3">
							<kbd className="px-2 py-1 bg-muted rounded border border-border">
								Cmd+O
							</kbd>
							<span>to open files</span>
							<kbd className="px-2 py-1 bg-muted rounded border border-border">
								Cmd+S
							</kbd>
							<span>to save</span>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
