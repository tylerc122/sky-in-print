Source: S. M. Silverman's historical aurora collections at NASA SPDF/NSSDC,
https://spdf.gsfc.nasa.gov/pub/data/aaa_special-purpose-datasets/aaa_historical_aurora/ , retrieved 2026-10-20:
`misc/temp01-08.txt` (main catalog), `new_england_auroral_obs_1720_1948/*.txt`, and
`auroral_notes_us_climat_data/*/*.txt` (US Climatological Data, 1914-1948).
Parsed by `src/skyinprint/parse_silverman.py` into `silverman_parsed.csv`: 96,600 rows, 77,045 in US
states/territories, 15,368 distinct US dates. Parsing is line-pattern based; rows the pattern misses are
not included (to be checked against the raw files when a cross-match matters).
