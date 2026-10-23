# Ground-track reconstructions from newspaper reports (2026-10-21)

Code: `src/skyinprint/track.py`, numbers in `tracks.json`.
- **Method:** each "passed overhead" or "directly over" statement gives a point under the path. The track is the great
  circle closest to those points.
- **Checks:** each track is then tested against evidence **not used in the fit**:
  - where a meteorite from it fell
  - observers who said which side of them it passed
  - places that heard the explosion
- **Coordinates:** town centres, so expect about 5 km of error.
- **What is not reconstructed:** speed, radiant and orbit. Newspaper times are given to the nearest few minutes, in
  local or railroad time, and are not good enough for those.

## 1. The great fireball of 1876-12-21 (Kansas to Ohio), fit from 7 overhead towns
| Overhead witness (used in fit) | Source | Distance from fitted track (km, + = north) |
|---|---|---|
| Mexico, Mo. | Mexico Weekly Ledger 1876-12-28 | -38 |
| Quincy, Ill. | Country Gentleman, via Middlebury Register 1877-01-20 (zenith point) | +25 |
| Lewistown, Ill. | N.Y. Sun 1876-12-31 ("nearly directly over") | +30 |
| Havana, Ill. | Middlebury Register (zenith point) | +18 |
| Bloomington, Ill. | Middlebury Register (zenith point) | +3 |
| Mansfield, Ill. | Inter Ocean via Salina Journal 1876-12-28 ("overhead, a little north of the zenith") | -40 |
| Gilman, Ill. | Middlebury Register (zenith point) | +2 |

**Fit:** the track runs at an azimuth of 68° (WSW to ENE), with a scatter of 26 km.
- **Direction:** the reports say "southwest to northeast" or "west to east", so it moved ENE.
- **Length:** the track runs from Kansas to Ohio, about 1,300 km of visible path. That matches the reports' "journey of
  one thousand miles" in order of magnitude.

**Independent checks (not used in the fit):**
| Check | Result |
|---|---|
| **Rochester, Ind. meteorite** (a recognized fall from this fireball) | **17 km south of the track.** The fit, made only from Missouri and Illinois witnesses, points at the place where a stone was found 300 km further along. |
| Emporia, Kan.: "passed over this city, west to east" | 40 km north of the track |
| Champaign Co., Ill. observer: "about 45 miles southeasterly of the zenith point" | 59 km south of the track, which agrees with his own estimate of about 72 km |
| Bucyrus, Ohio, where it "exhibited itself only in the shape of several meteors" | 132 km south of the extended track. The great-circle fit stops working in Ohio. One report says the path had a "bend toward the north". |
| **Height** from the Indianapolis observer, who saw it pass north of him at 45° | 156 km. **Fails:** too high for a fireball's luminous path, and above the 1876 estimates of 40-75 miles (65-120 km). Untrained observers overestimate elevation angles. An elevation of 27-37° would give the 1876 heights. |

**Verdict:** a defensible ground track over Missouri, Illinois and Indiana, confirmed by the meteorite site. Heights
from single elevation estimates are not reliable. Comparing with 19th-century analyses of this fireball, which the
newspapers mention (Prof. Colbert, the Chicago Tribune), is still to do.

## 2. Christmas Eve fireball, 1873-12-24 (Virginia), direction and end only
Only two track points: overhead at **Alexandria** ("shot athwart the sky from east to west directly over the city",
Alexandria Gazette via Richmond Dispatch 1873-12-29) and the explosion near **Fairfax Courthouse** (shock, windows
rattled, "rushing noise like high wind through a forest"). Two points always fit exactly, so the checks carry all the
weight.

| Check (not used in the fit) | Distance from track (km, + = north) | Agrees? |
|---|---|---|
| Washington, D.C.: "passed over the District", first seen a little south of east, course "about northwest by west" | +10 | yes. The track heads 282° (WNW), about 20° from "NW by W" (304°). |
| Baltimore: seen south of the zenith (Philosophical Society of Washington circular, Jan 1874) | +60 | yes |
| Elkton / North East, Md.: seen | +109 | plausible for a bright fireball |
| Vienna and Falls Church, Va.: "very loud clap of thunder" and a shock like an earthquake | +7, +6 | yes, the end point lies among them |

**Verdict:** the fireball came from the ESE over Maryland, passed just south of Washington and over Alexandria, and
exploded near Fairfax Courthouse. The Philosophical Society of Washington collected observations of this event in
Jan-Feb 1874. Its circular is printed in the Alexandria Daily State Journal of 1874-02-06. **Finding that society's
published result is the next step.** It is the 19th-century reconstruction to compare against, and it may say
whether anyone searched near Fairfax for stones.
