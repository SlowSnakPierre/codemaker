const { contextBridge, ipcRenderer } = require("electron");

// Configurer les écouteurs d'événements IPC
const listeners = {};

// Gérer les événements de modification de fichiers
ipcRenderer.on("fs:fileChanged", (event, data) => {
	if (listeners["fs:fileChanged"]) {
		listeners["fs:fileChanged"](data);
	}
});

ipcRenderer.on("app-close-attempted", () => {
	if (listeners["app-close-attempted"]) {
		listeners["app-close-attempted"]();
	}
});

contextBridge.exposeInMainWorld("electron", {
	// Gestion des dossiers
	openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
	readDirectory: (dirPath) => ipcRenderer.invoke("fs:readDirectory", dirPath),
	createDirectory: (params) =>
		ipcRenderer.invoke("fs:createDirectory", params),
	refreshDirectory: (dirPath) =>
		ipcRenderer.invoke("fs:refreshDirectory", dirPath),
	directoryExists: (dirPath) =>
		ipcRenderer.invoke("fs:directoryExists", dirPath),

	// Gestion des fichiers
	openFile: () => ipcRenderer.invoke("dialog:openFile"),
	saveFile: (params) => ipcRenderer.invoke("dialog:saveFile", params),
	readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
	writeFile: (params) => ipcRenderer.invoke("fs:writeFile", params),
	createFile: (params) => ipcRenderer.invoke("fs:createFile", params),
	getFileType: (filePath) => ipcRenderer.invoke("fs:getFileType", filePath),

	// Surveillance de fichiers
	restartWatcher: (dirPath) =>
		ipcRenderer.invoke("fs:restartWatcher", dirPath),
	checkWatcherStatus: () => ipcRenderer.invoke("fs:checkWatcherStatus"),
	onFileChanged: (callback) => {
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
	getSettings: (key) => ipcRenderer.invoke("settings:get", key),
	setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),

	// Enregistrer les écouteurs d'événements
	on: (channel, callback) => {
		listeners[channel] = callback;
	},
	off: (channel) => {
		delete listeners[channel];
	},

	// Pour exécuter des commandes dans le terminal (utilisé dans le testeur du watcher)
	runCommand: (command, options = {}) =>
		ipcRenderer.invoke("shell:runCommand", command, options),
});
