# Ranker blind check (2026-10-22)

**Sample:** 100 fall reports scoring below 3, drawn by seed `ranker-holdout-20261022` from the 1,124 low scorers in
the sweep years 1770-1887 before anyone read the list (`ranker_holdout_draw.json`). Claude read all 100: 55 s of
wall-clock time (`results/review_time.jsonl`).

## Result: the ranker missed 7 destinations in 100
| Item | Report | What it missed |
|---|---|---|
| H15 | Bellevue, Pa. 1886 (fragments = Bradford Woods fall) | "have **in their possession**" |
| H20 | West Roxbury, Mass. 1883 | druggist "has **in his possession**" a stone that fell beside him |
| H25 | Chittenden, Vt. 1861 | "in the possession of Mr. Eddy", more than 700 characters from the meteor word |
| H26 | Greengrove, Ala. 1881 | "**OH exhibition**" (OCR for "on") at G. W. Metcalfe & Bros. |
| H40 | Forest Hill, Mich. 1885 | "some of which **he secured**" |
| H49 | Launton, England 1830 | "**in his possession**" |
| H96 | Shergotty, India 1865 | "forwarded ... to the **Asiatic Society**" |

**What 7 in 100 means at scale:** 7% of 1,124 is about 80 missed destinations among low scorers, against the 136 the
ranker flagged. Its recall for destinations was roughly 60%, and the pilot result ("all 4 trails in the top 4.4%")
overstated it. That pilot test was not blind, as noted at the time.

## Fixes (`specimen_rank.py`)
- Holder phrases added: "in his/her/their/our possession", "secured (it/a piece/some)", "some of which he secured",
  "carried it home".
- OCR variants of "on exhibition" added ("oh", "ou", "0n").
- Institution list: "society" on its own.
- Read-first cut lowered from 3 to 2. A named holder alone scores 2, and Claude's reading costs almost nothing.
  - The read-first list goes from 136 to 253 reports (20% of fall reports).
  - It would catch 6 of the 7 misses. H25 stays out, beyond the window.
- **This sample is now used up.** It was used to tune the fixes, so it can't measure them. The next blind sample is
  drawn from the 1888-1964 sweep years before they are read.

## New leads found in the sample (catalogue checked; follow-up search run)
| Report | Status |
|---|---|
| Northport / Waldo Co., Me., 1884 | fragments found where a fall was seen years earlier; a 20-lb piece under study by "a scientist"; 5 follow-ups into 1885; no catalogue match (Castine 1848 is 17 km away and a different fall). **medium** |
| West Roxbury, Mass., 1883 | about 1-lb stone heard crashing through pines beside the druggist Gordon, who kept it. **medium-weak** |
| Greengrove, Madison Co., Ala., 1881 | dug from Boynton's yard after an explosion; kept as a charm stone; later on exhibition in a store. **medium-weak** |
| Forest Hill, Mich., 1885 | struck a fence beside George Huffman, who kept pieces. **weak** |
| Twin Tunnels, Ky., 1887 | hole on James Marshall's farm after a fireball; no stone mentioned. **weak** |
| Gibson Mills, Tenn., 1882 | 2-3 inch stone fell in the road in front of Mr. James. **weak** |
| Bellevue, Pa. 1886; Clarksville, Ark. 1886; Stewart Co., Ga. 1869 | recognized falls: Bradford Woods, Cabin Creek, Lumpkin |
| Richmond, Va. 1882 (stone through a store roof) | "seemed to be quartzite": probably not a meteorite |
| Amsterdam, N.Y. 1887; Claysville, Pa. 1885 ("200 tons"); Owensboro, Ky. 1887; Vanceboro 1887; Somerset, Ky. and Whitestone, Kan. killer meteors | tall tales or hoaxes |
