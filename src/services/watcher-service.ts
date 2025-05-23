/**
 * Service de surveillance des modifications de fichiers
 * Fournit des méthodes pour surveiller les changements dans les fichiers et répertoires
 */

import chokidar, { type FSWatcher } from "chokidar";
import path from "path";
import { type FileChangeEvent } from "@types";

export class WatcherService {
	private watchers: Map<string, FSWatcher> = new Map();
	private listeners: Map<string, Set<(event: FileChangeEvent) => void>> =
		new Map();

	/**
	 * Démarre la surveillance d'un répertoire
	 * @param dirPath Chemin du répertoire à surveiller
	 * @returns Identifiant unique pour ce watcher
	 */
	startWatching(dirPath: string): string {
		// Normalise le chemin pour éviter les doublons
		const normalizedPath = path.normalize(dirPath);

		// Génère un ID unique pour ce watcher
		const watcherId = `watch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

		// Crée un nouveau watcher
		const watcher = chokidar.watch(normalizedPath, {
			persistent: true,
			ignoreInitial: true,
			followSymlinks: false,
			ignored: [
				"**/node_modules/**",
				"**/.git/**",
				"**/dist/**",
				"**/build/**",
				"**/.next/**",
			],
		});

		// Initialise l'ensemble de listeners pour ce watcher
		this.listeners.set(watcherId, new Set());

		// Configure les gestionnaires d'événements
		watcher
			.on("add", (filePath) =>
				this.notifyListeners(watcherId, {
					type: "add",
					path: filePath,
				}),
			)
			.on("change", (filePath) =>
				this.notifyListeners(watcherId, {
					type: "change",
					path: filePath,
				}),
			)
			.on("unlink", (filePath) =>
				this.notifyListeners(watcherId, {
					type: "delete",
					path: filePath,
				}),
			)
			.on("addDir", (dirPath) =>
				this.notifyListeners(watcherId, {
					type: "addDir",
					path: dirPath,
				}),
			)
			.on("unlinkDir", (dirPath) =>
				this.notifyListeners(watcherId, {
					type: "deleteDir",
					path: dirPath,
				}),
			)
			.on("error", (error) =>
				console.error(`Erreur de surveillance : ${error}`),
			);

		// Stocke le watcher dans la map
		this.watchers.set(watcherId, watcher);

		return watcherId;
	}

	/**
	 * Arrête la surveillance d'un répertoire
	 * @param watcherId Identifiant du watcher à arrêter
	 */
	stopWatching(watcherId: string): void {
		const watcher = this.watchers.get(watcherId);

		if (watcher) {
			watcher.close();
			this.watchers.delete(watcherId);
			this.listeners.delete(watcherId);
		}
	}

	/**
	 * Ajoute un écouteur pour les événements de fichiers
	 * @param watcherId Identifiant du watcher
	 * @param listener Fonction appelée lors d'un changement de fichier
	 * @returns Fonction pour supprimer l'écouteur
	 */
	addListener(
		watcherId: string,
		listener: (event: FileChangeEvent) => void,
	): () => void {
		const watcherListeners = this.listeners.get(watcherId);

		if (!watcherListeners) {
			throw new Error(`Watcher avec ID ${watcherId} non trouvé`);
		}

		watcherListeners.add(listener);

		// Retourne une fonction pour supprimer cet écouteur
		return () => {
			const listeners = this.listeners.get(watcherId);
			if (listeners) {
				listeners.delete(listener);
			}
		};
	}

	/**
	 * Notifie tous les écouteurs d'un événement
	 * @param watcherId Identifiant du watcher
	 * @param event Événement de changement de fichier
	 */
	private notifyListeners(watcherId: string, event: FileChangeEvent): void {
		const watcherListeners = this.listeners.get(watcherId);

		if (watcherListeners) {
			watcherListeners.forEach((listener) => {
				try {
					listener(event);
				} catch (error) {
					console.error("Erreur dans un écouteur de fichier", error);
				}
			});
		}
	}
}

// Export d'une instance unique du service
export const watcherService = new WatcherService();
