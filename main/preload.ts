import { contextBridge, ipcRenderer } from "electron";

const listeners = {};

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

const electronAPI = {
	minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
	maximizeWindow: () => ipcRenderer.invoke("window:maximize"),
	closeWindow: () => ipcRenderer.invoke("window:close"),

	on: (channel: string, callback: () => void) => {
		listeners[channel] = callback;
	},
	off: (channel: string) => {
		delete listeners[channel];
	},
};

export type ElectronAPI = typeof electronAPI;

contextBridge.exposeInMainWorld("electron", electronAPI);
