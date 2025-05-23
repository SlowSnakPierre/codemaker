/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from "electron";
import type { FileChangeEvent, ReadFile, CommandOptions } from "./types";

// Définir les types pour l'API exposée
// Remarque: Nous déclarons ces types localement pour éviter les conflits
// avec les types déclarés dans src/core/types/electron.ts
interface ReadDirectory {
	name: string;
	path: string;
	isDirectory: boolean;
}

interface FileResult {
	success: boolean;
	message?: string;
	file?: { name: string; path: string; isDirectory: boolean };
}

interface DirectoryResult {
	success: boolean;
	message?: string;
	directory?: { name: string; path: string; isDirectory: boolean };
}

interface RefreshResult {
	success: boolean;
	message?: string;
	files?: ReadDirectory[];
}

interface TypeResult {
	success: boolean;
	message?: string;
	extension?: string;
}

interface CommandResult {
	success: boolean;
	stdout?: string;
	stderr?: string;
	error?: string;
}

// Définir le type de l'API Electron exposée
interface ElectronAPI {
	// Gestion des dossiers
	openDirectory: () => Promise<string | null>;
	readDirectory: (dirPath: string) => Promise<ReadDirectory[]>;
	createDirectory: (params: {
		dirPath: string;
		folderName: string;
	}) => Promise<DirectoryResult>;
	refreshDirectory: (dirPath: string) => Promise<RefreshResult>;
	directoryExists: (dirPath: string) => Promise<boolean>;

	// Gestion des fichiers
	openFile: () => Promise<ReadFile | null>;
	saveFile: (params: ReadFile) => Promise<string | null>;
	readFile: (filePath: string) => Promise<string | null>;
	writeFile: (params: {
		filePath: string;
		content: string;
	}) => Promise<boolean>;
	createFile: (params: {
		dirPath: string;
		fileName: string;
	}) => Promise<FileResult>;
	getFileType: (filePath: string) => Promise<TypeResult>;

	// Surveillance de fichiers
	restartWatcher: (dirPath: string) => Promise<boolean>;
	checkWatcherStatus: () => Promise<boolean>;
	onFileChanged: (callback: (data: FileChangeEvent) => void) => void;
	removeFileChangedListener: () => void;

	// Gestion de l'application
	minimizeWindow: () => Promise<void>;
	maximizeWindow: () => Promise<boolean>;
	closeWindow: () => Promise<void>;

	// Gestion du contenu persistant
	getSettings: <T>(key: string) => Promise<T>;
	setSettings: (settings: {
		key: string;
		value: unknown;
	}) => Promise<boolean>;

	// Enregistrer les écouteurs d'événements
	on: (channel: string, callback: (data: unknown) => void) => void;
	off: (channel: string) => void;

	// Pour exécuter des commandes dans le terminal
	runCommand: (
		command: string,
		options?: CommandOptions,
	) => Promise<CommandResult>;
}

// Configurer les écouteurs d'événements IPC

type EventListeners = {
	[key: string]: (data: any) => void;
};

const listeners: EventListeners = {};

// Gérer les événements de modification de fichiers
ipcRenderer.on("fs:fileChanged", (event, data) => {
	if (listeners["fs:fileChanged"]) {
		listeners["fs:fileChanged"](data);
	}
});

ipcRenderer.on("app-close-attempted", () => {
	if (listeners["app-close-attempted"]) {
		listeners["app-close-attempted"](null);
	}
});

// Création de l'API Electron exposée
const electronAPI: ElectronAPI = {
	// Gestion des dossiers
	openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
	readDirectory: (dirPath: string) =>
		ipcRenderer.invoke("fs:readDirectory", dirPath),
	createDirectory: (params: { dirPath: string; folderName: string }) =>
		ipcRenderer.invoke("fs:createDirectory", params),
	refreshDirectory: (dirPath: string) =>
		ipcRenderer.invoke("fs:refreshDirectory", dirPath),
	directoryExists: (dirPath: string) =>
		ipcRenderer.invoke("fs:directoryExists", dirPath),

	// Gestion des fichiers
	openFile: () => ipcRenderer.invoke("dialog:openFile"),
	saveFile: (params: ReadFile) =>
		ipcRenderer.invoke("dialog:saveFile", params),
	readFile: (filePath: string) => ipcRenderer.invoke("fs:readFile", filePath),
	writeFile: (params: { filePath: string; content: string }) =>
		ipcRenderer.invoke("fs:writeFile", params),
	createFile: (params: { dirPath: string; fileName: string }) =>
		ipcRenderer.invoke("fs:createFile", params),
	getFileType: (filePath: string) =>
		ipcRenderer.invoke("fs:getFileType", filePath),

	// Surveillance de fichiers
	restartWatcher: (dirPath: string) =>
		ipcRenderer.invoke("fs:restartWatcher", dirPath),
	checkWatcherStatus: () => ipcRenderer.invoke("fs:checkWatcherStatus"),
	onFileChanged: (callback: (data: FileChangeEvent) => void) => {
		listeners["fs:fileChanged"] = callback;
	},
	removeFileChangedListener: () => {
		delete listeners["fs:fileChanged"];
	},

	// Gestion de l'application
	minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
	maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
	closeWindow: () => ipcRenderer.invoke("window:close"),

	// Gestion du contenu persistant
	getSettings: <T>(key: string) =>
		ipcRenderer.invoke("settings:get", key) as Promise<T>,
	setSettings: (settings: { key: string; value: unknown }) =>
		ipcRenderer.invoke("settings:set", settings),

	// Enregistrer les écouteurs d'événements
	on: (channel: string, callback: (data: unknown) => void) => {
		listeners[channel] = callback;
	},
	off: (channel: string) => {
		delete listeners[channel];
	},

	// Pour exécuter des commandes dans le terminal (utilisé dans le testeur du watcher)
	runCommand: (command: string, options: CommandOptions = {}) =>
		ipcRenderer.invoke("shell:runCommand", command, options),
};

// Exposer l'API à travers le pont contextuel
contextBridge.exposeInMainWorld("electron", electronAPI);
