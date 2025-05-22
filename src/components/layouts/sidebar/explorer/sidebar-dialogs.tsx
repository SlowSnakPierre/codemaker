import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { toast } from "sonner";

type Props = {
	isLoading: boolean;
	isCreatingFile: boolean;
	isCreatingFolder: boolean;
	newFileName: string;
	newFolderName: string;
	selectedFolder: string | null;
	setIsLoading: (b: boolean) => void;
	refreshFolder: (b: string) => void;
	setIsCreatingFile: (b: boolean) => void;
	setIsCreatingFolder: (b: boolean) => void;
	setNewFileName: (name: string) => void;
	setNewFolderName: (name: string) => void;
};

const SidebarDialogs = ({
	isLoading,
	isCreatingFile,
	isCreatingFolder,
	newFileName,
	newFolderName,
	selectedFolder,
	setIsLoading,
	refreshFolder,
	setIsCreatingFile,
	setIsCreatingFolder,
	setNewFileName,
	setNewFolderName,
}: Props) => {
	const isElectron = typeof window !== "undefined" && window.electron;

	const handleCreateFile = async () => {
		if (!selectedFolder || !isElectron || !newFileName.trim()) return;

		setIsLoading(true);
		try {
			const result = await window.electron.createFile({
				dirPath: selectedFolder,
				fileName: newFileName.trim(),
			});

			if (result.success) {
				refreshFolder(selectedFolder);
				toast.success(`Fichier "${newFileName}" créé avec succès`);
				setNewFileName("");
				setIsCreatingFile(false);
			} else {
				toast.error(
					`Erreur lors de la création du fichier: ${result.message}`,
				);
			}
		} catch (error) {
			console.error("Échec de création du fichier:", error);
			toast.error("Impossible de créer le fichier");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateFolder = async () => {
		if (!selectedFolder || !isElectron || !newFolderName.trim()) return;

		setIsLoading(true);
		try {
			const result = await window.electron.createDirectory({
				dirPath: selectedFolder,
				folderName: newFolderName.trim(),
			});

			if (result.success) {
				refreshFolder(selectedFolder);
				toast.success(`Dossier "${newFolderName}" créé avec succès`);
				setNewFolderName("");
				setIsCreatingFolder(false);
			} else {
				toast.error(
					`Erreur lors de la création du dossier: ${result.message}`,
				);
			}
		} catch (error) {
			console.error("Échec de création du dossier:", error);
			toast.error("Impossible de créer le dossier");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Dialog open={isCreatingFile} onOpenChange={setIsCreatingFile}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Créer un nouveau fichier</DialogTitle>
						<DialogDescription>
							Entrez le nom du fichier à créer dans le dossier
							sélectionné.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="fileName">Nom du fichier</Label>
						<Input
							id="fileName"
							value={newFileName}
							onChange={(e) => setNewFileName(e.target.value)}
							placeholder="exemple.txt"
							className="mt-2"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateFile();
								}
							}}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setIsCreatingFile(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateFile}
							disabled={!newFileName.trim() || isLoading}
						>
							{isLoading ? "Création..." : "Créer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Créer un nouveau dossier</DialogTitle>
						<DialogDescription>
							Entrez le nom du dossier à créer.
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Label htmlFor="folderName">Nom du dossier</Label>
						<Input
							id="folderName"
							value={newFolderName}
							onChange={(e) => setNewFolderName(e.target.value)}
							placeholder="nouveau-dossier"
							className="mt-2"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									handleCreateFolder();
								}
							}}
						/>
					</div>

					<DialogFooter>
						<Button
							variant="secondary"
							onClick={() => setIsCreatingFolder(false)}
							disabled={isLoading}
						>
							Annuler
						</Button>
						<Button
							onClick={handleCreateFolder}
							disabled={!newFolderName.trim() || isLoading}
						>
							{isLoading ? "Création..." : "Créer"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default SidebarDialogs;
