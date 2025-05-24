import { useEffect, useState } from "react";

export function useIsMobile() {
	const [isMobile, setIsMobile] = useState<boolean>(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Vérifier initialement
		checkMobile();

		// Ajouter un écouteur d'événement pour les changements de taille
		window.addEventListener("resize", checkMobile);

		// Nettoyer l'écouteur d'événement
		return () => {
			window.removeEventListener("resize", checkMobile);
		};
	}, []);

	return isMobile;
}
