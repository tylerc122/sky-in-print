"""Coverage-aware known-fall recall over the full sweep.

For every US 'Fell' meteorite in a swept year:
  covered  = corpus has >=1 paper within RADIUS km of the fall site with issues in the fall year or the next
  stage A  = a keyword candidate names the meteorite within 400 chars of meteor/fall words (any triage verdict)
  stage B  = that candidate was accepted by LLM triage (fall / fireball / meteor / stones reported)
  nearby   = for falls with no name match: accepted fall/stones reports from papers within RADIUS km (hand review)
"""
import csv, glob, json, math, re, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(sys.argv[1]); OUT = Path(sys.argv[2]); RADIUS = 150

def km(a, b, c, d):
    p = math.pi / 180
    h = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))

places = {}
for r in csv.DictReader(open(ROOT / "reference/newspapers/lccn_places.csv")):
    if r["lat"]:
        places[r["lccn"]] = (float(r["lat"]), float(r["lon"]))

dirs = defaultdict(list)
for wd in ("sweep", "work"):
    for d in glob.glob(str(ROOT / f"data/{wd}/[0-9]*")):
        if (Path(d) / "candidates.jsonl").exists():
            dirs[int(Path(d).name)].append(Path(d))

papers_by_year = defaultdict(set)
for y, ds in dirs.items():
    for d in ds:
        if (d / "day_counts.csv").exists():
            for r in csv.DictReader(open(d / "day_counts.csv")):
                papers_by_year[y].add(r["lccn"])

falls = []
for r in csv.DictReader(open(ROOT / "reference/metbull/Meteorite_Landings.csv")):
    if r["fall"] != "Fell" or not r["year"] or not r["reclat"]:
        continue
    y, lat, lon = int(float(r["year"])), float(r["reclat"]), float(r["reclong"])
    if 24.4 <= lat <= 49.4 and -125 <= lon <= -66.9 and y in dirs:
        falls.append({"name": r["name"], "year": y, "lat": lat, "lon": lon})

CTX = r"(meteor|aerolit|fire ?ball|ball of fire|stone|fell from|fell in|sky|heavens|explosion|thunder)"
ACCEPT = ("meteorite_fall", "fireball", "meteor")

def load_year(y):
    tri, cands = {}, []
    for d in dirs.get(y, []):
        p = d / "triage_v2.jsonl"
        if p.exists():
            for line in open(p):
                r = json.loads(line)
                if "out" in r:
                    tri[r["key"]] = r["out"]
        for line in open(d / "candidates.jsonl"):
            c = json.loads(line)
            c["key"] = f'{c["file"]}#{c["article_id"]}'
            cands.append(c)
    for p in glob.glob(str(ROOT / "results/manual/*.jsonl")):
        for line in open(p):
            m = json.loads(line)
            if m.get("key") in tri and "out" in m:
                tri[m["key"]] = m["out"]
    return tri, cands

cache = {}
def year(y):
    if y not in cache:
        cache[y] = load_year(y)
    return cache[y]

for f in falls:
    base = re.sub(r"\s*\(.*?\)", "", f["name"]).strip()
    rx = re.compile(rf"\b{re.escape(base)}\b.{{0,400}}{CTX}|{CTX}.{{0,400}}\b{re.escape(base)}\b", re.I | re.S)
    near = {l for l, (a, b) in places.items() if km(f["lat"], f["lon"], a, b) <= RADIUS}
    f["covered_papers"] = len(near & (papers_by_year[f["year"]] | papers_by_year.get(f["year"] + 1, set())))
    f["named"], f["accepted"], f["nearby"] = [], [], []
    for yy in (f["year"], f["year"] + 1):
        if yy not in dirs:
            continue
        tri, cands = year(yy)
        for c in cands:
            txt = (c.get("headline") or "") + "\n" + (c.get("text") or "")
            o = tri.get(c["key"]) or {}
            ok = (o.get("observation") and o.get("type") in ACCEPT) or o.get("stones_reported")
            if rx.search(txt):
                f["named"].append(c["date"])
                if ok:
                    f["accepted"].append({"date": c["date"], "title": c["title"], "quote": (o.get("quote") or "")[:300],
                                          "where": o.get("where_text") or "", "key": c["key"]})
            elif ok and (o.get("type") == "meteorite_fall" or o.get("stones_reported")) and c["lccn"] in near:
                f["nearby"].append({"date": c["date"], "title": c["title"], "quote": (o.get("quote") or "")[:300],
                                    "where": o.get("where_text") or "", "key": c["key"]})
    f["accepted"].sort(key=lambda a: a["date"]); f["nearby"].sort(key=lambda a: a["date"])

json.dump(falls, open(OUT, "w"), indent=1)
cov = [f for f in falls if f["covered_papers"]]
print(f"{len(falls)} US falls in swept years, {len(cov)} with a paper within {RADIUS} km")
print(f"named (filter passed): {sum(1 for f in cov if f['named'])}; accepted: {sum(1 for f in cov if f['accepted'])}")
print(f"uncovered falls with an accepted name match anyway: {sum(1 for f in falls if not f['covered_papers'] and f['accepted'])}")
