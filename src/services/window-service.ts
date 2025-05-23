/**
 * Service de gestion de la fenêtre Electron
 * Fournit des méthodes pour interagir avec la fenêtre Electron
 */

import { type BrowserWindow, dialog, shell } from "electron";

export class WindowService {
	private mainWindow: BrowserWindow | null = null;

	/**
	 * Définit la fenêtre principale
	 * @param window Instance de BrowserWindow
	 */
	setMainWindow(window: BrowserWindow): void {
		this.mainWindow = window;
	}

	/**
	 * Récupère la fenêtre principale
	 * @returns Instance de BrowserWindow
	 */
	getMainWindow(): BrowserWindow | null {
		return this.mainWindow;
	}

	/**
	 * Vérifie si la fenêtre principale existe
	 * @returns true si la fenêtre existe, sinon false
	 */
	hasWindow(): boolean {
		return this.mainWindow !== null && !this.mainWindow.isDestroyed();
	}

	/**
	 * Maximise la fenêtre
	 */
	maximize(): void {
		if (this.hasWindow()) {
			this.mainWindow!.maximize();
		}
	}

	/**
	 * Minimise la fenêtre
	 */
	minimize(): void {
		if (this.hasWindow()) {
			this.mainWindow!.minimize();
		}
	}

	/**
	 * Restaure la fenêtre
	 */
	restore(): void {
		if (this.hasWindow()) {
			this.mainWindow!.restore();
		}
	}

	/**
	 * Ferme la fenêtre
	 */
	close(): void {
		if (this.hasWindow()) {
			this.mainWindow!.close();
		}
	}

	/**
	 * Ouvre la boîte de dialogue pour sélectionner un dossier
	 * @returns Chemin du dossier sélectionné ou null si annulé
	 */
	async selectDirectory(): Promise<string | null> {
		if (!this.hasWindow()) return null;

		const { canceled, filePaths } = await dialog.showOpenDialog(
			this.mainWindow!,
			{
				properties: ["openDirectory"],
			},
		);

		return canceled ? null : filePaths[0];
	}

	/**
	 * Ouvre la boîte de dialogue pour sélectionner un fichier
	 * @param filters Filtres pour les types de fichiers
	 * @returns Chemin du fichier sélectionné ou null si annulé
	 */
	async selectFile(
		filters?: { name: string; extensions: string[] }[],
	): Promise<string | null> {
		if (!this.hasWindow()) return null;

		const { canceled, filePaths } = await dialog.showOpenDialog(
			this.mainWindow!,
			{
				properties: ["openFile"],
				filters,
			},
		);

		return canceled ? null : filePaths[0];
	}

	/**
	 * Ouvre la boîte de dialogue de sauvegarde de fichier
	 * @param defaultPath Chemin par défaut
	 * @param filters Filtres pour les types de fichiers
	 * @returns Chemin du fichier à sauvegarder ou null si annulé
	 */
	async saveFile(
		defaultPath?: string,
		filters?: { name: string; extensions: string[] }[],
	): Promise<string | null> {
		if (!this.hasWindow()) return null;

		const { canceled, filePath } = await dialog.showSaveDialog(
			this.mainWindow!,
			{
				defaultPath,
				filters,
			},
		);

		return canceled ? null : filePath || null;
	}

	/**
	 * Ouvre un URL externe dans le navigateur par défaut
	 * @param url URL à ouvrir
	 */
	openExternal(url: string): void {
		shell.openExternal(url);
	}

	/**
	 * Affiche une boîte de dialogue de confirmation
	 * @param options Options pour la boîte de dialogue
	 * @returns Résultat de la boîte de dialogue
	 */
	async showConfirmation(options: {
		title: string;
		message: string;
		detail?: string;
		buttons?: string[];
		type?: "info" | "warning" | "error" | "question";
	}): Promise<number> {
		if (!this.hasWindow()) return -1;

		const { response } = await dialog.showMessageBox(this.mainWindow!, {
			title: options.title,
			message: options.message,
			detail: options.detail,
			buttons: options.buttons || ["OK", "Annuler"],
			type: options.type || "question",
			cancelId: 1,
		});

		return response;
	}
}

// Export d'une instance unique du service
export const windowService = new WindowService();
