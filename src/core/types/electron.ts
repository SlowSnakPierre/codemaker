/**
 * Types liés à l'API Electron
 */

import type {
	CreateDirectoryResult,
	CreateFileResult,
	FileChangeEvent,
	FileTypeResult,
	ReadDirectory,
	ReadFile,
	RefreshDirectoryResult,
} from "./file";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * API Electron exposée à l'application web
 */
export interface ElectronAPI {
	openDirectory: () => Promise<string | null>;
	readDirectory: (dirPath: string) => Promise<ReadDirectory[] | null>;
	createDirectory: (params: {
		dirPath: string;
		folderName: string;
	}) => Promise<CreateDirectoryResult>;
	refreshDirectory: (dirPath: string) => Promise<RefreshDirectoryResult>;
	directoryExists: (dirPath: string) => Promise<boolean>;

	openFile: () => Promise<ReadFile | null>;
	saveFile: (params: ReadFile) => Promise<string | null>;
	readFile: (filePath: string) => Promise<string | null>;
	writeFile: (params: ReadFile) => Promise<boolean>;
	createFile: (params: {
		dirPath: string;
		fileName: string;
	}) => Promise<CreateFileResult>;
	getFileType: (filePath: string) => Promise<FileTypeResult>;

	restartWatcher: (dirPath: string) => Promise<boolean>;
	checkWatcherStatus: () => Promise<boolean>;
	onFileChanged: (callback: (event: FileChangeEvent) => void) => void;
	removeFileChangedListener: (
		callback: (event: FileChangeEvent) => void,
	) => void;

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

	runCommand: (
		command: string,
		options: { cwd: string },
	) => Promise<string | null>;
}

declare global {
	interface Window {
		electron: ElectronAPI;
		__MONACO_EDITOR_INSTANCE__: any;
	}
}
