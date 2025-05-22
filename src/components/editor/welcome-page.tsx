"use client";

import React, { useState, useEffect } from "react";
import {
	FileIcon,
	FolderIcon,
	GitBranchIcon,
	SettingsIcon,
	BookOpenIcon,
	GlobeIcon,
	HeartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { RecentProject } from "@/lib/types";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../ui/tooltip";

interface WelcomePageProps {
	recentProjects: RecentProject[];
	onOpenFile: () => void;
	onDirectoryOpen: () => void;
	onSpecificDirectoryOpen: (dir: string) => void;
}

function useRelativeTime(date: Date): string {
	const [relativeTime, setRelativeTime] = useState<string>("");

	useEffect(() => {
		function updateRelativeTime() {
			setRelativeTime(formatDate(date));
		}

		updateRelativeTime();

		const interval = setInterval(updateRelativeTime, 1000);

		return () => clearInterval(interval);
	}, [date]);

	return relativeTime;
}

const RelativeTime: React.FC<{ date: Date }> = ({ date }) => {
	const relativeTime = useRelativeTime(date);
	return <>{relativeTime}</>;
};

const WelcomePage: React.FC<WelcomePageProps> = ({
	recentProjects,
	onOpenFile,
	onDirectoryOpen,
	onSpecificDirectoryOpen,
}) => {
	return (
		<div className="flex w-full h-full overflow-auto bg-background">
			{/* Page principale */}
			<div className="flex flex-col w-full max-w-5xl mx-auto p-8 gap-8">
				{/* En-tête avec logo */}
				<div className="flex flex-col items-center mb-4">
					<Image
						src="/logo.svg"
						alt="CodeMaker"
						width={120}
						height={120}
						className="mb-2"
					/>
					<h1 className="text-3xl font-semibold tracking-tight">
						CodeMaker
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Votre éditeur de code
					</p>
				</div>

				{/* Contenu principal en deux colonnes */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
					{/* Colonne de gauche - Démarrage rapide */}
					<div className="md:col-span-7 space-y-6">
						<div>
							<h2 className="text-lg font-medium mb-3">
								Démarrage
							</h2>
							<div className="grid grid-cols-2 gap-3">
								<Button
									variant="outline"
									className="flex justify-start px-4 h-14"
									onClick={onOpenFile}
								>
									<div className="flex items-center">
										<FileIcon className="h-5 w-5 mr-3 text-blue-500" />
										<div className="text-left">
											<div className="font-medium">
												Nouveau fichier
											</div>
											<div className="text-xs text-muted-foreground">
												Créer ou ouvrir un fichier
											</div>
										</div>
									</div>
								</Button>
								<Button
									variant="outline"
									className="flex justify-start px-4 h-14"
									onClick={onDirectoryOpen}
								>
									<div className="flex items-center">
										<FolderIcon className="h-5 w-5 mr-3 text-yellow-500" />
										<div className="text-left">
											<div className="font-medium">
												Ouvrir un dossier
											</div>
											<div className="text-xs text-muted-foreground">
												Ouvrir un dossier local
											</div>
										</div>
									</div>
								</Button>
								<Button
									variant="outline"
									className="flex justify-start px-4 h-14"
								>
									<div className="flex items-center">
										<GitBranchIcon className="h-5 w-5 mr-3 text-purple-500" />
										<div className="text-left">
											<div className="font-medium">
												Cloner un dépôt
											</div>
											<div className="text-xs text-muted-foreground">
												Clone depuis Git
											</div>
										</div>
									</div>
								</Button>
								<Button
									variant="outline"
									className="flex justify-start px-4 h-14"
								>
									<div className="flex items-center">
										<SettingsIcon className="h-5 w-5 mr-3 text-emerald-500" />
										<div className="text-left">
											<div className="font-medium">
												Personnaliser
											</div>
											<div className="text-xs text-muted-foreground">
												Configurer les paramètres
											</div>
										</div>
									</div>
								</Button>
							</div>
						</div>

						{recentProjects.length > 0 && (
							<div>
								<h2 className="text-lg font-medium mb-3 flex items-center">
									Récents{" "}
									<span className="text-xs ml-2 text-muted-foreground">
										({recentProjects.length})
									</span>
								</h2>
								<div className="bg-muted/50 rounded-md overflow-hidden">
									{recentProjects.map((project, index) => (
										<TooltipProvider key={project.path}>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														className={cn(
															"w-full flex items-center px-4 py-2.5 text-left hover:bg-muted transition-colors",
															index !==
																recentProjects.length -
																	1
																? "border-b border-border/40"
																: ""
														)}
														onClick={() =>
															onSpecificDirectoryOpen(
																project.path
															)
														}
													>
														<FolderIcon className="h-5 w-5 mr-3 text-muted-foreground" />
														<div className="flex-1 min-w-0">
															<p className="font-medium truncate">
																{project.name}
															</p>
														</div>
														<p className="text-xs text-muted-foreground ml-4 whitespace-nowrap">
															{project.path
																.split(/[/\\]/)
																.slice(0, -1)
																.join("/")}
														</p>
													</button>
												</TooltipTrigger>
												<TooltipContent side="bottom">
													Dernière ouverture:{" "}
													<RelativeTime
														date={
															new Date(
																project.lastOpened
															)
														}
													/>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									))}
								</div>
							</div>
						)}

						<div>
							<h2 className="text-lg font-medium mb-3">
								Raccourcis clavier
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
								<div className="flex justify-between">
									<span>Nouveau fichier</span>
									<kbd className="px-2 py-0.5 bg-muted rounded border border-border text-xs">
										Ctrl+N
									</kbd>
								</div>
								<div className="flex justify-between">
									<span>Ouvrir un fichier</span>
									<kbd className="px-2 py-0.5 bg-muted rounded border border-border text-xs">
										Ctrl+O
									</kbd>
								</div>
								<div className="flex justify-between">
									<span>Sauvegarder</span>
									<kbd className="px-2 py-0.5 bg-muted rounded border border-border text-xs">
										Ctrl+S
									</kbd>
								</div>
								<div className="flex justify-between">
									<span>Rechercher</span>
									<kbd className="px-2 py-0.5 bg-muted rounded border border-border text-xs">
										Ctrl+F
									</kbd>
								</div>
								<div className="flex justify-between">
									<span>Palette de commandes</span>
									<kbd className="px-2 py-0.5 bg-muted rounded border border-border text-xs">
										Ctrl+Shift+P
									</kbd>
								</div>
								<div className="flex justify-between">
									<span>Fermer l&apos;onglet</span>
									<kbd className="px-2 py-0.5 bg-muted rounded border border-border text-xs">
										Ctrl+W
									</kbd>
								</div>
							</div>
						</div>
					</div>

					{/* Colonne de droite - Apprendre et liens */}
					<div className="md:col-span-5 space-y-6">
						<div>
							<h2 className="text-lg font-medium mb-3">
								Apprendre
							</h2>
							<Card className="bg-muted/50 border-border/50">
								<CardContent className="p-4 space-y-3">
									<Button
										variant="ghost"
										className="w-full justify-start px-3 py-2 h-auto"
									>
										<BookOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
										<span>Documentation</span>
									</Button>
									<Button
										variant="ghost"
										className="w-full justify-start px-3 py-2 h-auto"
									>
										<GlobeIcon className="h-5 w-5 mr-3 text-blue-500" />
										<span>Site officiel</span>
									</Button>
									<Button
										variant="ghost"
										className="w-full justify-start px-3 py-2 h-auto"
									>
										<HeartIcon className="h-5 w-5 mr-3 text-red-500" />
										<span>Soutenir le projet</span>
									</Button>
								</CardContent>
							</Card>
						</div>

						<div>
							<h2 className="text-lg font-medium mb-3">
								Communauté
							</h2>
							<div className="grid grid-cols-2 gap-3">
								<Button
									variant="outline"
									className="h-auto py-2"
								>
									Twitter
								</Button>
								<Button
									variant="outline"
									className="h-auto py-2"
								>
									GitHub
								</Button>
								<Button
									variant="outline"
									className="h-auto py-2"
								>
									Discord
								</Button>
								<Button
									variant="outline"
									className="h-auto py-2"
								>
									Blog
								</Button>
							</div>
						</div>

						<div>
							<h2 className="text-lg font-medium mb-3">
								Conseils
							</h2>
							<Card className="bg-blue-500/10 border-blue-200 dark:border-blue-900">
								<CardContent className="p-4">
									<p className="text-sm">
										Utilisez la palette de commandes
										(Ctrl+Shift+P) pour accéder rapidement à
										toutes les fonctionnalités de
										l&apos;éditeur.
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>

				{/* Pied de page */}
				<div className="pt-6 mt-auto border-t border-border">
					<div className="flex justify-between items-center text-sm text-muted-foreground">
						<div>CodeMaker v0.1.0</div>
						<div className="flex gap-4">
							<button className="hover:underline">
								Préférences
							</button>
							<button className="hover:underline">
								Confidentialité
							</button>
							<button className="hover:underline">
								À propos
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

function formatDate(date: Date): string {
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffSeconds = Math.floor(diffTime / 1000);

	if (diffSeconds < 60) {
		return `il y a ${diffSeconds} ${
			diffSeconds <= 1 ? "seconde" : "secondes"
		}`;
	} else if (diffSeconds < 3600) {
		const minutes = Math.floor(diffSeconds / 60);
		return `il y a ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
	} else if (diffSeconds < 86400) {
		const hours = Math.floor(diffSeconds / 3600);
		return `il y a ${hours} ${hours === 1 ? "heure" : "heures"}`;
	} else {
		const diffDays = Math.floor(diffSeconds / 86400);

		if (diffDays === 0) {
			return "aujourd'hui";
		} else if (diffDays === 1) {
			return "hier";
		} else if (diffDays < 7) {
			return `il y a ${diffDays} jours`;
		} else if (diffDays < 30) {
			const weeks = Math.floor(diffDays / 7);
			return `il y a ${weeks} ${weeks === 1 ? "semaine" : "semaines"}`;
		} else {
			return date.toLocaleDateString();
		}
	}
}

export default WelcomePage;
