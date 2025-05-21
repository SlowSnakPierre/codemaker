import type { FileTab } from "@/lib/types";

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
		originalContent: content,
		language,
		languageOverride,
		active: false,
		modified: false,
	};
}

export function generateTabId(): string {
	return `tab-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function hasUnsavedChanges(tabs: FileTab[]): boolean {
	return tabs.some((tab) => tab.modified);
}

export function getFilenameFromPath(path: string): string {
	return path.split("/").pop() || path;
}

export function updateTabContent(
	tabs: FileTab[],
	tabId: string,
	newContent: string,
	isExternalUpdate = false
): FileTab[] {
	return tabs.map((tab) => {
		if (tab.id === tabId) {
			if (isExternalUpdate) {
				return {
					...tab,
					content: newContent,
					originalContent: newContent,
					modified: false,
				};
			}

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

export function syncFileContent(
	tabs: FileTab[],
	path: string,
	newContent: string
): FileTab[] {
	return tabs.map((tab) => {
		if (tab.path === path) {
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
