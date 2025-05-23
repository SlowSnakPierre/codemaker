"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Plus, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { forceRestartWatcher } from "@/lib/watcher-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FileChangeEvent } from "@/core/types";

interface FileWatcherTesterProps {
	directory: string | null;
}

interface WatcherEvent {
	type: string;
	path: string;
	timestamp: string;
}

export default function FileWatcherTester({
	directory,
}: FileWatcherTesterProps) {
	const [events, setEvents] = useState<WatcherEvent[]>([]);
	const [newFileName, setNewFileName] = useState("test-file.txt");
	const [isCreating, setIsCreating] = useState(false);
	const [isModifying, setIsModifying] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isElectron = typeof window !== "undefined" && window.electron;

	useEffect(() => {
		if (!isElectron) return;

		const handleFileChange = (event: FileChangeEvent) => {
			const newEvent = {
				type: event.type,
				path: event.path,
				timestamp: new Date().toLocaleTimeString(),
			};

			setEvents((prev) => [newEvent, ...prev].slice(0, 50));
		};

		window.electron.onFileChanged(handleFileChange);

		return () => {
			if (window.electron && window.electron.removeFileChangedListener) {
				window.electron.removeFileChangedListener(handleFileChange);
			}
		};
	}, [isElectron]);

	const handleCreateFile = async () => {
		if (!directory || !isElectron || !newFileName) {
			toast.error("Impossible de créer le fichier de test");
			return;
		}

		setIsCreating(true);

		try {
			const result = await window.electron.createFile({
				dirPath: directory,
				fileName: newFileName,
			});

			if (result.success) {
				toast.success(`Fichier créé: ${result.file?.name}`);
			} else {
				toast.error(`Échec de la création: ${result.message}`);
			}
		} catch (error) {
			toast.error("Erreur lors de la création du fichier");
			console.error("[FileWatcherTester] Erreur création:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleModifyFile = async () => {
		if (!directory || !isElectron || !newFileName) {
			toast.error("Impossible de modifier le fichier de test");
			return;
		}

		setIsModifying(true);

		try {
			const filePath = `${directory}/${newFileName}`;
			const content = `Contenu modifié le ${new Date().toLocaleString()}`;

			const result = await window.electron.writeFile({
				path: filePath,
				content,
			});

			if (result) {
				toast.success(`Fichier modifié: ${newFileName}`);
			} else {
				toast.error("Échec de la modification du fichier");
			}
		} catch (error) {
			toast.error("Erreur lors de la modification du fichier");
			console.error("[FileWatcherTester] Erreur modification:", error);
		} finally {
			setIsModifying(false);
		}
	};

	const handleDeleteFile = async () => {
		if (!directory || !isElectron || !newFileName) {
			toast.error("Impossible de supprimer le fichier de test");
			return;
		}

		setIsDeleting(true);

		try {
			const filePath = `${directory}/${newFileName}`;
			await window.electron.runCommand(
				`Remove-Item -Path "${filePath}" -Force`,
				{
					cwd: directory,
				},
			);

			toast.success(`Fichier supprimé: ${newFileName}`);
		} catch (error) {
			toast.error("Erreur lors de la suppression du fichier");
			console.error("[FileWatcherTester] Erreur suppression:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleRestartWatcher = async () => {
		if (!directory) {
			toast.error("Aucun répertoire sélectionné");
			return;
		}

		toast.info("Redémarrage du watcher...");

		try {
			const result = await forceRestartWatcher(directory);
			if (result) {
				toast.success("Watcher redémarré avec succès");
			} else {
				toast.error("Échec du redémarrage du watcher");
			}
		} catch (error) {
			toast.error("Erreur lors du redémarrage du watcher");
			console.error(error);
		}
	};

	const handleClearEvents = () => {
		setEvents([]);
		toast.info("Liste d'événements effacée");
	};

	if (!directory) {
		return (
			<Alert>
				<AlertDescription>
					Veuillez sélectionner un répertoire pour utiliser le testeur
					de surveillance.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Testeur de surveillance de fichiers</CardTitle>
				<CardDescription>
					Créez, modifiez et supprimez des fichiers pour tester la
					surveillance
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center gap-4">
					<Input
						value={newFileName}
						onChange={(e) => setNewFileName(e.target.value)}
						placeholder="Nom du fichier de test"
					/>
					<Button
						onClick={handleCreateFile}
						disabled={isCreating || !newFileName}
					>
						{isCreating ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Plus className="h-4 w-4 mr-2" />
						)}
						Créer
					</Button>
					<Button
						onClick={handleModifyFile}
						disabled={isModifying || !newFileName}
						variant="secondary"
					>
						{isModifying ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Save className="h-4 w-4 mr-2" />
						)}
						Modifier
					</Button>
					<Button
						onClick={handleDeleteFile}
						disabled={isDeleting || !newFileName}
						variant="destructive"
					>
						{isDeleting ? (
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
						) : (
							<Trash2 className="h-4 w-4 mr-2" />
						)}
						Supprimer
					</Button>
				</div>

				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">
						Événements détectés
					</h3>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleRestartWatcher}
						>
							<RefreshCw className="h-4 w-4 mr-2" />
							Redémarrer le Watcher
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={handleClearEvents}
						>
							Effacer
						</Button>
					</div>
				</div>

				<div className="border rounded-md max-h-[300px] overflow-y-auto">
					{events.length === 0 ? (
						<div className="text-center p-4 text-muted-foreground">
							Aucun événement détecté. Essayez de créer, modifier
							ou supprimer un fichier.
						</div>
					) : (
						<table className="w-full">
							<thead className="bg-muted/50 sticky top-0">
								<tr>
									<th className="text-left p-2 text-xs font-medium">
										Type
									</th>
									<th className="text-left p-2 text-xs font-medium">
										Chemin
									</th>
									<th className="text-left p-2 text-xs font-medium">
										Heure
									</th>
								</tr>
							</thead>
							<tbody>
								{events.map((event, index) => (
									<tr key={index} className="border-t">
										<td className="p-2 text-xs">
											<span
												className={`font-mono ${getEventTypeColor(
													event.type,
												)}`}
											>
												{event.type}
											</span>
										</td>
										<td className="p-2 text-xs truncate max-w-[300px]">
											{event.path}
										</td>
										<td className="p-2 text-xs tabular-nums">
											{event.timestamp}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>
			</CardContent>
			<CardFooter className="text-sm text-muted-foreground">
				Les événements de surveillance sont affichés en temps réel.
			</CardFooter>
		</Card>
	);
}

function getEventTypeColor(eventType: string): string {
	switch (eventType) {
		case "add":
			return "text-green-600 dark:text-green-400";
		case "change":
			return "text-blue-600 dark:text-blue-400";
		case "unlink":
			return "text-red-600 dark:text-red-400";
		case "addDir":
			return "text-emerald-600 dark:text-emerald-400";
		case "unlinkDir":
			return "text-rose-600 dark:text-rose-400";
		default:
			return "text-gray-600 dark:text-gray-400";
	}
}
