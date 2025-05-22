#!/usr/bin/env node

/**
 * Script pour créer facilement une nouvelle pull request
 * Usage: bun scripts/create-pr.js [titre] [type]
 * Types: feature, fix, docs, refactor, chore
 * Exemple: bun scripts/create-pr.js "Ajout de l'autocomplétion" feature
 */

const { execSync } = require("child_process");
const readline = require("readline");

// Configuration
const PR_TYPES = {
	feature: "✨ Feature",
	fix: "🐛 Fix",
	docs: "📝 Documentation",
	refactor: "♻️ Refactor",
	chore: "🔧 Chore",
	test: "🧪 Test",
};

// Fonctions utilitaires
function executeCommand(command) {
	try {
		return execSync(command, { encoding: "utf-8" }).trim();
	} catch (error) {
		console.error(
			`\n❌ Erreur lors de l'exécution de la commande: ${command}`,
		);
		console.error(error.message);
		process.exit(1);
	}
}

function getCurrentBranch() {
	return executeCommand("git branch --show-current");
}

function getDefaultPrType() {
	const branch = getCurrentBranch();
	const match = branch.match(/^(feature|fix|docs|refactor|chore|test)\//);
	return match ? match[1] : "feature";
}

function getDefaultTitle() {
	const branch = getCurrentBranch();
	return branch
		.replace(/^(feature|fix|docs|refactor|chore|test)\//, "")
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function promptForInput(question, defaultValue = "") {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const defaultText = defaultValue ? ` [${defaultValue}]` : "";

	return new Promise((resolve) => {
		rl.question(`${question}${defaultText}: `, (answer) => {
			rl.close();
			resolve(answer.trim() || defaultValue);
		});
	});
}

function getBranchStatus() {
	return executeCommand("git status --porcelain");
}

// Exécution principale
(async function main() {
	try {
		// Récupérer les arguments
		const args = process.argv.slice(2);
		let title = args[0] || "";
		let type = args[1] || "";

		// Vérifier la branche actuelle
		const currentBranch = getCurrentBranch();
		console.log(`\n🌿 Branche actuelle: ${currentBranch}`);

		if (currentBranch === "main" || currentBranch === "master") {
			console.error(
				"\n❌ Vous ne pouvez pas créer une PR directement depuis la branche main/master.",
			);
			process.exit(1);
		}

		// Vérifier s'il y a des changements non committés
		const status = getBranchStatus();
		if (status) {
			console.warn("\n⚠️ Vous avez des changements non commités:");
			console.log(executeCommand("git status --short"));

			const commitFirst = await promptForInput(
				"\n⚠️ Voulez-vous commiter ces changements? (o/N)",
				"N",
			);

			if (commitFirst.toLowerCase() === "o") {
				const commitMsg = await promptForInput(
					"\n📝 Message de commit",
				);
				if (!commitMsg) {
					console.error("❌ Un message de commit est requis");
					process.exit(1);
				}

				executeCommand(`git add . && git commit -m "${commitMsg}"`);
				console.log("✅ Changements commités");
			} else {
				console.log(
					"❌ Veuillez commiter ou stasher vos changements avant de créer une PR",
				);
				process.exit(1);
			}
		}

		// Déterminer le type de PR
		if (!type) {
			type = getDefaultPrType();
		}

		if (!Object.keys(PR_TYPES).includes(type)) {
			console.error(`\n❌ Type de PR invalide: ${type}`);
			console.error(`Types valides: ${Object.keys(PR_TYPES).join(", ")}`);
			process.exit(1);
		}

		// Obtenir un titre si non fourni
		if (!title) {
			title = await promptForInput(
				"\n📝 Titre de la PR",
				getDefaultTitle(),
			);
			if (!title) {
				console.error("❌ Un titre est requis");
				process.exit(1);
			}
		}

		// Push la branche
		console.log("\n🔄 Push de la branche...");

		// Vérifier si la branche existe sur origin
		const remoteBranches = executeCommand("git branch -r");
		if (!remoteBranches.includes(`origin/${currentBranch}`)) {
			executeCommand(`git push -u origin ${currentBranch}`);
		} else {
			executeCommand("git push");
		}

		// Créer la PR
		const fullTitle = `${PR_TYPES[type]}: ${title}`;
		console.log(`\n🔄 Création de la PR: "${fullTitle}"...`);

		// Utiliser gh CLI pour créer la PR
		try {
			executeCommand(
				`gh pr create --title "${fullTitle}" --body-file .github/pull_request_template.md`,
			);
			console.log("\n✅ Pull Request créée avec succès!");
		} catch (error) {
			console.error(
				"\n❌ Erreur lors de la création de la PR. Vérifiez que GitHub CLI est installé.",
			);
			console.error(
				"Installation: https://github.com/cli/cli#installation",
			);
			console.error(
				"\nAlternativement, vous pouvez créer la PR manuellement sur GitHub.",
			);
			process.exit(1);
		}
	} catch (error) {
		console.error(`\n❌ Une erreur est survenue: ${error.message}`);
		process.exit(1);
	}
})();
