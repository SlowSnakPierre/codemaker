"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FileTab } from "@/lib/types";
import CodeEditor from "@/components/editor/code-editor";
import { toast } from "sonner";
import { XIcon, CircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorPanelProps {
	tabs: FileTab[];
	activeTabId: string | null;
	onTabClick: (tabId: string) => void;
	onTabClose: (tabId: string) => void;
	onContentChange: (tabId: string, content: string) => void;
	onSaveFile: (tabId: string) => void;
	onCursorPositionChange: (line: number, column: number) => void;
	onUndo?: () => void;
	onRedo?: () => void;
}

export default function EditorPanel({
	tabs,
	activeTabId,
	onTabClick,
	onTabClose,
	onContentChange,
	onSaveFile,
	onCursorPositionChange,
	onUndo,
	onRedo,
}: EditorPanelProps) {
	const tabsRef = useRef<HTMLDivElement>(null);
	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				if (activeTabId) {
					onSaveFile(activeTabId);
					toast.success("File saved successfully");
				}
			}

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

	return (
		<div className="flex flex-col h-full">
			{tabs.length > 0 ? (
				<>
					<div className="border-b border-border">
						<ScrollArea className="max-w-full">
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
												<CircleIcon
													className={`h-2 w-2 ml-1 inline-flex fill-current ${
														tab.externallyModified
															? "text-red-500"
															: "text-orange-500"
													}`}
												/>
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
									onCursorPositionChange={
										onCursorPositionChange
									}
									onUndo={onUndo}
									onRedo={onRedo}
								/>
							</div>
						))}
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
