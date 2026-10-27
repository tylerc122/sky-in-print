# Fall leads, sweep years 1889-1913 (read 2026-10-24/25)

## Ranking and reading
- **Reports:** 3,899 accepted fall reports, 1889-1913. 862 score 2 or more under the patched ranker.
- **Grouped:** 855 reports (cut 2, before the second patch) collapse into 439 distinct stories once copies are
  grouped.
- **Claude read all 439:** 157 s of wall-clock time (`results/review_time.jsonl`).

## Recognized meteorites the read surfaced (validation)
- **Previously known falls:** Palahatchie (Rankin Co., Miss., 1910), Rich Mountain (N.C., 1903), Bath Furnace (Ky.,
  1902), Andover (Me., 1898), Allegan (Mich., 1899), Felix (Ala., 1900), Forest City (Iowa, 1890), Farmington (Kan.,
  1890), Bath (S.D., 1892), Mazapil, Zomba, Crumlin.
- **Finds:** Perryville (Mo.), Hale Center, Arlington (Minn.), Guffey, Willamette, Canyon Diablo, Admire, Selma and
  others.
- Two of the most promising-looking candidates turned out to be recognized falls (Palahatchie, Rich Mountain). So
  the leads that look strong do resemble real falls.

## New candidates: no catalogue match within 80 km and 8 years
Every candidate got the follow-up search. No real debunking was found: every flagged hit was the word
"doubt"/"doubtful" in unrelated text. Numbers in `candidate_checks_1889_1913.json`.

| Lead | Report | Destination / trail | Grade |
|---|---|---|---|
| **Cañon City, Colo., 1898-11-04** | seen to fall by power-plant engineer Wilson, H. N. Beecher and others; found by prospector Bowers; 60 lb; photographed | shipped to Philadelphia for analysis in March 1899, then "to be forwarded to the Smithsonian" (Cañon City Record 1899-03-09) | **strong** |
| **Morgan, Utah, Aug 1898** | seen to fall about 500 yards from Mr. Williams's porch; hole found next morning | **given to the state university museum** (University of Utah) | **strong** |
| **Muleshoe Mtn near Fossil, Wheeler Co., Ore., 1903-12-09** | Robert Wilson and herder Oscar Fritz watched it land 400 yards away, glowing; dug up next morning | Wilson carried it home | **strong** |
| **Valley Falls, Kan., Jan 1910** | 17-lb stone found in a barnyard after a loud noise heard by farmers | **St. Benedict's College** (Atchison, now Benedictine College) geologists pronounced it meteoric; placed in the college museum | **strong** |
| **Darlington / Carrington, N.D., 1910-01-10** | about 500 lb on the Mowery farm, buried 7 ft after a minute-long light and a shock | examined by the state university, the Agricultural College and Tiffany's chief gem expert; leased to the Beck Clothing Co. store. **Disappeared in Dec 1910** from the sidewalk, possibly shoveled into a sewer ditch (Fargo Forum 1910-12-17). 59 follow-up articles | **medium-strong** (very large; check the descriptions) |
| **Clintonville, N.Y., June 1903** | a swish and a thud; George W. Wake dug up a red stone "too hot to hold" | **sent to the Smithsonian** for examination | **medium-strong** |
| **Santa Rosa / Tucumcari, N.M., 1907-09-09** | big daytime fireball with explosions that shook Santa Rosa; fragments near Montoya; 80 lb at the Tucumcari bank | 45 follow-ups | **medium-strong** (the event is well documented) |
| **Near Beaumont, Tex., Aug 1907** | fireball seen at Houston and Beaumont; a farmer saw it fall and found a 67-lb piece next morning | brought into Beaumont | **medium** |
| **Nezperce, Idaho, late 1904** | 152 lb found by Dan Mulcahey; neighbours heard a roar and saw a light at night about 3 months earlier | shown at Kirby's store; owner Thomas Kirby of Peck planned to take it to the 1905 Lewis & Clark Exposition | **medium** |
| **Seaford, Del., Aug 1893** | a 5-lb stone cut a tree limb 10 ft from ex-Rep. Wallace's son; the fireball was seen across the state | shown at Wallace's store | **medium** |
| **Hugoton, Kan., Sept 1894** | coconut-sized stone fell "red hot" from a clear sky and set the prairie afire; a cowboy sold it to a schoolteacher | **a recognized 346-kg Hugoton meteorite (found 1927) exists. This may be a fall date for it, or a separate stone** | **medium (intriguing)** |
| **Royalton, Minn., Nov 1898** | several hundred lb; search parties found it next day | pieces shown at the hotel | **weak**: county society found nothing in the 3 local papers or town files (2026-10-27); only source is the St. Paul Globe item |

Further medium or weak candidates with named finders:
- Mineral Point, Wis. 1893 (World's Fair, Wisconsin building)
- Simpson Co., Miss. 1893 (J. N. Mattox, "hogshead" size)
- Licking, Mo. 1891 (Wm. Stone)
- Marion, N.C. 1893
- Platte Canyon, Colo. 1901 (Prof. H. A. Howe, Univ. of Denver)
- Red Oak, Iowa 1900 (to Iowa City)
- Ashley, Minn. 1899 (Byron F. Carr; a dozen witnesses)
- Gardenville, Md. 1906
- Bayonne, N.J. 1907
- Kenyon, Minn. 1904 (John Palla) **[rejected: Prof. Winchell investigated, "Kenyon Story False", Minneapolis Journal 1904-07-26; see audit2_2026-10-26.md]**
- Hudson 1900 (D. Y. Gable)
- Gulf Summit, N.Y./Pa. 1895
- Quanicassee, Mich. 1896
- Alliance, Ohio 1896
- Caliente, Nev. 1912

Dropped as tall tales or terrestrial:
- Effingham, Kan. 1896 (cinder with pebbles)
- Fetterman, W.Va. 1899 (glassy slag)
- Norwood, Mass. 1909 ("resembles iron slag")
- Binghamton 1897 ("message from Mars")
- the John Brown statue, Osawatomie 1893
- "ten-ton" and "forty-ton" stones (New Castle, Roundhead, Etna, Allegheny Valley, Catasauqua)
- Bruneau Valley and Sabinal "gold meteorites"
- Hooper 1911 (concretion, already known)

## Second blind check of the ranker (`ranker_holdout2_draw.json`, drawn before reading)
- **Sample:** 100 reports scoring below 2, from 3,044. Read in 32 s.
- **Misses:** 4 destinations. Down from 7 in the first check, after that check's fixes.
  - "proudly exhibiting"
  - "placed on exhibit ton" (OCR)
  - "in his posses sion" (OCR)
  - "will exhibit at the fair"
- **Patched:** 3 of the 4 are now caught. This sample is now used up for measurement.

## Self-checks on the strong leads (2026-10-24)
Done before writing to anyone, so the emails only ask what we can't answer ourselves.
- **Smithsonian Open Access API** (api.si.edu, searched every lead name):
  - "Canon City" there is USNM 5733, the **Canon City H6 that fell in 1973**, a different event from our 1898 stone.
    My first catalogue check missed this because it only looked within ±8 years.
  - Hugoton is USNM 935/5858, the 1927 find. Nothing on Clintonville, Morgan, Tucumcari/Montoya, Valley Falls,
    Nezperce, Seaford, Royalton, Beaumont or Fossil.
- **Farrington's 1915 *Catalogue of the Meteorites of North America*:** none of the 12 leads appear. The "Morgan" hits
  are Morgan County, Ala. (Danville). "Montoya" is the Three Rivers, N.M. find (1895), unrelated to 1907.
- **Destination-based full-text search on the Internet Archive** (University of Utah museum, St. Benedict's, the
  Smithsonian plus Clintonville, Kunz plus North Dakota, the Lewis & Clark Exposition, Santa Rosa 1907, Fossil/Wheeler
  Co., Cañon City plus Philadelphia): nothing on our leads.
  - The Lewis & Clark Exposition meteorite in the literature is the Willamette iron.
  - "Santa Rosa" is the Colombian iron.
- **Online catalogues:** NHMU and Benedictine College have none.
- **Result:** none of the 12 is settled. A zero from these searches is not proof that a stone was never studied.
- **Next:** inquiry emails to 11 institutions (Smithsonian, NHMU, Benedictine, and local historical societies for the
  rest). Darlington/Carrington and Santa Rosa are well covered in the papers, so a deeper newspaper read could still
  turn up their verdicts.

## Source check of the inquiry emails (2026-10-24)
Every claim in the 11 drafts was checked against the article it links. Several links pointed at a copy that lacked the
details, and two pointed at the wrong article: Cañon City (a Florence local column) and Nezperce (a Peck item). All of
those are now re-linked to the article that carries the details. Corrections:
- **Seaford:** "over 5 lb", "ex-Rep." and "his store" come from the Wilmington Daily Republican (1893-08-24); the Smyrna
  Times copy says "over three pounds".
- **Fossil:** 23 lb, shown at the Fossil drug store (Heppner Gazette 1903-12-24). The SF Call copy says "less than a
  hundred yards"; the local paper says 400.
