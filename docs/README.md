# Codemaker

<div style="display: flex;">
    <img src="public/logo.svg" style="margin-left: 1rem; margin-right: 1.5rem; width: 20%" />
    <h3 style="font-size: 1.25rem;">
    Codemaker est un environnement de développement intégré (IDE) moderne et performant, construit avec Electron et Next.js. Inspiré par Visual Studio Code et Bolt, il offre une expérience de développement fluide avec des fonctionnalités avancées tout en maintenant une interface utilisateur élégante et réactive.</h3>
</div>

## ✨ Fonctionnalités principales

- **Interface utilisateur moderne** : Construite avec Next.js et TailwindCSS pour une expérience fluide et réactive
- **Éditeur de code avancé** : Basé sur Monaco Editor (le même que VS Code) avec coloration syntaxique, complétion de code et bien plus
- **Gestion multi-fichiers** : Support complet pour travailler sur plusieurs fichiers simultanément avec système d'onglets
- **Explorateur de fichiers intégré** : Naviguez facilement dans vos projets avec une vue hiérarchique des dossiers et fichiers
- **Système de thèmes** : Basculez entre thèmes clairs et sombres selon vos préférences
- **Multi-plateforme** : Application bureau disponible pour Windows, macOS et Linux grâce à Electron
- **Surveillance de fichiers en temps réel** : Détection automatique des modifications effectuées en dehors de l'éditeur
- **Interface personnalisable** : Panneaux redimensionnables et configuration adaptable

## 🚀 Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [Bun](https://bun.sh/) (gestionnaire de paquets et runtime JavaScript)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/codemaker.git
cd codemaker

# Installer les dépendances
bun install
```

### Lancement en mode développement

```bash
# Démarrer l'application en mode développement
bun run dev
```

Cette commande lance simultanément le serveur Next.js et l'application Electron, vous permettant de voir vos modifications en temps réel.

### Construction pour production

```bash
# Créer un exécutable pour votre système d'exploitation
bun run build
```

Les fichiers compilés se trouvent dans le dossier `dist`, prêts à être distribués.

## 🏗️ Architecture du projet

Codemaker utilise une architecture hybride combinant Next.js pour l'interface utilisateur et Electron pour les fonctionnalités de bureau :

- **Front-end (Renderer Process)** : Construit avec React et Next.js
- **Back-end (Main Process)** : Gestion des fichiers système et opérations natives via Electron
- **Communication** : IPC (Inter-Process Communication) entre les processus main et renderer

### Structure des dossiers

```
codemaker/
├── electron/             # Code Electron (main process)
│   ├── main.js           # Point d'entrée Electron
│   └── preload.js        # Script de pré-chargement sécurisé
├── public/               # Assets statiques
├── scripts/              # Scripts d'utilitaires pour le développement
└── src/
    ├── app/              # Routes et layouts Next.js (App Router)
    ├── components/       # Composants React réutilisables
    │   ├── debug/        # Composants pour le débogage
    │   ├── editor/       # Composants de l'éditeur de code
    │   ├── layouts/      # Composants de mise en page
    │   ├── providers/    # Fournisseurs de contexte React
    │   └── ui/           # Composants d'interface utilisateur
    ├── hooks/            # Hooks React personnalisés
    └── lib/              # Utilitaires, types et fonctions partagées
```

## 📦 Technologies utilisées

- **Framework UI** : [Next.js](https://nextjs.org/) 15.3
- **Application Desktop** : [Electron](https://www.electronjs.org/) 36.2
- **Éditeur de code** : [Monaco Editor](https://microsoft.github.io/monaco-editor/) via @monaco-editor/react
- **Styling** : [TailwindCSS](https://tailwindcss.com/) 4.x avec [shadcn/ui](https://ui.shadcn.com/)
- **État et Formulaires** : React Hook Form, Zod
- **Surveillance des fichiers** : Chokidar
- **Composants UI** : Radix UI, Lucide React
- **Gestion de build** : Electron Builder
- **Tests et qualité de code** : ESLint, TypeScript, Prettier

## 💻 Workflow de développement

Ce projet utilise **GitHub Flow** pour la gestion du code source :

1. Créez une branche depuis `main` pour chaque fonctionnalité ou correction

    ```bash
    # Créer une branche avec le script automatisé
    bun run new-branch
    ```

2. Développez et testez vos modifications localement

3. Poussez vos changements et créez une Pull Request

    ```bash
    # Créer une PR avec le script automatisé
    bun run new-pr
    ```

4. Après revue et approbation par l'équipe, la PR est fusionnée dans `main`

### Règles de commit

Nous suivons la convention [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` - Nouvelle fonctionnalité
- `fix:` - Correction de bug
- `docs:` - Documentation
- `style:` - Formatage (sans changement de code)
- `refactor:` - Refactoring du code
- `perf:` - Optimisations de performance
- `test:` - Ajout/correction de tests
- `build:` - Changements au système de build
- `ci:` - Configuration de CI
- `chore:` - Autres changements

## 🚢 Processus de release

Pour créer une nouvelle version :

```bash
# Version patch (0.0.x) - par défaut
bun run release

# Version mineure (0.x.0)
bun run release minor

# Version majeure (x.0.0)
bun run release major

# Version beta
bun run release patch beta
```

Le script automatise le processus complet :

- Mise à jour de la version dans package.json
- Création d'un commit et d'un tag git
- Déclenchement du workflow de release via GitHub Actions
- Construction des binaires pour toutes les plateformes supportées

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [Guide de Contribution](./CONTRIBUTING.md) pour plus de détails sur le processus de développement et les bonnes pratiques.

## 📄 Documentation supplémentaire

- [Guide de Contribution](./CONTRIBUTING.md) - Comment contribuer au projet
- [Guide de Release](./RELEASING.md) - Processus détaillé de publication des versions

## 📝 Licence

Codemaker est publié sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

Construit avec ❤️ par l'équipe Codemaker
