/**
 * Types liés au système de fichiers
 */

/**
 * Information sur un fichier
 */
export interface FileInfo {
	name: string;
	path: string;
	isDirectory: boolean;
	size?: number;
	lastModified?: Date;
}

/**
 * Événement de changement de fichier
 */
export interface FileChangeEvent {
	type: "add" | "change" | "delete" | "addDir" | "deleteDir";
	path: string;
}

/**
 * Résultat de la création d'un fichier
 */
export interface CreateFileResult {
	success: boolean;
	message?: string;
	file?: FileData;
}

/**
 * Résultat de la création d'un répertoire
 */
export interface CreateDirectoryResult {
	success: boolean;
	message?: string;
	directory?: FileData;
}

/**
 * Résultat de l'identification du type de fichier
 */
export interface FileTypeResult {
	success: boolean;
	message?: string;
	extension?: string;
}

/**
 * Résultat du rafraîchissement d'un répertoire
 */
export interface RefreshDirectoryResult {
	success: boolean;
	message?: string;
	files?: ReadDirectory[];
}

/**
 * Entrée de répertoire
 */
export interface ReadDirectory {
	name: string;
	path: string;
	isDirectory: boolean;
}

/**
 * Fichier lu
 */
export interface ReadFile {
	path: string;
	content: string;
}

/**
 * Données de fichier
 */
export interface FileData {
	name: string;
	path: string;
	isDirectory: boolean;
	children?: FileData[];
	size?: number;
	lastModified?: Date;
}
