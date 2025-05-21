export function getFileIcon(fileName: string) {
	const extension = fileName.split(".").pop()?.toLowerCase() || "";

	if (
		["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
			extension
		)
	) {
		return "image";
	}

	if (["pdf", "doc", "docx", "txt", "rtf"].includes(extension)) {
		return "file-text";
	}

	if (["html", "htm", "xhtml", "xml"].includes(extension)) {
		return "file-code";
	}

	if (["css", "scss", "sass", "less"].includes(extension)) {
		return "file-css";
	}

	if (["js", "jsx", "ts", "tsx"].includes(extension)) {
		return "file-js";
	}

	if (
		["json", "yaml", "yml", "toml", "ini", "conf", "config"].includes(
			extension
		)
	) {
		return "file-json";
	}

	if (["py", "pyc", "pyd", "pyo", "pyw", "pyz"].includes(extension)) {
		return "file-python";
	}

	if (["java", "class", "jar"].includes(extension)) {
		return "file-java";
	}

	if (["rb", "erb", "gemspec", "rake"].includes(extension)) {
		return "file-ruby";
	}

	if (["php", "phtml", "php3", "php4", "php5", "phps"].includes(extension)) {
		return "file-php";
	}

	if (["go"].includes(extension)) {
		return "file-go";
	}

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

	return "file";
}

export function getFileIconColor(fileName: string) {
	const extension = fileName.split(".").pop()?.toLowerCase() || "";

	if (
		["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp", "ico"].includes(
			extension
		)
	) {
		return "text-green-400";
	}

	if (["js", "jsx"].includes(extension)) {
		return "text-yellow-300";
	}

	if (["ts", "tsx"].includes(extension)) {
		return "text-blue-400";
	}

	if (["html", "htm", "xhtml", "xml"].includes(extension)) {
		return "text-orange-400";
	}

	if (["css", "scss", "sass", "less"].includes(extension)) {
		return "text-purple-400";
	}

	if (["json"].includes(extension)) {
		return "text-green-500";
	}

	if (["md", "markdown"].includes(extension)) {
		return "text-slate-300";
	}

	if (["yaml", "yml", "toml", "ini", "conf", "config"].includes(extension)) {
		return "text-gray-400";
	}

	return "text-blue-400";
}
