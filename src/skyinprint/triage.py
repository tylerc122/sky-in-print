"""Triage filter candidates with the local model on Flint. Resumable, one request at a time.

Usage: python -m skyinprint.triage <year> [--limit N] [--sample N --seed S]
Reads data/work/<year>/candidates.jsonl, writes data/work/<year>/triage.jsonl.
"""
import argparse
import hashlib
import json
import random
import re
import sys
import time
from pathlib import Path

from skyinprint import flint

ROOT = Path(__file__).resolve().parents[2]
PROMPT_FILE = "triage_prompt_v2.md"
MAX_CHARS = 3500
FIELDS = {"observation", "type", "when_text", "where_text", "stones_reported", "secondhand", "doubtful", "quote"}
TYPES = {"aurora", "fireball", "meteorite_fall", "meteor_shower", "comet", "eclipse", "other_sky", "none"}
_norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())


def excerpt(text, headline):
    """Whole article if short; otherwise a window around the first sky keyword."""
    if len(text) <= MAX_CHARS:
        return text, 0
    m = re.search(r"aurora|borealis|northern l|meteor|fire.?ball|aerolite|comet|eclipse|shooting star|fell from|ball of fire",
                  text, re.I)
    centre = m.start() if m else 0
    start = max(0, min(centre - MAX_CHARS // 3, len(text) - MAX_CHARS))
    return text[start:start + MAX_CHARS], start


def verify(out, text):
    """Flag extracted fields that do not appear in the source (hallucination check)."""
    nt = _norm(text)
    bad = [k for k in ("when_text", "where_text", "quote") if out.get(k) and _norm(out[k]) not in nt]
    return bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("year")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--sample", type=int)
    ap.add_argument("--seed", type=int, default=20261020)
    ap.add_argument("--prompt", default=PROMPT_FILE)
    ap.add_argument("--out")
    a = ap.parse_args()
    global PROMPT, PROMPT_SHA
    PROMPT = (ROOT / "prereg" / a.prompt).read_text()
    PROMPT_SHA = hashlib.sha256(PROMPT.encode()).hexdigest()
    a.out = a.out or ("triage_" + Path(a.prompt).stem.replace("triage_prompt", "").strip("_") + ".jsonl").replace("triage_.jsonl", "triage.jsonl")
    d = ROOT / "data" / "work" / a.year
    cands = [json.loads(l) for l in open(d / "candidates.jsonl")]
    if a.sample:
        cands = random.Random(a.seed).sample(cands, min(a.sample, len(cands)))
    if a.limit:
        cands = cands[: a.limit]
    out_path = d / a.out
    done = set()
    if out_path.exists():
        # failed attempts are retried on the next run (analysis keeps the last record per key)
        done = {r["key"] for r in map(json.loads, open(out_path)) if "error" not in r}
    digest = flint.model_digest()
    print(f"{len(cands)} candidates, {len(done)} already done; model {flint.MODEL} {digest[:12]}; prompt {PROMPT_SHA[:12]}", flush=True)
    t0, n, secs = time.monotonic(), 0, 0.0
    with open(out_path, "a") as f:
        for c in cands:
            key = f"{c['file']}#{c['article_id']}"
            if key in done:
                continue
            if n % 25 == 0:
                flint.wait_for_turn(log=lambda s: print(s, flush=True))
            text, offset = excerpt(c["text"], c["headline"])
            user = f"Newspaper: {c['title']}\nPrinted: {c['date']}\nHeadline: {c['headline']}\n\nArticle text:\n{text}"
            rec = {"key": key, "model": flint.MODEL, "model_digest": digest, "prompt_sha": PROMPT_SHA,
                   "excerpt_offset": offset, "excerpt_len": len(text)}
            for attempt in range(4):
                try:
                    out, dt, usage = flint.chat_json(PROMPT, user)
                    break
                except Exception as e:
                    print(f"error {type(e).__name__}: {str(e)[:120]}; retry {attempt + 1}", flush=True)
                    time.sleep(30 * (attempt + 1))
                    flint.wait_for_turn(log=lambda s: print(s, flush=True))
            else:
                rec.update(error="failed after retries")
                f.write(json.dumps(rec) + "\n")
                continue
            rec.update(out={k: out.get(k) for k in FIELDS}, seconds=round(dt, 2),
                       prompt_tokens=usage.get("prompt_tokens"), completion_tokens=usage.get("completion_tokens"),
                       schema_ok=set(out) >= FIELDS and out.get("type") in TYPES,
                       unverified_fields=verify(out, text))
            f.write(json.dumps(rec) + "\n")
            f.flush()
            n += 1
            secs += dt
            if n % 50 == 0:
                print(f"{n} done, {secs / n:.2f}s/article, {n / (time.monotonic() - t0) * 3600:.0f}/hour", flush=True)
    print(f"finished {n} new; mean {secs / max(n, 1):.2f}s/article", flush=True)


if __name__ == "__main__":
    sys.exit(main())
