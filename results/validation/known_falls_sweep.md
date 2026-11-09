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
- **Recovered: 47 of 114 (41%)** after the 2026-11-08 filter test below found Palahatchie and Richardton under
  other names. Originally 45: 40 by name; 4 only through nearby reports under another name (Bald Mountain as
  "the old Blackburn place", Monroe as Cabarrus Co., Marion as "in our state" on 25 Feb 1847, Pricetown as "near
  Pulse"); Castalia as "Ransom's bridge, Halifax county" (found in the 1870s check).
- **Model misses: 1.** Among falls with at least one real report in the keyword candidates (46), the LLM rejected
  every report for just one: Cabin Creek 1886, a one-line note that Will Webb bought "the meteor found by C. C.
  Shandy". **Triage recall on falls that reach the model: 47 of 48 (98%)** (45 of 46 before the filter test).
- **The other 66 misses (68 before the filter test) have no real report in the candidates.** Every rejected candidate naming them was read, and
  all were false name hits: horses (Blanket), tennis (Tilden), baseball (Miller), sports pages (Torrington),
  shipping lists (Monroe, Marion), fiction (Deal). So these fail before the model: missing from the corpus, OCR-garbled
  or missed by the keyword filter. The 1877 rescan (Cynthiana, Warrenton) found the corpus was the cause both times
  it was checked; the rest aren't rescanned.
- **False name matches rejected correctly:** Fisher, Frankfort, Leighton, Independence, Farmington, Baxter and Success
  each had an accepted report that turned out to be a different event. Not counted.

## Keyword-filter test (2026-11-08)
Eight recorded falls with digitized papers within 150 km but no name match in the candidates (Bradford Woods 1886,
Cross Roads 1892, Palahatchie 1910, Moore County 1913, Norfork 1918, Richardton 1918, St. Mary's County 1919, Baldwyn
1922). Full-text rescans of each fall's year (`rescan_names.py --only filt`, every article, no keyword filter), keeping
any article naming the place or its county/nearby towns within 400 characters of a strong word (meteor, aerolite,
fireball, "fell from the sky").
- **Palahatchie 1910:** reported as "Pelahatchie" and "Rankin county" (Brandon News, East Mississippi Times, Macon
  Beacon, Birmingham Age-Herald, Oct 1910). All were already keyword candidates and accepted by triage.
- **Richardton 1918:** reported as the "Mott" fall (Fargo Forum, Grand Forks Herald, Devils Lake World, Hope Pioneer
  and others, Jul-Sep 1918). Also already candidates and accepted.
- **The other six:** no article in the whole year names the place near a strong word.
- **Result: the keyword filter dropped none of the eight.** The two "misses" were the eval's name matching, and the
  rest are not in the corpus. Corpus coverage, not the filter or the model, is what limits recall.

## Era
- 1807-1922: 34 of 71 recovered (with Palahatchie and Richardton).
- 1923-1963: 13 of 43. Far fewer papers are digitized after 1922.
