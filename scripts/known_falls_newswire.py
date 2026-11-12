"""Known-fall recall over the Newswire sweep (data/newswire), compared with the American Stories sweep.

For every US 'Fell' meteorite from 1878-1977:
  named    = a Newswire keyword candidate from the fall year or the next names it within 400 chars of a meteor/fall word
  accepted = that candidate was accepted by v2 triage (fall / fireball / meteor, or stones reported)
and, for 1878-1963, whether the American Stories sweep already recovered it (results/validation/known_falls_sweep.md,
read from the recall.json that known_falls_recall.py writes, if given).
Usage: python scripts/known_falls_newswire.py <repo> <out.json> [as_recall.json]
"""
import csv, json, re, sys
from pathlib import Path

ROOT, OUT = Path(sys.argv[1]), Path(sys.argv[2])
AS = {f["name"]: f for f in json.load(open(sys.argv[3]))} if len(sys.argv) > 3 else {}
CTX = r"(meteor|aerolit|fire ?ball|ball of fire|stone|fell from|fell in|sky|heavens|explosion|thunder)"
ACCEPT = ("meteorite_fall", "fireball", "meteor")
NW = ROOT / "data/newswire"


def load(y):
    d = NW / str(y)
    if not (d / "candidates.jsonl").exists():
        return None
    tri = {}
    if (d / "triage_v2.jsonl").exists():
        for r in map(json.loads, open(d / "triage_v2.jsonl")):
            if "out" in r:
                tri[r["key"]] = r["out"]
    cands = []
    for c in map(json.loads, open(d / "candidates.jsonl")):
        c["key"] = f'{c["file"]}#{c["article_id"]}'
        cands.append(c)
    return tri, cands


falls = []
for r in csv.DictReader(open(ROOT / "reference/metbull/Meteorite_Landings.csv")):
    if r["fall"] != "Fell" or not r["year"] or not r["reclat"]:
        continue
    y, lat, lon = int(float(r["year"])), float(r["reclat"]), float(r["reclong"])
    if 24.4 <= lat <= 49.4 and -125 <= lon <= -66.9 and 1878 <= y <= 1977:
        falls.append({"name": r["name"], "year": y, "lat": lat, "lon": lon})

cache = {}
for f in falls:
    base = re.sub(r"\s*\(.*?\)", "", f["name"]).strip()
    rx = re.compile(rf"\b{re.escape(base)}\b.{{0,400}}{CTX}|{CTX}.{{0,400}}\b{re.escape(base)}\b", re.I | re.S)
    f["named"], f["accepted"] = [], []
    for yy in (f["year"], f["year"] + 1):
        if yy not in cache:
            cache[yy] = load(yy)
        if not cache[yy]:
            continue
        tri, cands = cache[yy]
        for c in cands:
            if not rx.search(c.get("text") or ""):
                continue
            f["named"].append(c["date"])
            o = tri.get(c["key"]) or {}
            if (o.get("observation") and o.get("type") in ACCEPT) or o.get("stones_reported"):
                f["accepted"].append({"date": c["date"], "n_papers": c["n_papers"], "wire_city": c.get("wire_city"),
                                      "quote": (o.get("quote") or "")[:300], "key": c["key"]})
    a = AS.get(f["name"])
    f["american_stories_accepted"] = bool(a and a.get("accepted")) if a else None

json.dump(falls, open(OUT, "w"), indent=1)
for lo, hi in ((1878, 1922), (1923, 1963), (1964, 1977)):
    fs = [f for f in falls if lo <= f["year"] <= hi]
    acc = [f for f in fs if f["accepted"]]
    line = f"{lo}-{hi}: {len(fs)} falls, named {sum(1 for f in fs if f['named'])}, accepted {len(acc)}"
    if AS and hi <= 1963:
        new = [f["name"] for f in acc if f["american_stories_accepted"] is False]
        line += f"; accepted here but not by the AS name match: {len(new)} {new}"
    print(line)
print("Accepted name matches are leads, not recoveries: read each one before counting it (same rule as the AS sweep).")
