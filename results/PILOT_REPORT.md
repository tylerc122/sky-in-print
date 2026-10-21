# Sky In Print: pilot report (2026-10-21)

The pilot tested the method on pre-registered windows (`prereg/pilot_windows.json`): the 1859 debug window, the
1870s fall decade, and 10 ordinary 2-month windows (1844-1916). Its job was to show the pipeline works and to measure
what it misses, not to make discoveries. Deviations from the pre-registration are in `prereg/CHANGES.md`.

## What ran
| Step | Result |
|---|---|
| Corpus | American Stories at a pinned revision; per-year SHA-256 in `prereg/corpus_manifest.json` |
| Keyword filter (`prereg/patterns.json`) | 31,006 candidate articles (1859 debug window excluded) |
| Local-model triage (prompt v2, Flint, temperature 0) | 31,006 triaged, 0 unresolved errors (2 labeled by hand); 11.3 model-hours, about 1.3 s per article |
| Accepted as sky observations | 4,322: 1,873 fireball, 659 meteor shower, 640 meteorite fall, 423 comet, 283 aurora, 251 eclipse, 193 other |
| Ran unattended | On Cygnus in Docker, resumable, with courtesy rules for the shared model server |

## The five pilot outputs (spec §10)
1. **Fireballs: done** (`results/fireballs/`).
   - **Grouping:** 2,704 reports were grouped into 1,257 events, with OCR-tolerant copy detection. 111 events have 2 or
     more independent sources and 32 have 3 or more.
   - **Vetting:** the top 20 events were checked by hand. 20 unrelated report families were dropped, 3 split events
     were merged, 3 false events were dissolved, and one dating bug was fixed.
   - **Validation:**
     - The great fireball of 1876-12-21 ranks first, with 25 independent sources.
     - Every known fall that has reports is found on its correct date.
     - **The 1876-12-21 ground track**, fit from 7 overhead towns in Missouri and Illinois, passes 17 km from the
       Rochester, Ind. meteorite site. That site was not used in the fit.
   - **Partial track:** a second track (Christmas Eve 1873, Virginia) gives direction and end point, and agrees with
     4 independent checks.
   - **Failed check:** height from one observer's elevation estimate gave an implausible 156 km.
   - **Fall lead:** the South Bend 1876 lead is tied to the documented 1876-07-08 fireball.
2. **Falls: done.** All 682 accepted fall reports were grouped into reprint families. All 73 multi-paper families and all
   447 single-paper families were read and graded (`results/falls/`). Results:
   - 20 families match recognized meteorites.
   - 1 documented hoax was confirmed: Newton, Ind., 1879.
   - 1 known fall is missing from the frozen NASA snapshot: Kansas City, 1876. A non-match alone never makes a report new.
   - Specimen trails (`results/falls/trails.md`):
     - Saco 1870: the stone went to the York Institute, now the Saco Museum.
     - Jonesboro 1914: the stone went to the Cairo Public Library.
     - Washington Island 1914: a buyer is named.
     - Inquiries went to the Saco Museum and the Cairo Public Library.
     - Hooper 1911 (concretion), Yakima 1890 (cinder), Romney 1873 (hoax markers) and Wakefield 1911 (reads as fiction)
       were downgraded.
     - About 26 medium leads are not yet trailed.
3. **Miss-rate evidence: done, honestly bounded.**
   - Known 1870s US falls recovered: 5 of 7 (71%, 95% CI 36-92%). Both misses had no candidate at all, so they were lost
     before triage (in the corpus or the filter), not by the model.
   - Audit of 200 v2 rejections: 0 clear misses. The 95% upper bound is about 3.7% per rejection, which is loose for
     rare events.
   - Manual issue search: 1 real report in 2,775 articles, caught by both filter and model. That is 1/1, so it says
     little about recall.
   - Blind eye-check by Tyler: 22/24 agreement (92%, CI 74-98%). He found no misses among the model's rejections.
   - The early 1844 audit found that passing mentions were being missed. Prompt v2 fixed this, developed on 1859 data
     only and disclosed.
4. **Review time: estimated, not measured.** Reading and grading the 520 fall families took Claude a few hours of
   session time. Tyler's eye-check of 40 items took about an hour. No per-event timer was kept. Timing must be logged
   in the full run.
5. **Aurora comparison (optional): skipped.**

## What we learned
- **The filter-plus-model pipeline is cheap and reliable.** It sorts tens of thousands of articles a day on shared
  hardware with high agreement with a human reader.
- **Newspaper text cannot certify a small fall** (`results/falls/credibility_test.md`):
  - It flags killer-meteor hoaxes, which carry hoax markers in most articles.
  - It confirms big falls, which get dozens of papers and months of follow-up.
  - Small real falls look the same as our leads.
  - The only path to a claim is outside evidence, and the best kind is a report that **names where the stone went**.
    Both live trails came from such reports.
- **Weak spots to fix before scaling:**
  - Reprint grouping breaks on short, OCR-damaged items.
  - Excerpts are cut by character count. They should end at a sentence boundary (eye-check item D18).
  - Corpus coverage is untested for the two missed falls. This needs a rescan of 1877 for Cynthiana and Warrenton.

## Decision: go, with conditions
The method works end to end for falls, and its misses are measured and bounded. Per the spec, fall yield decides how
prominent falls are, not whether to continue. We have two institutional trails, which is enough to keep falls central.

**Before the full sweep:**
1. Sentence-boundary excerpts, and reprint grouping that tolerates OCR noise for falls (the fireball code already does this).
2. The 1877 rescan for Cynthiana and Warrenton.
3. Per-event review timing in the tools.
4. A **specimen-destination ranker**: flag every accepted fall report that names a museum, college, library, buyer or
   donor, so those are read first. Reading everything is not feasible at full scale.

**Full sweep (1774-1963):**
- Same pinned corpus, filter and prompt v2, run on Cygnus.
- The fireball and fall layers go first.
- Rough projection: about 200,000 candidates and 3-4 days of model time. This is an extrapolation from the pilot's
  per-year candidate rates and will be revised after the first decades run.
