# Newswire sweep (2026-11-12)

Ran the same fireball/fall/net filter and v2 triage (same model digest a0a6328748a1, same prompt) over Dell's Newswire
corpus, 1878-1977 (`prereg/newswire.json`, `src/skyinprint/run_newswire.py`). Outputs in `data/newswire/<year>/`.

- 2,719,607 wire stories, 4,481 keyword candidates (375 from 1878-1922, 3,109 from 1923-1963, 997 from 1964-1977),
  0 triage errors.
- Triage: 3,799 none, 481 fireball, 81 meteor shower, 58 meteorite fall, 39 other sky, 14 comet, 4 aurora, 4 eclipse.
  58 with stones reported. 67 articles are fall-or-stones (some are both).
- No page-scan links in Newswire. Each story lists the papers (LCCN) and dates that ran it, so a lead's page has to be
  found by hand.

## Known falls (`scripts/known_falls_newswire.py`, matches read by hand)

US falls in MetBull, 1878-1977: 97 (43 / 44 / 10 by era). Wire copy only covers the falls that made national news, so
recall is low.

- 1878-1922: Pitts 1921 (AS had it).
- 1923-1963: Archie 1932, Fayetteville 1934, Norton County 1948, Murray 1950, Sylacauga 1954, plus Harleton 1961 under
  "Marshall, Tex." (Harleton was already in AS). **Norton County is the only one AS missed**: 39 papers ran the AP story
  of the explosion over Kansas on 1948-02-19, and AS has no paper within 150 km that year.
- 1964-1977: San Juan Capistrano 1973. Denver 1967 was a false name hit.
- Not counted (outside the US): Allende 1969, Dresden, Ont. 1939.

So Newswire adds one known fall for 1923-1963. As a recall booster it's small, but it does reach past 1963.

## Leads not in MetBull or in our notes yet

Checked against MetBull (any meteorite within 80 km) and grep of `results/falls/*.md`. Already in our notes: Claysville
1885, Chimacum 1895, Sabinal/Uvalde 1895, Alliance 1896, Muskogee 1908, Corbley/Ruckman 1931, Zuni 1942 (local queue).

| Lead | What the wire said | Grade, first read |
|---|---|---|
| **Crescent City, Ill., 1899-11-16** (12 papers) | an aerolite "seven miles south of Crescent City" partly wrecked John Meyers's house, tore away part of the upper story, and buried itself about three feet from the foundation | **medium**: named owner, damage, a place to dig. It's Leonid week 1899, which was full of hoaxes, so look for a local follow-up (Iroquois County papers) |
| **North-central N.M., 1962-03-31** (12 papers) | LaPaz: the Saturday-night fall "ranks among the 10 or 12 biggest in the 20th century", fragments probably scattered over mountain country northwest of Los Alamos; scientists and state police searching | **medium**: no N.M. fall from 1962 in MetBull. LaPaz's UNM Institute of Meteoritics files are the trail (see `docs/other_sources.md`) |
| **Sequoia National Park, 1964-09-03** (12 papers) | Griffith Observatory team under Ronald Oriti searching a remote part of the park, "another fruitless day" | **medium**: a searched-for fall that may never have been found. Griffith Observatory archives / *Griffith Observer* |
| **Massachusetts, 1934-09-26** (4 papers) | after a brilliant daylight meteor over New England, meteorites "reported today to have fallen in at least five places in Massachusetts" (Cambridge dateline, so Harvard) | **medium-weak**: likely the fireball, not stones, but Harvard Observatory would have chased the five reports |
| **Syracuse, N.Y., 1974** (6 papers) | Susan Leson, 9, found a golf-ball-size meteorite near her home while playing kickball; UCLA's Institute of Geophysics paid her $100 | **medium as a find**: a real specimen went to UCLA, but nothing within 80 km in MetBull. Check the UCLA collection |
| Webster City, Ia., 1899-11-14 (5 papers) | a large meteor fell in the woods east of town, made a hole five feet square, "still seething and steaming" | weak: same Leonid week, reads like a hoax |
| Janesville-Beloit-Williams Bay, Wis., 1942-04-02 (6 papers) | an explosion heard for miles and a flash; Struve (Yerkes) thought a small meteorite buried itself; search under way | weak-medium: no stone reported |
| Luray, Va., 1932-12 (10 papers) | hunter Ezra Dyer in Shenandoah N.P. says a meteor fell close enough to feel its heat | weak |
| Williams Ranch, Tex., 1883-04 (7 papers); Comanche Peak, Tex., 1890-02 (4 papers) | one-line "a meteor fell" items | weak, not read past the wire text yet |
| Seattle (Laurelhurst), 1954-04 | the windshield-pitting scare; UW profs called the particles meteoric | discard (known mass hysteria) |

Next: local papers for Crescent City 1899 (Iroquois Co., Ill.) and the 1962 N.M. fall (Santa Fe and Albuquerque
papers, then LaPaz's files at UNM).

## Follow-up, same day

**Crescent City, Ill. 1899.** It was in the American Stories sweep all along (`results/fireballs/events_all.json`), filed as
a fireball, never as a fall lead. 36 copies from 1899-11-17 to 12-01, all the same syndicated paragraph (Nov. 16
dateline), no local paper, no follow-up, nothing saying anyone dug the stone up. Nothing online either (web search,
WUSTL's Illinois list). No Iroquois County paper for 1899 in CA; the Illinois Digital Newspaper Collections sit behind a
bot check I can't get past, so Tyler has to search them by hand ("aerolite" or "Meyers", Nov-Dec 1899). Other routes: the
Iroquois County Genealogical Society (Watseka, research request form, ~$20 fee), and the 1900 census for a John Meyers
in the townships south of Crescent City (FamilySearch).

**North-central N.M. 1962.** Only the one AP story in Newswire (1962-04-02, 12 papers); no follow-up on the wire, and
nothing in the AS 1962 sweep. MetBull has nothing within 80 km of Los Alamos for that year; the closest 1962 entry is
Acomita (pallasite, found, ~147 km SW), which doesn't fit "northwest of Los Alamos". A blog post cites the *Albuquerque
Journal* of 1962-04-06 for another fireball-to-ground report in N.M. (unverified). UNM's archive search has nothing
for "fireball" 1962-63, so LaPaz's own case files probably sit with the Institute of Meteoritics, not the CSWR. Next:
the *Albuquerque Journal* and *Santa Fe New Mexican* for Apr 1-15, 1962 (newspapers.com), and an email to UNM's
Institute of Meteoritics asking if the LaPaz fireball files survive. Drafts in `drafts/emails/newswire_leads_2026-11-12.md`.

**Crescent City, closed (hoax).** Searched IDNC in Tyler's Chrome. *Champaign Daily News* 1899-11-18 p8 ("Meteor Story
Is ...") and *Champaign County News* 1899-11-22 p3, Kankakee dateline Nov. 18: a telephone inquiry to a point near John
Meyers's house south of Crescent City "fails to obtain any news of a meteor falling in that vicinity. The Crescent City
telegraph operator says the story is a fake." No need for the Iroquois County Genealogical Society.

**N.M. 1962 contact:** Institute of Meteoritics, iom@unm.edu (director/curator Carl Agee, agee@unm.edu; program
specialist Beth Ha, beth3ha@unm.edu). UNM's CSWR (archives) is by phone, (505) 277-6451, if IOM says the LaPaz files
went to the library.
- UNM email put in Gmail Drafts 2026-11-12 (to iom@unm.edu, cc agee@unm.edu), not sent.
