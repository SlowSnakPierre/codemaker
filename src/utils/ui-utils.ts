/**
 * Utilitaires pour l'interface utilisateur
 */

/**
 * Calcule si le mode sombre devrait être activé
 * @param theme Thème sélectionné ('light', 'dark' ou 'system')
 * @returns true si le mode sombre devrait être activé
 */
export function isDarkMode(theme: string): boolean {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	}
	return theme === "dark";
}

/**
 * Déclenche une animation sur un élément
 * @param element Élément DOM à animer
 * @param animationName Nom de l'animation CSS
 * @param duration Durée de l'animation en millisecondes
 * @returns Promise qui se résout lorsque l'animation est terminée
 */
export function animateElement(
	element: HTMLElement,
	animationName: string,
	duration: number = 300,
): Promise<void> {
	return new Promise((resolve) => {
		element.style.animation = `${animationName} ${duration}ms`;

		const animationEndHandler = () => {
			element.style.animation = "";
			element.removeEventListener("animationend", animationEndHandler);
			resolve();
		};

		element.addEventListener("animationend", animationEndHandler);
	});
}

/**
 * Copie un texte dans le presse-papiers
 * @param text Texte à copier
 * @returns Promise qui se résout lorsque le texte est copié
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch (error) {
		console.error("Erreur lors de la copie dans le presse-papiers:", error);
		return false;
	}
}

/**
 * Retourne true si l'appareil est un appareil mobile
 * @returns true si l'appareil est mobile
 */
export function isMobileDevice(): boolean {
	return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent,
	);
}

/**
 * Empêche le débordement du texte avec ellipsis
 * @param element Élément DOM contenant du texte
 * @param text Texte à afficher
 * @param maxWidth Largeur maximale en pixels
 */
export function preventTextOverflow(
	element: HTMLElement,
	text: string,
	maxWidth: number,
): void {
	element.textContent = text;

	while (element.scrollWidth > maxWidth && text.length > 0) {
		text = text.slice(0, -1);
		element.textContent = text + "...";
	}
}
