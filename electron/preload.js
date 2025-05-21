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
	openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
	openFile: () => ipcRenderer.invoke("dialog:openFile"),
	saveFile: (params) => ipcRenderer.invoke("dialog:saveFile", params),

	readDirectory: (dirPath) => ipcRenderer.invoke("fs:readDirectory", dirPath),
	readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
	writeFile: (params) => ipcRenderer.invoke("fs:writeFile", params),
	createFile: (params) => ipcRenderer.invoke("fs:createFile", params),
	createDirectory: (params) =>
		ipcRenderer.invoke("fs:createDirectory", params),
	getFileType: (filePath) => ipcRenderer.invoke("fs:getFileType", filePath),
	refreshDirectory: (dirPath) =>
		ipcRenderer.invoke("fs:refreshDirectory", dirPath),

	minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
	maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
	closeWindow: () => ipcRenderer.invoke("window:close"),

	getSettings: (key) => ipcRenderer.invoke("settings:get", key),
	setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),

	// Enregistrer les écouteurs d'événements
	on: (channel, callback) => {
		listeners[channel] = callback;
	},
	off: (channel) => {
		delete listeners[channel];
	},
});
