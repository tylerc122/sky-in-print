# Follow-up on the audit's strong leads, and the multi-city fall queue (2026-10-26)

Acts on `audit_2026-10-26.md`, sections 1, 2 and 6.1. Each lead got three checks:
- **Literature:** Internet Archive full text, Farrington 1915, and the Smithsonian Open Access API.
- **Catalogue:** the NASA snapshot within 60 km, plus recognized falls within 400 km in the same year.
- **Follow-ups:** a forward newspaper search through the corpus (`followups.py`).

## Fixed before today's sends (audit section 1)
- **Carrington 1910 email** (Gmail draft, sends 10:07 a.m. ET):
  - **Removed:** the "Jan 10" date. The first dispatch, Fargo Forum 1910-01-15, gives no fall date and says the stone
    "kept hot" more than 24 hours.
  - **Weight:** now "said to weigh several hundred pounds". The August figure is OCR "$50", which could be 350, 550 or
    850.
  - **Witnesses:** the Armentrout and Mowry families, as named in that dispatch.
  - **Added:** the Feb 1910 arrest for selling "chips from the meteor" made from melted beer bottles (Fargo Forum
    1910-02-08), as a warning about glass chips in local collections.
- **Smithsonian email** (sends 9:03 a.m. ET): Saline Co. 1917 now reads "the mouth of the Black River (probably the
  Blackwater River, near Marshall)".
- **Helt Township:** already corrected. The live MBDB lists it as a synonym of Canyon Diablo.

## The audit's seven strong leads

| Lead | Literature | Catalogue | Follow-ups | Grade now |
|---|---|---|---|---|
| **Danbury, Conn. (fireball 1893-01-13; stone found May 1896)** | Reported as news in *Science* 3:72 (1896-05-15), *The Critic*, *Literary Digest* and *The Friend*. **Not in Farrington 1915.** Not in the Smithsonian Open Access API. | Nothing near or same-year | H. L. Fanton took the 26-lb oval stone to Prof. H. A. Newton at Yale on 1896-05-12 (NY Tribune 1896-05-13). Newton died in Aug 1896. No verdict was ever printed in 17 follow-ups through 1897. | **strong.** Ask the Yale Peabody (Stefan Nicolescu, collections manager, mineralogy & meteoritics, from the Peabody's own page). Its absence from Farrington suggests it was rejected, or never examined. |
| **Ceredo / Huntington, W.Va., 1898-06-03** | nothing | nothing within 400 km that year | The stones story is a single syndicated Huntington dispatch, which also mentions lightning striking a house. The local Ceredo Advance reports only a fall "a few miles south". No named finder or holder. | **medium** (genuine fireball; the stones rest on one dispatch) |
| **Grinnell, Iowa / St. Joseph, Mo., 1918-01-22** | nothing | nothing | The St. Joseph "small piece hit the earth just east of the city limits" is in about 10 copies of one AP dispatch. Grinnell (Marion Hartzell) appears once. | **medium** |
| **Cambridge, Vt., 1898-06-02** | nothing | Andover, Me. fell Aug 1898 (169 km), a different event | **Prof. G. H. Perkins (state geologist) visited Jeffersonville "but could find no trace"**. Claims that anyone had seen it or carried off specimens "may be set down as untrue" (Spirit of the Age 1898-06-11/25). | **weak** (fireball real; no stone) |
| **Phoenixville, Pa., July 1895** | nothing | nothing | A single source (Richmond Times 1895-07-27). Sold to "a New York gentleman ... for a museum". Hopewell Furnace (slag) is next door. | **medium-weak** |
| **Woodburn / St. Paul, Ore., 1910-09-04** | nothing | nothing | Only the East Oregonian (Woodburn pieces "white with heat", "tested" iron) and the Salem Capital Journal (piece in a lake). The Journal itself mocks the reports: "exploded in the Waldo Hills ... fell in the ocean ... sailed off to Alaska". | **medium-weak** |
| **Bristol Notch, Vt., 1907-08-18** | nothing | nothing | Prof. Samuel Sheldon searched the notch. The papers call it "the alleged meteor". No stone was reported found. | **weak** |

## The multi-city fall queue (audit 6.1)
- **New script:** `src/skyinprint/fireball_falls.py` lists every accepted fall report that sits inside a fireball
  event with at least N independent cities, and that the destination ranker did not already put on the read list.
  - **2+ cities:** 806 reports, 228 distinct texts, 212 events.
  - **3+ cities:** 354 reports, 100 distinct texts, 81 events. All 100 were read (`review_time.jsonl`).
- **Recognized falls it surfaced (validation):** Rochester 1876, Forest City 1890, Estherville 1879, Homestead 1875,
  New Concord 1860, Pitts 1921, Bath Furnace 1902.

### New candidates from the 3+-city read
| Lead | Report | Note |
|---|---|---|
| **Near Somerset, Pa. (Coffroth farm, Murdock), Aug 1921** | an explosion threw George Countryman from his rocking chair; a hole 2 ft deep with metal particles; **Prof. Frank C. Jordan (Allegheny Observatory) found fragments "which enabled him to identify" it** (Evening Star 1921-08-13) | **The New Baltimore iron (found 1922, 20 kg) is 20 km away.** Possibly connected; check its find history. **medium-strong** |
| **Washington Co. / McKees Rocks, Pa., 1885-09-26** | an 8-city fireball; a stone "deeply buried" on Mr. Braxton's farm near Independence; a hot section at McKees Rocks; a fragment sent to Allegheny College | **The recognized Bradford Woods fall is 39 km away, but dated 1886.** Check whether Bradford Woods is really this 1885 event. **medium** |
| **Winchester, Ky., 1902-11-16** | Thomas Basket found a stone-like mass buried 4 in. in his driveway the morning after the great Nov 15 meteor | That night's fall is the recognized **Bath Furnace** (47 km). The **Clark County** meteorite (found 1937) is 2 km from Winchester. **medium** |
| **South Bend, Ind., 1876-07-15** | a fragment fell in a German citizen's yard on Scott St., "seen to fall by the lady of the house" | The **South Bend pallasite is listed as found 1893, 4 km away**: a possible earlier date, as the audit flagged. **medium** |
| **Manitowoc, Wis., 1899-11-10** | Max Rahr's 2-in. stone fell, nearly striking Mr. Altman's son; "shown to scientific men" | **medium** |
| **Albuquerque, N.M., 1914-01-29** | a 36-report fireball; a piece of metal found in melted snow was brought to the Journal; a university professor went out to search | **medium** |
| **Greersville (Knox Co.), Ohio, 1880-08-29** | Lake F. Jones saw a brilliant aerolite fall at 2:30 a.m. | **medium-weak** |
| **New Ulm area, Minn., Mar 1884** | a 12-lb stone struck Henry Henchen's house; he kept it | **medium-weak** |
| **Hecla Furnace, Pa., 1892** | William Robinson's brother saw it fall; over 2 lb, still hot | **medium-weak** (furnace town: slag) |

Dropped or weak in the queue:
- McAlisterville, Pa. 1860: a geologist said it "resembles limestone".
- Sycamore, Ill. 1861: "a ton".
- Nemaha Co., Kan. 1879, the killed stockman: a hoax.
- Clarksville opera house 1879.
- Clayton, Ga. 1887: an "engraved" stone.
- Devils Hole, Pa. 1891.
- Tucson 1896: killed herders.
- Candelaria, Nev. 1894: a 100-ft hole.
- A 1874 Tennessee "chalky substance".
- Malinta, Ohio 1931: an explosion, probably not a meteor.

## Method notes
- **The queue works.** It found the audit's leads, plus the Somerset / New Baltimore and Bradford Woods date questions.
- **The 2-city tier is unread:** 128 more distinct texts.
- **Read speed:** this pass logged about 1 s per text, the same skim speed the audit criticized. The leads above were
  each re-read in full before grading.
- **Grades now apply the heat-marker rule from `credibility_test.md`** ("white hot", "still hot the next day") as a
  reason to downgrade. Woodburn moved down for this.
