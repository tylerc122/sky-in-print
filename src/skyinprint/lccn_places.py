"""Look up each newspaper's place of publication (city, state, lat/long) from the loc.gov API.

Reads LCCNs from data/work/*/titles.json; caches results in reference/newspapers/lccn_places.csv.
Polite: sequential, 1 request/second, resumable.
"""
import csv
import glob
import json
import time
from pathlib import Path

import requests

OUT = Path("reference/newspapers/lccn_places.csv")
cols = ["lccn", "title", "state", "city", "lat", "lon", "status"]
done = {}
if OUT.exists():
    for r in csv.DictReader(open(OUT)):
        done[r["lccn"]] = r
titles = {}
for p in glob.glob("data/work/*/titles.json"):
    titles.update(json.load(open(p)))
todo = [l for l in sorted(titles) if l not in done or done[l].get("status") != "200"]
print(len(titles), "newspapers;", len(todo), "to look up")
s = requests.Session()
for i, lccn in enumerate(todo):
    row = {"lccn": lccn, "title": titles[lccn]["title"], "state": titles[lccn]["state"], "city": "", "lat": "", "lon": "", "status": ""}
    try:
        for back in (0, 30, 120, 300):
            time.sleep(back)
            r = s.get(f"https://www.loc.gov/item/{lccn}/", params={"fo": "json"}, timeout=30)
            if r.status_code != 429:
                break
        row["status"] = str(r.status_code)
        if r.ok:
            it = r.json().get("item", {})
            city = it.get("location_city") or []
            ll = it.get("latlong") or []
            row["city"] = city[0] if city else ""
            if isinstance(ll, list) and len(ll) == 2:
                row["lat"], row["lon"] = ll
            elif isinstance(ll, str) and "," in ll:
                row["lat"], row["lon"] = [x.strip() for x in ll.split(",")[:2]]
    except Exception as e:
        row["status"] = f"error:{type(e).__name__}"
    done[lccn] = row
    if i % 25 == 0:
        print(i, lccn, row["city"], row["lat"], row["status"], flush=True)
    time.sleep(4)
with open(OUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    for k in sorted(done):
        w.writerow({c: done[k].get(c, "") for c in cols})
print("written", len(done))
