/**
 * Types liés aux paramètres de l'application
 */

import type { EditorSettings } from "./editor";

/**
 * Projet récent
 */
export interface RecentProject {
	name: string;
	path: string;
	lastOpened: string;
}

/**
 * Paramètres de l'application
 */
export interface AppSettings {
	theme: "light" | "dark" | "system";
	editorSettings: EditorSettings;
	recentProjects: string[];
	lastOpenedFiles: string[];
}
