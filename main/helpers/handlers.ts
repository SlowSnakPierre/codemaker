import { ipcMain } from "electron";

export const loadHandlers = (mainWindow) => {
	ipcMain.handle("window:minimize", () => {
		if (!mainWindow) {
			console.error("Main window is not available");
			return;
		}
		mainWindow.minimize();
	});

	ipcMain.handle("window:maximize", () => {
		if (!mainWindow) {
			console.error("Main window is not available");
			return;
		}

		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize();
			return false;
		} else {
			mainWindow.maximize();
			return true;
		}
	});

	ipcMain.handle("window:close", () => {
		if (!mainWindow) {
			console.error("Main window is not available");
			return;
		}
		mainWindow.close();
	});
};
