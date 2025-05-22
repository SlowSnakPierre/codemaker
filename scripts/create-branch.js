#!/usr/bin/env node

/**
 * Script pour créer facilement une nouvelle branche Git
 * Usage: bun scripts/create-branch.js [type] [nom]
 * Types: feature, fix, docs, refactor, chore
 * Exemple: bun scripts/create-branch.js feature ajout-completion-code
 */

const { execSync } = require("child_process");
const readline = require("readline");

// Configuration
const BRANCH_TYPES = ["feature", "fix", "docs", "refactor", "chore"];
const DEFAULT_TYPE = "feature";

// Fonctions utilitaires
function executeCommand(command) {
	try {
		return execSync(command, { encoding: "utf-8", stdio: "inherit" });
	} catch (error) {
		console.error(
			`\n❌ Erreur lors de l'exécution de la commande: ${command}`,
		);
		console.error(error.message);
		process.exit(1);
	}
}

function getBranchStatus() {
	try {
		const status = execSync("git status --porcelain", {
			encoding: "utf-8",
		});
		return status.trim();
	} catch (error) {
		console.error("❌ Erreur lors de la vérification du statut Git");
		console.error(error.message);
		process.exit(1);
	}
}

function getCurrentBranch() {
	try {
		return execSync("git branch --show-current", {
			encoding: "utf-8",
		}).trim();
	} catch (error) {
		console.error(
			"❌ Erreur lors de la récupération de la branche courante",
		);
		console.error(error.message);
		process.exit(1);
	}
}

function promptForInput(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

// Exécution principale
(async function main() {
	// Récupérer les arguments
	const args = process.argv.slice(2);
	let type = args[0] || DEFAULT_TYPE;
	let name = args[1] || "";

	// Valider le type
	if (!BRANCH_TYPES.includes(type)) {
		console.error(`\n❌ Type de branche invalide: ${type}`);
		console.error(`Types valides: ${BRANCH_TYPES.join(", ")}`);
		process.exit(1);
	}

	// Demander le nom de la branche si non fourni
	if (!name) {
		name = await promptForInput(
			"\n🔤 Nom de la branche (ex: ajout-completion-code): ",
		);

		if (!name) {
			console.error("❌ Le nom de la branche est requis");
			process.exit(1);
		}
	}

	// Formater le nom de la branche
	name = name
		.toLowerCase()
		.replace(/[^\w\s-]/g, "") // Supprimer les caractères spéciaux
		.replace(/\s+/g, "-"); // Remplacer les espaces par des tirets

	// Construire le nom complet de la branche
	const branchName = `${type}/${name}`;

	console.log(`\n🌿 Création de la branche: ${branchName}`);

	// Vérifier si nous sommes sur main
	const currentBranch = getCurrentBranch();
	if (currentBranch !== "main") {
		const switchToMain = await promptForInput(
			`\n⚠️ Vous êtes actuellement sur la branche '${currentBranch}'. Passer à 'main'? (o/N): `,
		);

		if (switchToMain.toLowerCase() === "o") {
			console.log("\n🔄 Passage à la branche main...");
			executeCommand("git checkout main");

			console.log("🔄 Mise à jour de la branche main...");
			executeCommand("git pull");
		}
	}

	// Vérifier s'il y a des changements non commités
	const status = getBranchStatus();
	if (status) {
		console.warn("\n⚠️ Vous avez des changements non commités:");
		console.log(execSync("git status --short", { encoding: "utf-8" }));

		const proceed = await promptForInput(
			"\n⚠️ Continuer quand même? (o/N): ",
		);
		if (proceed.toLowerCase() !== "o") {
			console.log("❌ Opération annulée");
			process.exit(0);
		}
	}

	// Créer la nouvelle branche
	console.log(`\n🔄 Création de la branche ${branchName}...`);
	executeCommand(`git checkout -b ${branchName}`);

	console.log("\n✅ Branche créée avec succès!");
	console.log(
		`\nVous pouvez maintenant commencer à travailler sur votre branche '${branchName}'`,
	);
	console.log("\nPensez à suivre la convention de commits:");
	console.log("  - feat: nouvelle fonctionnalité");
	console.log("  - fix: correction de bug");
	console.log("  - docs: documentation");
	console.log("  - refactor: refactoring de code");
	console.log("  - test: tests");
	console.log("  - chore: autres tâches");
})();
