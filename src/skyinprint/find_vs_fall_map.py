"""Catalogued US finds that a newspaper fall report may describe, matched by place instead of name (the Allen pattern).

find_vs_fall.py only catches a find when an article uses its catalogue name within two years of the find year. The
Rawlett 1878 report ("15 miles north of Dallas") and the Allen find (Rowlett Creek, ~1923) share neither. This pairs
every accepted fall report (type meteorite_fall, or stones reported) with every Valid US find found AFTER it, when:
  county: the report names the find's county ("Collin county", "Collin co.") and is in or about the find's state, or
  local:  the report was printed within LOCAL_KM of the find and reads as local news ("this city", "near here",
          "N miles north of ..."), with no other state named in where_text.
Counties come from the Census reverse geocoder (coordinates only), cached in data/sweep/cache/find_counties.json.
Usage: python -m skyinprint.find_vs_fall_map
Writes data/sweep/find_vs_fall_map.json
"""
import csv
import json
import math
import re
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

from skyinprint.load_triage import load

ROOT = Path(__file__).resolve().parents[2]
CACHE = ROOT / "data/sweep/cache/find_counties.json"
LOCAL_KM = 60
LOCAL = re.compile(r"this (city|county|place|town|section|vicinity|neighborhood)|near here|near (this|town)|"
                   r"\bhere\b|miles? (north|south|east|west|n\.|s\.|e\.|w\.)\w* of (this|here|town|the city)", re.I)
FALL = re.compile(r"\b(saw|seen|heard|fell|fall|struck|buried|hot|warm|dug|plowed|ploughed|hole)\b", re.I)
STATES = ["Alabama", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
          "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
          "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
          "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
          "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
          "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"]


def km(a, b, c, d):
    p = math.pi / 180
    h = math.sin((c - a) * p / 2) ** 2 + math.cos(a * p) * math.cos(c * p) * math.sin((d - b) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def county_of(lat, lon):
    url = ("https://geocoding.geo.census.gov/geocoder/geographies/coordinates?"
           f"x={lon}&y={lat}&benchmark=Public_AR_Current&vintage=Current_Current&layers=Counties&format=json")
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "sky-in-print"}), timeout=60) as r:
        g = json.load(r)["result"]["geographies"].get("Counties") or []
    return g[0]["BASENAME"] if g else None


def finds():
    states = json.load(open(ROOT / "data/sweep/cache/find_states.json"))
    cache = json.load(open(CACHE)) if CACHE.exists() else {}
    out = []
    for r in csv.DictReader(open(ROOT / "reference/metbull/Meteorite_Landings.csv")):
        if r["fall"] != "Found" or r["nametype"] != "Valid" or r["name"] not in states or not r["year"]:
            continue
        lat, lon = float(r["reclat"]), float(r["reclong"])
        if r["name"] not in cache:
            try:
                cache[r["name"]] = county_of(lat, lon)
            except Exception as e:  # noqa: BLE001 - a missing county just drops the county match for that find
                print("geocode failed", r["name"], e)
                cache[r["name"]] = None
            time.sleep(0.2)
        out.append({"name": r["name"], "year": int(float(r["year"])), "lat": lat, "lon": lon, "class": r["recclass"],
                    "mass_g": r["mass (g)"], "state": states[r["name"]], "county": cache[r["name"]]})
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    json.dump(cache, open(CACHE, "w"), indent=0)
    return out


def main():
    places = {r["lccn"]: (float(r["lat"]), float(r["lon"]), r["state"]) for r in
              csv.DictReader(open(ROOT / "reference/newspapers/lccn_places.csv")) if r["lat"]}
    paper_city = {r["lccn"]: r["city"] for r in csv.DictReader(open(ROOT / "reference/newspapers/lccn_places.csv"))}
    F = finds()
    tri = load() | load(workdir="sweep")
    cands = {}
    for wd in ("work", "sweep"):
        for p in (ROOT / "data" / wd).glob("[0-9]*/candidates.jsonl"):
            for line in open(p):
                c = json.loads(line)
                k = f'{c["file"]}#{c["article_id"]}'
                o = (tri.get(k) or {}).get("out") or {}
                if o.get("type") == "meteorite_fall" or o.get("stones_reported"):
                    c["out"] = o
                    cands[k] = c
    print(len(F), "finds;", len(cands), "accepted fall reports")
    county_rx = {f["name"]: re.compile(rf"\b{re.escape(f['county'])}\s+(county|co\b)", re.I) for f in F if f["county"]}
    hits = defaultdict(list)
    for k, c in cands.items():
        y = int(c["date"][:4])
        o = c["out"]
        where = o.get("where_text") or ""
        text = (c.get("text") or "")
        pl = places.get(c["lccn"])
        for f in F:
            if f["year"] < y:
                continue
            mode = None
            other_state = any(re.search(rf"\b{s}\b", where, re.I) for s in STATES if s != f["state"])
            if other_state:
                continue
            rx = county_rx.get(f["name"])
            # county: the fall's own place text names the find's county, and the report is in or about that state
            if rx and rx.search(where):
                if re.search(rf"\b{f['state']}\b", where, re.I) or (pl and pl[2] == f["state"]):
                    mode = "county"
            # local: printed nearby, the place text is local ("near here", "N miles north of this city"), and it
            # names no town except, at most, the paper's own (wire stories carry "here" under someone else's dateline)
            if not mode and pl and km(pl[0], pl[1], f["lat"], f["lon"]) <= LOCAL_KM and LOCAL.search(where):
                towns = set(re.findall(r"\b[A-Z][a-z]{3,}\b", where)) - {"This", "Near", "Miles", "North", "South",
                                                                          "East", "West", "Here", "Town", "City"}
                own = (paper_city.get(c["lccn"]) or "").lower()
                if all(t.lower() == own for t in towns):
                    mode = "local"
            if mode:
                hits[f["name"]].append({"key": k, "date": c["date"], "title": c["title"], "mode": mode,
                                        "paper_km": round(km(pl[0], pl[1], f["lat"], f["lon"])) if pl else None,
                                        "where": where, "quote": (o.get("quote") or "")[:300],
                                        "fall_words": len(FALL.findall(o.get("quote") or "")),
                                        "gap_years": f["year"] - y})
    out = []
    for f in F:
        h = sorted(hits.get(f["name"], []), key=lambda x: x["date"])
        if h:
            out.append({**f, "reports": len(h), "hits": h})
    out.sort(key=lambda f: (-max(x["fall_words"] for x in f["hits"]), f["name"]))
    json.dump(out, open(ROOT / "data/sweep/find_vs_fall_map.json", "w"), indent=1)
    print(len(out), "finds with at least one earlier local/county fall report")
    for f in out[:60]:
        x = max(f["hits"], key=lambda x: x["fall_words"])
        print(f'{f["name"]} ({f["state"]}, {f["county"]} Co., found {f["year"]}, {f["class"]}) n={f["reports"]} | '
              f'{x["date"]} {x["mode"]} {x["paper_km"]}km | {x["where"][:60]} | {x["quote"][:150]}')


if __name__ == "__main__":
    main()
