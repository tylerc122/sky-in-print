"""Full sweep on Cygnus: download, verify, filter and triage every year in prereg/sweep.json. Standard library only.

Two loops run side by side:
  fetch   one year at a time: download the archive (resumable, retried), check its SHA-256 against the frozen
          manifest, filter it with the sweep layers into data/sweep/<year>/, delete the archive
  triage  each filtered year in turn, one model request at a time under the Flint courtesy rules (triage.py)
Both are resumable: a year with stats.json is filtered; a year with TRIAGED is triaged.
Pilot triage records are copied in first for identical article keys, so no article is sent to the model twice.
Usage: python -m skyinprint.run_sweep
"""
import hashlib
import json
import os
import subprocess
import sys
import threading
import time
import urllib.request
from pathlib import Path

from skyinprint import filter_year

ROOT = Path(__file__).resolve().parents[2]
CFG = json.load(open(ROOT / "prereg/sweep.json"))
MAN = json.load(open(ROOT / "prereg/corpus_manifest.json"))
SWEEP = ROOT / "data/sweep"
RAW = ROOT / "data/raw"
URL = "https://huggingface.co/datasets/{repo}/resolve/{rev}/{name}"
YEARS = [y for y in CFG["years"] if y not in CFG["reuse_pilot_years"]]


def log(*a):
    print(time.strftime("%m-%d %H:%M"), *a, flush=True)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 22), b""):
            h.update(chunk)
    return h.hexdigest()


def download(name):
    """Resumable download with retries. The hash check after it is what makes the file trusted."""
    RAW.mkdir(parents=True, exist_ok=True)
    dest, part = RAW / name, RAW / (name + ".part")
    want = MAN["files"][name]
    if dest.exists() and dest.stat().st_size == want["size"]:
        return dest
    url = URL.format(repo=MAN["repo"], rev=MAN["revision"], name=name)
    for attempt in range(12):
        have = part.stat().st_size if part.exists() else 0
        req = urllib.request.Request(url, headers={"User-Agent": "sky-in-print-sweep"})
        if have:
            req.add_header("Range", f"bytes={have}-")
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                if have and r.status != 206:  # server ignored the range: start over
                    have = 0
                with open(part, "ab" if have else "wb") as f:
                    while chunk := r.read(1 << 20):
                        f.write(chunk)
            if part.stat().st_size == want["size"]:
                part.rename(dest)
                return dest
            log(name, "short download, resuming", part.stat().st_size, "/", want["size"])
        except Exception as e:
            log(name, f"download error {type(e).__name__}: {str(e)[:100]}; retry {attempt + 1}")
            time.sleep(min(600, 30 * 2 ** attempt))
    raise RuntimeError(f"could not download {name}")


def fetch_loop():
    for y in YEARS:
        out = SWEEP / str(y)
        if (out / "stats.json").exists():
            continue
        name = f"faro_{y}.tar.gz"
        while True:
            try:
                p = download(name)
                got = sha256(p)
                if got != MAN["files"][name]["sha256"]:
                    log(y, "hash mismatch; deleting and retrying")
                    p.unlink()
                    continue
                break
            except Exception as e:
                log(y, "fetch failed:", e, "- waiting 30 min")
                time.sleep(1800)
        win = {"name": f"sweep_{y}", "start": f"{y}-01-01", "end": f"{y}-12-31", "layers": CFG["layers"]}
        filter_year.main(p, y, out, wins=[win])
        p.unlink()
        log(y, "filtered; archive deleted")
    log("fetch: all years filtered")


def seed_from_pilot(y):
    """Copy pilot triage records for identical candidates, so they are not sent to the model again."""
    src, dst = ROOT / f"data/work/{y}/triage_v2.jsonl", SWEEP / str(y) / "triage_v2.jsonl"
    if not src.exists() or dst.exists():
        return 0
    keys = {f"{c['file']}#{c['article_id']}" for c in map(json.loads, open(SWEEP / str(y) / "candidates.jsonl"))}
    recs = [r for r in map(json.loads, open(src)) if r["key"] in keys and "error" not in r
            and r.get("prompt_sha") == CFG["prompt_sha256"]]
    with open(dst, "w") as f:
        for r in recs:
            f.write(json.dumps({**r, "from_pilot": True}) + "\n")
    return len(recs)


def triage_loop():
    pending = list(YEARS)
    while pending:
        progressed = False
        for y in list(pending):
            d = SWEEP / str(y)
            if (d / "TRIAGED").exists():
                pending.remove(y)
                continue
            if not (d / "stats.json").exists():
                break  # keep chronological order
            n = seed_from_pilot(y)
            log(f"=== triage {y}" + (f" ({n} reused from pilot)" if n else ""))
            r = subprocess.run([sys.executable, "-m", "skyinprint.triage", str(y), "--workdir", "sweep",
                                "--prompt", CFG["prompt"]], cwd=ROOT)
            if r.returncode == 0:
                (d / "TRIAGED").write_text(time.strftime("%Y-%m-%dT%H:%M:%S\n"))
                pending.remove(y)
                progressed = True
        if pending and not progressed:
            time.sleep(120)
    # final pass: triage.py skips finished articles and retries any that failed (network drops, server errors)
    for y in YEARS:
        subprocess.run([sys.executable, "-m", "skyinprint.triage", str(y), "--workdir", "sweep",
                        "--prompt", CFG["prompt"]], cwd=ROOT)
    log("triage: all years done")


def main():
    SWEEP.mkdir(parents=True, exist_ok=True)
    log(f"sweep: {len(YEARS)} years ({YEARS[0]}-{YEARS[-1]}), layers {CFG['layers']}")
    t = threading.Thread(target=fetch_loop, daemon=True)
    t.start()
    triage_loop()
    t.join()
    (ROOT / "data/SWEEP_DONE").write_text(time.strftime("%Y-%m-%dT%H:%M:%S\n"))
    if os.environ.get("SKY_IDLE_AFTER_DONE"):
        while True:
            time.sleep(3600)


if __name__ == "__main__":
    main()
