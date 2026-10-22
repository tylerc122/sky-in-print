# Early sweep fall leads (years 1770-1887, pulled 2026-10-22)

**Source data:** 93 sweep years whose triage was finished. The 1870s come from the pilot, and 1888 onward is still
running on Cygnus.

**Ranking:** 1,260 accepted fall reports were ranked by `specimen_rank.py --workdir sweep`.
- 136 score 3 or more. They collapse to 112 distinct items once copies are grouped.
- Claude read all 112. The batch log gives 83 s of wall-clock time; human review time comes from the review page.

**Blind check of the ranker:** 100 reports scoring below 3 were drawn by seed before anyone read the list
(`ranker_holdout_draw.json`). They have not been read yet.

## What the top tier contained
- **Recognized meteorites, mostly:**
  - Weston 1807, Forsyth 1829, Deal 1829
  - Linn County 1847, Cabarrus/Monroe 1849
  - Bethlehem 1859, New Concord 1860
  - Homestead 1875, Estherville 1879
  - Chilkat/Alaska iron, Tucson irons, Trenton iron, Ainsa
  - Plus museum notes about Red River (Yale), Amherst and Nashville.
- **Foreign falls:** Dharamsala 1860, Pultusk ("Poland") 1868, Parnallee, Grossliebenthal, Durango.
- **Dropped on reading:**
  - McGregor, Iowa 1866: visitors found "no such stone there".
  - Washington Co., Pa. 1885: a stone "thirty to fifty feet in diameter".
  - Vanceborough 1887: "larger than a box-car".
  - Wellsburg, N.Y. 1887: a 20×40 ft pit.
  - Brooklyn 1887: a green copper-like lump after lightning.
  - Fort Assinaboine 1882: a shock only, no stone.
  - Rowan Co., N.C. 1880: a hearsay mention.

## New candidates (no match in the frozen catalogue; web search found nothing)
| Report | Key details | Cautions | Grade |
|---|---|---|---|
| **Schroon Lake / Crown Point, N.Y., Sept 1880** | 125-lb stone found "red-hot" 20 ft from Lakeside Cottage (M. H. Granger), right after a flash and a house-shaking concussion. Two accounts: a Crown Point dispatch, and the owner's tenant's letter via W. Emerson Mead. A hut was built over it "for the benefit of scientists" | Described as "white stone". Kerosene and sulphur poured on it "burned up at once", which sounds odd. Meteorites are rarely hot on the surface | **medium-strong**: two accounts, named people, a fixed place |
| **Franklinton, N.C., 1887-04-03** | 15-lb stone fell a few feet from W. H. Jenkins's house after a flash and a report heard for 20 miles; buried several feet | single dispatch so far | **medium** |
| **Middleburg, Fla., 1887** | about 200-lb stone "which fell on his farm" (W. G. Burlington), to be exhibited at the Sub-Tropical Exposition, Jacksonville, Jan-May 1888 | no fall details | **medium-weak**, but the exhibition gives a trail: exposition catalogue and records |
| St. Joseph, near Evansville, Ind., 1887-06-12 | "aerolite of vast dimensions" smashed an oak and buried itself 15-18 ft; fragments "to be sent to the Smithsonian" | fragments "of obsidian, scoria and pumice" sound terrestrial | **weak**; check Smithsonian accession records |
| Shell Rock (Albert Lea), Minn., 1880 | 600-lb "meteor" that "fell and was found"; exhibited by D. G. Parker | "pyramid of cobble stones cemented together" sounds like a conglomerate or slag | **weak** |
| Chittenden, Vt., 1861-12-18 | stone fell on Zephaniah Eddy's farm with brilliant light; ground charred | "resembles sandstone". Zephaniah Eddy was the father of the Eddy Brothers, the Chittenden spiritualist mediums | **weak/curiosity** |
| Dayton, Ohio (Dr. Van Tuyl's cabinet, 1854) | stone "fell in a swamp" west of Dayton, dug from 17 ft | no witness; a find | **weak** |

**New destination for a pilot lead:** Laclede 1872 is "intended ... to present it to the Mercantile Library". An
inquiry email is drafted (`mercantile_inquiry_email.md`).

Next steps:
- Tyler's read (`results/review/sweep_leads_1.html`).
- Read the ranker blind sample.
- Rerun on the 1888-1964 years when they are finished.
