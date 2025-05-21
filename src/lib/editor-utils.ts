import { FileTab } from "@/lib/types";

/**
 * Determines the language for syntax highlighting based on file extension
 */
export function getLanguageFromFilename(filename: string): string {
	const extension = filename.split(".").pop()?.toLowerCase() || "";

	const languageMap: Record<string, string> = {
		// Web
		html: "html",
		htm: "html",
		css: "css",
		scss: "scss",
		sass: "scss",
		less: "less",

		// JavaScript family
		js: "javascript",
		jsx: "javascript",
		ts: "typescript",
		tsx: "typescript",
		mjs: "javascript",
		cjs: "javascript",

		// JSON & config
		json: "json",
		jsonc: "jsonc",
		babelrc: "json",
		eslintrc: "json",
		prettierrc: "json",

		// Markup
		md: "markdown",
		markdown: "markdown",
		xml: "xml",
		svg: "xml",
		yaml: "yaml",
		yml: "yaml",
		toml: "toml",

		// Programming languages
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

		// Shell
		sh: "shell",
		bash: "shell",
		zsh: "shell",
		fish: "shell",
		bat: "bat",
		ps1: "powershell",

		// Other
		sql: "sql",
		graphql: "graphql",
		dockerfile: "dockerfile",
		gitignore: "plaintext",
		env: "plaintext",
	};

	// Handle special filenames without extensions
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
 * Creates a new tab object
 */
export function createTab(
	id: string,
	name: string,
	path: string | null,
	content: string,
	language: string,
	languageOverride?: string | null
): FileTab {
	return {
		id,
		name,
		path,
		content,
		originalContent: content, // Stocker le contenu original
		language, // Langage détecté ou forcé
		languageOverride, // null = auto-détection, string = langage forcé
		active: false,
		modified: false,
	};
}

/**
 * Generates a unique ID for a new tab
 */
export function generateTabId(): string {
	return `tab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Checks if a file has unsaved changes
 */
export function hasUnsavedChanges(tabs: FileTab[]): boolean {
	return tabs.some((tab) => tab.modified);
}

/**
 * Gets the filename from a path
 */
export function getFilenameFromPath(path: string): string {
	return path.split("/").pop() || path;
}

/**
 * Updates a tab's content and handles modified state
 */
export function updateTabContent(
	tabs: FileTab[],
	tabId: string,
	newContent: string,
	isExternalUpdate = false
): FileTab[] {
	return tabs.map((tab) => {
		if (tab.id === tabId) {
			// If it's an external update, we don't want to mark the file as modified
			if (isExternalUpdate) {
				return {
					...tab,
					content: newContent,
					originalContent: newContent,
					modified: false,
				};
			}
			// Otherwise, mark as modified only if content has changed from original
			const isOriginalContent = tab.originalContent === newContent;
			return {
				...tab,
				content: newContent,
				modified: !isOriginalContent,
			};
		}
		return tab;
	});
}

/**
 * Syncs file content from external source
 */
export function syncFileContent(
	tabs: FileTab[],
	path: string,
	newContent: string
): FileTab[] {
	return tabs.map((tab) => {
		if (tab.path === path) {
			// Only update if the tab is not modified by the user
			if (!tab.modified) {
				return {
					...tab,
					content: newContent,
					originalContent: newContent,
				};
			}
		}
		return tab;
	});
}
