"use client";

import { useFileWatcher } from "@/hooks/useFileWatcher";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface WatcherStatusProps {
	currentDirectory: string | null;
}

export default function WatcherStatus({
	currentDirectory,
}: WatcherStatusProps) {
	const { watcherActive, checking, forceRestartWatcher } =
		useFileWatcher(currentDirectory);

	const handleForceRestart = async () => {
		if (!currentDirectory) return;

		try {
			const result = await forceRestartWatcher();
			if (result) {
				toast.success("Watcher redémarré avec succès");
			} else {
				toast.error("Échec du redémarrage du watcher");
			}
		} catch (error) {
			console.error("Erreur lors du redémarrage forcé:", error);
			toast.error("Erreur lors du redémarrage du watcher");
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
