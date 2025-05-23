/**
 * Utilitaires pour manipuler des fichiers
 */

import path from "path";

/**
 * Extrait l'extension d'un fichier
 * @param filePath Chemin du fichier
 * @returns Extension du fichier (sans le point)
 */
export function getFileExtension(filePath: string): string {
	return path.extname(filePath).slice(1).toLowerCase();
}

/**
 * Vérifie si un fichier est un fichier image
 * @param filePath Chemin du fichier
 * @returns true si c'est un fichier image
 */
export function isImageFile(filePath: string): boolean {
	const extension = getFileExtension(filePath);
	return ["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(
		extension,
	);
}

/**
 * Vérifie si un fichier est un fichier texte/code
 * @param filePath Chemin du fichier
 * @returns true si c'est un fichier texte/code
 */
export function isTextFile(filePath: string): boolean {
	const extension = getFileExtension(filePath);
	const textExtensions = [
		"txt",
		"md",
		"markdown",
		"html",
		"htm",
		"css",
		"scss",
		"sass",
		"less",
		"js",
		"jsx",
		"ts",
		"tsx",
		"json",
		"xml",
		"yaml",
		"yml",
		"toml",
		"py",
		"rb",
		"php",
		"java",
		"c",
		"cpp",
		"h",
		"cs",
		"go",
		"rs",
		"swift",
		"kt",
		"dart",
		"sql",
		"graphql",
		"sh",
		"bash",
	];

	return textExtensions.includes(extension);
}

/**
 * Génère un nom de fichier unique dans un répertoire
 * @param dirPath Chemin du répertoire
 * @param fileName Nom de fichier souhaité
 * @param existingFiles Liste des noms de fichiers existants
 * @returns Nom de fichier unique
 */
export function generateUniqueFileName(
	dirPath: string,
	fileName: string,
	existingFiles: string[],
): string {
	if (!existingFiles.includes(fileName)) {
		return fileName;
	}

	const extension = getFileExtension(fileName);
	const nameWithoutExtension = path.basename(fileName, `.${extension}`);
	let counter = 1;
	let newFileName = "";

	do {
		newFileName = `${nameWithoutExtension} (${counter}).${extension}`;
		counter++;
	} while (existingFiles.includes(newFileName));

	return newFileName;
}

/**
 * Convertit une taille en octets en une chaîne lisible
 * @param bytes Taille en octets
 * @returns Chaîne formatée (ex: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Vérifie si un chemin est un sous-répertoire d'un autre
 * @param parent Chemin parent potentiel
 * @param child Chemin enfant potentiel
 * @returns true si child est un sous-répertoire de parent
 */
export function isSubDirectory(parent: string, child: string): boolean {
	const relativePath = path.relative(parent, child);
	return (
		!!relativePath &&
		!relativePath.startsWith("..") &&
		!path.isAbsolute(relativePath)
	);
}
