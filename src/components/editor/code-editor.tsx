"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { Monaco, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
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
	const { theme } = useTheme();
	// Fonction pour annuler la dernière modification
	const handleUndo = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.trigger("keyboard", "undo", null);
			// Appel du callback externe si défini
			if (onUndo) onUndo();
		}
	}, [onUndo]);

	// Fonction pour rétablir la dernière modification annulée
	const handleRedo = useCallback(() => {
		if (editorRef.current) {
			editorRef.current.trigger("keyboard", "redo", null);
			// Appel du callback externe si défini
			if (onRedo) onRedo();
		}
	}, [onRedo]);

	const handleEditorDidMount: OnMount = (editor, monaco) => {
		editorRef.current = editor;
		setIsEditorReady(true);
		contentRef.current = content;

		// Expose l'instance de l'éditeur pour les fonctions externes (comme les boutons de la barre de titre)
		if (typeof window !== "undefined") {
			(window as any).__MONACO_EDITOR_INSTANCE__ = editor;
		}

		// Register save command
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
			onSave();
		});

		// Register undo command
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
			editor.trigger("keyboard", "undo", null);
		});

		// Register redo command
		editor.addCommand(
			monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ,
			() => {
				editor.trigger("keyboard", "redo", null);
			}
		);

		// Track cursor position
		editor.onDidChangeCursorPosition((e) => {
			onCursorPositionChange(e.position.lineNumber, e.position.column);
		});

		// Set up content change listener
		editor.onDidChangeModelContent(() => {
			const value = editor.getValue();
			contentRef.current = value;
			onChange(value);
		});

		editor.focus();
	};

	// Handle theme changes
	useEffect(() => {
		if (!editorRef.current) return;

		if (theme === "dark") {
			editorRef.current.updateOptions({ theme: "vs-dark" });
		} else {
			editorRef.current.updateOptions({ theme: "vs" });
		}
	}, [theme]);

	// Configure Monaco before mounting
	const handleEditorWillMount = (monaco: Monaco) => {
		// Configure Monaco editor here if needed
		monaco.editor.defineTheme("customDark", {
			base: "vs-dark",
			inherit: true,
			rules: [],
			colors: {
				"editor.background": "#1a1a1a",
			},
		});
	};

	// Sync content with editor when it changes externally
	useEffect(() => {
		if (editorRef.current && isEditorReady) {
			// Only update if the content has actually changed and is different from what we have
			if (content !== contentRef.current) {
				// Save current cursor position and selection
				const position = editorRef.current.getPosition();
				const selection = editorRef.current.getSelection();

				// Update content
				editorRef.current.setValue(content);
				contentRef.current = content;

				// Restore cursor position and selection
				if (position) {
					editorRef.current.setPosition(position);
				}
				if (selection) {
					editorRef.current.setSelection(selection);
				}
			}
		}
	}, [content, isEditorReady]);
	// Handle keyboard shortcuts globally
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Save shortcut (Ctrl+S / Cmd+S)
			if ((e.metaKey || e.ctrlKey) && e.key === "s") {
				e.preventDefault();
				onSave();
			}

			// Undo shortcut (Ctrl+Z / Cmd+Z)
			if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === "z") {
				e.preventDefault();
				handleUndo();
			}

			// Redo shortcut (Ctrl+Shift+Z / Cmd+Shift+Z)
			if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
				e.preventDefault();
				handleRedo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onSave, handleUndo, handleRedo]);

	// Nettoyer la référence globale lorsque le composant est démonté
	useEffect(() => {
		return () => {
			if (
				typeof window !== "undefined" &&
				(window as any).__MONACO_EDITOR_INSTANCE__
			) {
				(window as any).__MONACO_EDITOR_INSTANCE__ = null;
			}
		};
	}, []);

	return (
		<Editor
			height="100%"
			width="100%"
			language={language}
			value={content}
			theme={theme === "dark" ? "vs-dark" : "vs"}
			beforeMount={handleEditorWillMount}
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
					// @ts-expect-error No type definition for this property
					enabled: true,
				},
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
				// Paramètres d'annulation/rétablissement
				undoLimit: 100, // Nombre maximum d'opérations d'annulation à conserver
			}}
		/>
	);
}
