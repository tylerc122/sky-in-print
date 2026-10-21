"""Stream one American Stories year archive and keep only what the pilot needs.

For each scan (one newspaper page) whose date falls in a pilot window:
  - count articles per (date, newspaper) for coverage normalization
  - record the issue (date, newspaper, edition) for the pre-registered manual-search draw
  - keep articles matching any layer pattern (strict, fuzzy, or descriptive net)
Then draw the manual-search issues by seed and dump their full text, unread.

Usage: python -m skyinprint.filter_year <archive.tar.gz> <year> <outdir>
"""
import csv
import json
import random
import re
import sys
import tarfile
from collections import defaultdict
from pathlib import Path

PREREG = Path(__file__).resolve().parents[2] / "prereg"
SEED = 20261020
ISSUES_PER_WINDOW = 2


def load_windows(year):
    w = json.load(open(PREREG / "pilot_windows.json"))
    out = []
    for win in [w["debug"], w["fall_decade"], *w["ordinary"]]:
        if int(win["start"][:4]) <= year <= int(win["end"][:4]):
            layers = ["fireball", "fall", "net"] if win["name"].startswith("falls_") else \
                     ["aurora", "fireball", "fall", "comet", "eclipse", "net"]
            out.append({**win, "layers": layers})
    return out


def compile_patterns():
    p = json.load(open(PREREG / "patterns.json"))
    comp = {}
    for layer, v in p.items():
        if layer.startswith("_"):
            continue
        if layer == "net":
            comp["net"] = {"net": re.compile("|".join(v), re.I)}
        else:
            comp[layer] = {k: re.compile("|".join(v[k]), re.I) for k in ("strict", "fuzzy")}
    return comp


def parse_name(name):
    """faro_1859/1859-07-01_p2_sn83021205_00517172042_1859070101_0608.json"""
    base = name.split("/")[-1][:-5].split("_")
    return {"date": base[0], "page_seq": base[1].lstrip("p"), "lccn": base[2], "reel": base[3],
            "issue_code": base[4], "file": name}


def main(archive, year, outdir, wins=None):
    """`wins` overrides the pilot windows (the full sweep passes one whole-year window)."""
    year = int(year)
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    wins = wins if wins is not None else load_windows(year)
    if not wins:
        print("no pilot window in", year)
        return
    pats = compile_patterns()
    day_counts = defaultdict(int)          # (window, date, lccn) -> articles
    issues = defaultdict(list)             # (window, date, lccn, edition) -> scan files
    titles = {}
    n_scans = n_arts = n_cand = 0
    cand_f = open(outdir / "candidates.jsonl", "w")
    with tarfile.open(archive) as tf:
        for m in tf:
            if not m.isfile() or not m.name.endswith(".json"):
                continue
            meta = parse_name(m.name)
            in_wins = [w for w in wins if w["start"] <= meta["date"] <= w["end"]]
            if not in_wins:
                continue
            d = json.load(tf.extractfile(m))
            n_scans += 1
            lc = d.get("lccn") or {}
            titles[meta["lccn"]] = (lc.get("title", ""), lc.get("state", ""))
            edition = (d.get("edition") or {}).get("edition", "ed-01")
            scan_url = (d.get("scan") or {}).get("raw_data_loc", "")
            arts = d.get("full articles", [])
            for w in in_wins:
                day_counts[(w["name"], meta["date"], meta["lccn"])] += len(arts)
                issues[(w["name"], meta["date"], meta["lccn"], edition)].append(m.name)
            for a in arts:
                n_arts += 1
                text = (a.get("headline") or "") + "\n" + (a.get("article") or "")
                hits = {}
                layers = set(l for w in in_wins for l in w["layers"])
                for layer in layers:
                    for kind, rx in pats[layer].items():
                        mm = rx.search(text)
                        if mm:
                            hits.setdefault(layer, []).append(kind)
                if hits:
                    n_cand += 1
                    cand_f.write(json.dumps({
                        "windows": [w["name"] for w in in_wins], "hits": hits, **meta, "edition": edition,
                        "title": lc.get("title", ""), "state": lc.get("state", ""), "scan_url": scan_url,
                        "article_id": a.get("full_article_id", a.get("id")), "headline": a.get("headline", ""),
                        "text": a.get("article", "")}) + "\n")
    cand_f.close()

    with open(outdir / "day_counts.csv", "w", newline="") as f:
        wr = csv.writer(f)
        wr.writerow(["window", "date", "lccn", "articles"])
        for (w, dt, lccn), n in sorted(day_counts.items()):
            wr.writerow([w, dt, lccn, n])

    # Pre-registered manual-search draw: 2 issues per ordinary window, by seed, before reading.
    draws = {}
    rng = random.Random(f"{SEED}-{year}")
    for w in wins:
        if not w["name"].startswith("ordinary_"):
            continue
        keys = sorted(k for k in issues if k[0] == w["name"])
        pick = rng.sample(keys, min(ISSUES_PER_WINDOW, len(keys)))
        draws[w["name"]] = [{"date": k[1], "lccn": k[2], "edition": k[3], "files": sorted(issues[k])} for k in pick]
    if draws:
        json.dump(draws, open(outdir / "manual_draw.json", "w"), indent=1)
        # dump full text of drawn issues (all articles), unread
        with tarfile.open(archive) as tf, open(outdir / "manual_issues.jsonl", "w") as f:
            wanted = {fn: (wn, i) for wn, lst in draws.items() for i, iss in enumerate(lst) for fn in iss["files"]}
            for m in tf:
                if m.name in wanted:
                    d = json.load(tf.extractfile(m))
                    meta = parse_name(m.name)
                    for a in d.get("full articles", []):
                        f.write(json.dumps({"window": wanted[m.name][0], "issue": wanted[m.name][1], **meta,
                                            "article_id": a.get("full_article_id", a.get("id")),
                                            "headline": a.get("headline", ""), "text": a.get("article", "")}) + "\n")

    json.dump({k: {"title": t, "state": s} for k, (t, s) in titles.items()}, open(outdir / "titles.json", "w"))
    stats = {"year": year, "windows": [w["name"] for w in wins], "scans": n_scans, "articles": n_arts,
             "candidates": n_cand, "issues": len(issues), "newspapers": len(titles)}
    json.dump(stats, open(outdir / "stats.json", "w"))
    print(json.dumps(stats))


if __name__ == "__main__":
    main(*sys.argv[1:4])
