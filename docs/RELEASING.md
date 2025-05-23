# 🚀 Guide de publication de Codemaker

Ce document détaille le processus complet de création et de publication de nouvelles versions de Codemaker, destiné aux mainteneurs et contributeurs ayant les droits nécessaires pour effectuer des releases.

## 📑 Table des matières

- [Philosophie de versionnement](#philosophie-de-versionnement)
- [Cycle de publication](#cycle-de-publication)
- [Types de versions](#types-de-versions)
- [Création d'une nouvelle version](#création-dune-nouvelle-version)
- [Génération des notes de version](#génération-des-notes-de-version)
- [Gestion des builds et distribution](#gestion-des-builds-et-distribution)
- [Publication sur les marketplaces](#publication-sur-les-marketplaces)
- [Gestion des hotfixes](#gestion-des-hotfixes)
- [Checklist de publication](#checklist-de-publication)

## 📊 Philosophie de versionnement

Codemaker suit les principes du [Semantic Versioning](https://semver.org/) (SemVer) pour garantir une compréhension claire des changements entre les versions :

```
MAJEUR.MINEUR.CORRECTIF[-préversion]
```

- Les versions **MAJEURES** contiennent des changements incompatibles avec les versions précédentes
- Les versions **MINEURES** ajoutent des fonctionnalités de manière rétrocompatible
- Les versions **CORRECTIFS** (patch) apportent des corrections de bugs rétrocompatibles

## 🔄 Cycle de publication

Notre cycle de publication suit ces étapes principales :

1. **Développement continu** : Les nouvelles fonctionnalités et corrections sont fusionnées dans la branche `main` via des pull requests validées
2. **Préparation d'une version** : Lorsque suffisamment de changements sont accumulés ou qu'une date de release planifiée approche
3. **Tests pré-release** : Validation complète avec suite de tests automatisés et tests manuels
4. **Publication de la version** : Exécution du workflow de release via GitHub Actions
5. **Distribution** : Génération et publication des artefacts pour toutes les plateformes supportées
6. **Annonce** : Communication de la nouvelle version via les canaux officiels

## 🏷️ Types de versions

### Versions stables

- **Patch (0.0.x)** - Corrections de bugs et petites améliorations sans impact fonctionnel
- **Minor (0.x.0)** - Nouvelles fonctionnalités et améliorations rétrocompatibles
- **Major (x.0.0)** - Changements majeurs pouvant nécessiter des adaptations côté utilisateur

### Versions préliminaires

- **Alpha (x.y.z-alpha.n)**

    - En développement actif
    - Potentiellement instable et incomplète
    - Pour tests internes uniquement
    - Peut contenir des bugs connus

- **Beta (x.y.z-beta.n)**

    - Fonctionnellement complète mais en phase de test
    - Plus stable que les versions alpha
    - Pour les testeurs externes et les early adopters
    - Peut contenir quelques bugs mineurs

- **Release Candidate (x.y.z-rc.n)**
    - Version candidate finale, presque prête pour la production
    - Pour validation finale avant release officielle
    - Tous les bugs connus critiques sont résolus

## 🛠️ Création d'une nouvelle version

### Option 1 : Utiliser le script automatisé (recommandé)

Notre script `release` simplifie considérablement le processus de création d'une nouvelle version :

```bash
# Version patch (0.0.x) - par défaut
bun run release

# Version mineure (0.x.0)
bun run release minor

# Version majeure (x.0.0)
bun run release major

# Versions préliminaires
bun run release patch beta
bun run release minor alpha
bun run release patch rc
```

Ce script exécute les actions suivantes :

1. Détermine la nouvelle version basée sur la version actuelle et les paramètres
2. Affiche les changements depuis la dernière version
3. Demande une confirmation de l'utilisateur
4. Met à jour la version dans `package.json`
5. Crée un commit de version et un tag git
6. Pousse les changements vers le dépôt distant
7. Déclenche le workflow GitHub Actions `release.yml`

### Option 2 : Déclencher manuellement le workflow

Pour des cas spécifiques, vous pouvez également déclencher le workflow directement depuis l'interface GitHub :

1. Accédez à l'onglet "Actions" du dépôt GitHub
2. Sélectionnez le workflow "Release Management"
3. Cliquez sur "Run workflow"
4. Renseignez les paramètres requis :
    - **Version** : Numéro de version complet (ex: 1.0.0, 2.1.0-beta.1)
    - **Type** : stable, beta, alpha ou rc
    - **Base Branch** : Branche source (généralement `main`)
5. Cliquez sur "Run workflow" pour démarrer le processus

## 📝 Génération des notes de version

Les notes de version sont automatiquement générées à partir des messages de commit conformes à la convention Conventional Commits :

### Sections générées

- **✨ Nouvelles fonctionnalités** : Commits avec le préfixe `feat:`
- **🐛 Corrections de bugs** : Commits avec le préfixe `fix:`
- **⚡ Optimisations** : Commits avec le préfixe `perf:`
- **📚 Documentation** : Commits avec le préfixe `docs:` (uniquement pour les changements importants)
- **⚠️ Changements majeurs** : Messages contenant `BREAKING CHANGE:`

### Format des notes

Les notes de version suivent une structure cohérente :

```markdown
# Version X.Y.Z (YYYY-MM-DD)

## ✨ Nouvelles fonctionnalités

- Description de la fonctionnalité A (#123)
- Description de la fonctionnalité B (#124)

## 🐛 Corrections

- Correction du problème X (#125)
- Correction du problème Y (#126)

## ⚠️ Changements majeurs

- Description détaillée du changement majeur et comment migrer (#127)
```

## 📦 Gestion des builds et distribution

Une fois la release créée, notre système automatisé :

1. **Construit les binaires** pour toutes les plateformes supportées :

    - Windows (.exe, .msi)
    - macOS (.dmg, .pkg)
    - Linux (.AppImage, .deb, .rpm)

2. **Signe les packages** avec notre certificat de développeur pour garantir leur authenticité

3. **Attache les artefacts** à la release GitHub

4. **Configure les métadonnées** appropriées :
    - Marque comme "pre-release" si c'est une version alpha/beta/rc
    - Définit la visibilité selon le type de version

## 🌐 Publication sur les marketplaces

Pour les versions stables et RC, nous publions également sur diverses plateformes :

- **Microsoft Store** : Processus automatisé via notre pipeline CI/CD
- **Mac App Store** : Soumission manuelle par le mainteneur désigné
- **Snap Store** : Publication automatique
- **Homebrew** : Mise à jour du cask via PR automatisée

## 🚑 Gestion des hotfixes

Pour corriger un bug critique dans une version de production :

1. **Identifier la version concernée** et créer une branche depuis son tag :

    ```bash
    git checkout v1.2.3
    git checkout -b hotfix/description-concise
    ```

2. **Appliquer le correctif minimal** nécessaire pour résoudre le problème

3. **Tester rigoureusement** en isolant le correctif

4. **Créer une PR** vers `main` ET vers la branche de version si elle existe

5. **Publier une version patch** après approbation :

    ```bash
    bun run release patch
    ```

6. **Documenter clairement** le problème et sa résolution dans les notes de version

## ✅ Checklist de publication

Avant chaque release, vérifiez les points suivants :

- [ ] Tous les tests automatisés passent
- [ ] Les changements majeurs sont documentés avec des guides de migration
- [ ] La documentation utilisateur est à jour
- [ ] Les tests manuels sur toutes les plateformes sont validés
- [ ] La version et la date sont correctement mises à jour
- [ ] L'équipe marketing est informée pour les versions importantes
- [ ] La roadmap du projet est mise à jour

---

Pour toute question sur le processus de publication, contactez l'équipe de mainteneurs principaux.

_Dernière mise à jour : 22 mai 2025_

- Mettez à jour la documentation si nécessaire
- Testez les builds sur différentes plateformes avant de publier une version stable
- Utilisez des versions alpha/beta pour les changements majeurs ou risqués
- Maintenez un historique de commits propre et organisé
