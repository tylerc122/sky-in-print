"""Forward follow-up search (spec §5: retraction search) for a fall lead.

Every candidate article (meteor/aerolite keyword) printed from the lead's first report through the next MONTHS
months that names the lead's place or people is collected. Hits that also carry debunking words are flagged.
Schroon Lake 1880 is why this exists: two credible-looking accounts in September, then in November "merely a piece of
quartz covered with kerosene oil and sulphur". Neither the ranker nor either of our reads caught it.
Usage: python -m skyinprint.followups "<name regex>" <first-report date YYYY-MM-DD> [months=12]
Reads data/sweep and data/work.
"""
import datetime as dt
import glob
import json
import re
import sys
from pathlib import Path

from skyinprint.review_page import page_url

ROOT = Path(__file__).resolve().parents[2]
METEOR = re.compile(r"meteor|aerolit|aerolith", re.I)
DEBUNK = re.compile(r"hoax|humbug|canard|fake|fraud|joke|untrue|not true|no such|turns? out|proved to be|merely|"
                    r"nothing but|ordinary (stone|rock)|slag|cinder|quartz|terrestrial|doubt", re.I)


def followups(name_rx, start, months=12):
    rx = re.compile(name_rx, re.I)
    d0 = dt.date.fromisoformat(start)
    d1 = d0 + dt.timedelta(days=31 * months)
    seen, out = set(), []
    for y in range(d0.year, d1.year + 1):
        for p in glob.glob(str(ROOT / f"data/sweep/{y}/candidates.jsonl")) + glob.glob(str(ROOT / f"data/work/{y}/candidates.jsonl")):
            for x in map(json.loads, open(p)):
                k = f"{x['file']}#{x['article_id']}"
                if k in seen or not (str(d0) <= x["date"] <= str(d1)):
                    continue
                t = re.sub(r"\s+", " ", x["text"])
                m = rx.search(t)
                if not m or not METEOR.search(t):
                    continue
                seen.add(k)
                win = t[max(0, m.start() - 400): m.end() + 600]
                out.append({"date": x["date"], "paper": x["title"][:60], "scan": page_url(x),
                            "debunk": bool(DEBUNK.search(win)), "text": win})
    return sorted(out, key=lambda r: r["date"])


def main():
    name_rx, start = sys.argv[1], sys.argv[2]
    months = int(sys.argv[3]) if len(sys.argv) > 3 else 12
    rows = followups(name_rx, start, months)
    print(f"{len(rows)} articles; {sum(r['debunk'] for r in rows)} with debunking words")
    for r in rows:
        print(("!! " if r["debunk"] else "   ") + f"{r['date']} {r['paper']} {r['scan']}")


if __name__ == "__main__":
    main()
