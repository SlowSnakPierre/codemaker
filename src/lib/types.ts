/* eslint-disable @typescript-eslint/no-explicit-any */
import type { editor } from "monaco-editor";

declare global {
	interface Window {
		electron: ElectronAPI;
		__MONACO_EDITOR_INSTANCE__: editor.IStandaloneCodeEditor | null;
	}
}

export interface FileChangeEvent {
	type: "add" | "change" | "unlink" | "addDir" | "unlinkDir";
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

export interface RecentProject {
	name: string;
	path: string;
	lastOpened: string;
}

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
		callback: (event: FileChangeEvent) => void
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
		options: { cwd: string }
	) => Promise<string | null>;
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
	originalContent?: string;
	language: string;
	languageOverride?: string | null;
	active?: boolean;
	modified?: boolean;
	externallyModified?: boolean;
}

export interface WatcherInfoState {
	active: boolean;
	wasActive: boolean;
	directory: string;
	timestamp: string;
	status: string;
	lastWatcherDirectory?: string;
	lastWatcherTimestamp?: string;
}

export interface RecentProject {
	name: string;
	path: string;
	lastOpened: string;
}
