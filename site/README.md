# Sky In Print · static public site

Open `index.html` directly in a browser, or serve this folder with any static web server. No application server, build step, account or API is required. JavaScript is required for the atlas and assembled stories. Data and geographic boundaries load from classic local scripts, so file opening does not depend on fetch permissions. Google Fonts is optional; readable system fonts are the fallback.

## Pages
- `index.html`: the microfilm reader. All thirteen followed cases are on its reel as real Library of Congress scans, with the passage bracketed in pencil. Turn the crank (drag, click, arrow keys or the buttons) or tap a frame on the film strip, and a typed slip gives the verdict. Below it: the Thomson story, all thirteen as index cards, how it was done, and links to the map and the 1876 page.
- `case.html?c=<id>`: one case: the clipping, what it turned out to be, the long story where there is one, sources, a locator map, and links to the cases either side.
- `archive.html`: the full map explorer: search, outcome filters, brushed year range, coverage line and an equivalent report list.
- `fireball.html`: seven-town great-circle fit, Rochester holdout, optional replay and the write-up.
- `about.html`: methods, caveats, status definitions, credits and downloads.
- `stories.html`: a redirect; `stories.html#thomson` and the like go to the matching case page.

## Scans
`assets/scans/` and `data/scans.js` come from `python3 scripts/fetch_scans.py` (run from the project root). It pulls each case's page from loc.gov through IIIF, finds the article from the ALTO word coordinates, crops it, and keeps a small whole-page image for the film strip. Crops and pencil brackets that the OCR can't place get set by hand in the script's `CASES` table. Northport has no newspaper scan and shows a typed card instead.

The source files are the HTML/CSS/JS themselves. There is no template build tool. Change `assets/cases.js` for case wording and verdicts, `assets/home.js` for the reader, `assets/stories.js` for the long stories, and `assets/style.css` for design tokens. Vendored map libraries are version-pinned and include license notices.

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
