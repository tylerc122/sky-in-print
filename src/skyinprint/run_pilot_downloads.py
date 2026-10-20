"""Download each pilot year at the pinned revision, verify its hash, filter it, then delete the archive.

Resumable: years with data/work/<year>/stats.json are skipped.
Usage: python -m skyinprint.run_pilot_downloads [year ...]
"""
import hashlib
import json
import sys
from pathlib import Path

from huggingface_hub import hf_hub_download

from skyinprint import filter_year

ROOT = Path(__file__).resolve().parents[2]
MAN = json.load(open(ROOT / "prereg" / "corpus_manifest.json"))


def pilot_years():
    w = json.load(open(ROOT / "prereg" / "pilot_windows.json"))
    ys = set()
    for win in [w["debug"], w["fall_decade"], *w["ordinary"]]:
        ys.update(range(int(win["start"][:4]), int(win["end"][:4]) + 1))
    return sorted(ys)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 22), b""):
            h.update(chunk)
    return h.hexdigest()


def run(year):
    out = ROOT / "data" / "work" / str(year)
    if (out / "stats.json").exists():
        print(year, "done already", flush=True)
        return
    fname = f"faro_{year}.tar.gz"
    raw = ROOT / "data" / "raw"
    p = hf_hub_download(MAN["repo"], fname, repo_type="dataset", revision=MAN["revision"], local_dir=raw)
    want = MAN["files"][fname]["sha256"]
    got = sha256(p)
    if want and got != want:
        raise SystemExit(f"hash mismatch for {fname}: {got} != {want}")
    print(year, "downloaded and verified", flush=True)
    filter_year.main(p, year, out)
    Path(p).unlink()
    print(year, "filtered; archive deleted", flush=True)


if __name__ == "__main__":
    years = [int(y) for y in sys.argv[1:]] or pilot_years()
    for y in years:
        run(y)
