/**
 * Utilitaires pour la gestion et le diagnostic du watcher de fichiers
 */

let watcherCheckInterval: NodeJS.Timeout | null = null;

/**
 * Démarre une vérification périodique du watcher pour le répertoire spécifié
 * @param directory Le répertoire à surveiller
 * @param checkInterval L'intervalle de vérification en millisecondes
 */
export function startWatcherHealthCheck(
	directory: string | null,
	checkInterval: number = 30000,
): void {
	if (watcherCheckInterval) {
		clearInterval(watcherCheckInterval);
		watcherCheckInterval = null;
	}

	if (!directory || typeof window === "undefined" || !window.electron) {
		console.log(
			"[WatcherHealth] Vérification désactivée: aucun répertoire ou pas d'environnement Electron",
		);
		return;
	}

	console.log(
		`[WatcherHealth] Démarrage de la vérification du watcher pour ${directory}`,
	);

	watcherCheckInterval = setInterval(() => {
		window.electron
			.restartWatcher(directory)
			.then(() => console.log("[WatcherHealth] Watcher vérifié et actif"))
			.catch((err) =>
				console.error(
					"[WatcherHealth] Erreur lors de la vérification du watcher:",
					err,
				),
			);
	}, checkInterval);
}

/**
 * Arrête la vérification périodique du watcher
 */
export function stopWatcherHealthCheck(): void {
	if (watcherCheckInterval) {
		clearInterval(watcherCheckInterval);
		watcherCheckInterval = null;
		console.log("[WatcherHealth] Vérification du watcher arrêtée");
	}
}

/**
 * Force le redémarrage du watcher pour un répertoire spécifié
 * @param directory Le répertoire à surveiller
 * @returns Promise<boolean> Indique si le redémarrage a réussi
 */
export async function forceRestartWatcher(
	directory: string | null,
): Promise<boolean> {
	if (!directory || typeof window === "undefined" || !window.electron) {
		console.error(
			"[WatcherHealth] Impossible de redémarrer le watcher: aucun répertoire ou pas d'environnement Electron",
		);
		return false;
	}

	try {
		console.log(
			`[WatcherHealth] Forçage du redémarrage du watcher pour ${directory}`,
		);
		const result = await window.electron.restartWatcher(directory);
		console.log(
			`[WatcherHealth] Redémarrage forcé ${result ? "réussi" : "échoué"}`,
		);
		return result;
	} catch (error) {
		console.error(
			"[WatcherHealth] Erreur lors du forçage du redémarrage du watcher:",
			error,
		);
		return false;
	}
}
