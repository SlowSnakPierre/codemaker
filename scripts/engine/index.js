"use strict";

var path = require("path");
var { execa } = require("execa");

const defaultCommand = "dev";
const commands = new Set(["build", defaultCommand]);

const nodeArgs = [];
const inspectArg = process.argv.find((arg) => arg.includes("--inspect"));
if (inspectArg) {
	nodeArgs.push(inspectArg);
}

let cmd = process.argv[2];
let args = [];
if (commands.has(cmd)) {
	args = process.argv.slice(3);
} else {
	cmd = defaultCommand;
	args = process.argv.slice(2);
}

const defaultEnv = cmd === "dev" ? "development" : "production";
process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv;

const cli = path.join(__dirname, `engine-${cmd}`);

let isShuttingDown = false;
let currentProcess = null;

const startProcess = () => {
	console.log(
		`Starting process: node ${[...nodeArgs, cli, ...args].join(" ")}`,
	);

	const proc = execa("node", [...nodeArgs, cli, ...args], {
		stdio: "inherit",
		// IMPORTANT: Ne pas détacher le processus
		detached: false,
		// Propager les signaux
		killSignal: "SIGTERM",
		cleanup: true,
	});

	currentProcess = proc;

	proc.on("close", (code, signal) => {
		console.log(`Child process closed with code ${code}, signal ${signal}`);

		if (isShuttingDown) {
			process.exit(0);
			return;
		}

		if (code !== null) {
			process.exit(code);
		}

		if (signal) {
			if (signal === "SIGKILL") {
				process.exit(137);
			}
			process.exit(1);
		}

		process.exit(0);
	});

	proc.on("error", (err) => {
		console.error("Child process error:", err);
		process.exit(1);
	});

	// IMPORTANT: Écouter l'événement spawn pour confirmer que le processus a démarré
	proc.on("spawn", () => {
		console.log(`Child process spawned with PID: ${proc.pid}`);
	});

	return proc;
};

const killProcess = (signal = "SIGTERM") => {
	if (isShuttingDown) {
		return;
	}

	isShuttingDown = true;
	console.log(`Received shutdown signal, killing child process...`);

	if (currentProcess && !currentProcess.killed) {
		try {
			console.log(`Sending ${signal} to PID ${currentProcess.pid}`);
			currentProcess.kill(signal);

			// Force kill après 2 secondes si le processus ne répond pas
			setTimeout(() => {
				if (currentProcess && !currentProcess.killed) {
					console.log(`Force killing PID ${currentProcess.pid}`);
					try {
						currentProcess.kill("SIGKILL");
					} catch (e) {
						// Processus déjà mort
					}
				}
				process.exit(0);
			}, 2000);
		} catch (err) {
			console.error(`Error killing child process: ${err.message}`);
			process.exit(1);
		}
	} else {
		process.exit(0);
	}
};

// Démarrer le processus
const proc = startProcess();

// Gestionnaires de signaux - TRÈS IMPORTANT
process.on("SIGINT", () => {
	console.log("Dispatcher received SIGINT");
	killProcess("SIGINT");
});

process.on("SIGTERM", () => {
	console.log("Dispatcher received SIGTERM");
	killProcess("SIGTERM");
});

process.on("SIGHUP", () => {
	console.log("Dispatcher received SIGHUP");
	killProcess("SIGHUP");
});

// Gestionnaire d'exit pour cleanup final
process.on("exit", (code) => {
	console.log(`Dispatcher exiting with code ${code}`);
	if (currentProcess && !currentProcess.killed && !isShuttingDown) {
		try {
			currentProcess.kill("SIGKILL");
		} catch (e) {
			// Ignorer les erreurs
		}
	}
});

// Gestion des erreurs non capturées
process.on("uncaughtException", (err) => {
	console.error("Uncaught exception in dispatcher:", err);
	killProcess("SIGTERM");
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled rejection in dispatcher:", reason);
	killProcess("SIGTERM");
});
