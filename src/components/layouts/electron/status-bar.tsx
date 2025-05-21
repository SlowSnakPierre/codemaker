"use client";

import { useTheme } from "next-themes";
import React from "react";

type Props = {
	activeFile: string | null;
	language: string | null;
	cursorPosition: {
		line: number;
		column: number;
	};
	tabSize: number;
	useTabs: boolean;
};

const StatusBar = ({
	activeFile,
	language,
	cursorPosition,
	tabSize = 2,
	useTabs = false,
}: Props) => {
	const { theme } = useTheme();

	const formattedLanguage = language
		? language.charAt(0).toUpperCase() + language.slice(1)
		: "Plain Text";

	// Affichage de l'indentation (espaces ou tabulations)
	const indentationDisplay = useTabs
		? "Tabulations"
		: `Espaces : ${tabSize}`;

	return (
		<div className="h-6 bg-muted border-t border-border px-2 flex items-center text-xs text-muted-foreground select-none">
			<div className="flex-1 flex items-center space-x-4">
				<span>
					L {cursorPosition.line}, col {cursorPosition.column}
				</span>
				<span className="h-3 w-[1px] bg-border"></span>
				<span>{indentationDisplay}</span>
				<span className="h-3 w-[1px] bg-border"></span>
				<span>UTF-8</span>
				<span className="h-3 w-[1px] bg-border"></span>
				<span>
					{theme
						? theme.charAt(0).toUpperCase() + theme.slice(1)
						: "Unknown"}
				</span>
			</div>

			<div className=" flex items-center space-x-4">
				<span>{activeFile ? activeFile : "No file open"}</span>

				{activeFile && (
					<>
						<span className="h-3 w-[1px] bg-border"></span>
						<span>{formattedLanguage}</span>
					</>
				)}
			</div>
		</div>
	);
};

export default StatusBar;
