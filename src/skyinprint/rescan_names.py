"""Targeted rescan (spec §4.1/§5): stream whole years at the pinned revision and keep every article that
mentions a lead's names or places, with or without a meteor keyword. Archives are deleted afterwards.

Usage: python -m skyinprint.rescan_names 1890 1891 ...
Writes data/work/rescans/<year>.jsonl
"""
import json
import re
import sys
import tarfile
from pathlib import Path

from skyinprint.run_pilot_downloads import MAN, sha256
from huggingface_hub import hf_hub_download

ROOT = Path(__file__).resolve().parents[2]
TERMS = {
    "yakima_wenas_1890": r"\bwenas\b|richard lisk|\blisk\b.{0,80}(meteor|aerolite)|(meteor|aerolite).{0,200}yakima",
    "hooper_neb_1911": r"mary stuck|mrs\.? stuck|(meteor|aerolite).{0,200}hooper|hooper.{0,200}(meteor|aerolite)|mohler.{0,200}(meteor|aerolite)",
    "washington_island_1914": r"gullickson|washington island.{0,300}(meteor|aerolite)|(meteor|aerolite).{0,300}washington island",
    "jonesboro_ill_1914": r"a\.? ?v\.? cook.{0,300}(meteor|aerolite)|(meteor|aerolite).{0,300}jonesboro",
    "wakefield_1911": r"alfred h\.? richards|(meteor|aerolite).{0,200}wakefield",
}
RX = {k: re.compile(v, re.I | re.S) for k, v in TERMS.items()}


def scan(year):
    out = ROOT / "data/work/rescans" / f"{year}.jsonl"
    if out.exists():
        print(year, "done already", flush=True)
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    fname = f"faro_{year}.tar.gz"
    p = hf_hub_download(MAN["repo"], fname, repo_type="dataset", revision=MAN["revision"], local_dir=ROOT / "data/raw")
    want = MAN["files"][fname]["sha256"]
    if want and sha256(p) != want:
        raise SystemExit(f"hash mismatch {fname}")
    n = 0
    tmp = out.with_suffix(".tmp")
    with tarfile.open(p) as tf, open(tmp, "w") as f:
        for m in tf:
            if not m.isfile() or not m.name.endswith(".json"):
                continue
            d = json.load(tf.extractfile(m))
            base = m.name.split("/")[-1][:-5].split("_")
            for a in d.get("full articles", []):
                t = a.get("article") or ""
                hit = [k for k, rx in RX.items() if rx.search(t)]
                if hit:
                    n += 1
                    f.write(json.dumps({"year": year, "date": base[0], "page_seq": base[1].lstrip("p"), "lccn": base[2],
                                        "edition": (d.get("edition") or {}).get("edition", "ed-01"),
                                        "title": (d.get("lccn") or {}).get("title", ""), "leads": hit,
                                        "headline": a.get("headline", ""), "text": t}) + "\n")
    tmp.replace(out)
    Path(p).unlink()
    print(year, "hits", n, flush=True)


if __name__ == "__main__":
    for y in sys.argv[1:]:
        scan(int(y))
