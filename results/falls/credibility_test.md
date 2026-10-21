# Can newspaper evidence alone tell a real fall from a hoax? (test, 2026-10-21)

Signals are counted mechanically within ±700 characters of each meteor mention, in every 1870s candidate article
that names the event's place inside its date window. Code: `src/skyinprint/credibility.py`.
Labels come from outside our own reading:
- **real** = recognized meteorites
- **hoax** = documented in secondary sources (Indiana State Library; Vatican Observatory; Haunted Ohio Books)

| Event | Label | Papers | Span (days) | Science | Specimen | Fragments | Hoax markers | "Hot" |
|---|---|---|---|---|---|---|---|---|
| Estherville 1879 | real | 44 | 223 | 6 | 7 | 10 | 1 | 1 |
| Homestead 1875 | real | 32 | 879 | 27 | 21 | 20 | 3 | 0 |
| Searsmont 1871 | real | 5 | 44 | 0 | 2 | 1 | 1 | 2 |
| Rochester 1876 | real | 3 | 145 | 2 | 0 | 1 | 0 | 0 |
| Castalia 1874 | real | 3 | 1 | 2 | 1 | 0 | 0 | 0 |
| Ställdalen 1876 | real | 7 | 32 | 0 | 0 | 0 | 0 | 0 |
| Newton, Ind. 1879 | hoax | 24 | 33 | 7 | 8 | 0 | **19** | 2 |
| Whitestone/Nemaha, Kan. 1879 | hoax | 19 | 22 | 0 | 0 | 1 | **17** | 0 |
| Laclede/St. Louis 1872 | lead | 5 | 18 | 0 | 0 | 0 | 0 | 0 |
| Romney, Ind. 1873 | lead | 10 | 95 | 0 | 1 | 10 | **5** ("molten mass") | 0 |
| Smithfield, Ohio 1871 | lead | 2 | 20 | 0 | 0 | 0 | 0 | 0 |
| Barnhart, Pa. 1870 | lead | 1 | 0 | 0 | 0 | 0 | 0 | 1 |
| New London, Ohio 1873 | lead | 5 | 28 | 0 | 1 | 0 | 0 | 4 |
| South Bend, Ind. 1876 | lead | 2 | 21 | 1 | 0 | 1 | 0 | 0 |
| Farmersville, Mo. 1874 | suspect | 11 | 147 | 0 | 0 | 0 | 4 | 0 |
| Jay, Vt. 1877 | suspect | 13 | 245 | 1 | 3 | 0 | **10** | 0 |
| Maysville, Cal. 1873 | suspect | 6 | 98 | 0 | 0 | 0 | 0 | 3 |

(Saco 1870 is left out: its place pattern was too loose to measure.)

## What it shows
1. **One marker separates real from hoax, but only for one kind of hoax.** In both documented hoaxes, most articles carry a
   hoax marker (19/24, 17/19: a person killed). In real falls, at most 1 in 5 do. It also flags two of our suspects
   (Jay "two tons", Farmersville "molten mass") and one lead, **Romney 1873 ("molten mass")**. With only two hoaxes,
   both "killer meteor" stories, it can't say anything about subtler hoaxes.
2. **Mentioning a scientist or museum does not prove a fall is real.** The Newton hoax names the State Geologist and the
   state museum as often as the real falls do, because real officials were fooled and reported on it.
3. **Big real falls are unmistakable; small real falls look just like our leads.** Estherville and Homestead have dozens of
   papers, hundreds of days of follow-up, fragments and named professors. Castalia, Rochester, Searsmont and Ställdalen
   have 3-7 papers and short coverage. That is the same profile as Laclede, Smithfield, New London and South Bend.
4. **Automatic reprint detection fails on these short items.** OCR noise breaks the text matches, so "independent
   sources" still has to be judged by hand.

## Conclusion
Newspaper text can **flag likely hoaxes** (hoax markers) and **confirm big falls**. It **cannot certify a small fall as real**,
which is exactly where our leads sit. For those, credibility has to come from outside the newspapers: a surviving
specimen, a published analysis, or records showing the named people and places existed. This supports doing the
specimen trails (spec §5) before any claim. It also downgrades **Romney 1873** to suspect.
