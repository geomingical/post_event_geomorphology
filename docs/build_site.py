#!/usr/bin/env python3
"""Build papers.json from literature_database.csv for the static website."""

import csv
import json
import re
from pathlib import Path
from datetime import datetime

CSV_PATH = Path(__file__).parent.parent / "literature_database.csv"
OUTPUT = Path(__file__).parent / "papers.json"

# Process Phase metadata (for tabs — first layer)
PHASE_META = {
    "initial_aggradation": {"name": "Initial Aggradation", "icon": "trending-up", "color": "#8b5e3c"},
    "remobilization": {"name": "Remobilization", "icon": "refresh-cw", "color": "#c07a3a"},
    "geomorphic_adjustment": {"name": "Geomorphic Adjustment", "icon": "sliders", "color": "#7a6e4e"},
    "recovery": {"name": "Recovery", "icon": "sunrise", "color": "#5e7a52"},
    "equilibrium": {"name": "Equilibrium", "icon": "anchor", "color": "#4a6e7a"},
    "multiple": {"name": "Multiple Phases", "icon": "layers", "color": "#8a7f72"},
}

# Mechanism metadata (for sub-filters — second layer)
MECHANISM_META = {
    "coseismic_landslide": {"name": "Coseismic Landslide", "color": "#8b5e3c"},
    "debris_flow": {"name": "Debris Flow", "color": "#c07a3a"},
    "channel_incision": {"name": "Channel Incision", "color": "#7a6e4e"},
    "terrace_formation": {"name": "Terrace Formation", "color": "#5e7a52"},
    "hillslope_connectivity": {"name": "Hillslope Connectivity", "color": "#6b8a7a"},
    "hydrometeorological": {"name": "Hydrometeorological", "color": "#4a6e7a"},
    "multiple": {"name": "Multiple Mechanisms", "color": "#8a7f72"},
}


def make_id(authors_str, year, seen):
    """Generate author-year ID like 'wang-2023'. Handle duplicates with a/b/c."""
    parts = authors_str.strip().split(",")[0].strip().split()
    surname = parts[-1].lower() if parts else "unknown"
    surname = re.sub(r"[^a-z]", "", surname)
    if not surname:
        surname = "unknown"
    base = f"{surname}-{year}"
    if base not in seen:
        seen[base] = 0
        return base
    else:
        seen[base] += 1
        suffix = chr(ord("a") + seen[base])
        return f"{base}{suffix}"


def build_doi_url(doi):
    if doi and doi.strip():
        return f"https://doi.org/{doi.strip()}"
    return ""


def main():
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    print(f"Loaded {len(rows)} papers from CSV.")

    seen_ids = {}
    papers = []
    phase_counts = {}
    mechanism_counts = {}

    for row in rows:
        paper_id = make_id(row["Authors"], row["Year"], seen_ids)

        process_phase = row["Process_Phase"].strip()
        mechanism = row["Mechanism"].strip()
        study_type = row["Study_Type"].strip()

        # Parse parameters (semicolon first, then comma fallback)
        params_raw = row["Parameters"].strip()
        if ";" in params_raw:
            params = [p.strip() for p in params_raw.split(";") if p.strip()]
        else:
            params = [p.strip() for p in params_raw.split(",") if p.strip()]

        # Split process_phases and mechanisms into lists
        if ";" in process_phase:
            process_phases_list = [x.strip() for x in process_phase.split(";") if x.strip()]
        else:
            process_phases_list = [process_phase] if process_phase else []

        if ";" in mechanism:
            mechanisms_list = [x.strip() for x in mechanism.split(";") if x.strip()]
        else:
            mechanisms_list = [mechanism] if mechanism else []

        paper = {
            "id": paper_id,
            "title": row["Title"].strip(),
            "authors": [a.strip() for a in row["Authors"].split(",") if a.strip()],
            "year": int(row["Year"]) if row["Year"].strip().isdigit() else 0,
            "process_phase": process_phase,
            "process_phases": process_phases_list,
            "mechanism": mechanism,
            "mechanisms": mechanisms_list,
            "study_type": study_type,
            "journal": row["Journal"].strip(),
            "doi": row["DOI"].strip(),
            "url": build_doi_url(row["DOI"]),
            "region": row["Region"].strip(),
            "parameters": params,
            "time_scale": row["Time_Scale"].strip(),
            "key_findings": row["Key_Findings"].strip(),
            "relevance": row["Relevance"].strip().lower(),
        }
        papers.append(paper)

        # Count for categories
        phase_counts[process_phase] = phase_counts.get(process_phase, 0) + 1
        mechanism_counts[mechanism] = mechanism_counts.get(mechanism, 0) + 1

    # Sort by year descending, then title
    papers.sort(key=lambda x: (-x["year"], x["title"]))

    # Build process phase categories
    phase_categories = []
    for key, meta in PHASE_META.items():
        count = phase_counts.get(key, 0)
        if count > 0:
            phase_categories.append(
                {
                    "key": key,
                    "name": meta["name"],
                    "icon": meta["icon"],
                    "color": meta["color"],
                    "count": count,
                }
            )
    phase_categories.sort(key=lambda x: -x["count"])

    # Build mechanism sub-categories
    mechanism_categories = []
    for key, meta in MECHANISM_META.items():
        count = mechanism_counts.get(key, 0)
        if count > 0:
            mechanism_categories.append(
                {
                    "key": key,
                    "name": meta["name"],
                    "color": meta["color"],
                    "count": count,
                }
            )
    mechanism_categories.sort(key=lambda x: -x["count"])

    years = [p["year"] for p in papers if p["year"] > 0]

    result = {
        "phaseCategories": phase_categories,
        "mechanismCategories": mechanism_categories,
        "papers": papers,
        "meta": {
            "totalPapers": len(papers),
            "yearRange": [min(years), max(years)] if years else [0, 0],
            "generatedAt": datetime.now().isoformat(),
        },
    }

    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\nOutput: {OUTPUT}")
    print(f"Total: {len(papers)} papers")
    print(f"\nProcess Phase distribution:")
    for cat in phase_categories:
        print(f"  {cat['name']}: {cat['count']}")
    print(f"\nMechanism distribution:")
    for cat in mechanism_categories:
        print(f"  {cat['name']}: {cat['count']}")


if __name__ == "__main__":
    main()
