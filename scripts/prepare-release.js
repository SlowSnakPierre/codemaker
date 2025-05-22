#!/usr/bin/env node

/**
 * Script pour préparer une nouvelle version
 * Utilisation: bun run release [patch|minor|major] [beta|alpha]
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Configuration
const VALID_BUMP_TYPES = ["patch", "minor", "major"];
const VALID_PRE_RELEASE = ["beta", "alpha", ""];

// Récupérer les arguments
const args = process.argv.slice(2);
let bumpType = args[0] || "patch";
let preRelease = args[1] || "";

if (!VALID_BUMP_TYPES.includes(bumpType)) {
	console.error(`Type de version invalide: ${bumpType}`);
	console.error(
		`Utilisez un des types suivants: ${VALID_BUMP_TYPES.join(", ")}`,
	);
	process.exit(1);
}

if (preRelease && !VALID_PRE_RELEASE.includes(preRelease)) {
	console.error(`Type de pré-release invalide: ${preRelease}`);
	console.error(
		`Utilisez un des types suivants: ${VALID_PRE_RELEASE.filter(Boolean).join(", ")} ou omettez pour une version stable`,
	);
	process.exit(1);
}

// Fonctions utilitaires
function getCurrentVersion() {
	const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
	return packageJson.version;
}

function getNewVersion(currentVersion, bumpType, preRelease) {
	const [major, minor, patch] = currentVersion
		.split("-")[0]
		.split(".")
		.map(Number);

	let newVersion;
	switch (bumpType) {
		case "major":
			newVersion = `${major + 1}.0.0`;
			break;
		case "minor":
			newVersion = `${major}.${minor + 1}.0`;
			break;
		case "patch":
		default:
			newVersion = `${major}.${minor}.${patch + 1}`;
	}

	if (preRelease) {
		newVersion = `${newVersion}-${preRelease}`;
	}

	return newVersion;
}

// Exécuter la commande release dans GitHub Actions
async function runRelease(version, type) {
	console.log(
		`\nPréparation de la version ${version} (${type || "stable"})...`,
	);

	try {
		// S'assurer que les changements sont commités
		const status = execSync("git status --porcelain").toString().trim();
		if (status) {
			console.error(
				"\u274C Vous avez des changements non commités. Veuillez commiter ou stash vos changements avant de continuer.",
			);
			process.exit(1);
		}

		// Push vers GitHub pour déclencher le workflow
		console.log("📤 Push vers GitHub...");
		execSync("git push", { stdio: "inherit" });

		// Déclencher le workflow release
		console.log("🚀 Déclenchement du workflow de release...");
		execSync(
			`gh workflow run release.yml --ref main -f version=${version} -f type=${type || "stable"}`,
			{ stdio: "inherit" },
		);

		console.log("\n✅ Workflow de release déclenché avec succès!");
		console.log(
			"   Suivez la progression sur GitHub: https://github.com/[owner]/codemaker/actions",
		);
	} catch (error) {
		console.error(
			`❌ Erreur lors du déclenchement du workflow: ${error.message}`,
		);
		process.exit(1);
	}
}

// Exécution principale
(async function main() {
	const currentVersion = getCurrentVersion();
	const newVersion = getNewVersion(currentVersion, bumpType, preRelease);

	console.log(`\n📦 Préparation de la release:`);
	console.log(`   Version actuelle: ${currentVersion}`);
	console.log(`   Nouvelle version: ${newVersion}`);
	console.log(
		`   Type: ${bumpType} ${preRelease ? `(${preRelease})` : "(stable)"}`,
	);

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	rl.question("\n🔍 Souhaitez-vous continuer? (y/N): ", async (answer) => {
		rl.close();
		if (answer.toLowerCase() === "y") {
			await runRelease(
				newVersion.split("-")[0], // Version sans suffixe pour le workflow
				preRelease, // Type de release
			);
		} else {
			console.log("❌ Opération annulée");
		}
	});
})();
