"""Fireball events (spec §10 output 1): group accepted fireball reports into events and extract physical fields.

Steps:
  1. Reports: accepted v2 triage records of type fireball / meteor / other_sky / meteorite_fall.
  2. Event date: estimated from the model's when_text relative to the print date ("last evening" = day before,
     a weekday = most recent such day, "the 14th" = that day). Unparsed reports get a 14-day window before printing.
  3. Reprint families: one family = one source text. Whole-column similarity misses short copied dispatches, so
     copies are found on character 5-grams (tolerant of OCR errors) of the text near the sighting: the +/-300
     characters around the model's quote (>= WIN_SIM) or the quote itself (>= QUOTE_SIM).
  4. Events: families whose event-date windows overlap, both windows at most MAX_SPAN days wide, and whose
     newspapers lie within MAX_KM of each other. Shower nights are flagged, since unrelated meteors share them.
  5. Fields counted per event from the article excerpts: time of day, direction of travel, sound, duration,
     colour, train, bursting, stones.
Independence = number of reprint families from distinct newspaper cities (copies of one text count once).
Usage: python -m skyinprint.fireballs
Writes data/work/fireball_events.json and results/fireballs/events.md
"""
import calendar
import csv
import datetime as dt
import glob
import json
import math
import re
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer

from skyinprint.load_triage import load

ROOT = Path(__file__).resolve().parents[2]
TYPES = ("fireball", "meteor", "other_sky", "meteorite_fall")
WIN_SIM, QUOTE_SIM, MAX_DAYS = 0.3, 0.5, 180
METEOR = re.compile(r"meteor|aerolite|fire.?ball|ball of fire", re.I)
MAX_SPAN, MAX_KM = 3, 1200
SHOWERS = {(8, d) for d in range(9, 14)} | {(11, d) for d in range(12, 16)} | {(11, d) for d in range(26, 29)}

WEEKDAYS = {d.lower(): i for i, d in enumerate(calendar.day_name)}
MONTHS = {m.lower(): i for i, m in enumerate(calendar.month_name) if m}
MONTHS.update({m.lower(): i for i, m in enumerate(calendar.month_abbr) if m})
FIELDS = {
    "time": re.compile(r"\b\d{1,2}(:\d\d)?\s*o'?\s*clock|\b\d{1,2}(:\d\d)?\s*[ap]\.\s?m\b|half past|quarter (past|to|before)|midnight|dusk|twilight|daybreak", re.I),
    "direction": re.compile(r"from (the )?(north|south|east|west)\w*|(north|south|east|west)\w*(ward| direction)|towards? the (north|south|east|west)", re.I),
    "sound": re.compile(r"explo(sion|ded)|detonation|report(s)? (like|as of|resembling)|loud report|rumbl|concussion|like (the )?(discharge|thunder|cannon)|reverberat", re.I),
    "duration": re.compile(r"\b(\d+|a few|several|two|three|four|five|ten)\s+seconds|instant", re.I),
    "colour": re.compile(r"\b(blue|bluish|green|greenish|red|reddish|violet|purple|crimson|orange|yellow)\b", re.I),
    "train": re.compile(r"\btrain\b|\btrail\b|\btail\b|streak", re.I),
    "burst": re.compile(r"\bburst|broke (in|into) (pieces|fragments)|into fragments|divided into|separated into", re.I),
    "lit_ground": re.compile(r"light as day|bright as day|lit up|illumin|as light as|brilliant(ly)? lighted", re.I),
}


def event_window(when, printed):
    """(lo, hi) dates for when the sighting happened, from when_text and the print date."""
    w = (when or "").lower()
    if re.search(r"last (evening|night)|yesterday|night before last", w):
        d = printed - dt.timedelta(days=2 if "before last" in w else 1)
        return d, d
    if re.search(r"this (morning|evening)|to-?night|to-?day", w):
        return printed - dt.timedelta(days=1), printed  # weeklies and late editions blur same-day words
    m = re.search(r"(" + "|".join(MONTHS) + r")\.?\s+(\d{1,2})\b", w)
    if m:
        mo, day = MONTHS[m.group(1)], int(m.group(2))
        for yr in (printed.year, printed.year - 1):
            try:
                d = dt.date(yr, mo, day)
            except ValueError:
                break
            if d <= printed:
                return d, d
    m = re.search(r"\b(\d{1,2})(st|nd|rd|th)\b", w)
    if m:
        day = int(m.group(1))
        y, mo = printed.year, printed.month
        if day > printed.day:
            y, mo = (y - 1, 12) if mo == 1 else (y, mo - 1)
        try:
            d = dt.date(y, mo, day)
            return d, d
        except ValueError:
            pass
    for name, i in WEEKDAYS.items():
        if name in w:
            back = (printed.weekday() - i) % 7 or 7
            if "last" not in w and back == 7:
                back = 0
            d = printed - dt.timedelta(days=back)
            if re.search(r"\blast\b|week ago", w) and back >= 2:
                return d - dt.timedelta(days=7), d  # a weekly's "last Saturday" can be a week further back
            return d, d
    if re.search(r"last week", w):
        return printed - dt.timedelta(days=13), printed - dt.timedelta(days=5)
    return printed - dt.timedelta(days=14), printed


def near_text(text, quote):
    p = text.find(quote[:60]) if quote else -1
    if p < 0:
        m = METEOR.search(text)
        p = m.start() if m else 0
    return text[max(0, p - 300): p + len(quote) + 300].lower()


def km(a, b):
    (la1, lo1), (la2, lo2) = a, b
    p = math.pi / 180
    h = math.sin((la2 - la1) * p / 2) ** 2 + math.cos(la1 * p) * math.cos(la2 * p) * math.sin((lo2 - lo1) * p / 2) ** 2
    return 12742 * math.asin(math.sqrt(h))


def find(parent, i):
    while parent[i] != i:
        parent[i] = parent[parent[i]]
        i = parent[i]
    return i


def main():
    R = load()
    places = {r["lccn"]: r for r in csv.DictReader(open(ROOT / "reference/newspapers/lccn_places.csv")) if r["lat"]}
    cands = {}
    for p in glob.glob(str(ROOT / "data/work/*/candidates.jsonl")):
        if "/1859/" in p:
            continue
        for x in map(json.loads, open(p)):
            cands[f"{x['file']}#{x['article_id']}"] = x
    items = []
    for k, r in R.items():
        o = r.get("out") or {}
        if k not in cands or not o.get("observation") or o.get("type") not in TYPES or o.get("doubtful"):
            continue
        x = cands[k]
        off, n = r.get("excerpt_offset", 0), r.get("excerpt_len", len(x["text"]))
        printed = dt.date.fromisoformat(x["date"])
        lo, hi = event_window(o.get("when_text"), printed)
        pl = places.get(x["lccn"])
        items.append({"key": k, "date": x["date"], "lccn": x["lccn"], "title": x["title"], "state": x["state"],
                      "window": x["windows"][0], "type": o["type"], "when": o.get("when_text") or "",
                      "where": o.get("where_text") or "", "quote": o.get("quote") or "", "scan": x.get("scan_url", ""),
                      "lo": lo, "hi": hi, "dated": lo == hi or (hi - lo).days <= 1,
                      "city": f"{pl['city']}, {pl['state']}" if pl else x["lccn"],
                      "ll": (float(pl["lat"]), float(pl["lon"])) if pl else None,
                      "text": re.sub(r"\s+", " ", x["text"][off:off + n])})

    # 3. reprint families
    vec = lambda texts: TfidfVectorizer(analyzer="char_wb", ngram_range=(5, 5), sublinear_tf=True).fit_transform(texts)
    W = vec([near_text(it["text"], it["quote"]) for it in items])
    Q = vec([it["quote"].lower() or near_text(it["text"], "") for it in items])
    parent = list(range(len(items)))
    for M, cut in ((W, WIN_SIM), (Q, QUOTE_SIM)):
        S = (M @ M.T).tocoo()
        for i, j, s in zip(S.row, S.col, S.data):
            if i < j and s >= cut and abs((items[i]["lo"] - items[j]["lo"]).days) <= MAX_DAYS:
                parent[find(parent, i)] = find(parent, j)
    fams = {}
    for i in range(len(items)):
        fams.setdefault(find(parent, i), []).append(i)
    fam = []
    for members in fams.values():
        # the family's date is the narrowest window among its copies; its place is the first printing's paper
        best = min(members, key=lambda i: ((items[i]["hi"] - items[i]["lo"]).days, items[i]["date"]))
        first = min(members, key=lambda i: items[i]["date"])
        fam.append({"members": members, "lo": items[best]["lo"], "hi": items[best]["hi"],
                    "ll": items[first]["ll"] or next((items[i]["ll"] for i in members if items[i]["ll"]), None),
                    "city": items[first]["city"]})

    # 4. events: link dated families with overlapping windows and nearby papers
    p2 = list(range(len(fam)))
    dated = [i for i, f in enumerate(fam) if (f["hi"] - f["lo"]).days <= MAX_SPAN]
    dated.sort(key=lambda i: fam[i]["lo"])
    for a_i, a in enumerate(dated):
        for b in dated[a_i + 1:]:
            if fam[b]["lo"] > fam[a]["hi"]:
                break
            fa, fb = fam[a], fam[b]
            if fa["ll"] and fb["ll"] and km(fa["ll"], fb["ll"]) <= MAX_KM:
                p2[find(p2, a)] = find(p2, b)
    # a family dated only to within a week joins the one nearby dated event inside its window with the most
    # families, rather than linking to all of them (which would chain separate events together)
    size = {}
    for i in dated:
        size[find(p2, i)] = size.get(find(p2, i), 0) + 1
    for w in (i for i, f in enumerate(fam) if MAX_SPAN < (f["hi"] - f["lo"]).days <= 8 and f["ll"]):
        fw = fam[w]
        near = [i for i in dated if fw["lo"] <= fam[i]["lo"] <= fw["hi"] and fam[i]["ll"]
                and km(fw["ll"], fam[i]["ll"]) <= MAX_KM]
        if near:
            best = max(near, key=lambda i: (size[find(p2, i)], fam[i]["lo"]))
            p2[find(p2, w)] = find(p2, best)
    ev = {}
    for i in range(len(fam)):
        ev.setdefault(find(p2, i), []).append(i)

    events = []
    for fis in ev.values():
        its = [items[m] for fi in fis for m in fam[fi]["members"]]
        span = min((fam[fi]["hi"] - fam[fi]["lo"]).days for fi in fis)
        core = [fi for fi in fis if (fam[fi]["hi"] - fam[fi]["lo"]).days == span]  # date from the best-dated families
        votes = {}
        for fi in core:
            votes[fam[fi]["lo"]] = votes.get(fam[fi]["lo"], 0) + 1
        best_day = max(votes, key=lambda d: (votes[d], d))  # most families agree on it; ties go to the later day
        lo, hi = best_day, best_day + dt.timedelta(days=span)
        e_range = (min(fam[fi]["lo"] for fi in fis), max(fam[fi]["hi"] for fi in fis))
        if lo > hi:
            lo, hi = min(fam[fi]["lo"] for fi in fis), max(fam[fi]["hi"] for fi in fis)
        indep = len({fam[fi]["city"] for fi in fis})
        e = {"date_lo": str(lo), "date_hi": str(hi), "dated": (hi - lo).days <= 1,
             "date_votes": votes[best_day], "date_families": len(core),
             "date_range_all": [str(d) for d in e_range],
             "shower_night": any((d.month, d.day) in SHOWERS for d in (lo, hi)),
             "window": its[0]["window"], "reports": len(its), "papers": len({i["lccn"] for i in its}),
             "families": len(fis), "independent_cities": indep,
             "cities": sorted({fam[fi]["city"] for fi in fis})[:12],
             "states": sorted({i["state"] for i in its if i["state"]}),
             "types": sorted({i["type"] for i in its}),
             "fireball": any(i["type"] != "other_sky" for i in its),
             "stones": any(i["type"] == "meteorite_fall" for i in its),
             "fields": {k: sum(1 for fi in fis if any(rx.search(items[m]["text"]) for m in fam[fi]["members"]))
                        for k, rx in FIELDS.items()},
             "quotes": [{"date": i["date"], "paper": i["title"][:60], "when": i["when"], "where": i["where"],
                         "quote": i["quote"], "scan": i["scan"], "key": i["key"]}
                        for i in sorted(its, key=lambda i: i["date"])][:8]}
        lls = [fam[fi]["ll"] for fi in fis if fam[fi]["ll"]]
        e["spread_km"] = round(max((km(a, b) for a in lls for b in lls), default=0))
        events.append(e)
    events.sort(key=lambda e: (-e["independent_cities"], -e["reports"]))
    json.dump(events, open(ROOT / "data/work/fireball_events.json", "w"), indent=1)
    return items, fam, events


if __name__ == "__main__":
    items, fam, events = main()
    print(f"{len(items)} reports -> {len(fam)} families -> {len(events)} events")
    events = [e for e in events if e["fireball"]]
    multi = [e for e in events if e["independent_cities"] >= 2]
    print("events with >=2 independent cities:", len(multi), " >=3:", sum(e["independent_cities"] >= 3 for e in events))
    for e in events[:25]:
        print(e["date_lo"], e["date_hi"], e["independent_cities"], e["reports"], e["spread_km"], e["shower_night"],
              ",".join(e["states"])[:70])
