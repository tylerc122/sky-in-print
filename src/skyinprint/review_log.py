"""Log review time per batch, for spec §10 output 4 (review time per accepted event).

Claude's reading happens in a session, not a page, so it is timed by batch: start before reading, end after,
with the number of items read. Human review time comes from the review pages (review_page.py).
Usage:
  python -m skyinprint.review_log start <batch> [--who claude]
  python -m skyinprint.review_log end <batch> <items_read> [--who claude]
  python -m skyinprint.review_log summary
Appends to results/review_time.jsonl.
"""
import argparse
import datetime as dt
import json
from pathlib import Path

LOG = Path(__file__).resolve().parents[2] / "results/review_time.jsonl"


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("action", choices=["start", "end", "summary", "human"])
    ap.add_argument("batch", nargs="?")
    ap.add_argument("items", nargs="?", type=int)
    ap.add_argument("--who", default="claude")
    ap.add_argument("--seconds", type=int, help="human: total seconds from a review page's TSV")
    a = ap.parse_args()
    rows = [json.loads(l) for l in open(LOG)] if LOG.exists() else []
    if a.action == "summary":
        done = {}
        for r in rows:
            if r["event"] == "end" or r["event"] == "human":
                done.setdefault(r["who"], []).append(r)
        for who, rs in done.items():
            n = sum(r["items"] for r in rs)
            s = sum(r["seconds"] for r in rs)
            print(f"{who}: {n} items in {s / 3600:.1f} h, {s / max(n, 1):.0f} s per item ({len(rs)} batches)")
        return
    rec = {"event": a.action, "batch": a.batch, "who": a.who, "at": now()}
    if a.action == "end":
        start = next((r for r in reversed(rows) if r["event"] == "start" and r["batch"] == a.batch), None)
        if not start:
            raise SystemExit(f"no start for batch {a.batch}")
        rec["items"] = a.items
        rec["seconds"] = int((dt.datetime.fromisoformat(rec["at"]) - dt.datetime.fromisoformat(start["at"])).total_seconds())
    if a.action == "human":
        rec.update(items=a.items, seconds=a.seconds)
    with open(LOG, "a") as f:
        f.write(json.dumps(rec) + "\n")
    print(rec)


if __name__ == "__main__":
    main()
