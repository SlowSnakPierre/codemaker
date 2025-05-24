"use strict";

var arg = require("arg");
var webpack = require("webpack");
var fs = require("fs");
var path = require("path");
var webpackMerge = require("webpack-merge");
var TsconfigPathsPlugins = require("tsconfig-paths-webpack-plugin");
var logger = require("./logger.js");
var concurrently = require("concurrently");
var treeKill = require("tree-kill");

const cwd = process.cwd();
const getBabelConfig = () => {
	if (fs.existsSync(path.join(cwd, ".babelrc")))
		return path.join(cwd, ".babelrc");
	if (fs.existsSync(path.join(cwd, ".babelrc.js")))
		return path.join(cwd, ".babelrc.js");
	if (fs.existsSync(path.join(cwd, "babel.config.js")))
		return path.join(cwd, "babel.config.js");
	return path.join(__dirname, "babel.js");
};

const isTs = fs.existsSync(path.join(cwd, "tsconfig.json"));
const ext = isTs ? ".ts" : ".js";
const externals = require(path.join(cwd, "package.json")).dependencies;
const backgroundPath = path.join(cwd, "main", `background${ext}`);
const preloadPath = path.join(cwd, "main", `preload${ext}`);
const entry = { background: backgroundPath };

if (fs.existsSync(preloadPath)) {
	entry.preload = preloadPath;
}

const baseConfig = {
	target: "electron-main",
	entry,
	output: {
		filename: "[name].js",
		path: path.join(cwd, "app"),
		library: { type: "umd" },
	},
	externals: [...Object.keys(externals || {})],
	module: {
		rules: [
			{
				test: /\.(js|ts)x?$/,
				use: {
					loader: require.resolve("babel-loader"),
					options: {
						cacheDirectory: true,
						extends: getBabelConfig(),
					},
				},
				exclude: [/node_modules/, path.join(cwd, "renderer")],
			},
		],
	},
	resolve: {
		extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
		modules: ["node_modules"],
		plugins: [isTs ? new TsconfigPathsPlugins() : null].filter(Boolean),
	},
	stats: "errors-only",
	node: {
		__dirname: false,
		__filename: false,
	},
};

let config = webpackMerge.merge(baseConfig, {
	mode: "development",
	plugins: [
		new webpack.EnvironmentPlugin({ NODE_ENV: "development" }),
		new webpack.LoaderOptionsPlugin({ debug: true }),
	],
	devtool: "inline-source-map",
});

const args = arg({
	"--renderer-port": Number,
	"--run-only": Boolean,
	"--startup-delay": Number,
	"--electron-options": String,
});

const rendererPort = args["--renderer-port"] || 8888;
const startupDelay = args["--startup-delay"] || 10_000;
let electronOptions = args["--electron-options"] || "";

if (!electronOptions.includes("--remote-debugging-port")) {
	electronOptions += " --remote-debugging-port=5858";
}
if (!electronOptions.includes("--inspect")) {
	electronOptions += " --inspect=9292";
}
electronOptions = electronOptions.trim();

let isShuttingDown = false;
let processes = [];
let watching = null;

const trackProcess = (proc, name) => {
	processes.push({ proc, name });

	proc.on("exit", (code) => {
		logger.info(`${name} exited with code ${code}`);

		processes = processes.filter((p) => p.proc !== proc);

		if (
			!isShuttingDown &&
			(name === "electron" || (code !== 0 && code !== null))
		) {
			logger.info(`Critical process ${name} died, shutting down all...`);
			shutdown();
		}
	});

	return proc;
};

const shutdown = () => {
	if (isShuttingDown) return;
	isShuttingDown = true;

	logger.info("=== STARTING SHUTDOWN ===");

	if (watching) {
		try {
			watching.close(() => logger.info("Webpack watcher closed"));
		} catch (e) {
			logger.error("Error closing webpack watcher:", e.message);
		}
	}

	logger.info(`Killing ${processes.length} tracked processes...`);
	processes.forEach(({ proc, name }) => {
		if (proc && !proc.killed) {
			logger.info(`Killing ${name} (PID: ${proc.pid})`);
			try {
				proc.kill("SIGTERM");

				setTimeout(() => {
					if (proc && !proc.killed) {
						proc.kill("SIGKILL");
					}
				}, 2000);
			} catch (e) {
				logger.error(`Error killing ${name}:`, e.message);
			}
		}
	});

	setTimeout(() => {
		logger.info("=== SHUTDOWN COMPLETE ===");
		process.exit(0);
	}, 3000);
};

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
	process.on(signal, () => {
		logger.info(`Received ${signal}, shutting down...`);
		shutdown();
	});
});

process.on("exit", () => {
	logger.info("Process exiting...");
});

(async () => {
	try {
		let isFirstCompile = true;
		let isRunning = false;
		let concurrentlyInstance = null;

		const startAllProcesses = () => {
			if (isRunning) {
				logger.info("Stopping previous processes...");
				if (concurrentlyInstance) {
					concurrentlyInstance.close();
				}
			}

			logger.info("Starting processes...");
			const commands = [
				{
					name: "next",
					command: `npx next -p ${rendererPort} renderer`,
					prefixColor: "blue",
				},
			];

			if (!args["--run-only"] || isFirstCompile) {
				commands.push({
					name: "electron",
					command: `npx electron . ${rendererPort} ${electronOptions}`,
					prefixColor: "green",
					env: { FORCE_COLOR: "1" },
				});
			}

			const options = {
				prefix: "name",
				killOthers: ["failure", "success"],
				restartTries: 0,
				cwd: process.cwd(),
			};

			concurrentlyInstance = concurrently(commands, options);
			concurrentlyInstance.result.then(
				() => {
					logger.info("All processes exited successfully");
					process.exit(0);
				},
				() => {
					logger.info("One or more processes ended");
					process.exit(0);
				},
			);

			isRunning = true;
			isFirstCompile = false;
		};

		const compiler = webpack(config);
		watching = compiler.watch({}, (error, stats) => {
			if (error) {
				console.error(error.stack || error);
				return;
			}

			if (stats && stats.hasErrors()) {
				console.error(stats.toString("errors-only"));
				return;
			}

			if (args["--run-only"] && !isFirstCompile) {
				logger.info(
					"Webpack recompiled, but not restarting in run-only mode",
				);
				return;
			}

			logger.info(
				"Webpack compilation successful, (re)starting processes...",
			);

			setTimeout(startAllProcesses, 500);
		});
		const cleanup = () => {
			logger.info("Shutting down...");

			if (watching) {
				watching.close(() => {
					logger.info("Webpack watcher closed");
				});
			}

			if (concurrentlyInstance) {
				try {
					concurrentlyInstance.commands.forEach((command) => {
						if (command.pid) {
							logger.info(
								`Killing process ${command.name} (PID: ${command.pid})`,
							);
							try {
								treeKill(command.pid, "SIGTERM");
							} catch (err) {
								logger.error(
									`Error killing ${command.name}: ${err.message}`,
								);
							}
						}
					});
				} catch (err) {
					logger.error(`Error during cleanup: ${err.message}`);
				}
			}

			setTimeout(() => {
				process.exit(0);
			}, 1000);
		};

		process.on("SIGINT", cleanup);
		process.on("SIGTERM", cleanup);
		process.on("exit", cleanup);
	} catch (error) {
		logger.error(`Fatal error: ${error.message}`);
		process.exit(1);
	}
})();
