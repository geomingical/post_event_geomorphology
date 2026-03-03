# DOCS SUBDIRECTORY KNOWLEDGE BASE

**Scope:** `docs/` — GitHub Pages deploy target (static site build pipeline + frontend)

---

## FILE ROLES

| File | Role | Edit? |
|------|------|-------|
| `build_site.py` | CSV → `papers.json` converter (run this to rebuild) | ✅ Yes |
| `papers.json` | **AUTO-GENERATED** — never hand-edit | ❌ Never |
| `index.html` | Single-page app shell, DOM structure | ✅ Yes |
| `styles.css` | Earth-Stone theme, all visual styling | ✅ Yes |
| `app.js` | All interactive logic (filtering, rendering, export) | ✅ Yes |

---

## BUILD PIPELINE

```
literature_database.csv   ←── SOURCE OF TRUTH (root dir)
        │
        ▼
python3 docs/build_site.py
        │
        ▼
docs/papers.json          ←── AUTO-GENERATED (commit this)
        │
        ▼
docs/index.html + docs/app.js  (fetch papers.json at runtime)
```

**Always run after any CSV change:**
```bash
python3 docs/build_site.py
```

**Never run:**
```bash
python docs/build_site.py   # ❌ wrong — use python3
```

---

## CRITICAL RULES

- **NEVER** edit `papers.json` by hand — it is always overwritten by `build_site.py`.
- **NEVER** use JavaScript frameworks (React, Vue, etc.) — vanilla JS only.
- **NEVER** add CDNs other than Google Fonts.
- **NEVER** use `python` — always `python3`.
- **NEVER** inline large SVG icons — use the `ICONS` dict already in `app.js`.

---

## JAVASCRIPT CONVENTIONS (`app.js`)

- **Pattern**: Single IIFE `(function () { 'use strict'; ... })();` — no modules, no imports.
- **State variables** (top-level in IIFE):
  - `currentPhase` — active phase tab key (`'all'` or one of the 6 phase keys)
  - `currentMechanism` — active mechanism pill key (`'all'` or one of the 7 mech keys)
  - `currentYear` — year filter from timeline click (`null` = no filter)
  - `displayedCount` — pagination cursor for "Load More"
  - `selectedPapers` — `Set` of selected paper IDs for export
- **Data shape** (from `papers.json`):
  - `papersData.papers[]` — array of paper objects
  - `papersData.phaseCategories[]` — 6 phase tab configs
  - `papersData.mechanismCategories[]` — 7 mechanism pill configs
  - `papersData.meta` — `{totalPapers, yearRange, generatedAt}`
- **Paper object key fields**: `process_phases` (array), `mechanisms` (array), `year`, `study_type`, `time_scale`, `key_findings`, `relevance`, `url`, `doi`
- **Batch size**: `BATCH_SIZE = 60` papers per "Load More" page.
- **Icons**: Inline SVG strings stored in `ICONS` dict — use existing keys (`trending-up`, `refresh-cw`, `sliders`, `sunrise`, `anchor`, `layers`, `star`).

---

## CSS CONVENTIONS (`styles.css`)

### Earth-Stone Palette (CSS Variables)

```css
--accent:        #7a6e4e;   /* primary action color */
--accent-dark:   #5e5540;   /* hover states */
--accent-light:  #a8997a;   /* secondary accents */
--bg:            #f5f2ed;   /* page background */
--surface:       #ffffff;   /* card backgrounds */
--border:        #ddd8ce;   /* borders */
--text:          #2c2a25;   /* body text */
--text-muted:    #7a7570;   /* secondary text */
```

- **Fonts**: Sora (headings) + Public Sans (body) + JetBrains Mono (code/DOI) — loaded via Google Fonts in `index.html`.
- **Border radius**: `0.5rem` standard, `0.25rem` for small elements.
- **Card hover**: `transform: translateY(-2px)` + `box-shadow` deepens.
- **Active phase tab**: `.phase-tab.active` gets `background: var(--accent); color: white`.
- **Active mechanism pill**: `.mech-pill.active` gets `background: var(--accent); color: white`.

---

## HTML CONVENTIONS (`index.html`)

- Single `<body>` with no framework root — just semantic HTML5.
- JS and CSS loaded from same directory (`./styles.css`, `./app.js`).
- `papers.json` is fetched at runtime by `app.js` via `fetch('papers.json')`.
- Key DOM IDs (do not rename without updating `app.js`):
  - `#stat-papers`, `#stat-years` — header stats
  - `#phase-tabs` — phase tab container
  - `#mech-filters` — mechanism pill container
  - `#timeline-chart` — year histogram
  - `#papers-grid` — card grid
  - `#load-more` — pagination button
  - `#download-btn`, `#download-menu` — export dropdown
  - `#search-input` — text search field
  - `#selection-count` — badge on export button

---

## `build_site.py` CONVENTIONS

- **`PHASE_META`**: dict of 6 phase keys → `{name, icon, color}` (icon = Feather icon name, color = Earth-Stone hex).
- **`MECHANISM_META`**: dict of 7 mechanism keys → `{name, color}`.
- **`make_id()`**: generates `surname-year` slugs (e.g., `wang-2023`); appends `a/b/c` for duplicates.
- **Output sort**: papers sorted by year descending, then title ascending.
- **Counts**: phase and mechanism counts are computed fresh from the CSV on each build — do not hardcode them.

---

## REFERENCE

- Sister project: [water_che_after_event](https://github.com/geomingical/water_che_after_event) — same two-layer filtering pattern, same build pipeline shape.
- Root `AGENTS.md` has full CSV schema, enum values, and data quality rules.
