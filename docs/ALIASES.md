# Aliases d'Importation dans CodeMaker

Ce document décrit les aliases d'importation disponibles dans le projet CodeMaker pour faciliter les importations dans le code source.

## Aliases Disponibles

CodeMaker utilise des aliases pour simplifier les chemins d'importation et rendre le code plus lisible et plus maintenable. Voici les aliases disponibles :

| Alias           | Chemin               | Description                                      |
| --------------- | -------------------- | ------------------------------------------------ |
| `@/*`           | `./src/*`            | Accès à tous les fichiers du dossier source      |
| `@core/*`       | `./src/core/*`       | Configuration et types fondamentaux              |
| `@components/*` | `./src/components/*` | Composants React                                 |
| `@services/*`   | `./src/services/*`   | Services (gestion de fichiers, paramètres, etc.) |
| `@utils/*`      | `./src/utils/*`      | Fonctions utilitaires                            |
| `@features/*`   | `./src/features/*`   | Fonctionnalités spécifiques                      |
| `@app/*`        | `./src/app/*`        | Composants et routes de l'application Next.js    |
| `@hooks/*`      | `./src/hooks/*`      | Hooks React personnalisés                        |
| `@types`        | `./src/core/types`   | Types et interfaces centralisés                  |
| `@config`       | `./src/core/config`  | Configuration centralisée                        |

## Exemples d'Utilisation

### Importation de types

```typescript
// Au lieu de:
import { FileInfo, FileTab } from "@/core/types";

// Utilisez:
import { FileInfo, FileTab } from "@types";
```

### Importation de services

```typescript
// Au lieu de:
import { FileService } from "@/services/file-service";

// Utilisez:
import { FileService } from "@services/file-service";
```

### Importation de configuration

```typescript
// Au lieu de:
import { appConfig } from "@/core/config/app-config";

// Utilisez:
import { appConfig } from "@config/app-config";
```

### Importation de composants

```typescript
// Au lieu de:
import { Button } from "@/components/ui/button";

// Utilisez:
import { Button } from "@components/ui/button";
```

## Bonnes Pratiques

1. Préférez les aliases spécifiques (`@types`, `@services`, etc.) plutôt que l'alias générique (`@/*`) pour une meilleure clarté
2. Utilisez `@types` pour toutes les importations de types et interfaces
3. Pour les importations multiples depuis un même module, utilisez la syntaxe de destructuration
4. Pour les configurations, utilisez l'alias `@config`
