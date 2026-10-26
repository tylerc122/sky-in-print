# Specimen-destination ranker (pre-sweep tool, 2026-10-21)

Code: `src/skyinprint/specimen_rank.py`.

**Why it exists.** Newspaper text cannot tell a small real fall from a tall tale (`credibility_test.md`). Every lead
that became a specimen trail named where the stone went. At full scale there will be far more fall reports than
anyone can read, so the reports that name a destination are read first.

**Scoring.** Each signal counts once, within ±700 characters of a stone or meteor word:
| Signal | Points |
|---|---|
| The stone went to an institution: museum, college, library, institute, academy, society, state geologist. Includes a list of gifts to a named institution | +3 |
| A named holder, buyer or recipient, or the stone is on exhibition | +2 |
| Someone saw it fall | +2 |
| A weight is given | +1 |
| Hoax marker: a person killed, tons, molten mass, hoax/humbug | -3 |

Before scoring, words OCR split across lines are rejoined ("present- | ed" becomes "presented"), and the common
OCR "10 the" is read as "to the".

## Pilot result
- **Reports scored:** 1,843 accepted fall reports, plus the name-rescan hits.
- **Read first:** 81 score 3 or more (4.4%), and 23 score 5 or more.

**All four leads that have a trail are in the top 81:**
| Lead | Rank | Destination phrase found |
|---|---|---|
| Laclede Station / St. Louis 1872 | 12 | "intended ... to present it to the **Mercantile Library**" (**new**: missed when we read this lead) |
| Washington Island 1914 | 19 | "purchased by Charles Jensen" |
| Jonesboro 1914 | 22 | gifts to the Cairo Public Library (rescan text) |
| Saco 1870 | 43 | "presented to the York Institute" |

**Caveat: this is not a blind test.** Two of the four, Saco and Cairo, were scoring low, and the fixes were made to
catch them: OCR rejoining, the gift-list rule, and "killed" counting only for a person (Saco's grass was "scorched
and killed"). At full scale the ranker needs a held-out check: hand-read a random sample of low-scoring fall reports
for destinations it missed.

**Known noise:**
- Neighbouring items in the same news column can supply an institution word. In the top 40, 6 items get it from an
  unrelated story ("female college", "cornerstone of a college"). A ±400 window removes most of this but loses the
  Laclede hit, so 700 is kept, and readers drop such items in seconds.
- The ranker does not judge whether a report is true. The Newton hoax ranks 31st, because the State Geologist really
  did send for the stone.

## New trail candidates surfaced by the ranker (not yet read or checked)
| Report | Destination | Next step |
|---|---|---|
| Laclede Station, Mo., 1872 (existing lead) | St. Louis Mercantile Library (still exists, at UMSL) | Ask the Mercantile Library about an 1872 meteorite from John J. Murdoch |
| Cedar Twp., Monroe Co., 1870-10 | "sent to the Museum of the Wesleyan University at Mt. Pleasant" (Iowa Wesleyan; the college closed in 2023) | **Probably native copper** ("a large nugget of pure copper, weighing 116 pounds", Tama County Republican 1870-10-20; audit2_2026-10-26.md). Low priority. |
| "near his house, on the Step Rock road", 1880-03 | "will be sent to the Smithsonian Institution" | Read the report; check the Smithsonian's meteorite records for 1880 |
| near Minot, N.D., 1914-12 | dug up, "now has it on exhibition"; a second fall south of Minot | Read the report |
| Indianapolis, 1872-09 | 11-lb stone "which fell during the late meteoric shower", on exhibition at the police office | Read the report |
| unnamed city, 1877-07 | aerolite "still in the possession of the Rev. Dr. Wood" | Read the report |

Recognized falls rank high too (Homestead → Iowa State University; Estherville → University of Minnesota;
Searsmont → Amherst College). That is expected, and it supports the ranker: real falls with a known destination
score the way our trails do.
