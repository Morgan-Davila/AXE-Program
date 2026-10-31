# CLAUDE.md

Ce fichier fournit des indications à Claude Code (claude.ai/code) pour travailler dans ce dépôt.

## Projet

AXE est une application de productivité personnelle (suivi d'habitudes, statistiques de progression, planification) construite de façon incrémentale en front-end vanilla (sans framework, sans bundler), avec un backend prévu pour une phase ultérieure. Voir README.md pour la roadmap complète (AXE 1 : habitudes, AXE 2 : gestion scolaire — flashcards et cahiers, AXE 3 : stats, AXE 4 : agenda, AXE 5 : backend, AXE 6 : migration vers Electron). AXE 1 (Habit Manager) est terminé ; le projet en est actuellement à AXE 2, partie 1 (flashcards rangées dans une arborescence de dossiers).

## Commandes

```bash
npm install          # installe les dépendances (sass, chart.js)
npm run sass          # compile src/scss/main.scss -> public/css/style.css une fois
npm run sass:watch    # recompile à chaque modification ; à lancer pendant l'édition de tout fichier .scss
```

Il n'y a ni étape de build ni bundler — `index.html` et `public/pages/*.html` sont ouverts directement comme des fichiers statiques (par ex. via l'extension VS Code "Live Server" sur le port 5501, voir `app.code-workspace`). Il n'existe pas de script npm `dev`. Aucune suite de tests n'est configurée (`npm test` est un placeholder qui se termine en erreur).

## Architecture

**Multi-pages, sans routeur.** `index.html` (dashboard) et `public/pages/{habits,scolar,schedule,graphs-stats}.html` sont des pages statiques distinctes reliées par de simples liens `<a href>` (voir le header dans `index.html`). Chaque page charge `src/js/main.js` en tant que module ES ; il n'y a pas de point d'entrée par page, donc `main.js` appelle les fonctions d'initialisation de chaque fonctionnalité sans distinction (les recherches DOM renvoient `null` sur les pages où le markup correspondant est absent, et le code en aval est censé vérifier ces `null` via les helpers de `utils/dom.js`).

**Système de debug (`src/js/debug.js`).** Définit `window.AXE = { DEBUG, VERSION, ... }` et exporte `createDebug(localDebug)`, qui renvoie `console.log` « bindé » (préfixé par `[VERSION]`) si `AXE.DEBUG` ou `localDebug` est vrai, sinon une fonction vide. Comme c'est le module appelant qui exécute `console.log`, la console affiche la vraie origine `fichier:ligne` (une fonction qui envelopperait `console.log` afficherait toujours `debug.js`). Chaque module reprend ce schéma en haut du fichier :
```js
import { createDebug } from "../../debug.js";

const LOCAL_DEBUG = false;
const debug = createDebug(LOCAL_DEBUG);

debug("message", valeur);
```
Le test des drapeaux est fait une seule fois, au chargement du module : changer `AXE.DEBUG` depuis la console demande de recharger la page.

**Couche de stockage (`src/js/services/storage/`).** Basée sur localStorage, découpée en un fichier par domaine (il n'y a plus de `storage.js` unique) :
- `storageHabits.js` — clé `"habitArray"` : exporte un tableau mutable, `habitArray`, ainsi que `addHabit/deleteHabit/updateHabit/getHabit/clearHabits`, qui mutent tous `habitArray` et appellent `saveHabits()` pour persister.
- `storageTheme.js` — clé `"axeTheme"` (`"light"`/`"dark"`), via `loadTheme()`/`saveTheme()`.
- `storageFlashcards.js` — clé `"flashcardsArray"`, même schéma. Les anciennes flashcards sans `parentId` sont traitées comme étant à la racine (`getFlashcardParentId`).
- `storageFolders.js` — clé `"foldersArray"`, même schéma. Chaque dossier et chaque flashcard a un `parentId` (`null` = racine) : l'arborescence n'est stockée nulle part ailleurs, et ce fichier fournit les helpers pour la parcourir (`getSubFolders`, `getFolderFlashcards`, `getFolderPath`, `getAllSubFolderIds`, `moveFolder`, `deleteFolder`…). Il importe `storageFlashcards.js`, jamais l'inverse.
- `storageSize.js` — `logStorageSize()`, outil de debug activé par `AXE.STORAGE_SIZE`.

Les éléments supprimés sont archivés dans des clés `"deleted…Array"` plutôt que perdus. Attention : un module qui importe `flashcardsArray`/`foldersArray` ne peut pas les réassigner (seulement les muter sur place) ; une opération qui doit remplacer le tableau reste dans son fichier (ex. `deleteFlashcardsInFolders`, appelée par `deleteFolder`). Toute nouvelle fonctionnalité nécessitant de la persistance devrait suivre ce même schéma charger/muter/sauvegarder-dans-localStorage plutôt que d'introduire un autre pattern.

**Découpage des composants (`src/js/components/`).** Chaque composant est découpé en trois parties ; reproduis ce découpage pour tout nouveau composant (calendar est pour l'instant un stub). Exemple avec habits :
- `habits.js` — logique/données pures (ex. `createHabit`, `editHabit`, `getFrequency`, `getDuration`, `searchTypes`), aucun event listener.
- `habitsUI.js` — rendu DOM et références aux éléments. À noter : de nombreuses références DOM (`habitsFormInput`, `habitsPopupOverlay`, `habitsCommandButton`, etc.) sont récupérées **une seule fois, à l'évaluation du module**, dans des `const` exportées — cela ne fonctionne correctement que sur les pages qui contiennent le markup correspondant (`habits.html`).
- `habitsEvents.js` — branche les listeners, en appelant à la fois `habits.js`, `habitsUI.js` et `storageHabits.js`. Un seul formulaire de popup partagé est réutilisé pour les flux de création et d'édition, basculé via la variable de module `habitPopupMode` (`"create"` / `"edit"`) et pré-rempli via `insertDataInHabitPopup()`.

Autres composants suivant ce découpage :
- `dashboard/` — `reactHabit()` (dans `dashboard.js`) calcule les habitudes du jour et re-rend les cartes, puis l'anneau de progression, les chiffres clés et le graphique Chart.js de la semaine. Elle est appelée au chargement et après chaque habitude cochée ; comme elle reconstruit les cartes, `setupRecallsCheckmarks()` doit être rappelée après chaque re-render. Les confettis et la pulsation passent par un listener délégué sur `.habits` (`setupCheckEffects`). Les streaks sont remis à 0 par `resetMissedStreaks()` (au chargement de `main.js`, avant tout rendu, puis à minuit via `setupMidnightRefresh`) quand `hasMissedOccurrence()` détecte une échéance manquée sur un jour déjà terminé ; le jour courant ne compte jamais.
- `theme/` — bascule clair/sombre du bouton `#themeToggle` : pose `data-theme="dark"` sur `<html>` (le clair est le défaut, sans attribut). Un petit script inline dans le `<head>` de chaque page applique le thème sauvegardé avant l'affichage pour éviter un flash clair ; il doit rester synchronisé avec la clé `"axeTheme"` de `storageTheme.js`. Tout ce qui ne suit pas le CSS seul (ex. couleurs Chart.js, cf. `updateWeeklyChartColors`) doit être rafraîchi dans `themeEvents.js`.
- `scolar/` — flashcards et dossiers de `scolar.html`. Les faces des flashcards sont éditées avec Quill (`flashcardsEditor.js`) et stockées au format Delta, puis converties en HTML pour l'affichage par `deltaToHTML` (`scolarUI.js`). DOMPurify est chargé dans chaque page via `<script>` mais n'est pas encore appelé. Comme pour les habitudes, une seule popup sert à la création et à l'édition, basculée via `flashcardPopupMode`. `setupRootFlashcard()` re-rend tout le contenu de `.flashcardBox` (dossiers de la racine puis cartes) : préfère les listeners délégués sur `.flashcardBox` (cf. `setupFolderEvents`) à des listeners posés sur chaque élément. Un dossier est rendu par `renderFolder` (`scolarUI.js`) en `<button class="folder">` dont les couleurs viennent des variables `--folder-*`.

**Données de test (`src/js/testData/testData.js`).** `seedTestData()`/`clearTestData()` créent ou retirent un jeu de dossiers et de flashcards marqués `isTest: true`. Le module n'est importé nulle part par défaut : l'importer temporairement dans `main.js` pour s'en servir.

**Recherche d'habitudes.** Les critères de la recherche affichée sont gardés dans `habits.js` (`setActiveSearch`/`clearActiveSearch`). Pour re-rendre la table, utilise `renderHabits(getVisibleHabits())` et non `renderHabits()` seul, sinon une recherche en cours est perdue.

**Effets visuels (`src/js/utils/effects.js`).** Helpers purement décoratifs (`countUp`, `burstConfetti`) qui respectent `prefers-reduced-motion`.

**Helpers DOM sûrs (`src/js/utils/dom.js`).** `safeQuery`, `safeQueryAll`, `safeId` encapsulent `querySelector`/`getElementById` et logguent via `debug()` au lieu de lever une erreur quand rien ne correspond (`exists()` vérifie l'absence de `null`). Utilise ces helpers plutôt que `document.querySelector` brut dans le nouveau code — c'est la convention établie dans tous les composants existants.

**Styles.** Structure SCSS : `abstracts/` (`_tokens.scss`), `base/`, `layout/` (header, footer, mise en page), `components/` (avec les sous-dossiers `dashboard/`, `habitManager/`, `scolar/`, `calendar/`, `graph/`). `src/scss/main.scss` est un manifeste de directives `@use` — une nouvelle feuille de style de composant doit y être ajoutée, sinon elle ne sera pas incluse dans le `public/css/style.css` compilé. Tout style doit toujours être écrit en SCSS (`src/scss/`), jamais directement dans `public/css/style.css`, qui est un fichier généré par `npm run sass` et ne doit pas être édité à la main.

Les couleurs, espacements, rayons, ombres et durées sont des **variables CSS** définies dans `abstracts/_tokens.scss` (`var(--accent)`, `var(--ink)`, `var(--space-4)`…), redéfinies pour le mode sombre sous `:root[data-theme="dark"]`. Utilise toujours ces variables plutôt que des couleurs en dur, sinon le composant ne suivra pas le thème. Les couleurs de marque (`--brand-*`, `--grey-*`) sont définies directement dans `_tokens.scss` (source unique, plus de variables Sass). Voir `skill.md` pour les conventions détaillées. Les styles `.stats-*`, `.calendar__*` et `.schedule__agenda*` ne sont pas encore utilisés : ils préparent AXE 3 et AXE 4.

## Conventions

- Les textes d'interface, les commentaires et la majorité des messages de commit sont en français ; garde cette cohérence dans le code lié aux habitudes.
- Les messages de commit suivent globalement Conventional Commits (`feat:`, `fix:`, `refactor:`, parfois scopés comme `feat(habits):`), mais le format n'est pas homogène (`feat :` vs `feat:`) — les deux sont acceptés, mais préfère l'absence d'espace avant les deux-points pour les nouveaux commits.
- Tout bloc de code écrit par une IA doit être annoncé par un commentaire `//AI made` juste au-dessus et fermé par un commentaire `//end AI made` juste en dessous, pour délimiter clairement le code IA. En SCSS, même chose avec `//AI made` / `//end AI made` ; en HTML, `<!-- AI made -->` / `<!-- end AI made -->`. Les blocs existants sans marqueur de fin n'ont pas besoin d'être modifiés.
- Tout commit fait par une IA doit l'annoncer explicitement (par ex. dans le message de commit), sauf si le contenu commité est majoritairement écrit par un humain : dans ce cas, aucune mention de l'IA.