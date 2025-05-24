import { contextBridge } from "electron";

const listeners = {};

contextBridge.exposeInMainWorld("electron", {
	on: (channel: string, callback: () => void) => {
		listeners[channel] = callback;
	},
	off: (channel: string) => {
		delete listeners[channel];
	},
});
