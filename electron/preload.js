const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
	openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
	openFile: () => ipcRenderer.invoke("dialog:openFile"),
	saveFile: (params) => ipcRenderer.invoke("dialog:saveFile", params),

	readDirectory: (dirPath) => ipcRenderer.invoke("fs:readDirectory", dirPath),
	readFile: (filePath) => ipcRenderer.invoke("fs:readFile", filePath),
	writeFile: (params) => ipcRenderer.invoke("fs:writeFile", params),

	minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
	maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
	closeWindow: () => ipcRenderer.invoke("window:close"),

	getSettings: (key) => ipcRenderer.invoke("settings:get", key),
	setSettings: (settings) => ipcRenderer.invoke("settings:set", settings),
});
