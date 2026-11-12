# Finds that earlier fall reports may describe, matched by place (2026-11-08)

`src/skyinprint/find_vs_fall_map.py` is the place-based version of `find_vs_fall.py` (which needs the catalogue name
within two years of the find). It pairs every accepted fall report (6,841: type meteorite_fall or stones reported) with
every Valid US find (707) found **after** it, when the report's own place text names the find's county (county from the
Census reverse geocoder, cached in `data/sweep/cache/find_counties.json`), or the paper is within 60 km and the place
text is local news ("near here", "fifteen miles north of this city") naming no other town or state.

- **Positive control:** Allen (found ~1923) pairs with Rawlett 1878, the case found by hand on the same day.
- **53 finds** have at least one earlier report; all were read. Most are wire noise, old finds or already known
  (Hugoton 1894, Slovak/Surrounded Hill 1879, Nashville/Castalia, Coopertown, Freda/Richardton, New Baltimore).

## New leads

### Estacado (H6, 290 kg, "found 1883", Hale Co., Tex.; main mass AMNH): **strong, a Thomson-type correction**
**Downgraded 2026-11-10:** the 1906 description already prints the 1882 fireball story, and nobody saw the stone land.
What is left is the second piece sold to Foote in 1912. See `local_queue_2026-11-10.md`.
- *Lubbock Avalanche* 1912-01-25: B. O. McWhorter brought in a piece of "a meteor that fell near the Merrill farm north of
  Lubbock"; "a number of people who resided in the Estacado country saw this meteor when it fell and later found the
  stone ... near the Merrill farm in south part of Hale county".
- *Lubbock Avalanche* 1912-06-27; *El Paso Herald* 06-29 (Plainview); *Daily Ardmoreite* 06-28; *Kenna Record*,
  *Chanute Times*, *Abilene Reflector*, *Santa Fe New Mexican* 07-05/12: it **fell in 1880** on McWhorter's ranch in
  Hale Co. "about three miles from the Lubbock county line"; it **split in two when it struck**; the pair weighed
  "S75" lb (OCR: 375 or 875); McWhorter sold the larger piece ~1905-08 for $500 **to a "New York scientific institute"**,
  and H. C. Meyer of the **Foote Mineral Co.** bought the second piece in June 1912 and shipped it to Philadelphia.
- **Why it's Estacado:** Estacado is the only big Hale Co. stone known before 1915 (Plainview was recognized in 1917),
  it is 11 km from the Hale/Lubbock line, it is named for the same Quaker settlement, and its main mass is in New York
  (AMNH), with an analysis published in *Am. J. Sci.* in 1906, right after the New York sale.
- **Also:** a search snippet (not read in full) quotes R. A. McWhorter in Mary Lee Cox, *History of Hale County* (1937):
  Quakers going home from church in **fall 1882** saw a meteor cross the sky and thought it landed near Estacado, "but they
  never found it". So the family story puts a seen fireball near Estacado, then a recovery; the year is 1880 or 1882.
- **Next:** the 1906 AJS description and AMNH accession record (who sold it, when, and any fall story); Cox 1937
  (Hale County history); the Foote Mineral Co. 1912 catalogue for the second piece. If the AMNH accession says McWhorter,
  this is a Bulletin note like Thomson.

### New Westville (iron IVA, 4.8 kg, "found 1941", catalogued in Indiana, described as Preble Co., Ohio): **medium-strong**
- *Richmond Palladium* 1916-06-10: "A meteor that fell in Wayne county in 1909" on display in the Teeple shoe store window,
  belonging to Levi Nickens; found on the Peter N. Wright farm 2½ mi south of Arba; it struck a large rock and bounced
  300 yards; weighs 18 lb (OCR "Is"; could be 15).
- New Westville sits on the Indiana-Ohio line about 14 km from there. Henderson & Perry, "New Westville, Preble County,
  Ohio, meteorite", *Smithsonian Misc. Coll.* 104(17), 1946, is the description.
- **Against:** 18 lb vs 4.8 kg known; the 1909 fall itself isn't in our corpus (a *Palladium* 1907-12-30 fireball near
  the Arba pike is). **Next:** Henderson & Perry 1946 (finder, find story); *Richmond Palladium* 1909 for the fall.

### Weaker
- **Uvalde** (H5, found 1915): 1895 F. B. Garner, Sabinal Canyon, a 225-lb "meteoric stone or iron ore" dug from a 5-ft
  depression, thought to have fallen during the flood storm. Probably the same object, but no fall was seen.
- **Nuevo Laredo** (eucrite, found 1950, Webb Co.): 1916-12 a burning fragment crashed through a ranch-house roof in Webb Co.
- **Kennard** (H5, found 1961): 1907 Broken Bow item, a meteor seen by two farmers; Custer Co., wrong area.
- **Social Circle** (iron IVA, found 1927): 1877 shower of mica-streaked stones in Walton Co., Ga.; an iron can't be it.
- **Lafayette** (nakhlite): 1873 "1,000 lb" fragments in Tippecanoe Co. are the Romney lead in `leads.md` (probably slag).

# Never-followed pilot and ranker leads (searched 2026-11-08)
| Lead | What the corpus has | Catalogue | Grade |
|---|---|---|---|
| **Huntington Valley, Nev., spring 1879** | *Eureka Leader* via *Morning Appeal* 06-01, *Gold Hill News* 06-03, *Silver State* 05-29, *Idaho World* 06-06: James Marsh heard a report like a cannon early in the evening; ranch hands found and dug out ~400 lb of a hard, dark metallic mass, lead-gray inside, surface "indented with concentric rings" | nothing within 38 km; no large Nevada iron of that age | **medium** (could be an iron with regmaglypts, or slag; a sample was brought to Eureka) |
| Fourche Mountain, Ark., 1879 | one-line filler "a meteor weighing 140 pounds has recently fallen" (3 papers) | nothing within 66 km | weak |
| Santa Clara, Cal., 1870 | filler: hot meteoric iron set a barnyard's straw on fire | - | weak |
| Rankin Co., Miss. 1893 ("plantation") | "the size of a hogshead" on J. X. Mattox's plantation | Palahatchie 1910 fall 17 km | weak (size) |
| "plank walk", 1875 | 2-inch warm iron fragment; city never named in the 5 reprints | - | weak |
| Step Rock road, 1880 (Watertown, Wis.) | David Terrence dug up a 6-lb corrugated "aerolite" of magnetic iron: a find, not a fall | Trenton iron 51 km | weak-medium as an unknown find |
| Indianapolis police office 1872 | no matching article in the candidates | - | unresolved |
| Rev. Dr. Wood, 1877 | the Saskatchewan "Manitou" stone: the recognized Iron Creek iron | known | closed |
| Minot, N.D., 1914 | a low fireball near the Shea farm; no stone | - | closed |
| Benton Co./Oxford 1872, Belmont/Greensburg 1914 | only horse-racing and dress-fabric noise in the candidates | - | unresolved |
