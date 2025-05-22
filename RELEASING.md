# Processus de publication de Codemaker

Ce document explique le processus de création et de publication de nouvelles versions de Codemaker.

## Cycle de publication

1. **Développement continu** sur la branche `main` via des pull requests
2. **Préparation d'une version** lorsque suffisamment de fonctionnalités ou corrections sont accumulées
3. **Publication de la version** via le workflow GitHub Actions
4. **Distribution** des binaires pour Windows, macOS et Linux

## Types de versions

- **Patch (0.0.x)** - Corrections de bugs et petites améliorations
- **Minor (0.x.0)** - Nouvelles fonctionnalités sans changements cassants
- **Major (x.0.0)** - Changements majeurs avec possibles incompatibilités

- **Pré-releases** - Versions en développement
    - **Alpha (x.y.z-alpha)** - En développement actif, instable
    - **Beta (x.y.z-beta)** - Fonctionnelle mais en test, potentiellement instable

## Création d'une nouvelle version

### Option 1: Utiliser le script de release (recommandé)

Le script `release` simplifie le processus de création d'une nouvelle version.

```bash
# Version patch (0.0.x)
bun run release

# Version mineure (0.x.0)
bun run release minor

# Version majeure (x.0.0)
bun run release major

# Version beta
bun run release patch beta

# Version alpha
bun run release minor alpha
```

Ce script:

1. Détermine la nouvelle version
2. Vous demande confirmation
3. Déclenche le workflow GitHub Actions `release.yml`
4. Le workflow se charge de:
    - Mettre à jour `package.json`
    - Créer un commit et un tag
    - Générer les notes de version
    - Créer une release GitHub
    - Construire les binaires pour toutes les plateformes

### Option 2: Déclencher manuellement le workflow

Vous pouvez également déclencher le workflow manuellement depuis l'interface GitHub:

1. Allez sur l'onglet "Actions" du dépôt GitHub
2. Sélectionnez le workflow "Release Management"
3. Cliquez sur "Run workflow"
4. Remplissez les paramètres:
    - **Version**: Numéro de version (ex: 1.0.0)
    - **Type**: stable, beta, ou alpha
5. Cliquez sur "Run workflow"

## Contenu des notes de version

Les notes sont générées automatiquement en fonction des commits depuis la dernière version:

- **✨ Nouvelles fonctionnalités** - À partir des commits commençant par "feat:"
- **🐛 Corrections** - À partir des commits commençant par "fix:"
- **⚡ Performance** - À partir des commits commençant par "perf:"
- **⚠️ Changements majeurs** - Pour les versions majeures, à partir des messages "BREAKING CHANGE:"

## Gestion des builds

Une fois la release créée, le workflow de build est automatiquement déclenché:

1. Les binaires sont construits pour Windows, macOS et Linux
2. Les artéfacts sont attachés à la release GitHub
3. La version est marquée comme "pre-release" si c'est une version alpha/beta

## Workflow de hotfix

Pour corriger un bug critique dans une version déjà publiée:

1. Créez une branche depuis le tag de la version concernée:
    ```bash
    git checkout v1.0.0
    git checkout -b hotfix/correction-bug-critique
    ```
2. Corrigez le bug et committez
3. Créez une PR vers `main`
4. Une fois fusionnée, créez une nouvelle version patch

## Bonnes pratiques

- Assurez-vous que tous les tests passent avant de publier une version
- Mettez à jour la documentation si nécessaire
- Testez les builds sur différentes plateformes avant de publier une version stable
- Utilisez des versions alpha/beta pour les changements majeurs ou risqués
- Maintenez un historique de commits propre et organisé
