# Known-event recovery: recorded US falls, 1870s

Reference: frozen meteorite snapshot (`reference/metbull/Meteorite_Landings.csv`), US "Fell" entries
1870-1879: 7. The test asks whether the pipeline (keyword filter, then v2 triage) surfaces a contemporary report
of each fall that is accepted as a meteorite fall or with stones reported.

| Fall | Date | In candidates | Accepted as fall | Notes |
|---|---|---|---|---|
| Estherville, IA | 1879-05-10 | 24 (22 papers) | 24 | |
| Homestead (Amana), IA | 1875-02-12 | 50 (36 papers) | 39 | |
| Searsmont, ME | 1871-05-21 | 5 | 4 | |
| Rochester, IN | 1876-12-21 | 2 | 2 | Also many reports of the 1876-12-21 fireball itself |
| Castalia, NC | 1874-05-14 | yes | yes | Reported as "near Ransom's bridge, Halifax county, N.C., on the 14th"; a name search on "Castalia" missed it |
| Cynthiana, KY | 1877-01-23 | none found | 0 | No candidate mentions it |
| Warrenton, MO | 1877-01-03 | none found | 0 | No candidate mentions it |

**Result: 5 of 7 recovered (71%; 95% Wilson CI about 36-92%).** Both misses have no keyword candidate at all, so
they fail upstream of the model: either missing from the corpus or OCR-garbled. A targeted rescan of the 1877
archive for "Cynthiana" and "Warrenton" (spec §4.1) will separate corpus coverage from filter recall.
Name matching for this test was by place-name regex, then reviewed by hand.

## Rescan of the full 1877 archive (2026-10-21)
`rescan_names.py` streamed every 1877 article and kept those naming Cynthiana or Warrenton within 400 characters of
meteor, aerolite, stone, fell, sky or heavens.
- **28 articles name the towns:**
  - Cynthiana: 11 (Cincinnati Daily Star social notes, Kentucky items)
  - Warrenton: 17 (Missouri, Virginia and Georgia places)
- **None reports either fall.** Every hit was read. They are visitors, races, a hanging at Warrenton, Mo., land
  sales and fiction. No article in the whole 1877 archive puts a meteor or aerolite word near either name.

**Conclusion: both misses are corpus coverage, not filter or model recall.** The towns are well covered, and
Missouri news reached the corpus (the Warrenton hanging was reprinted in Tennessee). But no digitized paper in
American Stories carried these two falls, or their reports did not survive OCR.
- **Filter and model recall:** among falls that the corpus actually reported, 5 of 5 were recovered.
- **End-to-end recall:** 5 of 7 recorded falls, the figure to quote for what the catalogue can see.
