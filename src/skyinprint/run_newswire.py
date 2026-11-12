"""Newswire sweep on Cygnus: download, verify, filter and triage every year in prereg/newswire.json. Stdlib only.

Same shape as run_sweep.py, pointed at Dell's Newswire (de-duplicated wire stories, 1878-1977):
  fetch   one year at a time: download the JSON (resumable), check its SHA-256 against prereg/newswire_manifest.json,
          stream it through the sweep's fireball/fall/net patterns into data/newswire/<year>/, delete the download
  triage  each filtered year in turn through triage.py (same prompt, model and Flint courtesy rules)
Each year file is one big pretty-printed JSON array (up to ~700 MB), so it is parsed one object at a time to stay
under the container's 1 GB limit. Resumable: a year with stats.json is filtered, a year with TRIAGED is triaged.
Usage: python -m skyinprint.run_newswire [--filter-only YEAR...]
"""
import json
import os
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path

from skyinprint import filter_year
from skyinprint.run_sweep import log, sha256

ROOT = Path(__file__).resolve().parents[2]
CFG = json.load(open(ROOT / "prereg/newswire.json"))
MAN = json.load(open(ROOT / "prereg" / CFG["manifest"]))
OUT = ROOT / "data/newswire"
RAW = ROOT / "data/newswire_raw"
URL = "https://huggingface.co/datasets/{repo}/resolve/{rev}/{name}"
YEARS = CFG["years"]


def download(name):
    """Resumable download with retries; the hash check after it is what makes the file trusted."""
    import urllib.request
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
                if have and r.status != 206:
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


def iter_array(path, bufsize=1 << 20):
    """Yield the objects of a top-level JSON array one at a time without loading the whole file."""
    dec = json.JSONDecoder()
    with open(path, encoding="utf-8") as f:
        buf, pos, started = "", 0, False
        while True:
            # skip whitespace, the opening bracket and separators
            while True:
                while pos < len(buf) and buf[pos] in " \t\r\n,":
                    pos += 1
                if pos < len(buf):
                    break
                chunk = f.read(bufsize)
                if not chunk:
                    return
                buf, pos = buf[pos:] + chunk, 0
            if not started:
                if buf[pos] != "[":
                    raise ValueError("not a JSON array")
                started, pos = True, pos + 1
                continue
            if buf[pos] == "]":
                return
            while True:
                try:
                    obj, end = dec.raw_decode(buf, pos)
                    break
                except json.JSONDecodeError:
                    chunk = f.read(bufsize)
                    if not chunk:
                        raise
                    buf, pos = buf[pos:] + chunk, 0
            yield obj
            buf, pos = buf[end:], 0


def iso(d):
    """'Feb-23-1880' -> '1880-02-23' (None if it doesn't parse)."""
    try:
        return datetime.strptime(d.strip(), "%b-%d-%Y").strftime("%Y-%m-%d")
    except (ValueError, AttributeError):
        return None


def filter_file(path, year, outdir):
    """Write candidates.jsonl and stats.json for one Newswire year, in the shape triage.py expects."""
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    pats = filter_year.compile_patterns()
    layers = CFG["layers"]
    name = Path(path).name
    n_arts = n_cand = 0
    papers = set()
    with open(outdir / "candidates.jsonl.part", "w") as cand_f:
        for i, a in enumerate(iter_array(path)):
            n_arts += 1
            np_ = a.get("newspaper_metadata") or []
            papers.update(p.get("lccn") for p in np_)
            text = a.get(CFG["text_field"]) or ""
            hits = {}
            for layer in layers:
                for kind, rx in pats[layer].items():
                    if rx.search(text):
                        hits.setdefault(layer, []).append(kind)
            if not hits:
                continue
            n_cand += 1
            dates = sorted(filter(None, map(iso, a.get("dates") or [])))
            first = np_[0] if np_ else {}
            cand_f.write(json.dumps({
                "source": "newswire", "hits": hits, "file": name, "article_id": i,
                "date": dates[0] if dates else str(year), "dates": dates,
                "title": (first.get("newspaper_title") or "").title(), "state": (first.get("newspaper_state") or "").strip().title(),
                "lccn": first.get("lccn", ""), "n_papers": len(np_),
                "newspapers": [{"lccn": p.get("lccn"), "title": p.get("newspaper_title"),
                                "city": p.get("newspaper_city"), "state": (p.get("newspaper_state") or "").strip()} for p in np_],
                "wire_city": a.get("wire_city", ""), "wire_state": a.get("wire_state", ""),
                "cluster_size": a.get("cluster_size"), "byline": a.get("byline", ""),
                "headline": "", "text": text, "cleaned_text": a.get("cleaned_article", "")}) + "\n")
    os.replace(outdir / "candidates.jsonl.part", outdir / "candidates.jsonl")
    stats = {"year": year, "source": "newswire", "file": name, "articles": n_arts, "candidates": n_cand,
             "newspapers": len(papers - {None})}
    json.dump(stats, open(outdir / "stats.json", "w"))
    return stats


def fetch_loop():
    for y in YEARS:
        out = OUT / str(y)
        if (out / "stats.json").exists():
            continue
        name = f"{y}_data_clean.json"
        while True:
            try:
                p = download(name)
                if sha256(p) != MAN["files"][name]["sha256"]:
                    log(y, "hash mismatch; deleting and retrying")
                    p.unlink()
                    continue
                break
            except Exception as e:
                log(y, "fetch failed:", e, "- waiting 30 min")
                time.sleep(1800)
        log(y, "filtered", json.dumps(filter_file(p, y, out)))
        p.unlink()
    log("fetch: all years filtered")


def triage_year(y):
    return subprocess.run([sys.executable, "-m", "skyinprint.triage", str(y), "--workdir", "newswire",
                           "--prompt", CFG["prompt"]], cwd=ROOT).returncode


def triage_loop():
    pending = list(YEARS)
    while pending:
        progressed = False
        for y in list(pending):
            d = OUT / str(y)
            if (d / "TRIAGED").exists():
                pending.remove(y)
                continue
            if not (d / "stats.json").exists():
                break  # keep chronological order
            log(f"=== triage newswire {y}")
            if triage_year(y) == 0:
                (d / "TRIAGED").write_text(time.strftime("%Y-%m-%dT%H:%M:%S\n"))
                pending.remove(y)
                progressed = True
        if pending and not progressed:
            time.sleep(120)
    for y in YEARS:  # final pass retries any failed articles
        triage_year(y)
    log("triage: all years done")


def main():
    if sys.argv[1:2] == ["--filter-only"]:
        for y in map(int, sys.argv[2:]):
            name = f"{y}_data_clean.json"
            p = download(name)
            assert sha256(p) == MAN["files"][name]["sha256"], "hash mismatch"
            print(json.dumps(filter_file(p, y, OUT / str(y))))
        return
    OUT.mkdir(parents=True, exist_ok=True)
    log(f"newswire sweep: {len(YEARS)} years ({YEARS[0]}-{YEARS[-1]}), layers {CFG['layers']}")
    t = threading.Thread(target=fetch_loop, daemon=True)
    t.start()
    triage_loop()
    t.join()
    (ROOT / "data/NEWSWIRE_DONE").write_text(time.strftime("%Y-%m-%dT%H:%M:%S\n"))
    if os.environ.get("SKY_IDLE_AFTER_DONE"):
        while True:
            time.sleep(3600)


if __name__ == "__main__":
    main()
