"""Catalogued US finds named in an earlier fall report: the name matcher with no year window (the Cuero pattern).

find_vs_fall.py needs the find's name within two years of its find year. find_vs_fall_map.py needs the county's name,
or a paper within 60 km naming no other town. A fall "up near Cuero" in 1895, printed in Shiner, is caught by neither,
though the Cuero stone was found there in 1936. This pairs every accepted fall report (type meteorite_fall, or stones
reported) with every Valid US find found more than two years after it whose catalogue name is in the report's place
text, when the paper is in the find's state or the place text names that state.
Usage: python -m skyinprint.find_vs_fall_name
Writes data/sweep/find_vs_fall_name.json
"""
import csv
import glob
import json
import re
from pathlib import Path

from skyinprint.load_triage import load

ROOT = Path(__file__).resolve().parents[2]
# catalogue names that are also everyday words or very common town names
COMMON = {"Tell", "York", "Anthony", "New Mexico", "Kansas City", "Cincinnati", "Washington", "Jackson", "Lincoln",
          "Franklin", "Marion", "Union", "Monroe", "Madison", "Warren", "Clinton", "Springfield", "Columbus",
          "Richmond", "Chester", "Salem", "Dayton", "Lexington", "Auburn", "Plymouth", "Bristol", "Dover", "Oxford",
          "Florence", "Burlington", "Norfolk", "Eagle", "Glasgow", "Rochester", "Smithville", "Mount Vernon",
          "Nashville", "Kendall County", "Garland", "Summit"}


def main():
    states = json.load(open(ROOT / "data/sweep/cache/find_states.json"))
    names = {}
    for r in csv.DictReader(open(ROOT / "reference/metbull/Meteorite_Landings.csv")):
        if r["fall"] != "Found" or r["nametype"] != "Valid" or r["name"] not in states or not r["year"]:
            continue
        base = re.sub(r"\s*\(.*\)$", "", r["name"])
        if len(base) >= 5 and base not in COMMON:
            names.setdefault(base, []).append({"name": r["name"], "year": int(float(r["year"])),
                                               "state": states[r["name"]], "class": r["recclass"],
                                               "mass_g": r["mass (g)"]})
    places = {r["lccn"]: r for r in csv.DictReader(open(ROOT / "reference/newspapers/lccn_places.csv"))}
    tri = load() | load(workdir="sweep")
    out = []
    for wd in ("work", "sweep"):
        for p in glob.glob(str(ROOT / f"data/{wd}/[0-9]*/candidates.jsonl")):
            for line in open(p):
                c = json.loads(line)
                o = (tri.get(f'{c["file"]}#{c["article_id"]}') or {}).get("out") or {}
                where = o.get("where_text") or ""
                if not where or not (o.get("type") == "meteorite_fall" or o.get("stones_reported")):
                    continue
                pstate = (places.get(c["lccn"]) or {}).get("state") or c.get("state") or ""
                for base, finds in names.items():
                    if base not in where or not re.search(rf"\b{re.escape(base)}\b", where):
                        continue
                    for f in finds:
                        if f["year"] <= int(c["date"][:4]) + 2:
                            continue
                        if pstate == f["state"] or re.search(rf"\b{f['state'][:3]}", where):
                            out.append({**f, "date": c["date"], "paper": c["title"][:60], "lccn": c["lccn"],
                                        "page": c["page_seq"], "where": where, "quote": (o.get("quote") or "")[:300]})
    out.sort(key=lambda h: (h["name"], h["date"]))
    json.dump(out, open(ROOT / "data/sweep/find_vs_fall_name.json", "w"), indent=1)
    print(len(out), "pairs;", len({h["name"] for h in out}), "finds")
    return out


if __name__ == "__main__":
    main()
