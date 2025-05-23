import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitaires pour le formatage et la présentation
 */

/**
 * Utilitaire pour fusionner les classes CSS avec TailwindCSS
 * @param inputs Classes CSS à fusionner
 * @returns Classes CSS fusionnées
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Tronque un texte s'il dépasse une longueur maximale
 * @param text Texte à tronquer
 * @param maxLength Longueur maximale
 * @returns Texte tronqué avec ellipsis si nécessaire
 */
export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength) + "...";
}

/**
 * Formate une date en chaîne lisible
 * @param date Date à formater
 * @returns Chaîne formatée (ex: "22 mai 2025, 14:30")
 */
export function formatDate(date: Date | string): string {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return new Intl.DateTimeFormat("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(dateObj);
}

/**
 * Convertit une chaîne au format Camel Case
 * @param str Chaîne à convertir
 * @returns Chaîne en Camel Case
 */
export function toCamelCase(str: string): string {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+/g, "");
}

/**
 * Convertit une chaîne au format Pascal Case
 * @param str Chaîne à convertir
 * @returns Chaîne en Pascal Case
 */
export function toPascalCase(str: string): string {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
		.replace(/\s+/g, "");
}

/**
 * Convertit une chaîne au format Kebab Case
 * @param str Chaîne à convertir
 * @returns Chaîne en Kebab Case
 */
export function toKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/\s+/g, "-")
		.toLowerCase();
}
