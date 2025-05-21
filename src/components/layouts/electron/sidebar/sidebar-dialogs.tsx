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

type Props = {
	isLoading: boolean;
	isCreatingFile: boolean;
	isCreatingFolder: boolean;
	newFileName: string;
	newFolderName: string;
	setIsCreatingFile: (b: boolean) => void;
	setIsCreatingFolder: (b: boolean) => void;
	setNewFileName: (name: string) => void;
	setNewFolderName: (name: string) => void;
	handleCreateFile: () => void;
	handleCreateFolder: () => void;
};

const SidebarDialogs = ({
	isLoading,
	isCreatingFile,
	isCreatingFolder,
	newFileName,
	newFolderName,
	setIsCreatingFile,
	setIsCreatingFolder,
	setNewFileName,
	setNewFolderName,
	handleCreateFile,
	handleCreateFolder,
}: Props) => {
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
