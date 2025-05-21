import { FileData } from "@/lib/types";
import { renderFileIcon } from "./file-utils";

interface FileItemProps {
	item: FileData;
	level: number;
	onFileSelect: (file: FileData) => void;
}

export default function FileItem({ item, level, onFileSelect }: FileItemProps) {
	const paddingLeft = level * 16 + 16;
	return (
		<div
			key={item.path}
			className="flex items-center py-1 pl-4 pr-2 cursor-pointer hover:bg-muted relative file-item"
			onClick={() => onFileSelect(item)}
			style={{ paddingLeft: `${paddingLeft}px` }}
		>
			{renderFileIcon(item.name)}
			<span className="text-sm truncate">{item.name}</span>
		</div>
	);
}
