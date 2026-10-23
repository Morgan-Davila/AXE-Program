# AXE

AXE est une application de productivité personnelle conçue pour aider les utilisateurs à organiser leurs habitudes, suivre leur progression et structurer leur quotidien.

Le projet est développé avec une approche progressive : chaque fonctionnalité est construite lorsque le besoin apparaît afin de garder une architecture claire, maintenable et évolutive.

---

## Objectif du projet

AXE a pour objectif de devenir un espace central de gestion personnelle regroupant :

* Gestion des habitudes
* Suivi de progression
* Statistiques personnelles
* Organisation du temps
* Planification
* Suivi des objectifs
* Gestion scolaire (flashcards, cahiers)

L'objectif est de construire une application complète avec une architecture solide, en évoluant progressivement d'une application front-end locale vers une application complète avec backend.

---

# Technologies utilisées

## Front-end

* HTML5
* JavaScript ES6 Modules
* SCSS
* npm
* LocalStorage (stockage actuel)

## Librairies

* Chart.js (graphique hebdomadaire du dashboard, futures statistiques)
* Quill (éditeur de texte riche des flashcards)
* DOMPurify (nettoyage de HTML, chargé mais pas encore utilisé)
* Faker (développement uniquement : génération de flashcards de test)

## Outils

* VS Code
* Git / GitHub
* Sass

---

# Architecture du projet

```
src
├── assets
├── font
├── js
│   ├── components
│   │   ├── calendar
│   │   ├── dashboard
│   │   ├── habits
│   │   │   └── popupSearch
│   │   ├── scolar
│   │   └── theme
│   ├── services
│   ├── testData
│   └── utils
└── scss
    ├── abstracts
    ├── base
    ├── components
    │   ├── calendar
    │   ├── dashboard
    │   ├── graph
    │   ├── habitManager
    │   └── scolar
    └── layout
```

| Dossier | Rôle |
| --- | --- |
| `assets` | Images et icônes (vide pour l'instant) |
| `font` | Polices du projet (Inter, Frick Condensed) |
| `js` | `main.js` (point d'entrée de toutes les pages) et `debug.js` |
| `js/components` | Une fonctionnalité par dossier, découpée en logique / UI / events |
| `js/components/calendar` | Calendrier (préparé pour AXE 4) |
| `js/components/dashboard` | Tableau de bord : habitudes du jour, streaks, graphique de la semaine |
| `js/components/habits` | Gestionnaire d'habitudes : création, modification, suppression, recherche |
| `js/components/scolar` | Flashcards et dossiers (AXE 2), éditeur de texte Quill |
| `js/components/theme` | Bascule mode clair / mode sombre |
| `js/services` | Accès aux données (localStorage), sans lien avec l'interface |
| `js/testData` | Jeu de dossiers et de flashcards de test (non chargé par défaut) |
| `js/utils` | Fonctions réutilisables : DOM, dates, formats, effets, popups d'erreur |
| `scss` | `main.scss` importe toutes les feuilles de style |
| `scss/abstracts` | Variables CSS (couleurs, espacements…) du thème clair et du thème sombre |
| `scss/base` | Styles de base de la page (reset, typographie) |
| `scss/components` | Styles des composants, un sous-dossier par fonctionnalité |
| `scss/layout` | Header, footer et mise en page générale |

---

# Organisation du code

## Components

Contient les fonctionnalités principales de l'application.

Exemple :

* `components/habits` : gestionnaire d'habitudes
* `components/dashboard` : affichage du tableau de bord
* `components/scolar` : flashcards et dossiers (gestion scolaire)
* `components/calendar` : calendrier
* `components/theme` : bascule mode clair / mode sombre

---

## Services

Contient les services indépendants de l'interface.

Actuellement :

* `storage.js`

Responsabilités :

* Sauvegarde des données (habitudes, flashcards, dossiers, préférence de thème)
* Récupération des données
* Suppression des données
* Navigation dans l'arborescence des dossiers (sous-dossiers, chemin, déplacement)

---

## Test data

`testData/testData.js` crée un jeu de dossiers et de flashcards de test (marqués `isTest`, pour pouvoir les retirer sans toucher aux vraies données). Le module n'est pas chargé par défaut : il faut l'importer dans `main.js` pour l'utiliser.

---

## Utils

Contient les fonctions utilitaires réutilisables.

Exemples :

* Protection des sélecteurs DOM
* Conversion des formats
* Gestion des dates
* Effets visuels (compteurs animés, confettis)

---

## Styles

Les styles sont écrits en SCSS dans `src/scss/` et compilés dans `public/css/style.css` (fichier généré, à ne pas modifier à la main).

Couleurs, espacements, rayons et ombres sont des variables CSS définies dans `abstracts/_tokens.scss`, redéfinies pour le mode sombre. Les conventions détaillées sont décrites dans `skill.md`.

---

# Système de debug

AXE possède un système de debug, défini dans `debug.js`.

Chaque fichier crée sa propre fonction de debug, avec un niveau local :

```javascript
import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = true;
const debug = createDebug(LOCAL_DEBUG);

debug("Message de debug");
```

Les logs s'affichent si le debug local du fichier est actif, ou si le debug global (`AXE.DEBUG` dans `debug.js`) l'est. La console indique le fichier et la ligne d'origine de chaque log.

Cela permet d'activer ou désactiver facilement les logs pendant le développement.

---

# Roadmap

## AXE 1 - Habit Manager

Statut : terminé

Objectif : Finaliser le système complet de gestion des habitudes.

Fonctionnalités :

* Création d'habitudes
* Modification d'habitudes
* Suppression d'habitudes
* Affichage dynamique des habitudes
* Système de suivi quotidien
* Gestion des séries (streaks)
* Amélioration UX/UI

---

## AXE 2 - Gestion scolaire

Statut : en cours (partie 1 - flashcards)

Objectif : Centraliser les révisions et les cours dans AXE. La mise à jour se fait en deux parties.

### Partie 1 - Flashcards

Fonctionnalités :

* Création, modification et suppression de flashcards
* Classification des flashcards dans des dossiers et sous-dossiers (arborescence sans limite de profondeur)
* Déplacement des flashcards et des dossiers dans l'arborescence
* Impression des flashcards (d'une carte, d'un dossier ou d'une sélection)
* Session de révision lancée sur un dossier ou une sélection de flashcards

### Partie 2 - Cahiers

Fonctionnalités :

* Création de cahiers, avec choix du type de page : grands carreaux ou petits carreaux
* Ajout de chapitres dans un cahier
* Fenêtre d'édition de texte en Markdown
* Rendu du Markdown sur un cahier virtuel, consultable facilement
* Hiérarchisation automatique à partir des titres Markdown :

  * Thème
  * Chapitre
  * Grandes parties (I, II, III…)
  * Sous-parties (A, B, C…)
  * Activité ou autre
  * Textes / leçon / bilan
* Ajout d'images et de documents (documents fournis par le professeur, scannés)

---

## AXE 3 - Statistics & Progression

Objectif : Transformer les habitudes en données exploitables.

Fonctionnalités :

* Statistiques personnelles
* Graphiques de progression
* Historique des habitudes
* Calcul des performances
* Analyse des séries
* Visualisation des objectifs

---

## AXE 4 - Agenda & Organisation

Objectif : Ajouter une gestion complète du temps.

Fonctionnalités :

* Calendrier avancé
* Planning quotidien
* Évènements
* Rappels
* Organisation des tâches
* Connexion entre habitudes et agenda

---

## AXE 5 - Backend Update

Objectif : Transformer AXE en application complète avec une architecture client/serveur.

Fonctionnalités :

* Création d'un backend
* Base de données distante
* Authentification utilisateur
* Synchronisation des données
* Gestion des comptes
* API
* Sécurité des données

Technologies envisagées :

* Node.js
* Base de données SQL ou NoSQL
* API REST

---

## AXE 6 - Application native

Objectif : Migrer AXE vers Electron pour en faire une application de bureau native.

Fonctionnalités :

* Migration du front-end vers Electron
* Installation d'AXE comme application de bureau
* Accès au système de fichiers local (import d'images et de documents scannés, export)
* Notifications natives du système
* Intégration avec le backend (synchronisation des données)

Technologies envisagées :

* Electron
* Node.js

---

# Philosophie de développement

AXE suit plusieurs principes :

* Construire uniquement ce qui est nécessaire
* Éviter la complexification prématurée
* Garder une architecture compréhensible
* Séparer clairement les responsabilités
* Améliorer progressivement la qualité du code

Le projet évolue par itérations successives :
fonctionnalité → utilisation → amélioration → refactorisation.

---

# Installation

Cloner le projet :

```bash
git clone https://github.com/Morgan-Davila/AXE-Program.git
```

Installer les dépendances :

```bash
npm install
```

Compiler les styles (ou `npm run sass:watch` pour recompiler à chaque modification) :

```bash
npm run sass
```

Lancer le projet : il n'y a pas de serveur de développement. Ouvrir `index.html` avec un serveur statique, par exemple l'extension VS Code « Live Server ».

---

# Licence

Projet personnel en développement.
