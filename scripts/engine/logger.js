var chalk = require("chalk");

module.exports = {
	info: (message) => {
		console.log(chalk`{cyan [engine]} ${message}`);
	},
	error: (message) => {
		console.log(chalk`{cyan [engine]} {red ${message}}`);
	},
};
