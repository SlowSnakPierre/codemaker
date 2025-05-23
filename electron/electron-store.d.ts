/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Déclarations de types pour les modules externes
 */

declare module "electron-store" {
	interface ElectronStoreOptions<T> {
		name?: string;
		defaults?: T;
		schema?: any;
		cwd?: string;
	}

	class ElectronStore<
		T extends Record<string, any> = Record<string, unknown>,
	> {
		constructor(options?: ElectronStoreOptions<T>);
		// Store API
		get<K extends keyof T>(key: K): T[K];
		set<K extends keyof T>(key: K, value: T[K]): void;
		// Permet également la signature avec objet
		set(object: Partial<T>): void;
		// Autres méthodes
		has(key: keyof T): boolean;
		reset(...keys: Array<keyof T>): void;
		delete(key: keyof T): void;
		clear(): void;
		openInEditor(): void;
		size: number;
		store: T;
		path: string;
	}

	export default ElectronStore;
}
