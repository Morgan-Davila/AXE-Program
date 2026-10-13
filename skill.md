---
name: axe-scss-style
description: Règles et habitudes de style SCSS observées dans src/scss/ du projet AXE. À suivre pour tout nouveau fichier ou toute modification de style dans ce dépôt.
---

# Style SCSS — AXE

Règles déduites de `src/scss/` après l'intégration du redesign. Ce ne sont pas des préférences théoriques mais des habitudes réellement suivies dans le code — à reproduire pour rester cohérent.

## Organisation des fichiers

```
src/scss/
├── main.scss              # manifeste : uniquement des @use, dans l'ordre ci-dessous
├── abstracts/
│   └── _tokens.scss       # variables CSS (clair + sombre, couleurs de marque), @font-face
├── base/_base.scss        # reset, body, éléments HTML de base, prefers-reduced-motion
├── layout/                # _layout (page-shell, page-header), _header, _footer
└── components/            # _frame, _pills, _effects + un sous-dossier par composant JS
    ├── dashboard/  habitManager/  calendar/  graph/
```

- Un nouveau partial doit être ajouté dans `main.scss` via `@use`, sinon il n'est jamais compilé. Écrire le chemin complet avec underscore et extension (`@use 'components/dashboard/_dashboard.scss';`).
- Un sous-dossier de `components/` correspond à un composant JS (`components/habitManager/` ↔ `src/js/components/habits/`).
- Les partials ne font **aucun `@use`** : ils n'utilisent que des variables CSS, disponibles partout. Aucune variable Sass n'est utilisée.

## Variables CSS (`abstracts/_tokens.scss`) — règle principale

Toute valeur de design passe par une variable CSS, **jamais une couleur en dur** : c'est ce qui permet au mode sombre de fonctionner (les variables sont redéfinies sous `:root[data-theme="dark"]`).

| Famille | Variables |
|---|---|
| Fonds | `--bg`, `--bg-soft`, `--bg-frame`, `--surface`, `--surface-2` |
| Texte | `--ink`, `--ink-soft`, `--ink-faint`, `--on-brand` (texte sur fond de marque) |
| Bordures | `--border`, `--border-strong` |
| Accents | `--accent` (bleu), `--accent-violet`, `--success`, `--flame-cold/low/high` |
| Espacements | `--space-1` (4px) … `--space-8` (64px) |
| Rayons | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-pill` |
| Ombres | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Typo | `--font-ui` (Inter), `--font-display` (Frick Condensed, titres), `--text-xs` … `--text-3xl` |
| Mouvement | `--dur-fast`, `--dur-base`, `--dur-slow`, `--ease`, `--ease-spring` |

- Nouvelle couleur récurrente → l'ajouter dans `_tokens.scss` **dans les deux blocs** (`:root` et `:root[data-theme="dark"]`).
- Nouvelle couleur de marque → l'ajouter directement comme variable CSS dans `_tokens.scss` (`--brand-...`).
- Nuances dérivées (survol, halo de focus, fond teinté) : `color-mix()` plutôt qu'une variable dédiée ou `color.adjust()` (qui ne suit pas le thème) :
  ```scss
  &:hover { background: color-mix(in srgb, var(--accent) 85%, black); }
  &:focus { box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-violet) 15%, transparent); }
  ```

## Structure BEM par nesting `&__`

Bloc racine en camelCase ou kebab-case, éléments enchaînés via `&__` imbriqués :

```scss
.habits__cell__title { ... }
.habitManagerMenu__icons { ... }
.header__hour-Box__text { ... }
```

- `&--modifier` pour un état de style lié au contenu/variante (`&--done`, `&--removing`).
- Classe séparée togglée en JS quand l'état est piloté par du JS (`.activeTabs`, `.hiddenPopup`, `.hiddenTypeProposition`).
- Attribut `data-*` quand le JS fournit une valeur plutôt qu'un état (`[data-tier="high"]` sur le badge streak).
- **Ne jamais renommer une classe ou un id lu par le JS** (`src/js/`) : vérifier avec une recherche avant toute modification de markup ou de sélecteur.

## Motifs partagés

- **Cadre en tirets** (motif signature) : `components/_frame.scss` l'applique à `.habits, .schedule, .graph, .calendar, .habitManager`. Pour un nouveau bloc principal, l'ajouter à cette liste plutôt que de réécrire la bordure.
- **Bouton pilule** (« Nouveau », « Vue ») : `components/_pills.scss`, même principe.
- **Sections du dashboard** : `.xxx-box` (colonne) + `.xxx-box__title` (titre de section) + bloc de contenu `.xxx` encadré par `_frame.scss`.
- **Titre de page** : `.page-header__title` en `--font-display`.

## Regroupement des propriétés par lignes vides

À l'intérieur d'un bloc, propriétés groupées par thème et séparées par une ligne vide : position/layout → dimensions/espacement → couleur/fond/bordure → typographie → transition.

```scss
.habitManagerMenu__menu {
    cursor: pointer;
    background: var(--brand-blue-ink);
    height: 40px;
    padding: 0 var(--space-2) 0 var(--space-4);
    border-radius: var(--radius-pill);

    display: flex;
    align-items: center;

    box-shadow: var(--shadow-sm);
    transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-base) var(--ease);
}
```

## Transitions, hover et animations

- Transitions explicites par propriété avec les variables de mouvement : `transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-base) var(--ease);` — éviter `transition: all` / `transition: .2s`.
- Micro-interaction de survol récurrente : `transform: translateY(-2px)` + ombre qui passe de `--shadow-sm` à `--shadow-md`.
- Pas besoin de gérer `prefers-reduced-motion` composant par composant : `base/_base.scss` neutralise déjà toutes les animations et transitions.

## Indentation et unités

- 4 espaces, jamais de tabulations.
- `px` et variables d'espacement dominants ; `rem` ponctuellement pour les tailles de police des formulaires. Pour du nouveau code dans un composant existant, s'aligner sur ce qu'il utilise déjà.

## Annotations et provenance

- Tout bloc ajouté par une IA est précédé de `//AI made` (règle de `CLAUDE.md`).
- Chaque partial commence par un en-tête `/* ==== ... ==== */` qui décrit le composant et, si utile, les classes conservées pour le JS.
- Snippets externes crédités au-dessus du bloc (`/* From Uiverse.io by Shoh2008 */`).
- **Zone protégée** : `components/dashboard/_checkmark.scss` (la case à cocher du dashboard) — ne pas modifier sans demande explicite.
- Commentaires en français.

## Styles en attente

`.stats-*` (`graph/_graphs.scss`), `.calendar__*` (`calendar/_schedule.scss`) et `.schedule__agenda*` (`dashboard/_dashboard.scss`) ne sont pas encore utilisés : ils fixent la direction visuelle d'AXE 2 (stats) et AXE 3 (agenda). Les réutiliser plutôt que de repartir de zéro quand ces pages seront construites.
