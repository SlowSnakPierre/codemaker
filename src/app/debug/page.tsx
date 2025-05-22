"use client";

import { useEffect, useState } from "react";
import WatcherInfo from "@/components/debug/watcher-info";
import FileWatcherTester from "@/components/debug/file-watcher-tester";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DebugPage() {
	const [currentDirectory, setCurrentDirectory] = useState<string | null>(
		null
	);

	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		if (isElectron) {
			window.electron
				.getSettings("lastOpenDirectory")
				.then((dir: string) => {
					if (dir) {
						setCurrentDirectory(dir);
						console.log("[DebugPage] Répertoire récupéré:", dir);
					} else {
						console.log(
							"[DebugPage] Aucun répertoire ouvert récemment"
						);
					}
				});
		}
	}, [isElectron]);

	const handleSelectDirectory = async () => {
		if (!isElectron) {
			toast.error(
				"Cette fonction n'est disponible que dans l'application Electron"
			);
			return;
		}

		try {
			const dir = await window.electron.openDirectory();
			if (dir) {
				setCurrentDirectory(dir);
				toast.success(`Répertoire sélectionné: ${dir}`);
			}
		} catch (error) {
			toast.error("Erreur lors de la sélection du répertoire");
			console.error(
				"[DebugPage] Erreur lors de la sélection du répertoire:",
				error
			);
		}
	};

	return (
		<div className="container mx-auto py-8 space-y-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold">Page de débogage</h1>
				<Button
					onClick={handleSelectDirectory}
					disabled={!isElectron}
					variant="outline"
				>
					Sélectionner un répertoire
				</Button>
			</div>

			{!isElectron && (
				<Card className="mb-6 border-yellow-500 dark:border-yellow-700">
					<CardContent className="pt-6">
						<p className="text-yellow-600 dark:text-yellow-400">
							Cette page est conçue pour déboguer
							l&apos;application Electron. Certaines
							fonctionnalités ne sont pas disponibles dans le
							navigateur.
						</p>
					</CardContent>
				</Card>
			)}

			<Tabs defaultValue="watcher" className="w-full">
				<TabsList className="w-full justify-start mb-6">
					<TabsTrigger value="watcher">
						Surveillance de fichiers
					</TabsTrigger>
					<TabsTrigger value="tester">
						Testeur de surveillance
					</TabsTrigger>
				</TabsList>

				<TabsContent value="watcher" className="space-y-6">
					<WatcherInfo directory={currentDirectory} />
				</TabsContent>

				<TabsContent value="tester">
					<FileWatcherTester directory={currentDirectory} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
