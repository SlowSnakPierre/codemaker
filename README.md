# Codemaker

Un IDE moderne construit avec Electron et Next.js, inspiré par VS Code et Bolt.

## Fonctionnalités

- Interface utilisateur moderne basée sur Next.js et TailwindCSS
- Éditeur de code Monaco (utilisé dans VS Code)
- Support multi-fichiers et multi-onglets
- Explorateur de fichiers
- Thèmes clairs et sombres
- Application bureau avec Electron pour Windows, macOS et Linux

## Démarrage rapide

```bash
# Installer les dépendances
bun install

# Lancer l'application en mode développement
bun run dev
```

L'application démarre automatiquement une fenêtre Electron avec l'interface Next.js.

### Build

```bash
# Créer un exécutable pour votre système
bun run build
```

Les fichiers de sortie se trouvent dans le dossier `dist`.

## Workflow de développement

Ce projet utilise GitHub Flow pour la gestion du code:

1. Créez une branche depuis `main` pour chaque fonctionnalité/correction
2. Développez et testez vos modifications
3. Créez une Pull Request vers `main`
4. Après revue et approbation, la PR est fusionnée dans `main`

### Règles de commit

Nous utilisons la convention [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage, pas de changement fonctionnel
- `refactor:` - Refactoring de code
- `perf:` - Amélioration des performances
- `test:` - Ajout ou correction de tests
- `build:` - Changements affectant le système de build
- `ci:` - Changements de configuration CI
- `chore:` - Autres changements qui ne modifient pas le code source

### Releases

Pour créer une nouvelle version:

```bash
# Créer une version patch (0.0.x)
bun run release

# Créer une version mineure (0.x.0)
bun run release minor

# Créer une version majeure (x.0.0)
bun run release major

# Créer une version pre-release (beta)
bun run release patch beta
```

## Structure du projet

- `/electron` - Code Electron (main process)
- `/src` - Code React/Next.js (renderer process)
    - `/app` - Routes et layouts Next.js
    - `/components` - Composants React
    - `/lib` - Utilitaires et fonctions
    - `/hooks` - Hooks React personnalisés

## Documentation supplémentaire

- [Guide de contribution](./CONTRIBUTING.md)
- [Guide de release](./RELEASING.md)
