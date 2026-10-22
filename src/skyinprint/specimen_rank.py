"""Rank accepted fall reports by whether they say where the stone went (a specimen trail can start there).

Small real falls and our leads look alike in newspaper text (results/falls/credibility_test.md). The leads that
became trails (Saco 1870 -> York Institute, Jonesboro 1914 -> Cairo Public Library) both name a destination. So
at full scale these are read first. Signals, all counted within +/-WIN characters of a stone or meteor word:
  institution  the stone went to a museum, college, library, institute, academy, society, state geologist (+3)
  holder       a named person holds, bought or was sent it, or it is on exhibition (+2)
  seen_fall    someone saw it fall (+2)
  weight       a weight is given (+1)
  hoax         documented hoax markers: a person killed, tons, molten mass, hoax/humbug (-3)
Each signal counts once. The output keeps the matched phrase so a reader sees the destination at a glance.
Usage: python -m skyinprint.specimen_rank [--rescans]
Writes data/work/specimen_rank.json (and prints the top of the list).
"""
import argparse
import glob
import json
import re
from pathlib import Path

from skyinprint.load_triage import load

ROOT = Path(__file__).resolve().parents[2]
WIN = 700
ANCHOR = re.compile(r"meteor|aerolit|meteoric (stone|iron)|stone (fell|which fell)|fell from the (sky|heavens)", re.I)
# "society" alone: the Shergotty stone went "to the Asiatic Society" (missed in the blind check)
INST = r"museum|college|university|institute|academy|library|athen(a|e)um|cabinet|smithsonian|society|state geologist|geological survey|high school"
SIGNALS = {
    "institution": (3, re.compile(
        rf"(presented|donated|given|gift|deposited|sent|forwarded|sold|turned over)\b[^.]{{0,80}}\b({INST})"
        rf"|({INST})[^.]{{0,60}}\b(has|have|received|secured|acquired|purchased|bought|obtained)\b"
        rf"|gifts? to the [^.]{{0,40}}({INST})|for the ({INST})|in the ({INST})"
        # a list of gifts or accessions to a named institution, with the stone among them (the Cairo Bulletin case)
        rf"|({INST})[^|]{{0,250}}\b(gifts|donations|accessions|presented|donated)\b"
        rf"|\b(gifts|donations|accessions)\b[^|]{{0,250}}({INST})", re.I)),
    "holder": (2, re.compile(
        r"in (the )?possession of|in (his|her|their|our|my) possession|purchased by|bought by|sold (it |the stone |the meteor(ite)? )?(to|for)"
        r"|has the (stone|meteor)|secured (it|the stone|a piece|pieces|fragments|some)|some of which (he|they) secured|carried (it )?home"
        r"|sent (it |a piece |pieces |fragments |the stone )?to (prof|dr|the)|(on|oh|ou|0n) exhibition|exhibited (at|in|by)|will be exhibited"
        r"|is now (at|in|on)|preserved|keeps? it|has it in his", re.I)),
    "seen_fall": (2, re.compile(r"saw (it|the meteor|the stone|this meteorite?) fall|seen to fall|was seen to strike|saw it strike"
                                r"|fell (with|within|near|on|in|into) [^.]{0,40}(farm|yard|field|feet|rods)", re.I)),
    "weight": (1, re.compile(r"\b\d[\d,.]*\s*(pounds|lbs?\b|ounces|oz\b)|weigh(s|ed|ing) (about |nearly |over )?\w+ (pounds|ounces)", re.I)),
    # "killed" only of a person: the Saco report's grass was "scorched and killed"
    "hoax": (-3, re.compile(r"(man|farmer|woman|boy|girl|child|person|he|she|was|were|instantly) (was )?killed|killed (him|her|a man|instantly)|killing (a |the )?(man|farmer|woman|boy|him|her)"
                            r"|his death|\btons\b|molten mass|humbug|hoax|canard", re.I)),
}


def windows(text):
    for m in ANCHOR.finditer(text):
        yield text[max(0, m.start() - WIN): m.end() + WIN]


def clean(text):
    """Rejoin words OCR split across lines ("present- | ed" -> "presented") and drop column rules."""
    t = re.sub(r"\s+", " ", text.replace("|", " "))
    t = re.sub(r"\b([a-z]{2,})[-.,]? (ed|ing|ted|tion|ly|ment)\b", r"\1\2", t)
    return re.sub(r"\b(10|lo|t0|TO|To) (the|a|an|his|prof)\b", r"to \2", t)  # OCR "10 the" for "to the"


def score(text):
    t = clean(text)
    hits, total = {}, 0
    for name, (w, rx) in SIGNALS.items():
        for win in windows(t):
            m = rx.search(win)
            if m:
                a, b = max(0, m.start() - 80), min(len(win), m.end() + 80)
                hits[name] = win[a:b]
                total += w
                break
    return total, hits


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--rescans", action="store_true", help="also score the name-rescan hits (not triaged)")
    ap.add_argument("--workdir", default="work", help="'sweep' for the full sweep (data/sweep/<year>)")
    a = ap.parse_args(argv)
    R = load(workdir=a.workdir)
    cands = {}
    for p in glob.glob(str(ROOT / f"data/{a.workdir}/*/candidates.jsonl")):
        if a.workdir == "work" and "/1859/" in p:  # the pilot's debug window; the sweep's full 1859 is ordinary data
            continue
        for x in map(json.loads, open(p)):
            cands[f"{x['file']}#{x['article_id']}"] = x
    rows = []
    for k, r in R.items():
        o = r.get("out") or {}
        if k not in cands or not o.get("observation") or not (o.get("type") == "meteorite_fall" or o.get("stones_reported")):
            continue
        x = cands[k]
        s, hits = score(x["text"])
        rows.append({"score": s, "key": k, "date": x["date"], "paper": x["title"][:60], "scan": x.get("scan_url", ""),
                     "where": o.get("where_text") or "", "quote": o.get("quote") or "", "signals": hits, "source": "triage"})
    if a.rescans:
        for p in glob.glob(str(ROOT / "data/work/rescans/*.jsonl")):
            for x in map(json.loads, open(p)):
                s, hits = score(x["text"])
                rows.append({"score": s, "key": f"rescan:{x['year']}:{x['lccn']}:{x['date']}:{x['page_seq']}",
                             "date": x["date"], "paper": x["title"][:60], "where": ",".join(x["leads"]), "quote": "",
                             "signals": hits, "source": "rescan"})
    rows.sort(key=lambda r: (-r["score"], r["date"]))
    json.dump(rows, open(ROOT / f"data/{a.workdir}/specimen_rank.json", "w"), indent=1)
    return rows


if __name__ == "__main__":
    rows = main()
    from collections import Counter
    print(len(rows), "reports; score distribution:", sorted(Counter(r["score"] for r in rows).items(), reverse=True))
    for r in rows[:40]:
        d = r["signals"].get("institution") or r["signals"].get("holder") or ""
        print(f"{r['score']:3d} {r['date']} {r['source'][:6]} {r['where'][:30]:30s} | {d[:110]}")
