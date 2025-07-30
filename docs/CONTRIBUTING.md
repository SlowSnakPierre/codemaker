# Guide de contribution à Codemaker

Ce document détaille les processus, conventions et bonnes pratiques à suivre pour contribuer efficacement au projet Codemaker. Que vous soyez développeur, designer, testeur ou rédacteur technique, votre contribution est précieuse !

## 📋 Sommaire

- [Prérequis](#prérequis)
- [Workflow de développement](#workflow-de-développement)
- [Style de code](#style-de-code)
- [Messages de commit](#messages-de-commit)
- [Pull Requests](#pull-requests)
- [Tests](#tests)
- [Documentation](#documentation)
- [Processus de release](#processus-de-release)
- [Résolution des problèmes](#résolution-des-problèmes)

## 🛠️ Prérequis

Avant de commencer à contribuer, assurez-vous d'avoir installé :

- **Node.js** (v18+)
- **Bun** (dernière version stable)
- **Git** (2.30.0+)
- Un éditeur de code ([VS Code](https://code.visualstudio.com/) recommandé avec les extensions suivantes) :
    - ESLint
    - Prettier
    - TypeScript + Plugin

## 🔄 Workflow de développement

Nous utilisons une version simplifiée du modèle **GitHub Flow** :

### 1. Préparer votre environnement

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/codemaker.git
cd codemaker

# Installer les dépendances
bun install

# Configurer les hooks git pré-commit
bun run prepare
```

### 2. Créer une branche de travail

```bash
# S'assurer que votre branche main est à jour
git checkout main
git pull

# Option 1 : Créer une branche avec notre script automatisé
bun run new-branch <type> <nom>

# Option 2 : Créer manuellement une branche
git checkout -b type/description-concise
```

#### Nomenclature des branches

- `feature/...` - Nouvelles fonctionnalités
- `fix/...` - Corrections de bugs
- `docs/...` - Améliorations de la documentation
- `refactor/...` - Refactoring sans ajout de fonctionnalité
- `test/...` - Ajout ou modification de tests
- `perf/...` - Améliorations de performance
- `chore/...` - Maintenance, modifications d'outils, etc.

### 3. Développer et tester

```bash
# Lancer l'application en mode développement
bun run dev

# Vérifier le code (lint, types, format)
bun run validate
```

### 4. Créer une Pull Request

```bash
# Option 1 : Utiliser notre script automatisé
bun run new-pr

# Option 2 : Pousser manuellement les changements
git push -u origin votre-branche
```

Puis, sur GitHub :

1. Naviguez vers votre branche
2. Cliquez sur "Compare & pull request"
3. Remplissez le template avec :
    - Un titre clair suivant la convention Conventional Commits
    - Une description détaillée des changements
    - Des références aux issues associées (#123)
4. Demandez une revue à au moins un membre de l'équipe
5. Attendez les retours et apportez les modifications nécessaires

## 💻 Style de code

Nous utilisons plusieurs outils pour maintenir la cohérence et la qualité du code :

- **TypeScript** pour le typage statique
- **ESLint** pour l'analyse de code
- **Prettier** pour le formatage
- **Husky + lint-staged** pour la validation pré-commit

```bash
# Vérifier le typage
bun run typecheck

# Linter
bun run lint

# Formater le code
bun run format:write

# Vérification complète
bun run validate
```

### Conventions importantes

- Indentation avec des tabulations (configuré dans Prettier)
- Nommage en camelCase pour les variables et fonctions
- PascalCase pour les composants React et les classes
- Types explicites partout où c'est possible
- Pas de `any` sauf cas exceptionnels (à justifier dans un commentaire)
- Commentaires JSDoc pour les fonctions publiques

## 📝 Messages de commit

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[scope optional]: <description>

[corps optional]

[pied de page optional]
```

### Types de commit

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage (sans changement fonctionnel)
- `refactor:` - Refactoring (sans changement fonctionnel)
- `perf:` - Amélioration des performances
- `test:` - Ajout ou modification de tests
- `build:` - Changements système de build ou dépendances
- `ci:` - Changements workflow CI
- `chore:` - Autres changements

### Exemples

```
feat(editor): ajouter la fonction de complétion de code

fix(explorer): corriger le problème de rafraîchissement des dossiers

docs: mettre à jour la documentation de l'API
```

### Bonnes pratiques

- Un commit = une modification logique
- Préférez plusieurs petits commits cohérents
- Premier ligne de 50 caractères max
- Corps du message détaillé si nécessaire (quoi, pourquoi, pas comment)
- Mentionnez les issues associées : "fixes #123"

## 🧪 Tests

Pour chaque nouvelle fonctionnalité ou correction, nous encourageons l'ajout de tests :

```bash
# Exécuter les tests
bun run test

# Mode watch pendant le développement
bun run test:watch
```

Types de tests à considérer :

- Tests unitaires pour les fonctions et composants isolés
- Tests d'intégration pour les interactions entre modules
- Tests d'interface utilisateur pour valider l'expérience utilisateur

## 📚 Documentation

La documentation est essentielle pour rendre le projet accessible :

- Documentez les nouvelles fonctionnalités dans README.md
- Mettez à jour la documentation technique si nécessaire
- Ajoutez des commentaires JSDoc aux fonctions publiques
- Pour les changements majeurs d'API, mettez à jour les exemples de code

## 🚢 Processus de release

Les releases sont gérées par les mainteneurs du projet :

```bash
# Créer une nouvelle release (par défaut: patch)
bun run release [patch|minor|major] [beta|alpha]
```

## 🆘 Résolution des problèmes

Si vous rencontrez des difficultés :

1. Vérifiez les issues existantes
2. Consultez la documentation technique
3. Demandez de l'aide dans les discussions GitHub
4. Contactez un mainteneur pour des cas complexes

---

Merci de contribuer à Codemaker ! Votre implication aide à faire de ce projet un meilleur outil pour tous les développeurs. ❤️

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
