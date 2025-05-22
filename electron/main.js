// Fichier de test pour diagnostiquer le problème
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

// Activer les outils de développement
function openDevTools() {
	if (mainWindow && isDev) {
		mainWindow.webContents.openDevTools();
		console.log("DevTools ouvert");
	}
}

// Fonction pour démarrer le watcher sur le répertoire
function startWatcher(directory) {
	console.log(`[Watcher] Démarrage du watcher pour: ${directory}`);
	console.log(`[Watcher] Timestamp: ${new Date().toISOString()}`);

	// Vérifier si le répertoire existe
	if (!fs.existsSync(directory)) {
		console.error(
			`[Watcher] ERREUR: Le répertoire ${directory} n'existe pas ou est inaccessible`
		);
		return false;
	}

	// Si un watcher existe déjà, on le ferme
	if (fileWatcher) {
		console.log("[Watcher] Fermeture du watcher existant");
		try {
			fileWatcher.close();
			console.log("[Watcher] Watcher existant fermé avec succès");
		} catch (error) {
			console.error(
				"[Watcher] Erreur lors de la fermeture du watcher existant:",
				error
			);
		}
	}

	// Créer un nouveau watcher avec des options optimisées
	fileWatcher = chokidar.watch(directory, {
		ignored: /(^|[\/\\])\..|(node_modules|\.git)/, // ignore les fichiers cachés, node_modules et .git
		persistent: true,
		ignoreInitial: true,
		depth: 99,
		awaitWriteFinish: {
			stabilityThreshold: 100, // réduit pour une meilleure réactivité
			pollInterval: 50, // intervalle plus court pour vérifier plus fréquemment
		},
		usePolling: process.platform === "win32", // Utiliser le polling uniquement sur Windows
		interval: 300, // Intervalle de polling réduit
		binaryInterval: 500, // Intervalle pour les fichiers binaires
		disableGlobbing: true, // Améliore les performances
		alwaysStat: false, // Désactive la récupération des stats par défaut
	});

	console.log("[Watcher] Watcher configuré, attachement des écouteurs...");

	// Traitement uniforme des événements du système de fichiers
	const handleFileEvent = (type, filePath) => {
		console.log(`[Watcher] Événement détecté: ${type} - ${filePath}`);

		if (mainWindow) {
			mainWindow.webContents.send("fs:fileChanged", {
				type,
				path: filePath,
			});
		} else {
			console.log("[Watcher] Erreur: mainWindow est null");
		}
	};
	// Attacher les écouteurs d'événements
	fileWatcher
		.on("add", (path) => handleFileEvent("add", path))
		.on("change", (path) => handleFileEvent("change", path))
		.on("unlink", (path) => handleFileEvent("unlink", path))
		.on("addDir", (path) => handleFileEvent("addDir", path))
		.on("unlinkDir", (path) => handleFileEvent("unlinkDir", path))
		.on("error", (error) => console.error(`[Watcher] Erreur: ${error}`))
		.on("ready", () => {
			console.log("[Watcher] Prêt à surveiller les changements");
			console.log(`[Watcher] Surveillance active pour: ${directory}`);

			// Vérifier et afficher les chemins surveillés
			const watchedPaths = fileWatcher.getWatched();
			const pathCount = Object.keys(watchedPaths).length;
			console.log("[Watcher] Chemins surveillés:", pathCount);

			if (pathCount === 0) {
				console.warn(
					"[Watcher] ATTENTION: Aucun chemin n'est surveillé!"
				);
			} else {
				// Afficher les premiers chemins surveillés (limité à 5)
				console.log(
					"[Watcher] Exemples de chemins surveillés:",
					Object.keys(watchedPaths).slice(0, 5).join(", ")
				);
			}

			// Enregistrer le répertoire dans les paramètres pour la restauration future
			store.set("lastWatcherDirectory", directory);
			store.set("lastWatcherTimestamp", new Date().toISOString());
		});
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

	// Ouvrir automatiquement les DevTools en mode développement
	if (isDev) {
		setTimeout(openDevTools, 1000);
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
		if (fileWatcher) {
			fileWatcher.close();
			fileWatcher = null;
		}
	});
}

app.whenReady().then(() => {
	createWindow();

	// Restaurer le watcher pour le dernier répertoire ouvert
	const lastOpenDirectory = store.get("lastOpenDirectory");
	if (lastOpenDirectory) {
		console.log(
			`[Main] Restauration du watcher pour le dernier répertoire: ${lastOpenDirectory}`
		);
		setTimeout(() => startWatcher(lastOpenDirectory), 1500); // Délai pour s'assurer que l'application est prête
	}

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

// Gestion des répertoires
ipcMain.handle("dialog:openDirectory", async () => {
	const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
		properties: ["openDirectory"],
	});
	if (canceled) {
		return null;
	} else {
		const selectedDir = filePaths[0];
		console.log(`[Main] Répertoire sélectionné: ${selectedDir}`);

		// Démarrer le watcher sur le répertoire sélectionné
		startWatcher(selectedDir);
		return selectedDir;
	}
});

// Gestion des fichiers
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

// Opérations sur le système de fichiers
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

ipcMain.handle("fs:directoryExists", async (event, dirPath) => {
	return fs.existsSync(dirPath);
});

ipcMain.handle("fs:readFile", async (event, filePath) => {
	return fs.readFileSync(filePath, "utf8");
});

ipcMain.handle("fs:writeFile", async (event, { filePath, content }) => {
	fs.writeFileSync(filePath, content, "utf8");
	return true;
});

ipcMain.handle("fs:refreshDirectory", async (event, dirPath) => {
	try {
		if (fs.existsSync(dirPath)) {
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
		} else {
			return { success: false, message: "Le répertoire n'existe plus" };
		}
	} catch (error) {
		return { success: false, message: error.message };
	}
});

ipcMain.handle("fs:createFile", async (event, { dirPath, fileName }) => {
	const filePath = path.join(dirPath, fileName);
	try {
		if (fs.existsSync(filePath)) {
			return { success: false, message: "Le fichier existe déjà" };
		}

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
		if (fs.existsSync(newDirPath)) {
			return { success: false, message: "Le dossier existe déjà" };
		}

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

// Gestion de la fenêtre
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

// Gestion des paramètres
ipcMain.handle("settings:get", (event, key) => store.get(key));
ipcMain.handle("settings:set", (event, { key, value }) => {
	store.set(key, value);
	return true;
});

// Gestionnaire pour redémarrer explicitement le watcher
ipcMain.handle("fs:restartWatcher", (event, dirPath) => {
	if (!dirPath) return false;

	console.log(`[Main] Redémarrage explicite du watcher pour: ${dirPath}`);
	startWatcher(dirPath);
	return true;
});

// Exécution de commandes shell pour le testeur du watcher
ipcMain.handle("shell:runCommand", async (event, command, options = {}) => {
	return new Promise((resolve, reject) => {
		const { exec } = require("child_process");
		const cwd = options.cwd || process.cwd();

		console.log(`[Shell] Exécution de la commande: ${command} dans ${cwd}`);

		exec(command, { cwd }, (error, stdout, stderr) => {
			if (error) {
				console.error(`[Shell] Erreur d'exécution: ${error.message}`);
				reject(error.message);
				return;
			}

			if (stderr) {
				console.warn(`[Shell] Stderr: ${stderr}`);
			}

			console.log(`[Shell] Stdout: ${stdout}`);
			resolve({ stdout, stderr });
		});
	});
});

// Fonction pour vérifier l'état du watcher
function checkWatcherStatus() {
	if (!fileWatcher) {
		console.log("[Watcher] État: Aucun watcher actif");
		return false;
	}

	try {
		const watchedPaths = fileWatcher.getWatched();
		const pathCount = Object.keys(watchedPaths).length;
		console.log(`[Watcher] État: Actif, surveille ${pathCount} chemins`);
		return pathCount > 0;
	} catch (error) {
		console.error(
			"[Watcher] Erreur lors de la vérification de l'état:",
			error
		);
		return false;
	}
}

// Ajouter un gestionnaire pour vérifier l'état du watcher
ipcMain.handle("fs:checkWatcherStatus", () => {
	return checkWatcherStatus();
});
