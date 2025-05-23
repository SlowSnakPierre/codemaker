"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useTheme } from "next-themes";

interface CodeEditorProps {
	path: string | null;
	content: string;
	language: string;
	onChange: (value: string) => void;
	onSave: () => void;
	onCursorPositionChange: (line: number, column: number) => void;
	onUndo?: () => void;
	onRedo?: () => void;
}

export default function CodeEditor({
	content,
	language,
	onChange,
	onSave,
	onCursorPositionChange,
	onUndo,
	onRedo,
}: CodeEditorProps) {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const [isEditorReady, setIsEditorReady] = useState(false);
	const contentRef = useRef<string>(content);
	const { resolvedTheme } = useTheme();
	const handleUndo = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.trigger("keyboard", "undo", null);

			const currentContent = editorRef.current.getValue();
			contentRef.current = currentContent;
			onChange(currentContent);

			if (onUndo) onUndo();
		}
	}, [onChange, onUndo]);

	const handleRedo = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.trigger("keyboard", "redo", null);

			const currentContent = editorRef.current.getValue();
			contentRef.current = currentContent;
			onChange(currentContent);

			if (onRedo) onRedo();
		}
	}, [onChange, onRedo]);

	const handleEditorDidMount: OnMount = (editor, _monaco) => {
		editorRef.current = editor;
		setIsEditorReady(true);
		contentRef.current = content;

		if (typeof window !== "undefined") {
			window.__MONACO_EDITOR_INSTANCE__ = editor;
		}

		editor.onDidChangeCursorPosition((e) => {
			onCursorPositionChange(e.position.lineNumber, e.position.column);
		});

		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			contentRef.current = value;
			onChange(value);
		});

		editor.focus();
	};

	useEffect(() => {
		if (!editorRef.current) return;

		if (resolvedTheme === "dark") {
			editorRef.current.updateOptions({ theme: "vs-dark" });
		} else {
			editorRef.current.updateOptions({ theme: "vs" });
		}
	}, [resolvedTheme]);

	useEffect(() => {
		if (editorRef.current && isEditorReady) {
			if (content !== contentRef.current) {
				const position = editorRef.current.getPosition();
				const selection = editorRef.current.getSelection();

				editorRef.current.setValue(content);
				contentRef.current = content;

				if (position) {
					editorRef.current.setPosition(position);
				}
				if (selection) {
					editorRef.current.setSelection(selection);
				}
			}
		}
	}, [content, isEditorReady]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "z") {
				e.preventDefault();
				handleUndo();
			}

			if ((e.metaKey || e.ctrlKey) && e.key === "y") {
				e.preventDefault();
				handleRedo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onSave, handleUndo, handleRedo]);

	useEffect(() => {
		return () => {
			if (
				typeof window !== "undefined" &&
				window.__MONACO_EDITOR_INSTANCE__
			) {
				window.__MONACO_EDITOR_INSTANCE__ = null;
			}
		};
	}, []);

	return (
		<Editor
			height="100%"
			width="100%"
			language={language}
			value={content}
			theme={resolvedTheme === "dark" ? "vs-dark" : "vs"}
			onMount={handleEditorDidMount}
			options={{
				automaticLayout: true,
				fontSize: 14,
				lineHeight: 21,
				minimap: { enabled: true },
				scrollBeyondLastLine: false,
				renderLineHighlight: "all",
				rulers: [],
				lightbulb: {
					enabled: "on",
				} as editor.IEditorLightbulbOptions,
				suggestOnTriggerCharacters: true,
				quickSuggestions: true,
				scrollbar: {
					vertical: "auto",
					horizontal: "auto",
					verticalScrollbarSize: 10,
					horizontalScrollbarSize: 10,
				},
				tabSize: 2,
				wordWrap: "on",
				wordBasedSuggestions: "currentDocument",
				autoIndent: "advanced",
				formatOnPaste: true,
				smoothScrolling: true,
				cursorBlinking: "smooth",
				cursorSmoothCaretAnimation: "on",
				bracketPairColorization: {
					enabled: true,
				},
				guides: {
					bracketPairs: true,
					indentation: true,
				},
				folding: true,
				foldingStrategy: "auto",
				showFoldingControls: "always",
				links: true,
				contextmenu: true,
				find: {
					addExtraSpaceOnTop: false,
					autoFindInSelection: "never",
					seedSearchStringFromSelection: "always",
				},
			}}
		/>
	);
}
