"use strict";

var fs = require("fs-extra");
var path = require("path");
var arg = require("arg");
var chalk = require("chalk");
var { execa } = require("execa");
var logger = require("./logger.js");

const cwd = process.cwd();
const pkgPath = path.join(cwd, "package.json");
const nextConfigPath = path.join(cwd, "renderer", "next.config.js");
const useExportCommand = async () => {
	const { dependencies, devDependencies } = await fs.readJSON(pkgPath);

	let nextVersion = dependencies.next;

	if (nextVersion) {
		logger.info(
			"To reduce the bundle size of the electron app, we recommend placing next and engine in devDependencies instead of dependencies.",
		);
	}

	if (!nextVersion) {
		nextVersion = devDependencies.next;

		if (!nextVersion) {
			logger.error(
				"Next not found in both dependencies and devDependencies.",
			);
			process.exit(1);
		}
	}

	const majorVersion = ~~nextVersion
		.split(".")
		.filter((v) => v.trim() !== "")[0]
		.replace("^", "")
		.replace("~", "");

	if (majorVersion < 13) {
		return true;
	}

	if (majorVersion === 13) {
		const { output, distDir } = require(nextConfigPath);
		if (output === "export") {
			if (distDir !== "../app") {
				logger.error(
					'engine export the build results to "app" directory, so please set "distDir" to "../app" in next.config.js.',
				);
				process.exit(1);
			}

			return false;
		}

		return true;
	}

	if (majorVersion > 13) {
		const { output, distDir } = require(nextConfigPath);

		if (output !== "export") {
			logger.error(
				'We must export static files so as Electron can handle them. Please set next.config.js#output to "export".',
			);
			process.exit(1);
		}

		if (distDir !== "../app") {
			logger.error(
				'engine exports the build results to "app" directory, so please set "distDir" to "../app" in next.config.js.',
			);
			process.exit(1);
		}

		return false;
	}

	logger.error("Unexpected error occerred");
	process.exit(1);
};

const args = arg({
	"--mac": Boolean,
	"--linux": Boolean,
	"--win": Boolean,
	"--x64": Boolean,
	"--ia32": Boolean,
	"--armv7l": Boolean,
	"--arm64": Boolean,
	"--universal": Boolean,
	"--config": String,
	"--publish": String,
	"--no-pack": Boolean,
});

const appDir = path.join(cwd, "app");
const distDir = path.join(cwd, "dist");
const rendererSrcDir = "renderer";
const execaOptions = {
	cwd,
	stdio: "inherit",
};

(async () => {
	process.env.ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true";

	try {
		logger.info("Clearing previous builds");
		await Promise.all([fs.remove(appDir), fs.remove(distDir)]);

		logger.info("Building renderer process");
		await execa(
			"next",
			["build", path.join(cwd, rendererSrcDir)],
			execaOptions,
		);

		if (await useExportCommand()) {
			await execa(
				"next",
				["export", "-o", appDir, path.join(cwd, rendererSrcDir)],
				execaOptions,
			);
		}

		logger.info("Building main process");
		await execa(
			"node",
			[path.join(__dirname, "webpack.config.js")],
			execaOptions,
		);

		if (args["--no-pack"]) {
			logger.info("Skip packaging...");
		} else {
			logger.info("Packaging - please wait a moment");
			await execa("electron-builder", createBuilderArgs(), execaOptions);
		}

		logger.info("See `dist` directory");
	} catch (err) {
		console.log(chalk`

{bold.red Cannot build electron packages:}
{bold.yellow ${err}}
`);
		process.exit(1);
	}
})();

function createBuilderArgs() {
	const results = [];
	if (args["--config"]) {
		results.push("--config");
		results.push(args["--config"] || "electron-builder.yml");
	}
	if (args["--publish"]) {
		results.push("--publish");
		results.push(args["--publish"]);
	}
	args["--mac"] && results.push("--mac");
	args["--linux"] && results.push("--linux");
	args["--win"] && results.push("--win");
	args["--x64"] && results.push("--x64");
	args["--ia32"] && results.push("--ia32");
	args["--armv7l"] && results.push("--armv7l");
	args["--arm64"] && results.push("--arm64");
	args["--universal"] && results.push("--universal");
	return results;
}
