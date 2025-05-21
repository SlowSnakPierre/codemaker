import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as fs from "fs";
import * as path from "path";
import Store from "electron-store";
import isDev from "electron-is-dev";
import { fileURLToPath } from "url";
import chokidar from "chokidar";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();

let mainWindow;
let fileWatcher;

// Fonction pour démarrer le watcher sur le répertoire
function startWatcher(directory) {
	// Si un watcher existe déjà, on le ferme
	if (fileWatcher) {
		fileWatcher.close();
	}
	// Créer un nouveau watcher
	fileWatcher = chokidar.watch(directory, {
		ignored: /(^|[\/\\])\../, // ignore les fichiers cachés
		persistent: true,
		ignoreInitial: true,
		depth: 99, // Surveillance récursive de tous les sous-dossiers
		awaitWriteFinish: {
			stabilityThreshold: 300,
			pollInterval: 100,
		},
	});

	// Événements à surveiller
	fileWatcher
		.on("add", (path) =>
			mainWindow.webContents.send("fs:fileChanged", { type: "add", path })
		)
		.on("unlink", (path) =>
			mainWindow.webContents.send("fs:fileChanged", {
				type: "unlink",
				path,
			})
		)
		.on("addDir", (path) =>
			mainWindow.webContents.send("fs:fileChanged", {
				type: "addDir",
				path,
			})
		)
		.on("unlinkDir", (path) =>
			mainWindow.webContents.send("fs:fileChanged", {
				type: "unlinkDir",
				path,
			})
		);
}

// Créer une nouvelle fenêtre
function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 800,
		minHeight: 600,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
		titleBarStyle: "hiddenInset",
		frame: false,
		backgroundColor: "#1e1e1e",
		icon: path.join(__dirname, "../public/favicon.ico"),
	});

	const startUrl = isDev
		? "http://localhost:3000"
		: `file://${path.join(__dirname, "../.next/index.html")}`;

	mainWindow.loadURL(startUrl);

	// if (isDev) {
	// 	mainWindow.webContents.openDevTools();
	// }

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("dialog:openDirectory", async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
		properties: ["openDirectory"],
	});
	if (canceled) {
		return null;
	} else {
		const selectedDir = filePaths[0];
		// Démarrer le watcher sur le répertoire sélectionné
		startWatcher(selectedDir);
		return selectedDir;
	}
});

ipcMain.handle("dialog:openFile", async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
		properties: ["openFile"],
		filters: [
			{ name: "All Files", extensions: ["*"] },
			{ name: "JavaScript", extensions: ["js", "jsx"] },
			{ name: "TypeScript", extensions: ["ts", "tsx"] },
			{ name: "HTML", extensions: ["html", "htm"] },
			{ name: "CSS", extensions: ["css", "scss", "sass"] },
			{ name: "JSON", extensions: ["json"] },
			{ name: "Markdown", extensions: ["md", "markdown"] },
		],
	});

	if (canceled) {
		return null;
	} else {
		return {
			path: filePaths[0],
			content: fs.readFileSync(filePaths[0], "utf8"),
		};
	}
});

ipcMain.handle(
	"dialog:saveFile",
	async (event, { path: filePath, content }) => {
		if (!filePath) {
			const { canceled, filePath: newPath } = await dialog.showSaveDialog(
				mainWindow,
				{
					filters: [
						{ name: "All Files", extensions: ["*"] },
						{ name: "JavaScript", extensions: ["js", "jsx"] },
						{ name: "TypeScript", extensions: ["ts", "tsx"] },
						{ name: "HTML", extensions: ["html", "htm"] },
						{ name: "CSS", extensions: ["css", "scss", "sass"] },
						{ name: "JSON", extensions: ["json"] },
						{ name: "Markdown", extensions: ["md", "markdown"] },
					],
				}
			);
			if (canceled) return null;
			filePath = newPath;
		}

		fs.writeFileSync(filePath, content, "utf8");
		return filePath;
	}
);

ipcMain.handle("fs:readDirectory", async (event, dirPath) => {
	const items = fs.readdirSync(dirPath, { withFileTypes: true });
	const result = items.map((item) => ({
		name: item.name,
		path: path.join(dirPath, item.name),
		isDirectory: item.isDirectory(),
	}));

	return result.sort((a, b) => {
		if (a.isDirectory && !b.isDirectory) return -1;
		if (!a.isDirectory && b.isDirectory) return 1;
		return a.name.localeCompare(b.name);
	});
});

ipcMain.handle("fs:readFile", async (event, filePath) => {
	return fs.readFileSync(filePath, "utf8");
});

ipcMain.handle("fs:writeFile", async (event, { filePath, content }) => {
	fs.writeFileSync(filePath, content, "utf8");
	return true;
});

ipcMain.handle("fs:createFile", async (event, { dirPath, fileName }) => {
	const filePath = path.join(dirPath, fileName);
	try {
		// Vérifie si le fichier existe déjà
		if (fs.existsSync(filePath)) {
			return { success: false, message: "Le fichier existe déjà" };
		}

		// Créer le fichier avec un contenu vide
		fs.writeFileSync(filePath, "", "utf8");
		return {
			success: true,
			file: {
				name: fileName,
				path: filePath,
				isDirectory: false,
			},
		};
	} catch (error) {
		return { success: false, message: error.message };
	}
});

ipcMain.handle("fs:createDirectory", async (event, { dirPath, folderName }) => {
	const newDirPath = path.join(dirPath, folderName);
	try {
		// Vérifie si le dossier existe déjà
		if (fs.existsSync(newDirPath)) {
			return { success: false, message: "Le dossier existe déjà" };
		}

		// Créer le dossier
		fs.mkdirSync(newDirPath);
		return {
			success: true,
			directory: {
				name: folderName,
				path: newDirPath,
				isDirectory: true,
			},
		};
	} catch (error) {
		return { success: false, message: error.message };
	}
});

ipcMain.handle("fs:getFileType", async (event, filePath) => {
	try {
		const extension = path.extname(filePath).toLowerCase();
		return { success: true, extension };
	} catch (error) {
		return { success: false, message: error.message };
	}
});

ipcMain.handle("fs:refreshDirectory", async (event, dirPath) => {
	try {
		const items = fs.readdirSync(dirPath, { withFileTypes: true });
		const result = items.map((item) => ({
			name: item.name,
			path: path.join(dirPath, item.name),
			isDirectory: item.isDirectory(),
		}));

		return {
			success: true,
			files: result.sort((a, b) => {
				if (a.isDirectory && !b.isDirectory) return -1;
				if (!a.isDirectory && b.isDirectory) return 1;
				return a.name.localeCompare(b.name);
			}),
		};
	} catch (error) {
		return { success: false, message: error.message };
	}
});

ipcMain.handle("window:minimize", () => {
	mainWindow.minimize();
});

ipcMain.handle("window:maximize", () => {
	if (mainWindow.isMaximized()) {
		mainWindow.unmaximize();
		return false;
	} else {
		mainWindow.maximize();
		return true;
	}
});

ipcMain.handle("window:close", () => {
	mainWindow.close();
});

ipcMain.handle("settings:get", (event, key) => store.get(key));
ipcMain.handle("settings:set", (event, { key, value }) => {
	store.set(key, value);
	return true;
});
