# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-03
**Branch:** master

## OVERVIEW

Curated database of 323 peer-reviewed papers on post-seismic sediment dynamics (coseismic landsliding → channel aggradation → recovery → equilibrium), browsable as a static GitHub Pages site. The project uses a CSV-to-JSON pipeline with a vanilla HTML/CSS/JS frontend for two-layer filtering of geomorphic processes and transport mechanisms.

## STRUCTURE

```
post-event-geomorphology/
├── literature_database.csv     # PRIMARY DATA — 323 papers, 14 columns
├── generate_csv.py             # Mock database generation script
├── docs/                       # GitHub Pages deploy target
│   ├── index.html              # Frontend entry point
│   ├── styles.css              # Earth-stone theme (accent: #7a6e4e)
│   ├── app.js                  # Two-layer filtering logic
│   ├── papers.json             # AUTO-GENERATED from CSV
│   └── build_site.py           # CSV → papers.json converter
├── README.md
└── AGENTS.md
```

## CRITICAL RULES (NEVER DO THESE)

- **NEVER** edit `docs/papers.json` directly — it's auto-generated from CSV.
- **NEVER** use `python` — always `python3`.
- **NEVER** add MDPI or Frontiers journal papers — (DOI prefix 10.3390 is MDPI).
- **NEVER** add conference papers — only peer-reviewed journal articles.
- **NEVER** use JavaScript frameworks — vanilla HTML/CSS/JS only.
- **NEVER** use CDNs except for Google Fonts.
- **NEVER** commit `.env` files.

## CSV SCHEMA (14 Columns)

`ID, Authors, Year, Title, Journal, DOI, Process_Phase, Mechanism, Study_Type, Region, Parameters, Time_Scale, Key_Findings, Relevance`

## VALID ENUM VALUES

### Process_Phase
- `initial_aggradation` (65 papers)
- `remobilization` (81 papers)
- `geomorphic_adjustment` (55 papers)
- `recovery` (63 papers)
- `equilibrium` (19 papers)
- `multiple` (40 papers)

### Mechanism
- `coseismic_landslide` (109 papers)
- `debris_flow` (40 papers)
- `channel_incision` (37 papers)
- `terrace_formation` (24 papers)
- `hillslope_connectivity` (44 papers)
- `hydrometeorological` (20 papers)
- `multiple` (49 papers)

### Study_Type
- `field_observation` (122 papers)
- `remote_sensing` (45 papers)
- `modeling` (63 papers)
- `review` (19 papers)
- `combined` (74 papers)

### Relevance
- `high`
- `medium`
- `low`

## DATA QUALITY RULES

- **Unique & Specific Findings**: `Key_Findings` must be unique and descriptive (never templated).
- **Real Regions**: `Region` must be a real geographic location (not "Global" or "General").
- **No Duplicates**: No duplicate DOIs or titles.
- **Required Fields**: No empty DOIs, Years, or Key_Findings.
- **Sequential IDs**: IDs must remain sequential (1..N) after any row addition or removal.

## BUILD PROCESS

To update the frontend after modifying the CSV:
```bash
python3 docs/build_site.py
```
This script reads `literature_database.csv` and regenerates `docs/papers.json`.

## THEME

- **Palette**: Earth-Stone tones.
- **Accent Color**: `#7a6e4e`
- **Background**: `#f5f2ed`
- **Typography**: Professional, high-readability fonts via Google Fonts.

## REFERENCE SISTER PROJECT

Structure and conventions are intentionally aligned with [water_che_after_event](https://github.com/geomingical/water_che_after_event) to ensure cross-project consistency.
