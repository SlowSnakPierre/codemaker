"use client";

import { useTheme } from "next-themes";
import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
	activeFile: string | null;
	language: string | null;
	languageOverride?: string | null;
	cursorPosition: {
		line: number;
		column: number;
	};
	tabSize: number;
	useTabs: boolean;
	onLanguageChange?: (language: string) => void;
};

const availableLanguages = [
	"auto",
	"html",
	"css",
	"scss",
	"less",
	"javascript",
	"typescript",
	"json",
	"jsonc",
	"markdown",
	"yaml",
	"toml",
	"python",
	"java",
	"c",
	"cpp",
	"csharp",
	"go",
	"rust",
	"php",
	"ruby",
	"swift",
	"kotlin",
	"sql",
	"mysql",
	"pgsql",
	"mongodb",
	"powershell",
	"shell",
	"bash",
	"bat",
	"plaintext",
	"csv",
	"ini",
	"log",
	"abap",
	"apex",
	"azcli",
	"bicep",
	"cameligo",
	"clojure",
	"coffeescript",
	"dart",
	"dockerfile",
	"elixir",
	"fsharp",
	"graphql",
	"hcl",
	"julia",
	"latex",
	"lua",
	"m3",
	"mips",
	"pascal",
	"perl",
	"protobuf",
	"r",
	"razor",
	"redis",
	"scheme",
	"solidity",
	"sparql",
	"stan",
	"systemverilog",
	"tcl",
	"twig",
	"vb",
	"verilog",
	"vue",
	"wasm",
	"xml",
];

const formatLanguage = (lang: string | null): string => {
	if (!lang) return "Plain Text";

	if (lang === "auto") return "Auto-détection";

	return lang.charAt(0).toUpperCase() + lang.slice(1);
};

const StatusBar = ({
	activeFile,
	language,
	languageOverride,
	cursorPosition,
	tabSize = 2,
	useTabs = false,
	onLanguageChange,
}: Props) => {
	const { theme } = useTheme();
	const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (!isLanguageMenuOpen) {
			setSearchQuery("");
		}
	}, [isLanguageMenuOpen]);

	const filteredLanguages = useMemo(() => {
		if (!searchQuery) return availableLanguages;

		return availableLanguages.filter((lang) =>
			lang.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [searchQuery]);

	const isAutoDetect =
		languageOverride === null || languageOverride === undefined;

	const displayMode = isAutoDetect ? "auto" : languageOverride || "";
	const formattedLanguage = isAutoDetect
		? `${formatLanguage(language)} (Auto)`
		: formatLanguage(languageOverride || language);

	const indentationDisplay = useTabs ? "Tabulations" : `Espaces : ${tabSize}`;

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
				<span>{activeFile ? activeFile : "No file open"}</span>{" "}
				{activeFile && (
					<>
						<span className="h-3 w-[1px] bg-border"></span>{" "}
						<DropdownMenu
							open={isLanguageMenuOpen}
							onOpenChange={setIsLanguageMenuOpen}
						>
							<DropdownMenuTrigger asChild>
								<button
									className="flex items-center text-xs hover:text-foreground focus:outline-none"
									data-language={language}
								>
									<span>{formattedLanguage}</span>
									<ChevronDown size={12} className="ml-1" />
								</button>
							</DropdownMenuTrigger>{" "}
							<DropdownMenuContent
								align="end"
								className="w-64 p-2"
								onCloseAutoFocus={(e) => e.preventDefault()}
							>
								<div
									className="relative mb-2"
									onClick={(e) => e.stopPropagation()}
								>
									<Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
									<Input
										placeholder="Rechercher un langage..."
										className="pl-7 h-8 text-xs"
										value={searchQuery}
										onChange={(e) =>
											setSearchQuery(e.target.value)
										}
										autoFocus
										onClick={(e) => e.stopPropagation()}
										onFocus={(e) =>
											e.currentTarget.select()
										}
										onKeyDown={(e) => e.stopPropagation()}
									/>
									{searchQuery && (
										<button
											className="absolute right-2 top-2.5"
											onClick={(e) => {
												e.stopPropagation();
												setSearchQuery("");
												// Redonner le focus à l'input après avoir effacé
												e.currentTarget.parentElement
													?.querySelector("input")
													?.focus();
											}}
										>
											<X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
										</button>
									)}
								</div>{" "}
								<ScrollArea className="h-[350px] overflow-y-auto pr-2">
									{/* Option de détection automatique toujours en premier */}
									{filteredLanguages.includes("auto") && (
										<>
											<DropdownMenuItem
												key="auto"
												className={`text-xs ${
													isAutoDetect
														? "font-semibold bg-accent/30"
														: ""
												}`}
												onSelect={(e) => {
													// Empêcher la fermeture automatique du menu en interceptant l'événement
													e.preventDefault();
													onLanguageChange &&
														onLanguageChange(
															"auto"
														);
													setIsLanguageMenuOpen(
														false
													);
												}}
											>
												Auto-détection
											</DropdownMenuItem>
											<DropdownMenuSeparator />
										</>
									)}
									{/* Autres langages */}
									<div className="grid grid-cols-2 gap-x-1">
										{filteredLanguages
											.filter((lang) => lang !== "auto")
											.map((lang) => (
												<DropdownMenuItem
													key={lang}
													className={`text-xs capitalize py-1.5 ${
														!isAutoDetect &&
														languageOverride ===
															lang
															? "font-semibold bg-accent/30"
															: ""
													}`}
													onSelect={(e) => {
														e.preventDefault();
														onLanguageChange &&
															onLanguageChange(
																lang
															);
														setIsLanguageMenuOpen(
															false
														);
													}}
												>
													{formatLanguage(lang)}
												</DropdownMenuItem>
											))}
									</div>
									{filteredLanguages.length === 0 && (
										<div className="text-xs text-muted-foreground text-center py-2">
											Aucun langage trouvé
										</div>
									)}
								</ScrollArea>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}
			</div>
		</div>
	);
};

export default StatusBar;
