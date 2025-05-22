# Guide de développement pour Codemaker

Ce document décrit le workflow de développement et les bonnes pratiques pour le projet Codemaker.

## Workflow de développement

Nous suivons une version simplifiée de **GitHub Flow** :

1. Créer une branche depuis `main` pour chaque fonctionnalité/correction
2. Développer et tester vos modifications
3. Créer une Pull Request pour fusionner dans `main`
4. Après revue et validation, fusionner dans `main`

### Étapes détaillées

#### 1. Créer une branche

```bash
# S'assurer que votre main est à jour
git checkout main
git pull

# Créer une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite
```

Nomenclature des branches :

- `feature/...` - Nouvelles fonctionnalités
- `fix/...` - Corrections de bugs
- `docs/...` - Documentation
- `refactor/...` - Refactoring de code
- `chore/...` - Autres modifications

#### 2. Développer

Travaillez sur vos modifications. Committez régulièrement avec des messages descriptifs suivant la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
git add .
git commit -m "feat: ajouter la fonctionnalité X"
```

Types de commits principaux :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage
- `refactor:` - Refactoring de code
- `test:` - Tests
- `chore:` - Autres modifications

#### 3. Pousser et créer une Pull Request

```bash
git push -u origin feature/nom-de-la-fonctionnalite
```

Ensuite, créez une Pull Request sur GitHub :

1. Allez sur le [dépôt GitHub](https://github.com/votre-organisation/codemaker)
2. Cliquez sur "Compare & pull request"
3. Remplissez le template avec une description claire
4. Demandez une revue à au moins un membre de l'équipe

#### 4. Revue de code et fusion

Une fois la PR approuvée, elle peut être fusionnée dans `main`.

## Process de release

Les releases sont gérées par le mainteneur principal :

1. Mettre à jour la version :

    ```bash
    bun run release [patch|minor|major] [beta|alpha]
    ```

2. Cette commande :
    - Met à jour la version dans package.json
    - Crée un tag git
    - Déclenche le workflow de release GitHub
    - Construit les packages pour toutes les plateformes

## Bonnes pratiques

### Code

- Utilisez TypeScript pour tout nouveau code
- Commentez les parties complexes ou non évidentes
- Suivez les conventions de style du projet (enforced by ESLint & Prettier)
- Écrivez des tests pour les nouvelles fonctionnalités

### Commits

- Préférez plusieurs petits commits ciblés plutôt qu'un gros commit
- Chaque commit doit représenter une unité logique de changement
- Suivez la convention Conventional Commits
- Si un commit résout une issue, mentionnez-la avec "fixes #123"

### Revue de code

- Soyez respectueux et constructif
- Concentrez-vous sur le code, pas sur la personne
- Vérifiez la fonctionnalité, la qualité du code et la couverture de tests
- N'hésitez pas à demander des clarifications

## Configuration locale recommandée

### Extensions VS Code

- ESLint
- Prettier
- GitLens
- GitHub Pull Requests and Issues

### Configuration de l'éditeur

Dans votre `settings.json` VS Code :

```json
{
	"editor.formatOnSave": true,
	"editor.codeActionsOnSave": {
		"source.fixAll.eslint": "explicit"
	},
	"editor.defaultFormatter": "esbenp.prettier-vscode"
}
```
