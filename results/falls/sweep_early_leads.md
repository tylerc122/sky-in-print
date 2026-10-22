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

## Tyler's read (2026-10-22, `results/review/answers_tyler_2026-10-22_sweep_leads_1.tsv`)
- **Answers:** all 7 marked "chase it", most with reservations.
- **Time:** 724 s for 7 items, about 103 s each, with a scan opened for 6 of 7. This is the first measured human
  review time (spec §10 output 4).
- **Notes:**
  - Schroon Lake: names and an eyewitness, but "sounds fantastical"; the second, independent account makes it "a
    definite yes".
  - Franklinton: "described like fiction".
  - St. Joseph: "not less than two tons" is on the scan but not in our excerpt. Tyler: "just too big not to be
    documented".

**Follow-up on St. Joseph 1887.** The corpus split this story into separate articles, so the ranker saw a 1,130-
character fragment without the weight. Other copies say "cannot weigh less than two tons".
- It was printed in more than 20 papers, June 13-24, 1887.
- It has no follow-up, no recovered stone and no analysis.
- That is the profile of the documented killer-meteor hoaxes (`credibility_test.md`): wide syndication, an
  impossible size, nothing afterwards.
- **Downgraded to likely hoax.** One cheap check remains: the Evansville papers for late June 1887.

**Lesson for the ranker:** hoax markers can sit in a part of the story the corpus split off. At full scale, score
each reprint family by its longest copy, not by single articles.

## Priority after both reads
1. **Schroon Lake / Crown Point, N.Y., 1880.** Two accounts, named people, and a hut built over the stone. Next:
   Essex County and Schroon Lake historical societies; Essex County papers of Sept-Oct 1880 (NYS Historic
   Newspapers); American Journal of Science notes for 1880-81.
2. **Middleburg, Fla., 1887.** A 200-lb stone shown at the Sub-Tropical Exposition (Jacksonville, 1888). Next: the
   exposition catalogue and Clay County historical records.
3. **Franklinton, N.C., 1887.** Next: the Louisburg *Franklin Times*, April 1887; the N.C. Museum of Natural
   Sciences.
4. **Shell Rock / Albert Lea, Minn., 1880.** Next: Freeborn County Historical Society (D. G. Parker's exhibit).
5. Likely hoax or weak: St. Joseph 1887, Chittenden 1861, Dayton 1854.

## Follow-up (retraction) search, 2026-10-22 (`src/skyinprint/followups.py`, `followups_2026-10-22.json`)
Every candidate article naming a lead's place or people in the 12 months after its first report.

**Schroon Lake 1880: resolved, not a meteorite.** It had 12 articles, Sept 1880 to Apr 1881:
- Oct 9-10: a fragment was "to be submitted to a meeting of scientists ... some persons doubt the assertion that it
  fell from the sky".
- Nov 26, Dec 2 and Dec 16 (Perrysburg Journal, Wellington Enterprise, Bossier Banner): "the supposed aerolite, for
  the possession of which a lawsuit was threatened, was merely a piece of quartz covered with kerosene oil and
  sulphur."
- Tyler's "sounds fantastical" and the white stone that burned with kerosene and sulphur were the right warning signs.
- Lesson: two separate accounts made it look strong. Both were written from the same cottage before anyone examined
  the stone, so they were not independent checks of what it was.

**The others (no debunking found):**
| Lead | Coverage | Notes |
|---|---|---|
| Franklinton 1887 | 4 articles, Apr 3-21 | The date is uncertain. The Richmond item printed Sunday Apr 3 already says "is reported to have fallen", while the Raleigh dispatch of Apr 5 says "Sunday morning", so it may be Mar 27 or Apr 3 |
| Shell Rock 1880 | 2 articles, July | nothing later |
| St. Joseph 1887 | 12 matches, June 14-24, then silence | no retraction found, but also no stone, analysis or follow-up; stays "likely hoax" |
| Chittenden 1861 | 1 article | none |
| Laclede 1872 | Aug-Sept 1872 only | a June 1873 hit is a steamer named *Meteor* |
| Middleburg 1887 | — | the exhibition was Jan-May 1888, which has not finished triage; rerun after the next pull |

**Change to the method:** every fall lead now goes through `followups.py` before it is graded or emailed about.
It is the cheapest test we have, and in this batch it was the decisive one.

## Priority now
1. Middleburg, Fla., 1887 (pending the 1888 follow-up)
2. Franklinton, N.C., 1887
3. Shell Rock, Minn., 1880
4. Downgraded or resolved: Schroon Lake 1880 (quartz and kerosene), St. Joseph 1887 (likely hoax), Chittenden 1861,
   Dayton 1854.

## Middleburg, Fla., 1887-88: follow-up after pulling 1888 (2026-10-22)
12 matches, Dec 1887 to Mar 1888 (`followups_middleburg_2026-10-22.json`). No debunking.
- **Palatka Daily News, 1888-01-07:**
  - The stone was found about two weeks earlier, "half buried in the midst of a depression apparently made by its
    fall", in the road near Middleburg, broken into pieces of about 200 and 8 lb.
  - It "appeared to be an iron ore, covered with small opaque white crystals".
  - **A. S. Chalker**, who found it, gave it to Messrs. Sweeny and Allen of the **steamer *Twilight*** to take to the
    **Sub-Tropical Exposition**.
  - A thunderstorm the night before is "supposed" to be when it fell.
- **Syndicated dispatch, Jan-Mar 1888** (Morris, Minn. Sun; Pembina Pioneer Express; St. Landry Democrat):
  - A "fiery mass was seen to fall" in a storm and search parties went out.
  - Three Black men found it broken against a lightwood stump, with pieces still hot. The find was kept quiet at first.
  - Pieces weighed 212, 18, 10 and 8 lb.
  - It was "to be forwarded to the Jacksonville Sub-Tropical Exposition, and **samples have been sent to Professor
    Richard Proctor for examination**". Proctor, the English astronomer, lived in Florida then and died in Sept 1888.
- The Dec 1887 and Jan 1888 items name W. G. Burlington's farm as the place. The accounts disagree on details:
  finder, road or farm.
- **Cautions:**
  - "Iron ore with white crystals" fits Florida ironstone, a common pseudometeorite, as well as it fits a meteorite.
  - A thunderstorm fall is the classic "thunderstone" story.
- **Prior attention:** the story circulates on hobbyist forums (treasurenet, astronomy.activeboard), which say the
  stone was "never seen again". They cite no primary sources, and one garbles a J. Lawrence Smith opinion (Smith died
  in 1883). What we add is the primary newspaper trail: the finder, the courier, the exhibition and the Proctor
  samples.
- **Grade: medium. The trail is well defined.** Next human steps:
  - Sub-Tropical Exposition records and catalogue, Jacksonville 1888 (Jacksonville Historical Society; UF Smathers
    Libraries Florida collection).
  - The Florida Times-Union, Jan-May 1888.
  - Proctor's journal *Knowledge*, 1888.
  - Clay County Archives (Chalker and Burlington families).
