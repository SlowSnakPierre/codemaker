/**
 * Types liés à l'éditeur
 */

/**
 * Onglet de fichier
 */
export interface FileTab {
	id: string;
	name: string;
	path: string | null;
	content: string;
	originalContent: string;
	language: string;
	languageOverride?: string | null;
	active: boolean;
	modified: boolean;
}

/**
 * Paramètres de l'éditeur
 */
export interface EditorSettings {
	fontSize: number;
	tabSize: number;
	wordWrap: boolean;
	lineNumbers: boolean;
	minimap: boolean;
}
