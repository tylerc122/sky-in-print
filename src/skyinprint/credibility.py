"""Evidence signals per fall event, computed from every candidate article that mentions the event.

An event is a place pattern plus a date window. All signals are counted mechanically from article text,
so they do not depend on anyone's reading of the story:
  papers       distinct newspapers that mention it
  families     independent texts (reprints collapsed by TF-IDF similarity)
  span_days    days between first and last mention (follow-up coverage)
  science      articles naming a scientist, analysis, or institution
  specimen     articles saying where the specimen went (museum, college, sold, exhibited, presented)
  fragments    articles mentioning several pieces or fragments
  hoax_marks   articles with documented hoax markers (a person killed, 'tons', 'molten mass', 'humbug')
  hot          articles calling the stone hot (a folklore marker, weak)
Usage: python -m skyinprint.credibility
"""
import datetime as dt
import glob
import json
import re
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer

ROOT = Path(__file__).resolve().parents[2]
METEOR = re.compile(r"meteor|aerolite|aerolith|meteoric|fire.?ball|ball of fire", re.I)
SIG = {
    "science": re.compile(r"\bprof\b|professor|geologist|chemist|mineralogist|analy[sz]|smithsonian|academy of science|state university|scientific gentlemen|scientists", re.I),
    "specimen": re.compile(r"museum|cabinet|college|university|institute|exhibit|presented to|donated|sold|purchased|secured for", re.I),
    "fragments": re.compile(r"\bpieces\b|fragments", re.I),
    "hoax_marks": re.compile(r"\bkilled\b|instantly killed|his death|corpse|\btons\b|molten mass|humbug|hoax|canard", re.I),
    "hot": re.compile(r"\bhot\b|hissing|sizzl", re.I),
}
# label: real = recognized meteorite; hoax = documented hoax (outside sources); lead / suspect = unknown
EVENTS = [
    ("Estherville, Iowa 1879", "real", r"estherville|emmet", "1879-05-10", 400),
    ("Homestead (Amana), Iowa 1875", "real", r"amana|homestead|iowa county", "1875-02-12", 900),
    ("Searsmont, Maine 1871", "real", r"searsmont|searsport", "1871-05-21", 300),
    ("Rochester, Ind. 1876", "real", r"rochester.{0,60}(ind|fulton)|fulton county", "1876-12-21", 300),
    ("Castalia, N.C. 1874", "real", r"ransom'?s bridge|castalia|halifax county", "1874-05-14", 300),
    ("Stalldalen, Sweden 1876", "real", r"st[aä]l+[dc]al|staildal|stalldal", "1876-06-28", 300),
    ("Newton, Ind. killer meteor 1879", "hoax", r"fountain county|newton.{0,12}ind|newtown|leonidas", "1879-01-14", 300),
    ("Whitestone/Nemaha, Kan. killer meteor 1879", "hoax", r"meis\w*th\w*ler|mesenth|whitestone|whitstone|nemaha|nemeha|nemehah", "1879-12-08", 300),
    ("Laclede Station / St. Louis 1872 (Murdoch)", "lead", r"murdo[c]?k|laclede|lsclede|laelede", "1872-07-25", 300),
    ("Romney, Ind. 1873 (Harter)", "lead", r"romney|harter|tippecanoe", "1873-09-20", 300),
    ("Smithfield, Ohio 1871 (Ong)", "lead", r"smithfield|smithfeld", "1871-03-15", 300),
    ("Barnhart farm, Greene Co., Pa. 1870", "lead", r"barnhart|richhill|waynesburg", "1870-08-21", 300),
    ("Saco, Maine 1870 (Doe)", "lead", r"ira c\.? doe|york institute|saco", "1870-10-01", 1200),
    ("New London, Ohio 1873 (Hotchkiss)", "lead", r"new london|hotchkiss", "1873-08-18", 300),
    ("South Bend, Ind. 1876", "lead", r"south bend|sonth bend", "1876-07-15", 300),
    ("Farmersville, Mo. 1874", "suspect", r"farmersville|farmexsville", "1874-01-10", 300),
    ("Jay, Vt. 1877", "suspect", r"\bjay\b|jay peak", "1877-03-27", 300),
    ("Maysville, Cal. 1873", "suspect", r"maysvil|mayyille|marysvill", "1873-08-15", 300),
]


def load_candidates():
    out = []
    for p in sorted(glob.glob(str(ROOT / "data/work/187*/candidates.jsonl"))):
        out += [json.loads(l) for l in open(p)]
    return out


def families(texts, thresh=0.45):
    if len(texts) < 2:
        return len(texts)
    X = TfidfVectorizer(ngram_range=(3, 3), token_pattern=r"[a-z]{2,}", sublinear_tf=True).fit_transform(texts)
    S = (X @ X.T).toarray()
    parent = list(range(len(texts)))

    def f(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for i in range(len(texts)):
        for j in range(i + 1, len(texts)):
            if S[i, j] >= thresh:
                parent[f(i)] = f(j)
    return len({f(i) for i in range(len(texts))})


def main():
    C = load_candidates()
    rows = []
    for name, label, pat, d0, days in EVENTS:
        rx = re.compile(pat, re.I)
        start = dt.date.fromisoformat(d0) - dt.timedelta(days=10)
        end = dt.date.fromisoformat(d0) + dt.timedelta(days=days)
        hits = []
        for x in C:
            d = dt.date.fromisoformat(x["date"])
            if not (start <= d <= end):
                continue
            t = x["text"]
            for m in rx.finditer(t):
                win = t[max(0, m.start() - 700): m.end() + 700]
                if METEOR.search(win):
                    hits.append({**x, "win": win})  # signals are read from this window, not the whole column
                    break
        texts = [re.sub(r"\s+", " ", x["win"]).lower() for x in hits]
        dates = sorted(x["date"] for x in hits)
        r = {"event": name, "label": label, "articles": len(hits), "papers": len({x["lccn"] for x in hits}),
             "families": families(texts),
             "span_days": (dt.date.fromisoformat(dates[-1]) - dt.date.fromisoformat(dates[0])).days if dates else 0}
        for k, s in SIG.items():
            r[k] = sum(1 for x in hits if s.search(x["win"]))
        rows.append(r)
    json.dump(rows, open(ROOT / "results/falls/credibility_signals.json", "w"), indent=1)
    cols = ["papers", "families", "span_days", "science", "specimen", "fragments", "hoax_marks", "hot"]
    print(f"{'event':44s} {'label':7s} " + " ".join(f"{c[:8]:>8s}" for c in cols))
    for r in rows:
        print(f"{r['event'][:44]:44s} {r['label']:7s} " + " ".join(f"{r[c]:8d}" for c in cols))


if __name__ == "__main__":
    main()
