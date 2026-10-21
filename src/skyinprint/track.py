"""Ground-track fit for a fireball from newspaper "passed overhead" statements.

Each overhead witness gives a point under the path. The ground track is the great circle closest to those points
(least squares on unit vectors: the plane normal is the smallest singular vector). Checks use evidence not in the
fit: where meteorites fell, and observers off the track who give the fireball's elevation, which gives a height.
Coordinates are town centres (gazetteer values, about 5 km).
Usage: python -m skyinprint.track
"""
import json
import math
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
R_EARTH = 6371.0

# 1876-12-21. Sources: results/fireballs/events.json (event 1876-12-21); quotes in results/fireballs/tracks.md
EVENTS = {
    "1876-12-21": {
        "overhead": {  # place: (lat, lon, source)
            "Mexico, Mo.": (39.17, -91.88, "Mexico Weekly Ledger 1876-12-28: passed over Mexico"),
            "Quincy, Ill.": (39.94, -91.41, "Country Gentleman via Middlebury Register 1877-01-20: zenith point"),
            "Lewistown, Ill.": (40.39, -90.15, "N.Y. Sun 1876-12-31: nearly directly over Lewiston, Ill."),
            "Havana, Ill.": (40.30, -90.06, "Middlebury Register 1877-01-20: zenith point"),
            "Bloomington, Ill.": (40.48, -88.99, "Middlebury Register 1877-01-20: zenith point"),
            "Mansfield, Ill.": (40.21, -88.51, "Inter Ocean via Salina Journal 1876-12-28: overhead, a little north of zenith"),
            "Gilman, Ill.": (40.77, -87.99, "Middlebury Register 1877-01-20: zenith point"),
        },
        "checks": {
            "Rochester, Ind. meteorite (fell from this fireball)": (41.08, -86.21),
            "Bucyrus, Ohio (end: 'several meteors', fragments)": (40.81, -82.98),
            "Emporia, Kan. ('passed over this city, west to east')": (38.40, -96.18),
            "Indianapolis (passed north of observer at 45 deg)": (39.77, -86.16),
            "Champaign Co. observer ('about 45 miles SE of the zenith point')": (40.11, -88.24),
        },
        "elevation": {"Indianapolis": (39.77, -86.16, 45.0, "north")},
    },
    # 1873-12-24, Christmas Eve. Two track points only, so this fixes direction and end, not a tested fit.
    "1873-12-24": {
        "overhead": {
            "Alexandria, Va.": (38.805, -77.047, "Alexandria Gazette via Richmond Dispatch 1873-12-29: east to west directly over the city"),
            "Fairfax Courthouse, Va. (end)": (38.846, -77.306, "same: the meteor came to its end by explosion near that place; shock, windows rattled"),
        },
        "checks": {
            "Washington, D.C. ('passed over the District'; first seen a little S of E, course NW by W)": (38.895, -77.036),
            "Baltimore (Philosophical Society: seen south of the zenith)": (39.29, -76.61),
            "Elkton, Md. (seen between Elkton and North East)": (39.61, -75.83),
            "Vienna, Va. (thunder clap and shock)": (38.90, -77.27),
            "Falls Church, Va. (thunder clap and shock)": (38.88, -77.17),
        },
        "elevation": {},
    },
}


def vec(lat, lon):
    la, lo = math.radians(lat), math.radians(lon)
    return np.array([math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la)])


def fit(points):
    V = np.array([vec(a, b) for a, b in points])
    n = np.linalg.svd(V)[2][-1]  # normal of the best plane through the earth's centre
    return n / np.linalg.norm(n)


def offset_km(n, lat, lon):
    """Signed distance from the great circle (positive on the side the normal points to)."""
    return R_EARTH * math.asin(float(np.clip(vec(lat, lon) @ n, -1, 1)))


def azimuth_at(n, lat, lon):
    """Direction of the track (degrees from north) at the point of the track nearest (lat, lon)."""
    p = vec(lat, lon)
    p = p - (p @ n) * n
    p /= np.linalg.norm(p)
    d = np.cross(n, p)  # direction along the track
    la, lo = math.asin(p[2]), math.atan2(p[1], p[0])
    east = np.array([-math.sin(lo), math.cos(lo), 0])
    north = np.array([-math.sin(la) * math.cos(lo), -math.sin(la) * math.sin(lo), math.cos(la)])
    return math.degrees(math.atan2(d @ east, d @ north)) % 360


def main():
    out = {}
    for date, ev in EVENTS.items():
        pts = [(a, b) for a, b, _ in ev["overhead"].values()]
        n = fit(pts)
        north_side = offset_km(n, 45.0, -88.0) > 0  # orient: positive offsets are north of the track
        if not north_side:
            n = -n
        mid = np.mean(pts, axis=0)
        az = azimuth_at(n, *mid) % 180  # the track's line; the direction of motion comes from the reports
        res = {"azimuth_deg": round(az, 1),
               "fit_residuals_km": {k: round(offset_km(n, a, b)) for k, (a, b, _) in ev["overhead"].items()},
               "checks_km_north_of_track": {k: round(offset_km(n, a, b)) for k, (a, b) in ev["checks"].items()}}
        rms = math.sqrt(sum(v * v for v in res["fit_residuals_km"].values()) / len(pts))
        res["fit_rms_km"] = round(rms) if len(pts) > 2 else None  # two points always fit exactly
        for name, (a, b, elev, side) in ev["elevation"].items():
            d = abs(offset_km(n, a, b))
            res[f"height_from_{name}_km"] = round(d * math.tan(math.radians(elev)))
            res[f"height_from_{name}_note"] = f"{d:.0f} km from track, elevation {elev} deg, seen to the {side}"
        out[date] = res
    json.dump(out, open(ROOT / "results/fireballs/tracks.json", "w"), indent=1)
    print(json.dumps(out, indent=1))


if __name__ == "__main__":
    main()
