/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
	interface Window {
		electron: ElectronAPI;
	}
}

export interface ElectronAPI {
	openDirectory: () => Promise<string | null>;
	openFile: () => Promise<ReadFile | null>;
	saveFile: (params: ReadFile) => Promise<string | null>;

	readDirectory: (dirPath: string) => Promise<ReadDirectory[] | null>;
	readFile: (filePath: string) => Promise<string | null>;
	writeFile: (params: ReadFile) => Promise<boolean>;

	minimizeWindow: () => Promise<void>;
	maximizeWindow: () => Promise<boolean>;
	closeWindow: () => Promise<void>;

	getSettings: <T = any>(key: string) => Promise<T>;
	setSettings: (settings: {
		key: string;
		value: any;
	}) => Promise<true | null>;
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
	language: string;
	active?: boolean;
	modified?: boolean;
}
