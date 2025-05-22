// Configuration des hooks Git
export default {
	hooks: {
		"commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
		"pre-commit": "lint-staged",
		"pre-push": "bun run validate",
	},
};
