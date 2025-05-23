/**
 * Service de gestion des paramètres persistants
 * Fournit des méthodes pour lire et écrire des paramètres d'application
 */

import ElectronStore from "electron-store";
import { type AppSettings } from "@types";

class SettingsService {
	private store: ElectronStore<AppSettings>;

	constructor() {
		this.store = new ElectronStore<AppSettings>({
			defaults: {
				theme: "system",
				editorSettings: {
					fontSize: 14,
					tabSize: 2,
					wordWrap: true,
					lineNumbers: true,
					minimap: true,
				},
				recentProjects: [],
				lastOpenedFiles: [],
			},
		});
	}

	/**
	 * Récupère tous les paramètres
	 * @returns Tous les paramètres de l'application
	 */
	getAll(): AppSettings {
		return this.store.store;
	}

	/**
	 * Récupère un paramètre spécifique
	 * @param key Clé du paramètre à récupérer
	 * @returns Valeur du paramètre
	 */
	get<K extends keyof AppSettings>(key: K): AppSettings[K] {
		return this.store.get(key);
	}

	/**
	 * Définit un paramètre
	 * @param key Clé du paramètre à définir
	 * @param value Valeur du paramètre
	 */
	set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
		this.store.set(key, value);
	}

	/**
	 * Ajoute un projet récent à la liste
	 * @param projectPath Chemin du projet à ajouter
	 */
	addRecentProject(projectPath: string): void {
		const recentProjects = this.get("recentProjects");

		// Supprime le projet s'il existe déjà pour éviter les doublons
		const filteredProjects = recentProjects.filter(
			(p) => p !== projectPath,
		);

		// Ajoute le nouveau projet au début
		const updatedProjects = [projectPath, ...filteredProjects].slice(0, 10);

		this.set("recentProjects", updatedProjects);
	}

	/**
	 * Ajoute un fichier récemment ouvert à la liste
	 * @param filePath Chemin du fichier à ajouter
	 */
	addLastOpenedFile(filePath: string): void {
		const lastOpenedFiles = this.get("lastOpenedFiles");

		// Supprime le fichier s'il existe déjà pour éviter les doublons
		const filteredFiles = lastOpenedFiles.filter((f) => f !== filePath);

		// Ajoute le nouveau fichier au début
		const updatedFiles = [filePath, ...filteredFiles].slice(0, 20);

		this.set("lastOpenedFiles", updatedFiles);
	}
}

// Export d'une instance unique du service
export const settingsService = new SettingsService();
