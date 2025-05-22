"use client";

import { useState, useEffect, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { WatcherInfoState } from "@/lib/types";

interface WatcherInfoProps {
	directory: string | null;
}

export default function WatcherInfo({ directory }: WatcherInfoProps) {
	const [watcherInfo, setWatcherInfo] = useState<WatcherInfoState | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const isElectron = typeof window !== "undefined" && window.electron;

	const fetchWatcherInfo = useCallback(async () => {
		if (!directory || !isElectron) {
			setError("Aucun répertoire ouvert ou environnement non-Electron");
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const currentStatus = await window.electron.checkWatcherStatus();

			const restartResult = await window.electron.restartWatcher(
				directory
			);

			const newStatus = await window.electron.checkWatcherStatus();

			setWatcherInfo({
				active: restartResult && newStatus,
				wasActive: currentStatus,
				directory: directory,
				timestamp: new Date().toLocaleTimeString(),
				status: restartResult ? "actif" : "inactif",
				lastWatcherDirectory: await window.electron.getSettings(
					"lastWatcherDirectory"
				),
				lastWatcherTimestamp: await window.electron.getSettings(
					"lastWatcherTimestamp"
				),
			});
		} catch (err) {
			console.error(
				"Erreur lors de la récupération des infos du watcher:",
				err
			);
			setError(
				`Erreur: ${err instanceof Error ? err.message : String(err)}`
			);
			setWatcherInfo(null);
		} finally {
			setLoading(false);
		}
	}, [directory, isElectron]);

	useEffect(() => {
		if (directory) {
			fetchWatcherInfo();
		}
	}, [directory, fetchWatcherInfo]);

	const handleForceRestart = async () => {
		if (!directory) {
			toast.error("Aucun répertoire à surveiller");
			return;
		}

		toast.info("Redémarrage du watcher...");
		await fetchWatcherInfo();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					<span>État du watcher de fichiers</span>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleForceRestart}
						disabled={loading}
					>
						<RefreshCw
							className={`h-4 w-4 ${
								loading ? "animate-spin" : ""
							}`}
						/>
					</Button>
				</CardTitle>
				<CardDescription>
					Information sur la surveillance des fichiers
				</CardDescription>
			</CardHeader>
			<CardContent>
				{error ? (
					<div className="flex items-center text-destructive">
						<AlertCircle className="h-4 w-4 mr-2" />
						<span>{error}</span>
					</div>
				) : watcherInfo ? (
					<dl className="space-y-2 text-sm">
						<div className="flex justify-between">
							<dt className="font-medium">Statut:</dt>
							<dd className="flex items-center">
								{watcherInfo.active ? (
									<>
										<CheckCircle className="h-4 w-4 mr-1 text-green-500" />{" "}
										Actif
									</>
								) : (
									<>
										<AlertCircle className="h-4 w-4 mr-1 text-amber-500" />{" "}
										Inactif
									</>
								)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="font-medium">État précédent:</dt>
							<dd className="flex items-center">
								{watcherInfo.wasActive ? (
									<>
										<CheckCircle className="h-4 w-4 mr-1 text-green-500" />{" "}
										Était actif
									</>
								) : (
									<>
										<AlertCircle className="h-4 w-4 mr-1 text-amber-500" />{" "}
										Était inactif
									</>
								)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="font-medium">Répertoire:</dt>
							<dd className="max-w-[200px] truncate text-right">
								{watcherInfo.directory}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="font-medium">
								Dernière vérification:
							</dt>
							<dd>{watcherInfo.timestamp}</dd>
						</div>
						{watcherInfo.lastWatcherDirectory && (
							<div className="flex justify-between">
								<dt className="font-medium">
									Dernier répertoire surveillé:
								</dt>
								<dd className="max-w-[200px] truncate text-right">
									{watcherInfo.lastWatcherDirectory}
								</dd>
							</div>
						)}
						{watcherInfo.lastWatcherTimestamp && (
							<div className="flex justify-between">
								<dt className="font-medium">
									Dernier horodatage du watcher:
								</dt>
								<dd>
									{new Date(
										watcherInfo.lastWatcherTimestamp
									).toLocaleString()}
								</dd>
							</div>
						)}
					</dl>
				) : (
					<div className="text-center py-4 text-muted-foreground">
						{loading
							? "Chargement..."
							: "Aucune information disponible"}
					</div>
				)}
			</CardContent>
			{watcherInfo && (
				<CardFooter className="text-xs text-muted-foreground border-t pt-4">
					Utilisez le bouton en haut à droite pour forcer un
					redémarrage du watcher.
				</CardFooter>
			)}
		</Card>
	);
}
