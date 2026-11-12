# Sky In Print · static public site

Plain HTML, CSS and JS with no build step. Pages use clean URLs (`/`, `/archive`, `/fireball`, `/about`, `/cases/<id>`) and root paths for assets, set up in `vercel.json`, so opening files straight from disk won't work. Run `python3 scripts/serve_site.py` from the project root to serve it locally the same way Vercel does, on port 8766.

## Pages
- `index.html`: Thomson painted across the top, the Thomson fix with the before and after catalogue entry, all thirteen cases oldest first (each with its own painting, filterable by outcome), the open leads, and links to the map, the 1876 page and the method.
- `/cases/<id>` (served by `case.html`, old `case.html?c=<id>` links still work): one case: its painting, the outcome, the long story where there is one (else the summary with the clipping), a locator map, the record in order for Thomson, sources, and the cases either side.
- `archive.html`: the full map explorer: search, outcome filters, brushed year range, coverage line and an equivalent report list.
- `fireball.html`: the Rochester painting, the seven-town great-circle fit, Rochester holdout, optional replay and the write-up.
- `about.html`: methods, caveats, how the paintings are made, status definitions, credits and downloads.
- `stories.html`: a redirect; `stories.html#thomson` and the like go to the matching case page.

## Paintings
`assets/paint.js` is the brush engine: a scene is a list of passes, each pass places strokes, and each stroke is drawn as a bundle of thin bristle lines. `assets/scenes.js` holds the building blocks (sky, clouds, hills, trees, water, snow, houses, fireballs, smoke) and one composition per case, with its caption and alt text; `assets/scene-thomson.js` is the Thomson scene. Seeds are fixed, so a painting is the same on every visit. Open `mock/scenes.html` (local only, not deployed) to see all thirteen side by side while tuning. The rule for every scene: paint only what the case's sources back up, nothing falls in a hoax, and the caption says when the hour or season is a guess.

## Scans
`assets/scans/` and `data/scans.js` come from `python3 scripts/fetch_scans.py` (run from the project root). It pulls each case's page from loc.gov through IIIF, finds the article from the ALTO word coordinates, crops it, and keeps a small whole-page image for the film strip. Crops and pencil brackets that the OCR can't place get set by hand in the script's `CASES` table. Northport has no newspaper scan and shows a typed card instead.

The source files are the HTML/CSS/JS themselves. There is no template build tool. Change `assets/cases.js` for case wording and verdicts, `assets/home.js` for the homepage, `assets/scenes.js` for the paintings, `assets/stories.js` for the long stories, and `assets/style.css` for design tokens. Vendored map libraries are version-pinned and include license notices.

## Refresh the data
From the project root, in an environment with this project installed:

```sh
python -m skyinprint.export_public
```

The exporter reads the grouped pilot results, frozen newspaper and meteorite references, current sweep statistics, the curated v1 cases, and an explicit evidence allowlist. `docs/PUBLIC_UPDATES.md` is the intentionally public institutional-update summary. It never reads drafts, private attachments, or the outreach log. Do not copy the repository wholesale to a web host; only this `site/` directory is the public artifact.

New sweep statistics appear on regeneration. New fireball events must be grouped and reviewed upstream before replacing `results/fireballs/events.json`. Curated fall statuses are in `src/skyinprint/export_public.py` and must be deliberately updated as investigations resolve.

```sh
python -m unittest discover -s tests -v
python -m http.server 4173 --directory site
```

Export checks cover CSV/JSON parity, evidence links, privacy exclusions, stable output, missing coverage, issue editions and reconstruction geometry. The data dictionary in `data/README.md` defines every release field.
