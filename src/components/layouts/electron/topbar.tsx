"use client";

import { Button } from "@/components/ui/button";
import {
	Menubar,
	MenubarContent,
	MenubarItem,
	MenubarMenu,
	MenubarSeparator,
	MenubarShortcut,
	MenubarSub,
	MenubarSubContent,
	MenubarSubTrigger,
	MenubarTrigger,
} from "@/components/ui/menubar";
import {
	VscChromeClose,
	VscChromeMaximize,
	VscChromeMinimize,
	VscChromeRestore,
} from "react-icons/vsc";
import { FaBolt } from "react-icons/fa6";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
	isElectron: boolean;
	onOpenFile: () => void;
	onOpenDirectory: () => void;
	onSaveFile: () => void;
	onToggleSidebar: () => void;
	onUndo?: () => void;
	onRedo?: () => void;
};

const TitleBar = ({
	isElectron,
	onOpenFile,
	onOpenDirectory,
	onSaveFile,
	onToggleSidebar,
	onUndo,
	onRedo,
}: Props) => {
	const [isMaximized, setIsMaximized] = useState(false);
	const { theme, setTheme } = useTheme();

	const handleWindowClose = () => {
		if (isElectron) {
			window.electron.closeWindow();
		}
	};

	const handleWindowMinimize = () => {
		if (isElectron) {
			window.electron.minimizeWindow();
		}
	};

	const handleWindowMaximize = async () => {
		if (isElectron) {
			const maximized = await window.electron.maximizeWindow();
			setIsMaximized(maximized);
		}
	};

	if (!isElectron) {
		return null;
	}

	return (
		<div className="flex items-center justify-between border-b h-[40px] drag bg-gray-100 border-gray-200 text-gray-700 dark:bg-neutral-900 dark:border-neutral-800 dark:text-muted-foreground">
			<div className="flex-1 flex justify-start items-center">
				<Menubar className="border-0 bg-transparent no-drag">
					<div className="flex items-center select-none relative h-full -ml-1 -mr-2">
						<div className="absolute z-999 h-[40px] w-[40px]" />
						<Image
							src="/logo.svg"
							alt="CodeMaker Logo"
							width={50}
							height={50}
							quality={100}
							className="h-[40px] p-2 object-contain"
						/>
					</div>

					<MenubarMenu>
						<MenubarTrigger className="text-sm px-3 focus:bg-gray-200 data-[state=open]:bg-gray-200 dark:focus:bg-muted dark:data-[state=open]:bg-muted font-normal text-gray-700 dark:text-neutral-300">
							Fichier
						</MenubarTrigger>
						<MenubarContent>
							<MenubarItem onClick={onOpenFile}>
								Nouveau fichier{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+N
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem onClick={onOpenFile}>
								Nouvelle fenêtre{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+Maj+N
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={onOpenFile}>
								Ouvrir le fichier{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+O
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem onClick={onOpenDirectory}>
								Ouvrir le dossier{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+O
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={onSaveFile}>
								Enregistrer{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+S
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem>
								Enregistrer sous{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+Maj+S
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem onClick={handleWindowClose}>
								Quitter
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger className="text-sm px-3 focus:bg-gray-200 data-[state=open]:bg-gray-200 dark:focus:bg-muted dark:data-[state=open]:bg-muted font-normal text-gray-700 dark:text-neutral-300">
							Édition
						</MenubarTrigger>
						<MenubarContent>
							<MenubarItem onClick={onUndo}>
								Annuler{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+Z
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem onClick={onRedo}>
								Rétablir{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+Y
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem>
								Couper{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+X
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem>
								Copier{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+C
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem>
								Coller{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+V
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarItem>
								Rechercher{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+F
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem>
								Remplacer{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+H
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger className="text-sm px-3 focus:bg-gray-200 data-[state=open]:bg-gray-200 dark:focus:bg-muted dark:data-[state=open]:bg-muted font-normal text-gray-700 dark:text-neutral-300">
							Affichage
						</MenubarTrigger>
						<MenubarContent>
							<MenubarItem onClick={onToggleSidebar}>
								Activer/désactiver la barre latérale{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+B
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarSeparator />
							<MenubarSub>
								<MenubarSubTrigger>Apparence</MenubarSubTrigger>
								<MenubarSubContent>
									<MenubarItem
										onClick={() => setTheme("light")}
									>
										Clair
										{theme === "light" && (
											<MenubarShortcut>✓</MenubarShortcut>
										)}
									</MenubarItem>
									<MenubarItem
										onClick={() => setTheme("dark")}
									>
										Sombre
										{theme === "dark" && (
											<MenubarShortcut>✓</MenubarShortcut>
										)}
									</MenubarItem>
									<MenubarItem
										onClick={() => setTheme("system")}
									>
										Système
										{theme === "system" && (
											<MenubarShortcut>✓</MenubarShortcut>
										)}
									</MenubarItem>
								</MenubarSubContent>
							</MenubarSub>
							<MenubarItem>
								Zoom avant{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl++
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
							<MenubarItem>
								Zoom arrière{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+-
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>

					<MenubarMenu>
						<MenubarTrigger className="text-sm px-3 focus:bg-gray-200 data-[state=open]:bg-gray-200 dark:focus:bg-muted dark:data-[state=open]:bg-muted font-normal text-gray-700 dark:text-neutral-300">
							Aide
						</MenubarTrigger>
						<MenubarContent>
							<MenubarItem
								onClick={() => toast.info("CodeMaker v0.1.0")}
							>
								À propos
							</MenubarItem>
							<MenubarItem
								onClick={() =>
									toast.error(
										"Les raccourcis clavier ne sont pas encore implémentés"
									)
								}
							>
								Raccourcis clavier{" "}
								<MenubarShortcut>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+K
									</kbd>
									<kbd className="px-2 py-1 bg-muted rounded border border-border">
										Ctrl+S
									</kbd>
								</MenubarShortcut>
							</MenubarItem>
						</MenubarContent>
					</MenubarMenu>
				</Menubar>
			</div>

			<div className="flex-1 flex justify-center items-center gap-2 text-center text-md select-none">
				<div className="flex items-center gap-1 no-drag">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className="h-7 w-7"
									onClick={onUndo}
								>
									<ArrowLeft className="h-4 w-4 text-gray-600 dark:text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Annuler</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className="h-7 w-7"
									onClick={onRedo}
								>
									<ArrowRight className="h-4 w-4 text-gray-600 dark:text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Rétablir</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
				<Button
					variant={"outline"}
					size={"sm"}
					className="flex-1 no-drag w-full h-7 text-xs max-w-xl border-gray-300 bg-white text-gray-800 dark:text-neutral-200"
				>
					<Search className="h-3.5 w-3.5 mr-2" />
					<span className="truncate">
						CodeMaker - Éditeur de code
					</span>
				</Button>
				<div className="no-drag">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant={"ghost"}
									size={"icon"}
									className="h-7 w-7"
								>
									<FaBolt className="h-3.5 w-3.5 text-gray-600 dark:text-muted-foreground" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Assistant IA</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{isElectron && (
				<div className="flex-1 flex justify-end items-center h-full">
					<Button
						variant="ghost"
						size="icon"
						onClick={handleWindowMinimize}
						className="h-full w-[40px] rounded-none focus:outline-none no-drag hover:bg-gray-200 dark:hover:bg-muted"
					>
						<VscChromeMinimize className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleWindowMaximize}
						className="h-full w-[40px] rounded-none focus:outline-none no-drag hover:bg-gray-200 dark:hover:bg-muted"
					>
						{isMaximized ? (
							<VscChromeRestore className="h-4 w-4" />
						) : (
							<VscChromeMaximize className="h-4 w-4" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={handleWindowClose}
						className="h-full w-[40px] rounded-none hover:bg-red-600 hover:text-white focus:outline-none no-drag"
					>
						<VscChromeClose className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
};

export default TitleBar;
