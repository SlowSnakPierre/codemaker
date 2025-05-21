// Fonction pour déterminer l'icône du fichier en fonction de son extension
export function getFileIcon(fileName: string) {
	const extension = fileName.split(".").pop()?.toLowerCase() || "";

	// Images
	if (
		["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
			extension
		)
	) {
		return "image";
	}

	// Documents
	if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
		return "file-text";
	}

	// Web
	if (["html", "htm", "xhtml", "xml"].includes(extension)) {
		return "file-code";
	}

	// Styles
	if (["css", "scss", "sass", "less"].includes(extension)) {
		return "file-css";
	}

	// JavaScript/TypeScript
	if (["js", "jsx", "ts", "tsx"].includes(extension)) {
		return "file-js";
	}

	// Configuration
	if (
		["json", "yaml", "yml", "toml", "ini", "conf", "config"].includes(
			extension
		)
	) {
		return "file-json";
	}

	// Python
	if (["py", "pyc", "pyd", "pyo", "pyw", "pyz"].includes(extension)) {
		return "file-python";
	}

	// Java
	if (["java", "class", "jar"].includes(extension)) {
		return "file-java";
	}

	// Ruby
	if (["rb", "erb", "gemspec", "rake"].includes(extension)) {
		return "file-ruby";
	}

	// PHP
	if (["php", "phtml", "php3", "php4", "php5", "phps"].includes(extension)) {
		return "file-php";
	}

	// Go
	if (["go"].includes(extension)) {
		return "file-go";
	}

	// Markdown
	if (["md", "markdown"].includes(extension)) {
		return "file-markdown";
	}

	if (
		fileName.includes(".env") ||
		fileName.includes(".gitignore") ||
		fileName.includes(".prettierrc")
	) {
		return "file-config";
	}

	// Par défaut
	return "file";
}

// Fonction pour obtenir la couleur de l'icône en fonction du type de fichier
export function getFileIconColor(fileName: string) {
	const extension = fileName.split(".").pop()?.toLowerCase() || "";

	// Images - Vert
	if (
		["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
			extension
		)
	) {
		return "text-green-400";
	}

	// JavaScript - Jaune
	if (["js", "jsx"].includes(extension)) {
		return "text-yellow-300";
	}

	// TypeScript - Bleu
	if (["ts", "tsx"].includes(extension)) {
		return "text-blue-400";
	}

	// HTML - Orange
	if (["html", "htm", "xhtml", "xml"].includes(extension)) {
		return "text-orange-400";
	}

	// CSS - Violet
	if (["css", "scss", "sass", "less"].includes(extension)) {
		return "text-purple-400";
	}

	// JSON - Vert
	if (["json"].includes(extension)) {
		return "text-green-500";
	}

	// Markdown - Gris bleuté
	if (["md", "markdown"].includes(extension)) {
		return "text-slate-300";
	}

	// Configuration - Gris
	if (["yaml", "yml", "toml", "ini", "conf", "config"].includes(extension)) {
		return "text-gray-400";
	}

	// Par défaut - Bleu clair
	return "text-blue-400";
}
