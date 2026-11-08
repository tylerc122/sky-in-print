# Known-fall recovery, full sweep (2026-11-08)

Extends `known_falls_1870s.md` to every swept year. Reference: frozen snapshot `reference/metbull/Meteorite_Landings.csv`,
"Fell" entries inside the contiguous-US box, in a year with sweep data: 118, minus 4 outside the US (Dresden, Ont.;
De Cewsville, Ont.; Mazapil and Avilez, Mexico) = **114 US falls, 1807-1963**.

Scripts: `scripts/known_falls_recall.py <repo> recall.json` (writes the per-fall matches), then
`scripts/known_falls_rejected.py <repo> <names...>` (prints rejected candidates naming a fall; run it next to recall.json).

## Method
1. **Name match:** a keyword candidate from the fall year or the next names the meteorite within 400 characters of a
   meteor/fall word.
2. **Accepted:** that candidate's v2 triage says sky observation (fall, fireball or meteor) or stones reported.
3. **Nearby:** for falls with no name match, accepted fall reports from papers within 150 km, read by hand.
4. **Every match was read.** A fall counts as recovered only if an accepted article is actually about that fall.

The catalogue snapshot only has years, not dates, so this can't measure days from fall to first report.

## Result
- **Recovered: 45 of 114 (39%).** 40 by name; 4 only through nearby reports under another name (Bald Mountain as
  "the old Blackburn place", Monroe as Cabarrus Co., Marion as "in our state" on 25 Feb 1847, Pricetown as "near
  Pulse"); Castalia as "Ransom's bridge, Halifax county" (found in the 1870s check).
- **Model misses: 1.** Among falls with at least one real report in the keyword candidates (46), the LLM rejected
  every report for just one: Cabin Creek 1886, a one-line note that Will Webb bought "the meteor found by C. C.
  Shandy". **Triage recall on falls that reach the model: 45 of 46 (98%).**
- **The other 68 misses have no real report in the candidates.** Every rejected candidate naming them was read, and
  all were false name hits: horses (Blanket), tennis (Tilden), baseball (Miller), sports pages (Torrington),
  shipping lists (Monroe, Marion), fiction (Deal). So these fail before the model: missing from the corpus, OCR-garbled
  or missed by the keyword filter. The 1877 rescan (Cynthiana, Warrenton) found the corpus was the cause both times
  it was checked; the rest aren't rescanned.
- **False name matches rejected correctly:** Fisher, Frankfort, Leighton, Independence, Farmington, Baxter and Success
  each had an accepted report that turned out to be a different event. Not counted.

## Era
- 1807-1922: 32 of 71 recovered.
- 1923-1963: 13 of 43. Far fewer papers are digitized after 1922.
