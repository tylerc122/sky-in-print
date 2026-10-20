# Pilot pre-registration

Committed before any newspaper data inside the evaluation windows was downloaded or read.
Corpus: American Stories, Hugging Face revision `77e27fa69c4788dfaad1c9efd8a226d5a32d3e9a`
(per-year sizes and SHA-256 in `corpus_manifest.json`). Windows were chosen by `src/skyinprint/prereg.py`
(seed 20261020) and are listed in `pilot_windows.json`.

## Windows

| Window | Dates | Use |
|---|---|---|
| debug_1859 | 1859-08-15 to 1859-10-15 | Debugging only. Already downloaded during exploration, so never used for evaluation |
| falls_1870s | 1870-01-01 to 1879-12-31 | Fireball and fall layers. Chosen as the 1840–1919 decade (corpus ≤ 25 GB) with the most recorded US falls in the frozen meteorite snapshot: 7 |
| 10 ordinary windows | 2 months each: 1844-09, 1849-04, 1851-02, 1852-04, 1863-07, 1880-02, 1893-09, 1911-04, 1914-11, 1916-11 | Held-out evaluation, all layers |

## Rules fixed now
1. **Patterns:** `patterns.json`, drafted from the 1859 debug window only. Pattern changes after this commit
   are logged in `CHANGES.md` with a reason and re-run on all windows.
2. **Independent manual search:** in each ordinary window, 2 newspaper issues (one issue = all pages of one
   title on one date) are drawn by seed 20261020 from the issues present, *before* any article in them is
   read. Every article in those issues is read for sky observations without using the filters. Their
   yield is compared against the pipeline's yield on the same issues.
3. **Rejection audits:** random samples from each filter stage's rejected set, reported with uncertainty.
   "Insufficient evidence to estimate recall" is an allowed result.
4. **Known-event recovery:** recorded US falls in the pilot windows from the frozen snapshot (1870s: 7
   falls), checked for a contemporary report. An independent fireball list is added if one becomes
   available in usable form; otherwise this limitation is stated.
5. **Success criteria** are the five pilot outputs in `docs/SPEC.md` §10. They depend on the method, not
   on yield. A zero fall yield is a valid result.

## Reference snapshot
- `reference/metbull/Meteorite_Landings.csv`: NASA's export of the Meteoritical Society database
  (SHA-256 `5b4c6a35…`, retrieved 2026-10-20). The live Meteoritical Bulletin site was not reachable for
  automated download (a bot-check page), so this derived snapshot is the frozen reference. It lacks
  doubtful and pseudometeorite listings, a known limitation that is checked by hand for strong candidates.
