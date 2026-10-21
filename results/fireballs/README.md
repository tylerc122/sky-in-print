# Fireball events, pilot windows (spec §10 output 1), 2026-10-21

Code: `src/skyinprint/fireballs.py`. Data: `events.json` (one record per event, up to 8 dated quotes with scan links each).
1859 debug window excluded.

## Procedure
1. **Reports:** 2,704 accepted v2 reports of type fireball, meteor or meteorite fall (plus other_sky for grouping;
   events made only of other_sky are dropped). Reports the article itself calls a hoax are excluded.
2. **Event date** from the model's `when_text` and the print date: "last evening" = the day before; a month and day,
   or "the 14th", = that date; a weekday = the most recent such day ("last Saturday" in a later printing gets a
   one-week window); no date words = the 14 days before printing.
3. **Copies:** one family per source text. Whole-column similarity missed short telegraph items copied with OCR
   damage (one Chicago dispatch of 1879-04-09 counted as 10 "independent" reports). Copies are now matched on
   character 5-grams of the text around the sighting quote (cut 0.3) or the quote itself (cut 0.5).
   Result: 1,657 families.
4. **Events:** families dated to within 3 days whose windows overlap and whose papers are within 1,200 km are
   linked. A family dated only to within a week joins the single best nearby event. Hand decisions in `vetting.json`
   (drops, merges, splits, keyed by report) are applied last. Result: **1,257 fireball events** (events made only of
   other-sky reports are left out; an earlier draft wrongly counted them).
5. **Fields**, counted per family, by pattern: time of day, direction of travel, sound, duration, colour, train,
   bursting, lit ground, stones.

## Yield (after vetting)
| Independent sources (distinct texts from distinct papers' cities) | Events |
|---|---|
| 1 | 1,146 |
| 2 | 79 |
| 3 | 18 |
| 4 | 5 |
| 5 or more | 9 |

- 541 events are dated to the day.
- 74 fall on meteor-shower nights and are flagged, since unrelated meteors share those nights.

## Validation against known events
| Known event | Found as | Rank | Independent sources |
|---|---|---|---|
| Great fireball of 1876-12-21 (Kansas to Ohio; Rochester, Ind. fall) | 1876-12-21 | **1** | 20 |
| Estherville fall, 1879-05-10 | 1879-05-10 | 6 | 8 |
| Homestead (Amana) fall, 1875-02-12 | 1875-02-12, plus a split 1875-02-18 event (several reprints say "the 18th", probably a misprint or OCR of "12th") | 24 / 22 | 3 + 3 |
| Castalia fall, 1874-05-14 | 1874-05-14 | 59 | 2 |
| Searsmont fall, 1871-05-21 | 1871-05-21 | 141 | 1 (Maine papers only) |
| Cynthiana and Warrenton falls, 1877 | not found | | (missing upstream, as in the fall test) |

The best-documented event in the pilot comes out first, and every known fall that has reports is found on its correct date.

## Hand vetting of the top 20 events (`vetting.json`)
Every family in the top 20 was read from the text around the sighting.
- **Dropped** 20 report families that were not part of the event:
  - a thunderstorm and a lightning strike
  - a balloon ascent and a mirage
  - political jokes that mention a meteor
  - an Arizona meteoric-iron article
  - the Newton hoax
  - the Barnhart fall (a different day)
  - sightings at a different hour or in a different region
- **Merged** 3 pairs that were one fireball, split by misdating:
  - 1876-12-21 and 1876-12-28
  - 1876-07-08 and part of 1876-07-15
  - 1877-11-20 and 1877-11-22
- **Dissolved** 3 "events" made of unrelated meteors: 1872-08-14, 1875-06-30 and 1870-08-18.
- **Fixed** a dating bug found while reading: a weekly printed on a Thursday that says "Thursday night" was taken to
  mean that day.

**Vetted top events:**
| Date | Region | Indep. sources | Notes |
|---|---|---|---|
| 1876-12-21 | Kansas to Ohio | 25 | Rochester, Ind. meteorite. **Track reconstructed** (`tracks.md`) |
| 1876-07-08 | Indiana, Michigan, Ohio, Illinois | 10 | The Chicago Tribune compared observations. **The South Bend fall lead is reported as a fragment of this fireball** |
| 1870-10-23 | New York, Vermont, Massachusetts, New Hampshire | 10 | Sunday morning about 6 a.m. Exploded with sound. Towns claimed the remains (West Brookfield / New Braintree; Shaker Pond) |
| 1874-07-07 | Tennessee, Kentucky | 9 | About 9:30-10 p.m. Detonations heard. A claimed white fragment at Columbia, Tenn. (weak) |
| 1879-05-10 | Iowa, Minnesota, Dakota | 8 | Estherville fall |
| 1877-11-20 | Virginia, North Carolina | 8 | Daylight fireball about 4:40 p.m. Prof. J. L. Campbell (Washington and Lee) estimated its height |
| 1873-12-24 | Virginia, D.C., Maryland | 5 | Christmas Eve. Exploded near Fairfax Courthouse. Philosophical Society of Washington inquiry. **Track reconstructed** |
| 1893-09-21 | Louisiana | 5 | The sound delay at Natchitoches was used in 1893 to place the fall 15-40 miles SW |
| 1879-09-05 | Nevada | 4 | Long-lasting serpentine train at dusk |
| 1874-08-02 | D.C., Maryland, Ohio | 4 | Sunday about 9 p.m. Multicoloured |
| 1877-03-20 | Vermont, Maine | 4 | Sunrise. Broke into fragments ("if anybody is lucky enough to find the remains...") |
| 1893-10-02 | Washington, Oregon | 4 | About 7:40 p.m. "Fell north of Athena" |

The 1876-07-15 remainder (5 sources) is left apart. Its "last Saturday" reports could mean July 8 or July 15.

## Top 25 events before vetting (first draft, kept for the record)
| # | Date | Indep. | Reports | Paper spread (km) | States printing | Fields present | Stones |
|---|---|---|---|---|---|---|---|
| 1 | 1876-12-21 | 20 | 48 | 2142 | Idaho, Illinois, Indiana, Iowa, Kansas, Michigan… | time, direction, sound, duration, colour, train, burst |  |
| 2 | 1870-10-23 | 10 | 19 | 1471 | District of Columbia, Indiana, Louisiana, Maine, New York, Ohio… | time, direction, sound, duration, colour, train, burst | yes |
| 3 | 1874-07-07 | 10 | 13 | 1444 | Illinois, Kentucky, New York, Tennessee, Virginia | time, direction, sound, duration, colour, train, burst | yes |
| 4 | 1876-07-08 | 9 | 23 | 726 | Illinois, Indiana, Iowa, Michigan, Minnesota, New York… | time, direction, duration, colour, train, burst | yes |
| 5 | 1876-12-28 | 9 | 18 | 1914 | Iowa, Kansas, Maryland, Michigan, Montana, New York… | time, direction, sound, duration, colour, train, burst |  |
| 6 | 1879-05-10 | 8 | 39 | 1947 | California, District of Columbia, Indiana, Louisiana, Maine, Minnesota… | time, direction, sound, colour, train, burst | yes |
| 7 | 1876-07-15 | 7 | 8 | 1803 | Illinois, Indiana, New York, Ohio, Tennessee | time, direction, sound, duration, colour, train | yes |
| 8 | 1877-11-22 | 5 | 14 | 989 | Maine, Maryland, New York, North Dakota, Virginia | sound, colour, train, burst |  |
| 9 | 1873-12-24 | 5 | 12 | 443 | Delaware, District of Columbia, Virginia, West Virginia | time, direction, sound, colour, train |  |
| 10 | 1879-09-05 | 5 | 11 | 1017 | Idaho, Montana, Nevada | time, direction, sound, colour, train, burst | yes |
| 11 | 1872-08-14 | 5 | 6 | 1594 | Minnesota, New York, Pennsylvania, Tennessee, Virginia | time, train | yes |
| 12 | 1893-09-21 | 5 | 6 | 328 | Louisiana | time, sound, colour, train, burst |  |
| 13 | 1875-06-30 | 5 | 5 | 1144 | Delaware, Illinois, Michigan, South Carolina | duration, colour, burst |  |
| 14 | 1874-09-14 | 4 | 7 | 1021 | Arizona, Nevada | direction, duration, colour, train |  |
| 15 | 1870-08-18 | 4 | 5 | 762 | New York, Pennsylvania, Vermont, West Virginia | time, direction, sound, colour, train, burst | yes |
| 16 | 1874-08-02 | 4 | 5 | 434 | District of Columbia, Maryland, Ohio | time, direction, sound, duration, colour, train, burst |  |
| 17 | 1877-03-20 | 4 | 5 | 197 | Maine, Vermont | direction, sound, colour, train, burst | yes |
| 18 | 1877-11-20 | 4 | 5 | 1087 | New York, North Carolina, Virginia | sound |  |
| 19 | 1879-01-14 | 4 | 4 | 1600 | Georgia, Ohio, Tennessee, Vermont | direction, duration, train | yes |
| 20 | 1893-10-02 | 4 | 4 | 1006 | Oregon, Washington | time, direction, duration, train, burst |  |
| 21 | 1911-04-23 | 4 | 4 | 1413 | Alabama, Mississippi, Tennessee, West Virginia | time, direction, duration, colour, train, burst |  |
| 22 | 1875-02-18 | 3 | 20 | 1236 | District of Columbia, Iowa, Louisiana, Maine, Maryland, Minnesota… | time, direction, sound, colour, train, burst | yes |
| 23 | 1876-07-09 | 3 | 15 | 1144 | New York | direction, sound, colour, train, burst |  |
| 24 | 1875-02-12 | 3 | 13 | 460 | Iowa, Missouri, Tennessee, Virginia, Wisconsin | time, direction, sound, colour, train, burst | yes |
| 25 | 1870-10-30 | 3 | 7 | 126 | Connecticut, Vermont | time, direction, sound, duration, colour, train, burst | yes |

## What this does and does not do
- **Done end to end, automatically:** grouping, dating, copy detection, independence counts, field extraction, and a
  ranked review queue with scan links.
- **Trajectory reconstruction: done for 2 events** (`tracks.md`), not for the rest. Turning witness directions and times into a ground track needs a person
  to read each top event's reports and place each witness. Pattern-matched fields show which events have the
  material (8 of the top 10 report both time and direction), not the track itself.
- **Known errors, found by reading the top events:**
  - Events pick up unrelated items printed on the same days. The 1874-07-07 event includes an Arizona meteoric-iron
    story. The 1876-07-08 event includes a meteoric stone given to the Centennial. The 1872-08-14 "balls of fire" in
    telegraph offices is a storm.
  - Some events are split by misdating: July 8 and 15, 1876 are largely one Indiana meteor, and Oct 23 and 30, 1870
    are one New England meteor. A weekly's "last Saturday" or "last Sunday" can be a week further back than the
    parse assumes.
  - "Independent sources" counts distinct texts, not distinct witnesses. A paper that rewrites a dispatch counts
    again. "Paper spread" measures how far the news traveled, not the fireball's path.
- **So the ranked list is a reading queue, not a catalog.** Each event needs a human read before it is published:
  remove unrelated items, merge split events, place witnesses. At the pilot's size, that means 39 events with 3 or
  more sources.
