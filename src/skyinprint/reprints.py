"""Group accepted reports into reprint families (near-duplicate text printed within a few months).

Text similarity: TF-IDF over word 3-grams of the excerpt the model read; two reports join a family when cosine
similarity >= THRESH and their print dates are within MAX_DAYS. Families are connected components.
Usage: python -m skyinprint.reprints <layer> [window-prefix]   (layer: fall | fireball)
Writes data/work/families_<layer>.json
"""
import datetime as dt
import glob
import json
import re
import sys
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from skyinprint.load_triage import load

ROOT = Path(__file__).resolve().parents[2]
THRESH = 0.45
MAX_DAYS = 180


def selected(o, layer):
    if not o.get("observation"):
        return False
    if layer == "fall":
        return o["type"] == "meteorite_fall" or o.get("stones_reported")
    return o["type"] in ("fireball", "other_sky", "meteor")


def main(layer, prefix=""):
    R = load()
    cands = {}
    for p in glob.glob(str(ROOT / "data/work/*/candidates.jsonl")):
        if "/1859/" in p:
            continue
        for x in map(json.loads, open(p)):
            cands[f"{x['file']}#{x['article_id']}"] = x
    items = [(k, cands[k]) for k, r in R.items()
             if k in cands and "out" in r and selected(r["out"], layer) and cands[k]["windows"][0].startswith(prefix)]
    texts = []
    for k, x in items:
        r = R[k]
        off, n = r.get("excerpt_offset", 0), r.get("excerpt_len", len(x["text"]))
        texts.append(re.sub(r"\s+", " ", x["text"][off:off + n]).lower())
    vec = TfidfVectorizer(analyzer="word", ngram_range=(3, 3), min_df=1, sublinear_tf=True, token_pattern=r"[a-z]{2,}")
    X = vec.fit_transform(texts)
    S = (X @ X.T).tocoo()
    dates = [dt.date.fromisoformat(x["date"]) for _, x in items]
    parent = list(range(len(items)))

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i, j, s in zip(S.row, S.col, S.data):
        if i < j and s >= THRESH and abs((dates[i] - dates[j]).days) <= MAX_DAYS:
            parent[find(i)] = find(j)
    fam = {}
    for i in range(len(items)):
        fam.setdefault(find(i), []).append(i)
    out = []
    for members in fam.values():
        members.sort(key=lambda i: dates[i])
        first = members[0]
        out.append({"size": len(members), "first_date": str(dates[first]), "last_date": str(dates[members[-1]]),
                    "papers": len({items[i][1]["lccn"] for i in members}),
                    "states": sorted({items[i][1]["state"] for i in members if items[i][1]["state"]}),
                    "representative": items[first][0], "members": [items[i][0] for i in members],
                    "where": [R[items[i][0]]["out"].get("where_text", "") for i in members][:5]})
    out.sort(key=lambda f: (-f["size"], f["first_date"]))
    json.dump(out, open(ROOT / f"data/work/families_{layer}.json", "w"), indent=1)
    sizes = [f["size"] for f in out]
    print(f"{layer}: {len(items)} reports -> {len(out)} reprint families; singletons {sizes.count(1)}; largest {sizes[:8]}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
