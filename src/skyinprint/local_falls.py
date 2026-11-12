"""Third fall-reading queue: accepted fall reports that neither earlier queue reached.

specimen_rank.py reads a report first when it names where the stone went, and fireball_falls.py when it sits inside a
fireball seen from 2+ cities. A single local paper reporting a stone on a named farm, with no destination, is in neither
(2026-11-10: about 3,900 of the 6,250 sweep fall reports). This queue takes every such report and orders it by how much
it reads like local news about a physical object:
  same-state   the paper's state is named in the fall's place text (+2); another state is named instead (-1)
  paper-city   the place text names the paper's own town (+1)
  local        "this city", "near here", "last night" (+2)
  person       a named person or a named farm, yard or ranch (+3)
  phys         a weight, a hole, digging, a crust, metal, a specimen (+2)
  bad          tall-tale markers: tons, killed, molten, white-hot, hoax, "it is said" (-3)
Reports whose place text is abroad or at sea are dropped. Copies of one text are grouped (first 60 letters of the quote).
A report is tagged "known" when its place or quote names a famous recognized meteorite, so a reader can skip it.
Usage: python -m skyinprint.local_falls
Reads data/sweep/specimen_rank.json, data/sweep/fireball_falls.json, results/falls/ranker_holdout*_draw.json and the
sweep candidates; writes data/sweep/local_falls.json
"""
import collections
import csv
import glob
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
READ_CUT = 2  # specimen_rank's read cut (the early years were read down to 2 as well: batch tier2-1888)
STATES = ["Alabama", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
          "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
          "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
          "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
          "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee",
          "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "Dakota",
          "Indian Territory", "Alaska"]
FOREIGN = re.compile(
    r"\b(England|Scotland|Ireland|France|Germany|Russia|Siberia|India|China|Japan|Mexico|Brazil|Spain|Italy|Austria|"
    r"Hungary|Sweden|Norway|Africa|Australia|Canada|Ontario|Quebec|Manitoba|Greenland|Chil[ie]|Peru|Argentin|Turkey|"
    r"Egypt|Persia|Poland|Bohemia|Switzerland|Belgium|Holland|Denmark|Cuba|London|Paris|Berlin|Vienna|Bavaria|Prussia|"
    r"Saxony|Iceland|New Zealand|Java|Arabia|Syria|Finland|Colombia|Venezuela|Bolivia|Nova Scotia|New Brunswick|"
    r"British Columbia|Europe|Asia|Jamaica|Portugal|Greece|Serbia|Roumania|Bulgaria|Korea|Philippine|Hawaii|Honolulu|"
    r"Atlantic|Pacific|at sea|steamer|ship|schooner|bark)\b", re.I)
PERSON = re.compile(
    r"\b(Mr|Mrs|Dr|Prof|Capt|Col|Judge|Rev|Squire|Esq)\b\.? ?[A-Z]"
    r"|[A-Z][a-z]+'s (farm|place|yard|field|house|barn|ranch|lot|garden|pasture|residence|store)"
    r"|(farm|place|ranch|residence|yard|field|premises|plantation) of [A-Z]|[A-Z]\. ?[A-Z]\. [A-Z][a-z]+"
    r"|(farmer|man|boy) named [A-Z]")
LOCAL = re.compile(
    r"this (city|county|place|town|section|vicinity|neighborhood|village)|near here|\bhere\b"
    r"|miles? (north|south|east|west)\w* of (this|here|town|the city)|our (city|town|county)"
    r"|last (night|evening|week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)", re.I)
PHYS = re.compile(
    r"\b(pounds?|lbs?|ounces?|weigh|dug|picked up|found|piece|fragment|buried|hole|inches|feet deep|crust|black|iron|"
    r"metallic|magnet|nickel|specimen|analy)", re.I)
BAD = re.compile(
    r"\btons?\b|killed|molten|white[- ]hot|red[- ]hot|size of a (house|barn|hogshead|flour barrel)|acres|hoax|canard|"
    r"april fool|\bjoke\b|said to have|it is said|rumou?r", re.I)
# famous recognized meteorites that fill the wire copy; a tag for the reader, not a catalogue check
KNOWN = re.compile(
    r"Ca[nñ]on Diab|Canyon Diab|Coon Butte|Meteor Crater|Barringer|Willamette|Oregon City|Peary|Cape York|Ahnighito|"
    r"Estherville|Emmet+ county|Kiowa county|Brenham|Holbrook|Aztec|Bath Furnace|Felix|Allegan|Forest City|"
    r"Winnebago county|Homestead|Amana|Iowa county|New Concord|Guernsey|Weston|Paragould|Sylacauga|Johnstown|"
    r"Richardton|Plainview|Norton|Tucson|Cumberland Falls|Bath,? S|Farmington|Washington county, Kan|Cabin Creek|"
    r"Johnson county, Ark|Castalia|Nash county|Pultusk|Mazapil|Tilden|Colby|Rochester, Ind|Kunz|Ward", re.I)


def unread():
    """Accepted sweep fall reports that no read queue has reached."""
    done = {r["key"] for r in json.load(open(ROOT / "data/sweep/fireball_falls.json"))}
    for p in glob.glob(str(ROOT / "results/falls/ranker_holdout*_draw.json")):
        done |= set(json.load(open(p))["keys"])
    return [r for r in json.load(open(ROOT / "data/sweep/specimen_rank.json"))
            if r["score"] < READ_CUT and r["key"] not in done]


def main():
    rows_in = unread()
    keys = {r["key"] for r in rows_in}
    places = {r["lccn"]: r for r in csv.DictReader(open(ROOT / "reference/newspapers/lccn_places.csv"))}
    cands = {}
    for p in glob.glob(str(ROOT / "data/sweep/[0-9]*/candidates.jsonl")):
        for line in open(p):
            c = json.loads(line)
            k = f'{c["file"]}#{c["article_id"]}'
            if k in keys:
                cands[k] = c
    rows = []
    for r in rows_in:
        c = cands.get(r["key"])
        if not c:
            continue
        where, quote = r["where"] or "", r["quote"] or ""
        if FOREIGN.search(where):
            continue
        pl = places.get(c["lccn"], {})
        pstate, pcity = pl.get("state") or c.get("state") or "", pl.get("city") or ""
        both = where + " " + quote
        named = [s for s in STATES if re.search(rf"\b{s}\b", where)]
        s, why = 0, []
        if pstate and pstate in named:
            s += 2
            why.append("same-state")
        elif named:
            s -= 1
            why.append("other-state")
        if pcity and re.search(rf"\b{re.escape(pcity)}\b", where, re.I):
            s += 1
            why.append("paper-city")
        if LOCAL.search(where) or LOCAL.search(quote):
            s += 2
            why.append("local")
        if PERSON.search(both):
            s += 3
            why.append("person")
        if PHYS.search(quote):
            s += 2
            why.append("phys")
        if BAD.search(both):
            s -= 3
            why.append("bad")
        if r["score"] < 0:
            s -= 1
        if len(quote) < 40:
            s -= 2
        rows.append({"s": s, "why": why, "known": bool(KNOWN.search(both)), "key": r["key"], "date": c["date"],
                     "paper": c["title"][:50], "pstate": pstate, "where": where, "quote": quote, "rank": r["score"],
                     "lccn": c["lccn"], "page": c["page_seq"]})
    seen, out = {}, []
    for r in sorted(rows, key=lambda r: r["date"]):
        sig = re.sub(r"[^a-z]", "", r["quote"].lower())[:60]
        if sig and sig in seen:
            seen[sig]["copies"] += 1
            continue
        r["copies"] = 1
        seen[sig] = r
        out.append(r)
    out.sort(key=lambda r: (-r["s"], r["date"]))
    for i, r in enumerate(out):
        r["id"] = f"L{i + 1}"
    json.dump(out, open(ROOT / "data/sweep/local_falls.json", "w"), indent=0)
    print(f"{len(rows_in)} unread fall reports; {len(rows)} after dropping foreign; {len(out)} distinct texts")
    print("score distribution:", sorted(collections.Counter(r["s"] for r in out).items(), reverse=True))
    print("tagged known:", sum(r["known"] for r in out))
    return out


if __name__ == "__main__":
    main()
