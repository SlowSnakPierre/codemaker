import { getFileIcon, getFileIconColor } from "@/utils/file-icons";
import {
	ImageIcon,
	FileTextIcon,
	FileCodeIcon,
	FileCogIcon,
	Code2Icon,
	CogIcon,
	FileIcon,
} from "lucide-react";

export function renderFileIcon(fileName: string) {
	const iconType = getFileIcon(fileName);
	const iconColor = getFileIconColor(fileName);

	switch (iconType) {
		case "image":
			return <ImageIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		case "file-text":
			return <FileTextIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		case "file-code":
			return <FileCodeIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		case "file-css":
			return <FileCogIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		case "file-js":
			return <Code2Icon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		case "file-json":
			return <FileCogIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		case "file-config":
			return <CogIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
		default:
			return <FileIcon className={`h-4 w-4 mr-2 ${iconColor}`} />;
	}
}
