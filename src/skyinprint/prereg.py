"""Deterministically choose the pilot windows and write them to prereg/.

Run once, before any newspaper data inside the chosen windows is downloaded or read.
Only corpus metadata (file sizes) and the frozen meteorite snapshot are used.
"""
import json
import random
from collections import defaultdict

import polars as pl

SEED = 20261020
manifest = json.load(open("prereg/corpus_manifest.json"))
sizes = {int(k[5:9]): v["size"] for k, v in manifest["files"].items()}

# Debug window: the Carrington storm (already downloaded during exploration, so never used for evaluation).
debug = {"name": "debug_1859", "start": "1859-08-15", "end": "1859-10-15", "purpose": "debugging only"}

# Fall-rich decade: among 1840-1919 decades with corpus <= 25 GB, the most US-box falls in the
# frozen meteorite snapshot. Fireball/fall layers only.
ml = pl.read_csv("reference/metbull/Meteorite_Landings.csv", infer_schema_length=0).with_columns(
    pl.col("year").cast(pl.Float64, strict=False).cast(pl.Int64, strict=False),
    pl.col("reclat").cast(pl.Float64, strict=False),
    pl.col("reclong").cast(pl.Float64, strict=False))
us_falls = ml.filter((pl.col("fall") == "Fell") & pl.col("reclat").is_between(24.5, 49.5)
                     & pl.col("reclong").is_between(-125, -66.5))
dec_size = defaultdict(float)
for y, s in sizes.items():
    dec_size[y // 10 * 10] += s / 1e9
dec_falls = defaultdict(int)
for y in us_falls["year"].drop_nulls():
    dec_falls[y // 10 * 10] += 1
eligible = [d for d in range(1840, 1920, 10) if dec_size[d] <= 25]
fall_decade = max(eligible, key=lambda d: (dec_falls[d], dec_size[d]))
fall = {"name": f"falls_{fall_decade}s", "start": f"{fall_decade}-01-01", "end": f"{fall_decade + 9}-12-31",
        "purpose": "fireball and fall layers", "rule_inputs": {str(d): {"us_falls": dec_falls[d], "gb": round(dec_size[d], 1)} for d in eligible}}

# Ordinary held-out windows: 10 windows of 2 calendar months, years 1840-1922 with a >= 0.5 GB archive,
# excluding 1859 and the fall decade, at most one window per year.
rng = random.Random(SEED)
pool = [y for y, s in sorted(sizes.items()) if 1840 <= y <= 1922 and s >= 5e8 and y != 1859
        and not (fall_decade <= y <= fall_decade + 9)]
years = sorted(rng.sample(pool, 10))
ordinary = []
for y in years:
    m = rng.randint(1, 11)
    end_m = m + 1
    last = [31, 29 if y % 4 == 0 and (y % 100 or y % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][end_m - 1]
    ordinary.append({"name": f"ordinary_{y}_{m:02d}", "start": f"{y}-{m:02d}-01", "end": f"{y}-{end_m:02d}-{last}",
                     "purpose": "held-out evaluation, all layers"})

out = {"seed": SEED, "corpus_revision": manifest["revision"], "debug": debug, "fall_decade": fall, "ordinary": ordinary}
json.dump(out, open("prereg/pilot_windows.json", "w"), indent=1)
print(json.dumps(out, indent=1))
