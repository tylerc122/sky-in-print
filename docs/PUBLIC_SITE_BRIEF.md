# Sky In Print: public site brief (for an implementing agent)

This brief is self-contained. Read `docs/SPEC.md` (project spec) and `results/PILOT_REPORT.md` for background, but
everything needed to build v1 is here.

## What the project is (for the site's own "About" text)
Sky In Print reads American newspapers from 1770 to 1964 (the *American Stories* corpus, OCR'd from the Library of
Congress's Chronicling America) to find every reported fireball and meteorite fall.
- A keyword filter and a local AI model pick out the sky reports.
- A person reads and checks the interesting ones.
- Every "meteorite fall" story is then followed through later newspapers, scientific journals and museum records to
  see how it turned out.

The headline idea: **newspapers recorded far more falls than science ever confirmed; we follow each one to its
ending**: recognized meteorite, hoax, slag or ironstone, or still unresolved, with a stone possibly sitting in a
museum drawer.

## Audience and tone
- **Audience:** curious general public (think a good museum website or a long-form science story), not specialists.
- **Tone:** plain, warm and precise. No hype: never say "discovered a new meteorite" unless one is confirmed (none
  is yet).
- **Every factual claim on the site must link to its source:** a newspaper scan URL (`https://www.loc.gov/resource/...`)
  or a journal citation.

## Deliverables (v1)
A static site in `site/`, buildable with no server: plain HTML/CSS/JS. Libraries may come from a CDN, pinned to exact
versions (e.g. Leaflet 1.9.4, d3 7.9.0). It has four pages:

1. **Home / Atlas.** A US map plus a timeline (1770-1964) of fireball events and fall reports.
   - Map: one point per event. Fall reports are coloured by **status**: recognized / hoax / not a meteorite /
     unresolved / under investigation. Fireball events are sized by number of independent reports.
   - Timeline: a strip or histogram by year below the map. Brushing a year range filters the map.
   - Click a point: a side panel with date, place, status, a 1-2 sentence summary, quotes (short, under about 40
     words) and links to the newspaper scans.
   - **Coverage caveat on the map:** the number of digitized newspapers varies hugely by year and state. Show a small
     "newspapers digitized per year" line under the timeline (from `data/sweep/*/stats.json`: `newspapers`,
     `articles`) and a sentence explaining that more dots in later years mostly means more newspapers, not more
     meteors. **Do not present trends in meteor frequency.**
2. **Stories.** One page each, or one long page with sections. See "Stories" below.
3. **The fireball of December 21, 1876.** A map of the reconstructed ground track: a line from `tracks.json` azimuth,
   drawn as the great circle through the overhead towns. Plot the 7 overhead-witness towns and the Rochester, Ind.
   meteorite site (17 km from the track, not used in the fit). A few quotes from witnesses. This is the "here's what
   newspapers can do" showcase.
4. **About / Methods.** How it works: pipeline, the model, human checks, the follow-up search. How we measure what we
   miss: known-fall recovery 5/7, both misses absent from the corpus itself, audits, the blind checks. Honest limits
   (OCR errors, coverage, newspapers exaggerate). Credits: Library of Congress / Chronicling America, *American
   Stories* (Dell et al.), NASA/Meteoritical Society data. Link to the data download.

Plus a **data release** (`site/data/`):
- `fall_reports.csv`
- `fireball_events.csv`
- a README describing the columns and status definitions.

## Data sources in this repo
| What | File | Notes |
|---|---|---|
| Fireball events (pilot windows + vetting) | `results/fireballs/events.json` | 1,257 events. Fields: `date_lo`, `date_hi`, `dated`, `reports`, `papers`, `independent_cities`, `cities`, `states`, `types`, `stones`, `vetted`, `quotes` (each has `date`, `paper`, `quote`, `scan`, `where`), `fields`. For the map use events with `independent_cities >= 2`, or `vetted`. |
| Fireball tracks | `results/fireballs/tracks.json`, `tracks.md` | 1876-12-21 (fit), 1873-12-24 (direction and end only) |
| Newspaper locations | `reference/newspapers/lccn_places.csv` | `lccn,title,state,city,lat,lon`. Join candidates by `lccn` to place reports |
| Fall leads and grades | `results/falls/*.md`, `single_paper_leads.jsonl`, `multi_paper_families_graded.jsonl` | Human-graded. Use the curated table below for v1 |
| Sweep outputs (local only, git-ignored) | `data/sweep/<year>/candidates.jsonl`, `triage_v2.jsonl`, `stats.json` | Present after `scripts/pull-from-cygnus.sh`. The full sweep finishes around 2026-10-25 |
| Recognized meteorites | `reference/metbull/Meteorite_Landings.csv` | NASA snapshot of the Meteoritical Bulletin; for "recognized" matches |

Write the export as a script: `src/skyinprint/export_public.py` reads these files and writes `site/data/*.json` and
`*.csv`. The site loads only `site/data/`. Regenerating after the full sweep must be one command.

## Curated fall stories and statuses for v1 (source of truth until a structured file exists)
| Lead | Status | One-line ending | Key sources |
|---|---|---|---|
| Saco, Me., Oct 1870 (Capt. Ira C. Doe) | **under investigation** | Doe saw it fall and gave the stone to the York Institute (now the Saco Museum) in 1873. The museum has found accession records for it (1873.111) and a second Doe "meteorite" (1891.68). The stones have not been located or examined yet. | `results/falls/saco_trail.md`; Daily Kennebec Journal 1873-11-20 p3 |
| Middleburg, Fla., Jan 1888 | **not a meteorite (limonite)** | A 200-lb stone sent to the Jacksonville Sub-Tropical Exposition. G. F. Kunz told the N.Y. Academy of Sciences in Feb 1888 it was "only a mass of limonite"; the Exposition catalogue lists it as "Sample Iron Rock, from Middleburg". | `results/falls/middleburg_trail.md`; Trans. N.Y. Acad. Sci. 7:135 |
| Schroon Lake, N.Y., Sept 1880 | **hoax / not a meteorite** | "Red-hot" 125-lb stone at a lakeside cottage; by December the papers reported it "merely a piece of quartz covered with kerosene oil and sulphur". | `results/falls/sweep_early_leads.md` |
| Northport, Me. (1850 fireball; fragments 1881-84) | **not a meteorite (slag)** | Fragments analyzed by F. C. Robinson (Bowdoin): copper slag, probably ship's ballast (Am. J. Sci. 1888). | `results/falls/literature_check_2026-10-22.md` |
| Thomson, Ga., Oct 15, 1888 | **recognized (record correction)** | A recognized meteorite listed as "Found", but Merrill (1910) and our 1888 newspaper show B. F. Wilson saw it fall while picking cotton. | `literature_check_2026-10-22.md` |
| Newton, Ind. 1879 "killer meteor" | **hoax** | Widely reprinted story of a farmer killed in bed; a documented hoax. | `results/falls/leads.md`, `credibility_test.md` |
| St. Joseph, Ind., June 1887 | **likely hoax** | "Two-ton" aerolite syndicated in 20+ papers; no stone, analysis or follow-up ever appeared. | `sweep_early_leads.md` |
| Amsterdam, N.Y., Nov 1887 | **hoax** | "Three-ton aerolite" outside a bank; later revealed as "a big stone [that] fell from a wagon". | `literature_check_2026-10-22.md` |
| Jonesboro, Ill., 1914 (A. V. Cook) | **under investigation** | Cook "saw this meteorite fall" and gave it to the Cairo Public Library (Cairo Bulletin 1914-12-11). Inquiry pending. | `results/falls/trails.md` |
| Laclede Station, Mo., 1872 (J. J. Murdoch) | **under investigation** | A metal "globe" dug up 13 ft down, "intended ... to present it to the Mercantile Library" (St. Louis). Inquiry pending. | `specimen_rank.md`, `trails.md` |
| Estherville, Iowa 1879; Homestead 1875; Rochester, Ind. 1876 | **recognized** | Famous falls the pipeline recovered; use as "what a real fall looks like in the papers". | `results/validation/known_falls_1870s.md` |

**Status definitions** (show these on the site and in the data README):
- **recognized:** matches a meteorite in the Meteoritical Bulletin.
- **not a meteorite:** identified as a terrestrial object by a contemporary or modern examination.
- **hoax:** retracted or documented as invented.
- **likely hoax:** has the hoax pattern (impossible size, wide syndication, nothing afterwards) but no retraction found.
- **unresolved:** credible report, no outcome found.
- **under investigation:** an institution is currently checking records or objects.

## Stories (long-form pages, about 600-1,000 words each, all sourced)
1. **"The stone in the cabinet" (Saco).** The 1870 fall, the York Institute, the accession records, what happens next.
   Must say clearly that it is not yet confirmed as a meteorite. Leave a placeholder section, "Update", for the
   result.
2. **"Iron rock from Middleburg."** The sensation, the steamer *Twilight*, the Exposition, Kunz's one-line verdict,
   and how Charles Fort turned it into "a block of limestone". A good story about how corrections don't travel.
3. **"Quartz, kerosene and sulphur" (Schroon Lake).** A hoax that looked like the best lead, caught by reading later
   papers.
4. **"Tracking a fireball with 1876 newspapers."** The Dec 21, 1876 reconstruction.

## Hard rules
- **Privacy:**
  - Do not publish anything from `drafts/` (email drafts are git-ignored and must stay out of the site).
  - Do not publish the outreach log, or names or emails of archivists and librarians, unless they agree. Say "the
    Saco Museum confirmed…", not a staff name.
  - Do not publish attachments institutions sent.
- **No overclaiming:** use only the statuses above. "Under investigation" leads say what is known and what isn't.
- **Copyright:** newspaper text from 1770-1964 US papers is public domain, but keep quotes short anyway (they are OCR
  and messy). Clean up obvious OCR errors in quotes only inside brackets, or say "(OCR lightly corrected)".
- **Coverage honesty:** never imply that more dots means more meteors.
- **Accessibility:** readable fonts, keyboard-usable map panel, alt text, works on phones (16px side padding, no
  horizontal scroll), light and dark mode.
- **Commits:** first person and casual, no attribution lines (house style; see `~/.claude/CLAUDE.md`).

## Out of scope for v1
- Live data, accounts, comments.
- The full-sweep numbers: build v1 on pilot data and the pulled sweep years, and make it regenerate cleanly once the
  sweep finishes.
- Aurora, comet and eclipse layers (later phases of the spec).

## Done when
- `python -m skyinprint.export_public` writes `site/data/`.
- Opening `site/index.html` (or serving `site/` with any static server) shows the atlas, the four stories, the 1876
  track page and About.
- Every story claim links a source.
- The data release has a README with column and status definitions.
