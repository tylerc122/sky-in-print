# Local-news fall queue, read 2026-11-10

## The gap
Two queues decided which accepted fall reports got read: the destination ranker (`specimen_rank.py`, score 2 or more)
and the multi-city fireball queue (`fireball_falls.py`, 2 or more cities). A report from one paper about a stone on a
named farm, with no word on where the stone went, is in neither.

- **Never read:** 3,949 of the 6,250 accepted sweep fall reports (the three blind samples of 100 are counted as read).
- **New script:** `src/skyinprint/local_falls.py` takes those 3,949, drops places abroad or at sea, groups copies, and
  orders the rest by how much they read like local news about a physical object (named person or farm, "this city" or
  "near here", a weight or a hole, the paper's own state; tall-tale words count against). Output:
  `data/sweep/local_falls.json`, 2,959 distinct texts.
- **Read so far:** see the sections below. Each candidate got the full article text, a catalogue check within 90 km
  (frozen snapshot, any year) and a forward search with `followups.py`.

## First batch: the top 267 (first cut of the queue, score 4 or more)

### Recognized meteorites it surfaced (validation)
- **Falls:** New Concord, Monroe (Hiram Bost's land, Cabarrus Co.), Castalia ("the specimen from Nash"), Estherville,
  Cabin Creek (Kunz, Johnson Co., Ark.), Farmington (Washington Co., Kan. 1890), Forest City (Goddard farm, Peter
  Hoagland, Winchell), Bath (Lawrence Freeman's farm), Beaver Creek (B.C.), Felix, Bath Furnace (the Ewing heirs v.
  Pergram suit over the main mass), Holbrook ("Aztec"), Cumberland Falls (fragments sent to the Univ. of Kentucky),
  Paragould, Dresden, Sylacauga.
- **Finds:** Guffey (below), Willamette (Oregon City 1903), Cullison (A. J. Oshel plowed it up, Aug 1911), Greenbrier
  County (two irons "found about three years ago near White Sulphur Springs", 1883), Glorieta Mountain, Jamestown
  (O. W. Huntington's North Dakota specimen), Quinn Canyon (Twin Springs, Nye Co., 1908), Ainsworth (sold to E. E. Howell
  in 1907 for Warren Townsend), Arlington (Jos. Barry's farm), Navajo, Cold Bay (the "Western Alaska" fragment of 1922).
- **Guffey's find story:** *Cañon City Record* 1908-12-24 p. 8 has the iron lying on the sidewalk in front of J. N.
  Anderson & Co.'s grocery at 500 Main St., 685 lb, "found last fall by Toll Witcher and R. M. Pope Jr., near Mr.
  Witcher's ranch on Wilson creek", hauled to Cripple Creek and then to Cañon City. Other papers credit P. M. (or
  Samuel) Sifers of High Park and give 712 or 564 lb. It reached the AMNH by May 1909. Not a new meteorite, but the
  catalogue has no finder on record.
  https://www.loc.gov/resource/sn85067315/1908-12-24/ed-1/?sp=8
- **Probably known:** Odessa, Neb., March 1935 (Earl Turner, 26 lb, uncovered in a field) is most likely Kearney (H5,
  10 kg, found 1934, 16 km away). The Clarendon, Tex., item of Dec 1937 (eight fragments J. D. Stocking got from E. V.
  Bolton, a Ralls farmer) is one of the Stocking-era Panhandle finds.

### New leads
| Lead | Report | Catalogue | Grade |
|---|---|---|---|
| **Cotton Plant, Woodruff Co., Ark., March 1917** (brought to the bank on the 13th; the fall date isn't given) | James Jackson and Ollie Lee, farmers two miles south of town, were standing in a field, "heard whirring noise and moment later as if something had struck the earth with a club", found fresh earth 200 ft away and dug a rock of about 4 lb from two feet down. "Appearance of having been to high degree of heat, and piece broken off one edge of recent occurrence." They brought it to the **First National Bank** (*Pine Bluff Daily Graphic* 1917-03-15 p. 7, Cotton Plant dateline of the 14th) | Slovak (H5, found 1962, 8.2 kg) 50 km; Newport pallasite 66 km. Not in the Arkansas Geological Survey's list of 15 | **strong for a single report**: named witnesses, sound and no light (a daytime fall past its luminous flight), a small stone, no heat-to-the-touch claim, no absurd size |
| **Burlington, Iowa, Dec 1903** | Carl Leopold (furniture manufacturer, Aldo Leopold's father) picked up a "queer looking stone" while quail hunting near town and "will put it in the collection of the **Burlington public library**" (*Evening Times-Republican* 1903-12-03 p. 3) | nothing within 59 km | **medium-weak as a meteorite, good trail**: a find, nobody examined it, but the destination is named and its collections survive |
| **Bigelow, Nobles Co., Minn., fall 1936** | Ralph Wood found a "peculiar green rock" on the farm of his brother-in-law Harm Stopsack. In June 1937 **Frank C. Cross of the Colorado Museum of Natural History** wrote to the *Worthington Globe* asking for the circumstances of its fall; the stone "has been identified as type of meteorite heretofore unknown to science" (*Ely Miner* 1937-07-01 p. 6; *Sauk Centre Herald* 1937-06-24 p. 2) | Hardwick (L4, found 1937) 50 km, Estherville 70 km | **medium**: green suggests slag glass, but Nininger's museum asked in print. No later mention found |
| Tulare, Cal., early 1934 | a 25-lb stone (one copy says 15) went through a board of an old windmill on the J. W. Slayton ranch and buried itself three feet; "on display here" (UP; *Waterbury Democrat* 1934-03-15, *Evening Star* 04-22) | San Emigdio (found 1887) 39 km | medium-weak, wire copy only |
| Great Salt Lake Desert, Utah, 1927 | Capt. Charles E. Davis, hunting pioneer wagon relics, found a mass of "several hundred pounds" partly buried in alkali and sand, too heavy to move (*Douglas Daily Dispatch* 1927-11-18) | nothing within 90 km | weak-medium; Davis's relic collection and notes went to Sutter's Fort |
| San Antonio, Tex., Jan 1893 | Albert Haberle "discovered a body of meteoric iron near here", estimated at 10,000 lb; Prof. Gustave Jermy's assay 91.5% iron with nickel and a trace of cobalt (6 papers) | Kendall County iron (21 kg, obtained in San Antonio 1887) | weak-medium; the size reads like an ore body, but Jermy was a real San Antonio naturalist with meteorites in his cabinet |
| Stratford, Conn., 1893-11-21 | one line: a meteorite "fell upon the farm of William Turney in Stratford Tuesday night and dug hole for itself three feet deep" near his back door (*Morning Journal and Courier* 1893-11-24) | Weston 15 km (1807); the Stratford fall is 1974 | weak, one line |

**Follow-up search (`followups.py`, 36 to 60 months):** Cotton Plant has only the one article. Haberle has six copies
of one dispatch, Tulare three, Bigelow two, all without a later word. Web searches found nothing on Cotton Plant,
Leopold's stone or Bigelow.

### Dropped on reading
- **Georgetown, Ky., Jan 1916** (ex-constable Stockdell's back yard, after the Jan 12 Ohio Valley fireball that also
  gave the Minerva lead): "two by four by seven inches" and two pounds is about the density of water. Cinder or slag.
- **Harshasville, Adams Co., Ohio, June 1898** (Prof. S. B. Kimball and M. D. Gustin, pieces also at Wheat Ridge and
  Newport, two weeks after the Ceredo fireball): "appearance of honeycomb", dark brown, brittle. Not a meteorite.
- **Claysville, Pa., Feb 1889** (John Graham's farm): light, porous, "tastes very much like potash".
- **Clyde, Kan., 1939** (Lester Hess): "one side resembled granite; the other house brick".
- **Sumner, Neb., 1935:** "so light they will float in water".
- **Marshfield, Wis., 1905** (August Furstenberg's yard): resembles stratified clay or slate.
- **Silver Creek near Monticello, Minn., 1905** (Ekstrand, Sodstrom farm): a quarter-inch "streak of bright metal
  resembling gold", which reads like pyrite.
- **Whatcom Co., Wash., 1907-09** (Horace G. Herold, timber cruiser of Tacoma): a "meteorite" 4 by 6 by 10 ft and 12 tons
  in the Mt. Baker foothills. The Forest Service ruled in May 1909 that he could remove it; 25 articles and no museum
  ever took it. A boulder.
- **Tall tales:** Romer, Ala. 1890 (16 ft around, white hot), Dyersville and Manchester, Iowa 1909 ("about a ton"),
  Orangeville, Pa. 1837 (killed an ox), New Castle, Colo. 1892 (10 tons), Marshalltown 1910 (800 lb in a storm),
  Chimacum, Wash. 1895 (5,000 lb), Hot Springs 1916 (as large as a house).
- **Probably terrestrial:** Jackson, Ohio 1867 (H. F. Austin's stone, "appearance of cinder", in furnace country),
  Galesburg, N.D. 1904 (plowed up, partly fused iron), Hancock, Md. 1931 (800 lb of "metal and a stone like
  substance" on a mountain side), Yanceyville, N.C. 1930 (a crystal rock with an acid smell).

### Already in the notes by another route
Kenyon 1904, Le Sueur 1896, Linton 1936, Fruit Hill 1903, Ashley 1899 (the same paper also has Jack Gettys's 200-lb
stone five miles northeast of Sauk Centre), Sabinal/Uvalde 1895, Nezperce 1905, Lewistown 1931, Blackstone 1922,
Saline Co. 1917, Creston 1918, Danbury 1896, Washington Co., Kan. 1888.

## Estacado: the fall story is already in the 1906 description
`find_vs_fall_map.md` graded Estacado "strong, a Thomson-type correction" and listed the 1906 paper as the next thing to
read. It is K. S. Howard and J. M. Davison, "The Estacado Aerolite", *Am. J. Sci.* 22 (July 1906), pp. 55-60
(archive.org `sim_american-journal-of-science_1906-07_22_127`). Its history paragraph quotes a Hale Center resident:

- "In the year of 1882 a bright meteor was seen one night by the people of a Quaker colony called Estacado ... The
  meteor was seen to pass to the west and fall northwest from them."
- "In the following year of 1883 a few cowboys, in rounding up the range, saw this meteor and the Estacado people felt
  certain that this was what they saw fall the year before, and we have all considered it so."
- R. A. McWhorter took it home in the spring of 1902 and "has been the owner of it all the time".
- The stone was 290 kg, "rusty brown", with oxidation scale 3 to 4 mm thick and hardly any black crust.

So the link between the 1882 fireball and the stone was printed with the original description, and the catalogue has
listed it as a find ever since. Nobody saw it land; it rests on direction and on being found the next year. That is
weaker than Thomson, where Wilson heard the stone come down beside him. **Downgraded to a known association.** The
1912 newspaper version ("fell in 1880", "split in two when it struck") is later and looser than the 1906 account.

**What the 1912 papers do add:** a second piece. Howard and Davison describe one 290 kg mass, with one side that "looks
like an old fracture surface" and is less oxidized than the rest. The June 1912 dispatches say the stone split in two,
that McWhorter sold the larger piece about 1905-08, and that H. C. Meyer of the Foote Mineral Co. bought "the second
and last piece" in June 1912 and shipped it to Philadelphia. The catalogue's 290 kg is the Ward mass alone. Either
Foote sold a second Estacado mass that the total doesn't count, or the 1912 stone was something else from Hale County
(the first Plainview stones also came to light through Philadelphia dealers a few years later). Foote's 1912-13 price
lists would show which.

## The three "sent to the Smithsonian" stones: printed accession lists checked
The U.S. National Museum's annual reports print every accession by donor, and the full texts are on archive.org
(`sim_united-states-national-museum-annual-report_...`). Read for the fiscal years ending June 1899, 1900, 1903, 1904,
1908, 1917 and 1918, searching every meteorite entry and the names in our reports.

- **Cañon City 1898-99** (Sterling, Bowers, Beecher; shipped to Philadelphia in March 1899): not in FY1899 or FY1900.
  The meteorites accessioned those years are all named ones (Oscuro Mountains, Mount Joy, Jerome, Bishopville and
  others).
- **Clintonville 1903** (George W. Wake): not in FY1903 or FY1904.
- **Saline Co., Mo. 1917:** not in FY1917 or FY1918.
- **Berwyn, Md. 1907:** no meteorite entry in FY1908 (no stone was found, so none was expected).
- **The lists do include rejects:** FY1904 has "specimen of pseudo-meteoric iron from near Cumberland" (R. H. Gordon,
  42382), and FY1918 has "2 specimens of supposed meteorites" from Miss Mamie E. Martz of St. Paul, Ind. (61937). So a
  doubtful stone that the museum kept would still be listed.
- **Limits:** this is OCR text, and a stone examined and sent back was never an accession.
- **Reading:** with Mineral Sciences' "no record" (10-27) and Merrill's letters (11-05), none of the three reached the
  museum's collection. This answers most of what was asked of Richard Gilreath on 11-06. The trail for each now has to
  start from the town end.

## Second batch (same day): score 3, and the named part of score 2
- **Read:** all 93 at score 3; of the 768 at score 2, the 23 that name a person, the 21 local ones that mention a stone,
  and 93 of the 574 "physical object only" ones (those with a US place, a fall verb and a recovery word). 230 texts,
  with the full article read for 31 of them. Logged as batch `local-falls-tail` in `review_time.jsonl`; the time includes
  the catalogue and literature checks, so it is not a reading speed.
- **Not read yet (at the end of this batch):** 631 at score 2 (mostly wire copy with a weight and no name), 274 at
  score 1, 821 at score 0 and 540 below zero. About 2,270 distinct texts. They are covered by the third batch below.
- **Third matcher:** `src/skyinprint/find_vs_fall_name.py` pairs every accepted fall report with every Valid US find
  found more than two years later whose catalogue name is in the report's place text. `find_vs_fall.py` only looks
  within two years of the find, and `find_vs_fall_map.py` needs the county's name or a paper within 60 km that names no
  other town. 37 pairs over 21 finds (`data/sweep/find_vs_fall_name.json`), all read. It gave both leads below.

### New leads
#### Cuero (H5, 46.5 kg, DeWitt Co., Tex., found 16 May 1936): two earlier falls reported "near Cuero"
- **1875-07-16 (a Friday).** *Weekly Democratic Statesman* (Austin) 1875-07-22 p. 2 speaks of "the curious pieces of
  mineral and metal scattered recently over the country by the exploded meteor that shook the country last Friday from
  seashore even to Seguin". The 08-05 issue, p. 2: "The falling of the large meteoric stone caused" a preacher "near
  Cuero" to announce the end of the world; he "seen piece of it that was busted off" and "exhibited the curious
  fragment, having a strange odor". Both are in a joking state-news column, but they treat the detonation and the
  fragments as common knowledge two weeks apart.
  https://www.loc.gov/resource/sn83021327/1875-07-22/ed-1/?sp=2 ·
  https://www.loc.gov/resource/sn83021327/1875-08-05/ed-1/?sp=2
- **1895-06-01 (a Saturday morning).** *Shiner Gazette* 1895-06-06 p. 5, credited to a paper called the *Graphic*: the
  display seen by early risers "proved to be huge stone flying through the air, a portion of which struck the ground up
  near Cuero and sank into the earth several feet. It was visited Sunday by great many people from Cuero and the
  surrounding country, and sulphurous heat was still being emitted from the hole". Nothing says anyone dug.
  https://www.loc.gov/resource/sn86090270/1895-06-06/ed-1/?sp=5
- **Catalogue:** the Cuero stone is 8 km from town. Also within 40 km: Yorktown (Texas) (H5, 3.5 kg, found 1957),
  Myersville (OC, 5.4 kg, 1969), Davy (a) (L4, 50.6 kg, 1940), Nordheim (iron, 1932).
- **Primary source, not read yet:** V. E. Barnes, "The stony meteorite from Cuero, Texas", Univ. Texas Publ. 3945,
  pp. 613-622. The search snippet opens "On May 16, 1936, Mr. C. J. Sigmund, of Cuero, and a ..." and the volume's
  catalogue of Texas meteorites gives "Found: May 16, 1936. Weight: 102.5 lb." It is in the same archive.org lending
  volume as the Kimble County paper (`contributionstog0000ehse`).
- **Grade: medium-strong as a find-or-fall question.** A stone that "sank into the earth several feet" in 1895 and was
  left there is the sort of thing a plow or a washout turns up 41 years later. Against: no eyewitness to a stone in
  either year, and the corpus has one item for each.
- **Next:** Barnes's paper (how deep, how weathered, any local story); the Cuero and Victoria papers for June 1895 and
  July 1875 (Portal to Texas History); which *Graphic* the Shiner paper was quoting.

#### Newport (pallasite, 5.6 kg, Jackson Co., Ark., "found 1923"): the Scheiss "meteor" of 1916 and 1920
- *Newport Citizen*, in the *Sharp County Record* 1916-12-01 p. 1: E. E. Scheiss showed "a solid substance about as
  large as cannon ball, and weighing nearly five pounds. It is supposed to be a meteor, and it must have fallen many
  years ago, as it was found imbedded in an old log that Mr. Scheiss was splitting up for wood."
  https://www.loc.gov/resource/sn87091045/1916-12-01/ed-1/?sp=1
- *Newport Independent*, in the *Newark Journal* 1920-07-01 p. 1: "Shorty Scheiss, living in the outer edge of Newport",
  found a 3½-lb meteor in the forks of a tree; "on exhibit in the Harry Brandenburg show windows"; "sent to Little Rock
  to the mining experts for assay", then "to New York for final assay, which offices gave out the information that it
  contained a large percent of gold and iron. Governor Brough has asked that the meteor be sent to the state capitol
  and placed in the display rooms there."
  https://www.loc.gov/resource/sn89051084/1920-07-01/ed-1/?sp=1
- `sweep_leads_1914_1964.md` dropped this as a tall tale ("gold"; the same family's tree story as 1916). But Arkansas's
  only pallasite is catalogued from this town three years later, and neither the Bulletin database nor the Arkansas
  Geological Survey's list (MP-26: "Newport, Jackson, 1923, 12.3 lb, stony-iron") says who found it or how. Yellow
  olivine in a metal sponge is what a layman, or a hurried assayer, would call gold in iron.
- **Against:** the weights (about 5 lb, then 3½ lb, against 12.3 lb), and a stone inside a log is a strange place for a
  meteorite. There may have been two Scheiss objects, or one described twice.
- **Grade: medium-strong as a record note** (a finder and an earlier date for Newport, maybe a second mass).
- **Next:** Nininger's description of Newport and his source for "1923"; the Arkansas State Archives for Governor
  Brough's capitol display (1920); the Jackson County Historical Society; the *Newport Independent*, 1920-23.

### Weaker, kept
| Lead | Report | Note |
|---|---|---|
| Kings Creek / Gaffney, Cherokee Co., S.C. | *Pageland Journal* 1916-05-03: Dr. Lee Davis Lodge (Limestone College) and three others examined a rock in a field that Mr. Scruggs, a boy of seven at the time, saw where it fell; "totally different formation from anything surrounding it", fragments scattered; Lodge took a sample "to send to an eminent geologist". *Yorkville Enquirer* 1912-09-13 recalls a meteorite that fell near Kings Creek in 1849 or 1850 | Not read in full. The date fits the Monroe, N.C. fall of 31 Oct 1849, which was heard across this country. A diabase boulder would also look out of place. Gaffney *Ledger* 1916; Limestone University archives |
| Colfax, Dunn Co., Wis., Sept 1924 | 30-lb object dug from the sand of a lake by J. A. Mari while seining minnows, "a mixture of stone and metal and resembled a petrified sponge", taken to Eau Claire for examination | That is how a weathered pallasite looks, and also slag or bog iron. Hammond iron 56 km |
| Reno, Nev., 1912-01-21 | Capt. J. J. Gosse, in a duck blind at the Tule Gun Club, watched it come down near the lone mountain at the southeast end of the valley, with a loud report (*Tonopah Bonanza* 01-23). In March the Foote Mineral Co. wrote asking him who found it and offering to buy | no stone on record |
| Roseville, Ohio, Oct 1896 | fell one afternoon in a creek bottom on the James farm, half a mile from town; the village turned out; "the projectile is being unearthed" | the hole was guessed at 300-400 lb; no later word |
| Red Rock, Okla., July 1902 | a state bank "is in possession of a meteoric rock that recently fell on Mr. Barhyte's farm"; grass burned around the hole; "largely composed of iron, charged with sulphur" | could be a pyrite nodule |
| Sparta, Ga., 1905-09-28 | a black stone "not much larger than an ordinary bullet" came through the skylight of E. A. Rozier's grocery in the afternoon | "so hot as to burn the fingers" |
| Hill Co., Tex., April 1880 | Hillsboro telegram: a daytime meteor burst near Richland Creek; a piece "as large as a man's head" found five or six feet down | one telegram; Ash Creek (2009) is 25 km |
| Zuni, N.M., Jan 1942 | a "bomb-like object whistled out of the sky and landed nearby with terrific force" (AP) | no stone mentioned |
| Keokuk, Iowa, Jan-Feb 1910 | Mrs. Loudon saw it fall by the barn; the stone turned up when the snow melted, "reddish blue"; a second piece found by a man named Hamilton, reported to Prof. Stoneking | weak |
| Others | St. David, Ariz. 1897 (J. N. Curtis, "perfectly round"); Hagerstown, Md. 1913 (7 lb, "resembles crude cast-iron", through the National Biscuit Co. roof; "will be analysed"); Umatilla National Forest 1927 (rangers "collected the fragments" at a burning tree); Juniata, Neb. 1901 (14 lb through George Brookman's roof in a windstorm); Ellsworth, Wis. 1888 (40 lb, "whitish", six copies) | weak |

### Dropped on reading
- **Pyrite or marcasite:** Oxford Junction and West Union, Iowa 1894-95 (a "syndicate" dug up a ball "of some unknown
  metal, which bears strong resemblance to bronze", "heavier than lead"); Cave City, Cal. 1892 ("covered with film of
  solid gold"); McFarland, Cal. 1913 (a gold-looking sheet in a well).
- **Wrong material:** Anoka, Minn. 1935 (Daniel Rankin's piece "looks like vitrified piece of flint" and cuts glass, so
  it is not the Anoka iron); Williston, N.D. 1922 (floats); Nobles Co., Minn. 1940 (Malenke's white and gray pitted
  rock); Mt. Carmel, Ill. 1867 ("sand and some kind of iron ore").
- **Tall tales and hoaxes:** Jetmore, Kan. 1891 (a rose-colored stone 20 ft long), Oswego Co., N.Y. 1859 (covers half
  an acre), "Prof. Emery" 1886 (200 tons), Perry, Okla. 1898 (two children killed), Cool Spring, Va. 1910 (several
  tons), Lumley 1865, Pistol River, Ore. 1891 (1,000 lb, in Port Orford country), the stone showers (Tennessee 1882,
  Venango 1844, Chico 1922).
- **Recognized:** Algoma (the University of Wisconsin's piece), Cabin Creek (the Clarksville "iron pyrite"), Forsyth
  1829, Drake Creek, Modoc 1905, Weaver Mountains, Winona.

### Fixes to earlier notes
- **Kimble County:** `find_vs_fall.md` gives Barnes's Kimble County paper as pp. 613-622 of Univ. Texas Publ. 3945.
  Those pages are his Cuero paper; the Kimble County paper follows it in the same volume. The quoted opening ("During
  August, 1936, a large meteorite was brought") is the Kimble paper's, so the conclusion there stands. The volume also
  holds Barnes's catalogue of Texas meteorites, which should give find details for Kimble County, Cuero and Allen.
- **Newport, Ark. 1920:** no longer "dropped" (above).

## Third batch (same day): the rest of the queue
- **What was left:** 2,266 texts (plus 223 tagged as famous recognized meteorites, not read).
- **Skipped by rule, not read:** 743 whose quote has no object or impact word (a meteor "fell" and nothing else), 324
  whose place and year are already in these notes, 57 generic science or crater items, 33 with a foreign place in the
  quote.
- **Read:** the other 1,109, grouped by year and place into 876 stories (one text per story). The full article was read
  for about 120 of them. The story keys are in `local_queue_batch3_keys.json`. Not timed.
- **The queue is now finished.** What no one has read is the skipped classes above.

### New leads
| Lead | Report | Catalogue | Grade |
|---|---|---|---|
| **Cornish, N.H.: a stone in the Fairbanks Museum** | 1883: Capt. Larnard Powers "recently found in a yard near his house a meteoric stone"; "the top is oval, full of indentations, and very dark colored, nearly black" (wire copy, e.g. *Dallas Daily Herald* 1883-06-30 p. 2). 1900: the Fairbanks Museum, St. Johnsbury, Vt., shows a "meteoric stone, picked up on the top of a mountain in Cornish, N.H., and presented by F. A. Tiff[t], formerly of this place. Although not large stone, its weight is 14½ pounds ... The surface is furrowed" (*St. Johnsbury Caledonian* 1900-10-10 p. 4; the OCR prints the weight as "1412" and the next word as "CARED", so scarred or seared; check the scan). `audit_2026-10-26.md` listed the museum item and nobody followed it | nothing within 70 km; New Hampshire has no recognized meteorite | **medium-strong trail**: small, very heavy, dark and pitted is what an iron looks like (or a lump of magnetite), and it was in a museum that still exists. The two accounts differ on where it was picked up |
| **Lake Fremont Twp., Martin Co., Minn.: a possible Estherville mass** | "A meteor weighing thirty pounds is on exhibition at a hotel in Fairmont, Minn. It was dug up by Frank Mathwig on his farm in Lake Fremont township, Martin county. The meteor fell about thirty years ago when Mathwig was a boy, and he always remembered the spot. Recently in digging a well he found the specimen" (*Redwood Gazette* 1911-02-28 p. 3; *Omaha Bee* 1911-02-21 p. 3, Estherville dateline, adds that he was herding cattle, told his parents, and they thought he had dreamed it) | the Estherville fall of 10 May 1879 is 17 km away, and the township is just over the state line from Emmet Co. | **medium-strong as an unrecorded mass of a recognized fall**: the date, the place and the boy's story fit. No description of the stone |
| **Brooke Co., W.Va., June 1888** | Mr. Sanford, walking the river-bottom fields opposite Steubenville, "found two fragments of meteor. They are masses of meteoric iron"; brownish black, "surface smooth and glazed and full of characteristic cupules", "excessively hard, turning the edge of knife"; filed, it shows "an interior like polished steel, a result which no native ore will show" (*Wheeling Register* 1888-07-05 p. 4) | Bradford Woods 48 km; no iron nearer than Pittsburg (52 km) | **medium**: a careful description, though a river bottom below Steubenville also collects furnace scrap. The printed size and weight (7 by 8½ in., 1¼ lb) don't agree, so one is an OCR error |
| **Lake Plantagenet, Hubbard Co., Minn., Nov 1914** | Henry Rockensock, driving home in the evening, saw a luminous body bury itself 15 rods from his house; dug out next morning from more than four feet, nine pounds, "harder than stone" with "much the appearance of iron"; shown in a store window on Third St., Bemidji (*Bemidji Daily Pioneer* 1914-11-14 p. 1) | Turtle River iron (22.4 kg, found 1953) 27 km | **medium** (flames "five feet long" and four feet deep count against) |
| **Gilead, Oxford Co., Me., April 1920** | Herman Bean found a large stone two rods from his barn door one Monday morning; "pitted surface with a fused crust", studded with what he thinks is nickel; a piece sent to a laboratory (*Oxford Democrat* 1920-04-06 p. 2) | Andover (fell 1898) 31 km | **medium-weak**: the right words, but the paper's own |
| Davenport, Iowa, 1856-08-19 | fell in daylight, "seen by several", struck a rail near the depot; a piece handed to the editor, "strong smell and taste of sulphur and ink"; "about the size of an ordinary bucket" (*Davenport Daily Gazette* 08-20 p. 2) | nothing within 70 km | medium-weak; no later issue in the corpus |
| Texas Panhandle, spring 1894 | at Weatherford a reporter was shown "a piece of an aerolite which lately fell in the Panhandle country and was en route to John O. Ford of Fort Worth"; the whole measured three feet around (*Fort Worth Gazette* 1894-06-21 p. 5) | - | medium-weak; a named recipient |
| South Windham, Me., autumn 1891 | Miss Emily Rogers saw a small meteor plunge into a neighbour's front yard; dug out next morning and "presented to the local natural history society" (syndicated) | - | weak-medium; the Portland Society of Natural History's collections were dispersed |
| Sweetwater Mts., Nev., May 1895 | Jack Raycraft brought to Carson a "meteor" found near the Sweetwater mountains, "composed chiefly of nickel", about 200 lb (*Carson News* via *Wadsworth Dispatch* 06-01) | - | weak-medium; could be nickel ore |
| Toledo, Lincoln Co., Ore. | John Nye Jr. brought in "a chunk of the meteorite which fell several years ago on the old Shaw place. The greater part ... was broken up and carried away" (*Lincoln County Leader* 1906-12-07 p. 1) | nothing within 70 km | weak-medium; no description, no earlier report found |
| Mansfield, Wright Co., Mo., June 1914 | a meteor seen earlier was "found Tuesday morning by I. B. Bell in his pasture", four pounds, "small but rather heavy", ashes and burned rubbish under it (*Mansfield Mirror* 07-02) | Seymour iron (found 1940) 23 km | weak-medium |
| Wichita, Kan., Dec 1880 | a "meteoric fragment ... which fell east of town a few weeks ago, and was found by a colored boy"; an Eastern scientist offers "a round price. Who knows where the boy" is? (*Wichita City Eagle* 1881-01-20) | the Wichita stone (H6, found 1971) is 15 km southeast of downtown | weak |

**One-line reports with a named finder, weak:** New Truxton, Mo. 1909 (5½ lb, 17 in. deep); Winnetoon, Neb. 1909
(Oliver Ellingson, after two detonations); Wamego, Kan. 1905 (George Gearing) and St. Marys, Kan. 1884; Fort Meade,
S.D. 1905 (4 oz at seven inches); Rumford, Me. 1897 (Eastman, shown at the *Times* office, a year before Andover fell
about 20 km away); Keyser, W.Va. 1892; Tiffin, Ohio 1887 (42½ lb, "resembling iron", Honey Creek); Chatham Co., N.C. 1886
(Samuel Hancock, 15 lb); Charlottesville, Ind. 1930 (through the hood of Lawrence Swank's car); Fond du Lac 1911
(through the courthouse skylight); Lewiston, Idaho 1941; Pratt, Kan. Oct 1915 (fragments "said to have been found"
after a detonating fireball); Frederick Co., Md. Jan-Feb 1919 (two slag-like objects after the Jan 19 fireball);
Helena, Mont. 1892 (two "nickel and magnetic iron" pieces of 90 and 70 lb for the World's Fair); Deming, N.M. 1892
(an iron smelted into watch charms); Point Loma, Cal. (a lighthouse log of an 1875 fall).

### Additions to leads already in the notes
- **Seaford, Del.** *Every Evening* (Wilmington) 1921-05-13 p. 7: "A meteor which fell in Seaford 27 years ago was
  exhibited among the Seaford public school children yesterday." It is "about the size of large cocoanut" and fell in
  front of the home of **Mrs. Henrietta McNeilly** "while the family were sitting on the porch after the evening
  meal"; she "picked the meteor up while it was still hot and has kept it ever since"; it has "a hole about the size
  of marble", once "filled with substance resembling powder". This is probably the Seaford Museum's rock (the photo
  shows a pitted nodule). It gives the museum a name and a date near 1893-94, and it is a second stone from the Wallace
  one. Worth adding to the unsent reply to Dave Grantz: does their rock have a marble-sized hole?
- **Beaumont, Tex. 1907.** *Southern Sentinel* 1907-09-13: the farmer found it "between Nederland and Port Neches",
  carried it to Beaumont "and sold it to a hardware company for $75". The fall date reads "August IS" (15 or 18).
- **Washington Co., Pa. 1885.** A June 1887 summary says that a month after the fireball a "Professor" (Emerson or
  Emery) "declared that he had found the meteoric stone about two miles north of Claysville" and put it at nearly 200
  tons; "considerable doubt was thrown" on it. So the "deeply buried" stone was a boulder. The fireball stands, and
  Sanford's irons (above) were picked up about 15 km northwest of Independence three years later.
- **Burlington, Iowa.** The library had a "meteor" long before Leopold's: in July 1868 a 300 to 500 lb "aerolite"
  found in town was going "in the rooms of the Library" (*Burlington Argus* via *Daily Gate City* 1868-07-30). Ask the
  Heritage Museum about both.
- **Forest City.** Erick Dahl plowed up a four-pound piece near Thompson, Iowa, in Sept 1904.
- **Tunbridge, Vt., 1893-11-17:** a detonating daylight fireball at 10 a.m., houses shaken miles apart, a search of
  the hills; no stone reported. Vermont has no recognized meteorite.

### Dropped on reading
- **Wrong material:** Junction House near Reno 1903 (light as coke); Wichita 1897 (Lohse's "hard carbon" with mineral
  veins, 2½ oz) and Hutchinson 1897 (granite); Roundhead, Ohio 1939 ("carbon-like"); Skillman, Ky. 1899 (hollow, from
  a gravel pit); West Chester, Pa. 1905 (a geode); Meeker, Colo. 1892 (cuts like lead); Woodbury, N.J. 1892 (gold);
  Hilton, Wis. 1896 (mica scales); Kasota, Minn. 1886 (bitumen); Scranton 1894 and Hollis, N.Y. 1902 (slag, cinder);
  Mankato and Gainesville, Minn. 1895, Fergus Falls 1922 (conglomerate); Preble Co., Ohio 1905 (25 in. across, so not
  New Westville); Taylor's Bridge, Del. 1937 (tons).
- **Tall tales:** Winsted, Conn. 1909 and 1910, Manistee 1909, Mt. Airy 1882, Lathrop 1891, Crookston 1901 (200 lb with
  sparks), Greenville, Mich. 1917, Jonesboro, Ark. 1934 (460 lb), San Jacinto Co. 1909, Memphis 1915, the Antioch
  College porch 1901, and the killed-man stories (Rabb 1884, Meisenthaler 1879, Muskogee 1908).
- **Recognized:** Harrison County 1859 ("Taylor, Ky."), Auburn, Deep Springs, Mount Vernon (Christian Co., Ky.),
  McKinney, Savannah (Tenn.), Gun Creek, Wallapai, Pitts, Selma, Castine, Nobleborough, Drake Creek, Danville (Ala.).
