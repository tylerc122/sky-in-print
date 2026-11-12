"""Fetch the newspaper scan for each followed case and crop it to the article.

For every case below, this pulls the page from the Library of Congress (IIIF images
plus ALTO word coordinates), finds the article from a few keywords, crops it, and
picks up to two lines to pencil-mark. Pages whose OCR is too garbled to search get
a crop typed in by hand (`crop`, in full-size image pixels).

Writes site/assets/scans/<id>.jpg (the clipping), site/assets/scans/<id>-page.jpg (a
small whole page for the film strip) and site/data/scans.js.

    python3 scripts/fetch_scans.py            # all cases
    python3 scripts/fetch_scans.py saco thomson
"""

import json
import re
import sys
import time
import urllib.request
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent / "site"
OUT = SITE / "assets" / "scans"
UA = {"User-Agent": "sky-in-print scan fetcher (personal research project)"}
PAUSE = 2.5  # seconds between requests, to stay well inside loc.gov's rate limits
CROP_W = 900  # downloaded clipping width in pixels

# url: the loc.gov page the case cites. words: what to search the OCR for, most telling first.
# crop: [x, y, w, h] in IIIF pixels, set by hand where the OCR search lands badly.
# brackets: [y0, y1] ranges in crop pixels for the pencil bracket, placed by eye (mark is the fallback).
CASES = {
    "saco": {
        "url": "https://www.loc.gov/resource/sn82014248/1873-11-20/ed-1/?sp=3",
        "paper": "Daily Kennebec Journal, Nov. 20, 1873, p. 3",
        "words": ["meteoric", "York"],
        "mark": ["meteor in", "whizzing"],
        "crop": [4320, 5880, 780, 960],
        "brackets": [[205, 470]],
    },
    "laclede": {
        "url": "https://www.loc.gov/resource/sn84024670/1872-08-10/ed-1/?sp=3",
        "paper": "Daily State Journal, Aug. 10, 1872, p. 3",
        "words": ["Murdoch", "meteor", "Mercantile"],
        "mark": ["meteor", "Mercantile"],
        "crop": [90, 380, 690, 1640],
        "brackets": [[280, 570], [775, 850], [1245, 1295]],
    },
    "homestead": {
        "url": "https://www.loc.gov/resource/sn84031492/1875-02-14/ed-1/?sp=2",
        "paper": "Knoxville Journal, Feb. 14, 1875, p. 2",
        "words": ["meteor", "Homestead", "Iowa"],
        "mark": ["meteor"],
        "brackets": [[300, 640]],
    },
    "rochester": {
        "url": "https://www.loc.gov/resource/sn84026844/1876-12-22/ed-1/?sp=1",
        "paper": "Wheeling Daily Intelligencer, Dec. 22, 1876, p. 1",
        "words": ["meteor", "Rochester"],
        "mark": ["meteor"],
        "brackets": [[315, 615]],
    },
    "newton": {
        "url": "https://www.loc.gov/resource/sn87056243/1879-01-23/ed-1/?sp=1",
        "paper": "Plymouth Democrat, Jan. 23, 1879, p. 1",
        "words": ["meteor", "killed"],
        "mark": ["meteor", "killed"],
        "crop": [3080, 1360, 900, 3010],
        "brackets": [[0, 300], [2110, 2700]],
    },
    "estherville": {
        "url": "https://www.loc.gov/resource/sn84022144/1879-05-13/ed-1/?sp=4",
        "paper": "Daily Press and Dakotaian, May 13, 1879, p. 4",
        "words": ["Estherville", "meteor"],
        "mark": ["meteor", "Estherville"],
        "brackets": [[320, 650]],
    },
    "schroon": {
        "url": "https://www.loc.gov/resource/sn84024738/1880-09-28/ed-1/?sp=2",
        "paper": "Daily Dispatch, Sept. 28, 1880, p. 2",
        "words": ["Schroon", "meteor", "cottage"],
        "mark": ["meteor", "Schroon"],
        "brackets": [[187, 495]],
    },
    "st-joseph": {
        "url": "https://www.loc.gov/resource/sn99068076/1887-06-24/ed-1/?sp=1",
        "paper": "Kimball Graphic, June 24, 1887, p. 1",
        "words": ["aerolite", "meteor", "Joseph"],
        "mark": ["aerolite", "tons"],
        "brackets": [[320, 560]],
    },
    "amsterdam": {
        "url": "https://www.loc.gov/resource/sn86091092/1888-01-28/ed-1/?sp=3",
        "paper": "Caldwell Tribune, Jan. 28, 1888, p. 3",
        "words": ["aerolite", "Amsterdam", "wagon"],
        "mark": ["aerolite", "wagon"],
        "brackets": [[150, 345]],
    },
    "middleburg": {
        "url": "https://www.loc.gov/resource/sn89070049/1888-01-07/ed-1/?sp=4",
        "paper": "Palatka Daily News, Jan. 7, 1888, p. 4",
        "words": ["meteoric", "Middleburg"],
        "mark": ["meteoric", "Middleburg"],
        "brackets": [[265, 500]],
    },
    "thomson": {
        "url": "https://www.loc.gov/resource/sn86063034/1888-11-07/ed-1/?sp=6",
        "paper": "Savannah Morning News, Nov. 7, 1888, p. 6",
        "words": ["Meteor", "whizzing"],
        "mark": ["Meteor Found", "whizzing"],
        "crop": [330, 560, 740, 660],
        "brackets": [[250, 320], [470, 565]],
    },
    "jonesboro": {
        "url": "https://www.loc.gov/resource/sn93055779/1914-12-11/ed-1/?sp=2",
        "paper": "Cairo Bulletin, Dec. 11, 1914, p. 2",
        "words": ["meteorite", "Cook"],
        "mark": ["meteorite"],
        "crop": [400, 1290, 680, 1880],
        "brackets": [[555, 750], [1640, 1795]],
    },
}


def get(url, binary=False):
    time.sleep(PAUSE)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "ignore")


def attrs(tag):
    return dict(re.findall(r'(\w+)="([^"]*)"', tag))


def num(a, key):
    return float(a.get(key, 0) or 0)


def parse_alto(alto, k):
    """Blocks with their lines and words, in image pixels."""
    blocks = []
    for b in re.finditer(r"<TextBlock ([^>]*)>(.*?)</TextBlock>", alto, re.S):
        ba = attrs(b.group(1))
        lines = []
        for ln in re.finditer(r"<TextLine ([^>]*)>(.*?)</TextLine>", b.group(2), re.S):
            la = attrs(ln.group(1))
            words = [attrs(w.group(0)) for w in re.finditer(r"<String [^>]*/?>", ln.group(2))]
            lines.append(
                {
                    "box": [num(la, "HPOS") * k, num(la, "VPOS") * k, num(la, "WIDTH") * k, num(la, "HEIGHT") * k],
                    "text": " ".join(w.get("CONTENT", "") for w in words),
                }
            )
        blocks.append(
            {
                "box": [num(ba, "HPOS") * k, num(ba, "VPOS") * k, num(ba, "WIDTH") * k, num(ba, "HEIGHT") * k],
                "lines": lines,
            }
        )
    return blocks


def find_crop(blocks, words, W, H):
    """The block where the keywords cluster, cut down to the part around them."""
    best, best_score, anchor = None, 0, None
    for b in blocks:
        text = " ".join(l["text"] for l in b["lines"]).lower()
        score = sum(3 if i == 0 else 1 for i, w in enumerate(words) if w.lower() in text)
        if score > best_score:
            best, best_score = b, score
            hit = next(
                (l for l in b["lines"] if words[0].lower() in l["text"].lower()),
                next((l for l in b["lines"] if any(w.lower() in l["text"].lower() for w in words)), None),
            )
            anchor = hit["box"][1] if hit else b["box"][1]
    if not best:
        return None
    # crop the column around the keyword line, not the OCR block: blocks are often a single paragraph
    bx, by, bw, bh = best["box"]
    margin = 24
    y0 = max(0, anchor - 320)
    y1 = min(H, anchor + 700)
    x = max(0, bx - margin)
    return [round(x), round(y0), round(min(W - x, max(bw, 560) + 2 * margin)), round(y1 - y0)]


def marks_for(blocks, crop, mark_words):
    """Up to two lines inside the crop that carry the marked words, as [x, y, w] underlines."""
    cx, cy, cw, ch = crop
    out = []
    for word in mark_words:
        for b in blocks:
            for l in b["lines"]:
                x, y, w, h = l["box"]
                inside = cx - 12 <= x <= cx + cw and cy <= y and y + h <= cy + ch
                if inside and word.lower() in l["text"].lower():
                    u = [round(max(0, x - cx)), round(y - cy + h + 4), round(min(w, cw - max(0, x - cx)))]
                    if u not in out:
                        out.append(u)
                    break
            else:
                continue
            break
    return out[:2]


def merge(ranges):
    out = []
    for a, b in sorted(ranges):
        if out and a <= out[-1][1] + 10:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def fetch(cid, spec):
    meta = json.loads(get(spec["url"] + ("&" if "?" in spec["url"] else "?") + "fo=json"))
    page = meta["page"]
    jp2 = next(p for p in page if p.get("mimetype") == "image/jp2")
    xml = next(p["url"] for p in page if p.get("mimetype") == "text/xml")
    base = jp2["info"].rsplit("/info.json", 1)[0]
    # the IIIF service can serve a smaller image than the jp2 metadata says, so ask it for the real size
    info = json.loads(get(jp2["info"]))
    W, H = info["width"], info["height"]
    alto = get(xml)
    pw = num(attrs(re.search(r"<Page [^>]*>", alto).group(0)), "WIDTH")
    blocks = parse_alto(alto, W / pw)
    crop = spec.get("crop") or find_crop(blocks, spec["words"], W, H)
    if not crop:
        print(f"  {cid}: no keywords found, needs a hand crop")
        return None
    x, y, w, h = crop
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{cid}.jpg").write_bytes(get(f"{base}/{x},{y},{w},{h}/{min(CROP_W, w)},/0/default.jpg", True))
    (OUT / f"{cid}-page.jpg").write_bytes(get(f"{base}/full/300,/0/default.jpg", True))
    marks = marks_for(blocks, crop, spec.get("mark", []))
    # OCR line positions drift by about a line, so mark whole passages with a margin bracket
    brackets = spec.get("brackets") or merge([[max(0, m[1] - 80), min(h, m[1] + 20)] for m in marks])
    print(f"  {cid}: crop {crop}, brackets {brackets}")
    return {
        "src": f"assets/scans/{cid}.jpg",
        "page": f"assets/scans/{cid}-page.jpg",
        "w": w,
        "h": h,
        # where the clipping sits on the page, as fractions, so the lens can zoom from the page to it
        "at": [round(x / W, 4), round(y / H, 4), round(w / W, 4), round(h / H, 4)],
        "brackets": brackets,
        "paper": spec["paper"],
        "url": spec["url"],
    }


def main():
    only = sys.argv[1:]
    out_file = SITE / "data" / "scans.js"
    scans = {}
    if out_file.exists():
        scans = json.loads(out_file.read_text().split("=", 1)[1].rstrip().rstrip(";"))
    for cid, spec in CASES.items():
        if only and cid not in only:
            continue
        try:
            got = fetch(cid, spec)
        except Exception as e:  # keep going; one bad page shouldn't stop the rest
            print(f"  {cid}: failed ({e})")
            continue
        if got:
            scans[cid] = got
    out_file.write_text("window.SKY_SCANS = " + json.dumps(scans, indent=1) + ";\n")
    print(f"wrote {out_file.relative_to(SITE.parent)} with {len(scans)} scans")


if __name__ == "__main__":
    main()
