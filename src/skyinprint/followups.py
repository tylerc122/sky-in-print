"""Forward follow-up search (spec §5: retraction search) for a fall lead.

Every candidate article printed from the lead's first report through the next MONTHS calendar months is collected if it
names the lead's place or people within NEAR characters of a meteor word. Every such passage is kept, and an article
is flagged if any of its passages carries a debunking word (the words are listed, since "doubt" is often noise).
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
                    r"nothing but|ordinary (stone|rock)|slag|cinder|quartz|terrestrial"
                    # "doubt" only as doubt: not "no doubt", "without doubt", "undoubtedly", "doubtless" (2026-10-26)
                    r"|doubtful|(?<!no )(?<!out )(?<!of )(?<!un)\bdoubts?\b(?!less)", re.I)


NEAR = 600  # a name counts only if a meteor word is within this many characters of it
BEFORE, AFTER = 400, 600  # passage shown around each such name


def add_months(d, months):
    y, m = divmod(d.month - 1 + months, 12)
    return dt.date(d.year + y, m + 1, min(d.day, 28))


def passages(t, rx):
    """Every passage around a name occurrence that has a meteor word nearby, overlaps merged.

    The first version took only the first name match, so with a common name (Jackson, Murphy) the window could be an
    unrelated paragraph and the debunk flag was computed on the wrong text (second audit, 2026-10-26)."""
    spans = []
    for m in rx.finditer(t):
        if METEOR.search(t[max(0, m.start() - NEAR): m.end() + NEAR]):
            a, b = max(0, m.start() - BEFORE), min(len(t), m.end() + AFTER)
            if spans and a <= spans[-1][1]:
                spans[-1][1] = b
            else:
                spans.append([a, b])
    return [t[a:b] for a, b in spans]


def followups(name_rx, start, months=12):
    rx = re.compile(name_rx, re.I)
    d0 = dt.date.fromisoformat(start)
    d1 = add_months(d0, months)
    seen, out = set(), []
    for y in range(d0.year, d1.year + 1):
        for p in glob.glob(str(ROOT / f"data/sweep/{y}/candidates.jsonl")) + glob.glob(str(ROOT / f"data/work/{y}/candidates.jsonl")):
            for x in map(json.loads, open(p)):
                k = f"{x['file']}#{x['article_id']}"
                if k in seen or not (str(d0) <= x["date"] <= str(d1)):
                    continue
                ps = passages(re.sub(r"\s+", " ", x["text"]), rx)
                if not ps:
                    continue
                seen.add(k)
                words = sorted({m.group(0).lower() for p in ps for m in DEBUNK.finditer(p)})
                out.append({"date": x["date"], "paper": x["title"][:60], "scan": page_url(x),
                            "debunk": bool(words), "debunk_words": words, "passages": ps,
                            "text": " … ".join(ps)})
    return sorted(out, key=lambda r: r["date"])


def main():
    name_rx, start = sys.argv[1], sys.argv[2]
    months = int(sys.argv[3]) if len(sys.argv) > 3 else 12
    rows = followups(name_rx, start, months)
    print(f"{len(rows)} articles; {sum(r['debunk'] for r in rows)} with debunking words")
    for r in rows:
        flag = f"!! [{', '.join(r['debunk_words'])}] " if r["debunk"] else "   "
        print(flag + f"{r['date']} {r['paper']} {r['scan']} ({len(r['passages'])} passage(s))")


if __name__ == "__main__":
    main()
