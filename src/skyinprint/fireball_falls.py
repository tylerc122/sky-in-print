"""Second fall-reading queue: fall reports that sit inside a fireball seen from several cities.

The specimen ranker (specimen_rank.py) only scores destinations, so a stone picked up after a well-attested fireball
scores 0-1 if nobody says where it went (the 2026-10-26 audit: Ceredo 1898, Grinnell 1918, Danbury 1896 and others).
This queue takes every accepted fall report (type meteorite_fall, or stones reported) whose article belongs to a
fireball event with at least MIN_CITIES independent cities, and that the ranker did not already put on the read list.
Usage: python -m skyinprint.fireball_falls [min_cities=2]
Reads data/sweep/fireball_events_all.json and data/sweep/specimen_rank.json; writes data/sweep/fireball_falls.json
"""
import json
import sys
from pathlib import Path

from skyinprint.load_triage import load

ROOT = Path(__file__).resolve().parents[2]
READ_CUT = 2  # specimen_rank's read-first cut


def queue(min_cities=2):
    events = json.load(open(ROOT / "data/sweep/fireball_events_all.json"))
    ranked = {r["key"]: r for r in json.load(open(ROOT / "data/sweep/specimen_rank.json"))}
    R = load() | load(workdir="sweep")
    out = []
    for e in events:
        if e["independent_cities"] < min_cities:
            continue
        for fam in e["family_keys"]:
            for k in fam:
                o = (R.get(k) or {}).get("out") or {}
                if not (o.get("type") == "meteorite_fall" or o.get("stones_reported")):
                    continue
                if ranked.get(k, {}).get("score", 0) >= READ_CUT:
                    continue  # already on the destination read list
                out.append({"key": k, "event": e["date_lo"], "cities": e["independent_cities"],
                            "reports": e["reports"], "vetted": e["vetted"], "where": o.get("where_text") or "",
                            "quote": o.get("quote") or "", "family_first": k == fam[0]})
    out.sort(key=lambda r: (-r["cities"], r["event"]))
    json.dump(out, open(ROOT / "data/sweep/fireball_falls.json", "w"), indent=1)
    return out


if __name__ == "__main__":
    rows = queue(int(sys.argv[1]) if len(sys.argv) > 1 else 2)
    stories = [r for r in rows if r["family_first"]]
    print(f"{len(rows)} unread fall reports in multi-city fireballs; {len(stories)} distinct texts; "
          f"{len({r['event'] for r in rows})} events")
