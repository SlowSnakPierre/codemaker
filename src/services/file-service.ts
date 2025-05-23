/**
 * Service de gestion des opérations sur les fichiers
 * Fournit des méthodes pour lire, écrire, supprimer et manipuler des fichiers
 */

import { promises as fs } from "fs";
import path from "path";
import { type FileInfo } from "@types";

export class FileService {
	/**
	 * Lit le contenu d'un fichier
	 * @param filePath Chemin du fichier à lire
	 * @returns Le contenu du fichier
	 */
	static async readFile(filePath: string): Promise<string> {
		try {
			return await fs.readFile(filePath, "utf-8");
		} catch (error) {
			console.error(
				`Erreur lors de la lecture du fichier ${filePath}`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Écrit du contenu dans un fichier
	 * @param filePath Chemin du fichier à écrire
	 * @param content Contenu à écrire
	 */
	static async writeFile(filePath: string, content: string): Promise<void> {
		try {
			// S'assurer que le répertoire existe
			const dirPath = path.dirname(filePath);
			await fs.mkdir(dirPath, { recursive: true });

			// Écrire dans le fichier
			await fs.writeFile(filePath, content, "utf-8");
		} catch (error) {
			console.error(
				`Erreur lors de l'écriture du fichier ${filePath}`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Supprime un fichier
	 * @param filePath Chemin du fichier à supprimer
	 */
	static async deleteFile(filePath: string): Promise<void> {
		try {
			await fs.unlink(filePath);
		} catch (error) {
			console.error(
				`Erreur lors de la suppression du fichier ${filePath}`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Vérifie si un fichier existe
	 * @param filePath Chemin du fichier à vérifier
	 * @returns true si le fichier existe, sinon false
	 */
	static async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Liste les fichiers d'un répertoire
	 * @param dirPath Chemin du répertoire à lister
	 * @returns Liste des fichiers et sous-répertoires
	 */
	static async listDirectory(dirPath: string): Promise<FileInfo[]> {
		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true });

			return Promise.all(
				entries.map(async (entry) => {
					const fullPath = path.join(dirPath, entry.name);
					const isDirectory = entry.isDirectory();

					return {
						name: entry.name,
						path: fullPath,
						isDirectory,
						size: isDirectory ? 0 : (await fs.stat(fullPath)).size,
						lastModified: (await fs.stat(fullPath)).mtime,
					};
				}),
			);
		} catch (error) {
			console.error(
				`Erreur lors de la lecture du répertoire ${dirPath}`,
				error,
			);
			throw error;
		}
	}
}
