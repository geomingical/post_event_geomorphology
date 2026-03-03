# Post-Seismic Sediment Dynamics Literature Database

Curated database of 323 peer-reviewed papers on post-seismic sediment dynamics (coseismic landsliding → channel aggradation → recovery → equilibrium), browsable as a static GitHub Pages site.

## Live Site
[https://YOUR_USERNAME.github.io/post_event_geomorphology/](https://YOUR_USERNAME.github.io/post_event_geomorphology/)
*(Please update with your actual GitHub username)*

## Database Summary
| Metric | Value |
|--------|-------|
| Total Papers | 323 |
| Year Range | 1984–2025 |
| Process Phases | 6 |
| Mechanisms | 7 |

## Process Phases
- **initial_aggradation**: Immediate post-seismic sediment pulse to channels.
- **remobilization**: Secondary mobilization of landslide debris by rainfall or floods.
- **geomorphic_adjustment**: Channel and hillslope morphological response.
- **recovery**: Vegetation recolonization and sediment supply decline.
- **equilibrium**: Long-term return to pre-seismic sediment regime.
- **multiple**: Studies spanning multiple phases.

## Mechanisms
- **coseismic_landslide**: Direct sediment input from earthquake-triggered landslides.
- **debris_flow**: Mobilization of sediment as concentrated mass flows.
- **channel_incision**: Downcutting into previously aggraded sediment or bedrock.
- **terrace_formation**: Development of fluvial terraces through aggradation and incision.
- **hillslope_connectivity**: Coupling between hillslopes and channel networks.
- **hydrometeorological**: Influence of rainfall and floods on sediment transport.
- **multiple**: Interaction of several mechanisms.

## How to Rebuild
To regenerate the site data after editing the CSV source of truth:
```bash
# Edit literature_database.csv (source of truth)
python3 docs/build_site.py   # regenerates docs/papers.json
# Then push to GitHub Pages
```

## CSV Schema
| Column | Description |
|--------|-------------|
| ID | Sequential identifier (1..N) |
| Authors | Paper authors (e.g., Smith et al.) |
| Year | Publication year |
| Title | Full paper title |
| Journal | Journal name |
| DOI | Digital Object Identifier |
| Process_Phase | Main geomorphic process phase (see list above) |
| Mechanism | Dominant sediment transport mechanism (see list above) |
| Study_Type | Methodology (field_observation, remote_sensing, modeling, review, combined) |
| Region | Geographic study area |
| Parameters | Key metrics studied (e.g., sediment yield, landslide area) |
| Time_Scale | Duration of the study (e.g., 5 years, decades) |
| Key_Findings | Specific, unique geomorphic insights |
| Relevance | Subjective importance (high, medium, low) |

## Contributing
- **No MDPI or Frontiers journals**: DOI prefix 10.3390 is strictly excluded.
- **No conference papers**: Only peer-reviewed journal articles.
- **Unique Key_Findings**: Must be specific and non-templated.

## Reference
This project is inspired by and structured similarly to the sister project [water_che_after_event](https://github.com/geomingical/water_che_after_event).
