"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { forceRestartWatcher } from "@/lib/watcher-utils";
import { toast } from "sonner";

interface WatcherStatusProps {
	currentDirectory: string | null;
}

export default function WatcherStatus({
	currentDirectory,
}: WatcherStatusProps) {
	const [watcherActive, setWatcherActive] = useState<boolean | null>(null);
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		const checkWatcherStatus = async () => {
			if (
				!currentDirectory ||
				typeof window === "undefined" ||
				!window.electron
			) {
				setWatcherActive(false);
				return;
			}

			setChecking(true);

			try {
				const result =
					await window.electron.restartWatcher(currentDirectory);
				setWatcherActive(result);

				if (!result) {
					console.warn("[WatcherStatus] Le watcher semble inactif");
				}
			} catch (error) {
				console.error(
					"[WatcherStatus] Erreur lors de la vérification du watcher:",
					error,
				);
				setWatcherActive(false);
			} finally {
				setChecking(false);
			}
		};

		checkWatcherStatus();

		const interval = setInterval(() => void checkWatcherStatus, 30000);

		return () => {
			clearInterval(interval);
		};
	}, [currentDirectory]);

	const handleForceRestart = async () => {
		if (!currentDirectory) return;

		setChecking(true);
		try {
			const result = await forceRestartWatcher(currentDirectory);
			if (result) {
				toast.success("Watcher redémarré avec succès");
				setWatcherActive(true);
			} else {
				toast.error("Échec du redémarrage du watcher");
				setWatcherActive(false);
			}
		} catch (error) {
			console.error("Erreur lors du redémarrage forcé:", error);
			toast.error("Erreur lors du redémarrage du watcher");
			setWatcherActive(false);
		} finally {
			setChecking(false);
		}
	};

	if (!currentDirectory) return null;

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Badge
						variant={watcherActive ? "outline" : "destructive"}
						className={`cursor-pointer ${
							checking ? "animate-pulse" : ""
						}`}
						onClick={handleForceRestart}
					>
						{checking
							? "Vérification..."
							: watcherActive
								? "Watcher actif"
								: "Watcher inactif"}
					</Badge>
				</TooltipTrigger>
				<TooltipContent side="top">
					{watcherActive
						? "La surveillance de fichiers est active. Cliquez pour forcer un redémarrage."
						: "La surveillance de fichiers est inactive. Cliquez pour tenter un redémarrage."}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
