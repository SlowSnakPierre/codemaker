# Structure du Projet CodeMaker

Ce document décrit l'organisation et la structure du projet CodeMaker.

## Structure des Dossiers

Le projet est organisé selon une architecture modulaire qui favorise la séparation des préoccupations et facilite la maintenabilité :

### `/src/core`

Contient les éléments fondamentaux de l'application :

- `config/` : Configuration centralisée de l'application
- `types/` : Types et interfaces globaux

### `/src/services`

Services qui encapsulent la logique métier :

- `file-service.ts` : Gestion des opérations sur les fichiers
- `settings-service.ts` : Gestion des paramètres persistants
- `watcher-service.ts` : Surveillance des modifications de fichiers
- `window-service.ts` : Gestion de la fenêtre Electron

### `/src/utils`

Utilitaires et fonctions d'aide réutilisables :

- `file-icons.ts` : Utilitaires pour les icônes de fichiers
- `file-utils.ts` : Fonctions utilitaires pour les fichiers
- `format-utils.ts` : Fonctions de formatage
- `ui-utils.ts` : Utilitaires pour l'interface utilisateur

### `/src/features`

Fonctionnalités spécifiques organisées par domaine.

### `/src/components`

Composants React pour l'interface utilisateur :

- `ui/` : Composants UI de base
- `layouts/` : Structures de page et mises en page
- `editor/` : Composants liés à l'éditeur de code

### `/src/app`

Routage et composants de niveau application (Next.js).

### `/electron`

Configuration et scripts pour l'application Electron.

## Bonnes Pratiques

1. **Importations** : Utilisez des chemins d'alias (`@/...`) pour éviter les chemins relatifs complexes
2. **Types** : Importez les types depuis `/src/core/types`
3. **Configuration** : Utilisez les constantes de `/src/core/config/app-config.ts`
4. **Services** : Accédez aux fonctionnalités via les classes de service appropriées
5. **Utilitaires** : Les fonctions utilitaires sont disponibles via `/src/utils`

## Compatibilité

Les anciens chemins d'importation sont maintenus via des redirections pour assurer la rétrocompatibilité, mais ils sont marqués comme obsolètes et devraient être remplacés progressivement.
