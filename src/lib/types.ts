/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
	interface Window {
		electron: ElectronAPI;
	}
}

export interface FileChangeEvent {
	type: "add" | "unlink" | "addDir" | "unlinkDir";
	path: string;
}

export interface CreateFileResult {
	success: boolean;
	message?: string;
	file?: FileData;
}

export interface CreateDirectoryResult {
	success: boolean;
	message?: string;
	directory?: FileData;
}

export interface FileTypeResult {
	success: boolean;
	message?: string;
	extension?: string;
}

export interface RefreshDirectoryResult {
	success: boolean;
	message?: string;
	files?: ReadDirectory[];
}

export interface ElectronAPI {
	openDirectory: () => Promise<string | null>;
	openFile: () => Promise<ReadFile | null>;
	saveFile: (params: ReadFile) => Promise<string | null>;

	readDirectory: (dirPath: string) => Promise<ReadDirectory[] | null>;
	readFile: (filePath: string) => Promise<string | null>;
	writeFile: (params: ReadFile) => Promise<boolean>;
	createFile: (params: {
		dirPath: string;
		fileName: string;
	}) => Promise<CreateFileResult>;
	createDirectory: (params: {
		dirPath: string;
		folderName: string;
	}) => Promise<CreateDirectoryResult>;
	getFileType: (filePath: string) => Promise<FileTypeResult>;
	refreshDirectory: (dirPath: string) => Promise<RefreshDirectoryResult>;

	minimizeWindow: () => Promise<void>;
	maximizeWindow: () => Promise<boolean>;
	closeWindow: () => Promise<void>;

	getSettings: <T = any>(key: string) => Promise<T>;
	setSettings: (settings: {
		key: string;
		value: any;
	}) => Promise<true | null>;

	on: (channel: string, callback: (data: any) => void) => void;
	off: (channel: string) => void;
}

export interface ReadFile {
	path: string;
	content: string;
}

export interface ReadDirectory {
	name: string;
	path: string;
	isDirectory: boolean;
}

export interface FileData {
	name: string;
	path: string;
	isDirectory: boolean;
	children?: FileData[];
}

export interface FileTab {
	id: string;
	name: string;
	path: string | null;
	content: string;
	originalContent?: string; // Contenu original du fichier pour comparer après les opérations d'annulation
	language: string;
	active?: boolean;
	modified?: boolean;
}
