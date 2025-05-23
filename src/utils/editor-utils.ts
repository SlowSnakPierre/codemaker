import type { editor } from "monaco-editor";
import { type FileTab } from "@types";

/**
 * Utilitaires pour l'éditeur de code
 */

/**
 * Détermine le langage à utiliser dans l'éditeur en fonction du nom de fichier
 * @param filename Nom du fichier
 * @returns Identifiant du langage pour Monaco Editor
 */
export function getLanguageFromFilename(filename: string): string {
	const extension = filename.split(".").pop()?.toLowerCase() || "";

	const languageMap: Record<string, string> = {
		html: "html",
		htm: "html",
		css: "css",
		scss: "scss",
		sass: "scss",
		less: "less",

		js: "javascript",
		jsx: "javascript",
		ts: "typescript",
		tsx: "typescript",
		mjs: "javascript",
		cjs: "javascript",

		json: "json",
		jsonc: "jsonc",
		babelrc: "json",
		eslintrc: "json",
		prettierrc: "json",

		md: "markdown",
		markdown: "markdown",
		xml: "xml",
		svg: "xml",
		yaml: "yaml",
		yml: "yaml",
		toml: "toml",

		py: "python",
		rb: "ruby",
		php: "php",
		java: "java",
		c: "c",
		cpp: "cpp",
		h: "cpp",
		cs: "csharp",
		go: "go",
		rs: "rust",
		swift: "swift",
		kt: "kotlin",
		dart: "dart",

		sh: "shell",
		bash: "shell",
		zsh: "shell",
		fish: "shell",
		bat: "bat",
		ps1: "powershell",

		sql: "sql",
		graphql: "graphql",
		dockerfile: "dockerfile",
		gitignore: "plaintext",
		env: "plaintext",
	};

	if (!extension || extension === filename) {
		const lowercaseFilename = filename.toLowerCase();
		if (lowercaseFilename === "dockerfile") return "dockerfile";
		if (lowercaseFilename === ".gitignore") return "plaintext";
		if (lowercaseFilename === ".env") return "plaintext";
		if (lowercaseFilename.startsWith(".env.")) return "plaintext";
		return "plaintext";
	}

	return languageMap[extension] || "plaintext";
}

/**
 * Crée un nouvel onglet de fichier
 * @param id Identifiant unique
 * @param name Nom du fichier
 * @param path Chemin du fichier
 * @param content Contenu du fichier
 * @param language Langage utilisé
 * @param languageOverride Surcharge manuelle du langage (optionnel)
 * @returns Objet FileTab
 */
export function createTab(
	id: string,
	name: string,
	path: string | null,
	content: string,
	language: string,
	languageOverride?: string | null,
): FileTab {
	return {
		id,
		name,
		path,
		content,
		originalContent: content,
		language,
		languageOverride,
		active: false,
		modified: false,
	};
}

/**
 * Génère un identifiant unique pour un nouvel onglet
 * @returns Identifiant unique
 */
export function generateTabId(): string {
	return `tab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Vérifie si des onglets ont des modifications non sauvegardées
 * @param tabs Liste des onglets
 * @returns true si au moins un onglet a des modifications non sauvegardées
 */
export function hasUnsavedChanges(tabs: FileTab[]): boolean {
	return tabs.some((tab) => tab.modified);
}

/**
 * Formate le code selon le langage spécifié
 * @param editor Instance de l'éditeur Monaco
 * @param language Langage du code
 */
export function formatCode(editor: editor.IStandaloneCodeEditor): void {
	editor.getAction("editor.action.formatDocument")?.run();
}

/**
 * Configure les options de base pour Monaco Editor
 * @param fontSize Taille de la police
 * @param tabSize Taille des tabulations
 * @param wordWrap Activation du retour à la ligne automatique
 * @returns Options de configuration
 */
export function getDefaultEditorOptions(
	fontSize: number = 14,
	tabSize: number = 2,
	wordWrap: boolean = true,
): editor.IStandaloneEditorConstructionOptions {
	return {
		fontSize,
		tabSize,
		wordWrap: wordWrap ? "on" : "off",
		automaticLayout: true,
		minimap: {
			enabled: true,
		},
		scrollBeyondLastLine: false,
		lineNumbers: "on",
		renderLineHighlight: "all",
		renderWhitespace: "none",
		bracketPairColorization: {
			enabled: true,
		},
	};
}
