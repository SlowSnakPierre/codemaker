// filepath: d:\Downloads\codemaker\electron\types.ts
/**
 * Types pour les fichiers Electron (utilisés uniquement dans le processus principal)
 */

/**
 * Type pour la configuration du store Electron
 */
export interface StoreData {
	lastOpenDirectory?: string;
	lastWatcherDirectory?: string;
	lastWatcherTimestamp?: string;
	[key: string]: unknown;
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

/**
 * Options pour les commandes shell
 */
export interface CommandOptions {
	workingDirectory?: string;
	timeout?: number;
	maxBuffer?: number;
	cwd?: string; // Alias pour workingDirectory
}

/**
 * Résultat d'une commande shell
 */
export interface ShellCommandResult {
	success: boolean;
	stdout?: string;
	stderr?: string;
	error?: string;
}

/**
 * Événement de changement de fichier
 */
export interface FileChangeEvent {
	type: string;
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
 * Fichier lu
 */
export interface ReadFile {
	path: string;
	content: string;
}

/**
 * Entrée de répertoire
 */
export interface ReadDirectory {
	name: string;
	path: string;
	isDirectory: boolean;
}
