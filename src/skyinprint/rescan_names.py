"""Targeted rescan (spec §4.1/§5): stream whole years at the pinned revision and keep every article that
mentions a lead's names or places, with or without a meteor keyword. Archives are deleted afterwards.

Usage: python -m skyinprint.rescan_names 1890 1891 ... [--only <lead prefix>]
Writes data/work/rescans/<year>.jsonl
"""
import json
import re
import sys
import tarfile
from pathlib import Path

from skyinprint.run_pilot_downloads import MAN, sha256
from huggingface_hub import hf_hub_download

ROOT = Path(__file__).resolve().parents[2]
TERMS = {
    "yakima_wenas_1890": r"\bwenas\b|richard lisk|\blisk\b.{0,80}(meteor|aerolite)|(meteor|aerolite).{0,200}yakima",
    "hooper_neb_1911": r"mary stuck|mrs\.? stuck|(meteor|aerolite).{0,200}hooper|hooper.{0,200}(meteor|aerolite)|mohler.{0,200}(meteor|aerolite)",
    "washington_island_1914": r"gullickson|washington island.{0,300}(meteor|aerolite)|(meteor|aerolite).{0,300}washington island",
    "jonesboro_ill_1914": r"a\.? ?v\.? cook.{0,300}(meteor|aerolite)|(meteor|aerolite).{0,300}jonesboro",
    "wakefield_1911": r"alfred h\.? richards|(meteor|aerolite).{0,200}wakefield",
    # recorded 1877 falls the pilot missed: is the corpus missing them, or did the keyword filter miss them?
    "cynthiana_1877": r"cynthiana.{0,400}(meteor|aerolit|stone|fell|sky|heavens)|(meteor|aerolit|stone|fell|sky|heavens).{0,400}cynthiana",
    "warrenton_1877": r"warrenton.{0,400}(meteor|aerolit|stone|fell|sky|heavens)|(meteor|aerolit|stone|fell|sky|heavens).{0,400}warrenton",
    # Saco 1870 (Capt. Ira C. Doe): the fall itself, his 1873 gift and the 1891 accession (1891.68), in any wording
    "saco_doe": r"york institute|ira c\.? doe|capt(ain|\.)? (ira )?doe\b|\bdoe\b.{0,300}(meteor|aerolit|stone|sky|heavens)"
                r"|(meteor|aerolit|fire ?ball|ball of fire|shooting star).{0,300}\bsaco\b|\bsaco\b.{0,300}(meteor|aerolit|fire ?ball|ball of fire)",
    # Rawlett's place, 15 mi N of Dallas, Mar 1878: any Rawlett/Rowlett mention, or a meteor near Dallas-area names
    "rawlett_1878": r"\br[ao]u?wlett?s?\b|(meteor|aerolit).{0,400}(dallas|collin|plano|richardson|mckinney)"
                    r"|(dallas|collin|plano|richardson|mckinney).{0,400}(meteor|aerolit)",
}
# Keyword-filter recall test (2026-11-08): recorded falls with local paper coverage but no keyword candidate.
# Each name within 400 chars of any sky/stone/fall word, in either order, like the 1877 Cynthiana check.
_SKY = r"(meteor|aerolit|stone|rock|fell|fall|sky|heavens|explosion|exploded|report|thunder|light|fire|flash|ball)"
SKY_RX = re.compile(_SKY, re.I)
NEAR = {}  # key -> name regex; matched as "name, then a sky word within 400 chars either side" (fast two-step)
for _key, _names in {
    "filt_bradford_woods_1886": r"bradford woods|(sewickley|bakerstown|wexford)",
    "filt_cross_roads_1892": r"cross roads|wilson county|(black creek|stantonsburg)",
    "filt_palahatchie_1910": r"palahatchie|pelahatchie|rankin county",
    "filt_moore_county_1913": r"moore county|carthage, n",
    "filt_norfork_1918": r"norfork|baxter county|mountain home, ark",
    "filt_richardton_1918": r"richardton|\bmott\b|stark county|hebron, n",
    "filt_st_marys_1919": r"st\.? mary'?s county|leonardtown",
    "filt_baldwyn_1922": r"baldwyn|lee county, miss|tupelo",
}.items():
    NEAR[_key] = re.compile(_names, re.I)
RX = {k: re.compile(v, re.I | re.S) for k, v in TERMS.items()}


def near_hit(rx, t):
    for m in rx.finditer(t):
        if SKY_RX.search(t, max(0, m.start() - 400), m.end() + 400):
            return True
    return False


def scan(year, only=None):
    """only: a lead-name prefix; scans just those terms and writes <year>_<only>.jsonl, so a new lead can be
    rescanned in a year that already has a rescan file."""
    global RX, NEAR
    if only:
        RX = {k: rx for k, rx in RX.items() if k.startswith(only)}
        NEAR = {k: rx for k, rx in NEAR.items() if k.startswith(only)}
    out = ROOT / "data/work/rescans" / (f"{year}_{only}.jsonl" if only else f"{year}.jsonl")
    if out.exists():
        print(year, "done already", flush=True)
        return
    out.parent.mkdir(parents=True, exist_ok=True)
    fname = f"faro_{year}.tar.gz"
    p = hf_hub_download(MAN["repo"], fname, repo_type="dataset", revision=MAN["revision"], local_dir=ROOT / "data/raw")
    want = MAN["files"][fname]["sha256"]
    if want and sha256(p) != want:
        raise SystemExit(f"hash mismatch {fname}")
    n = 0
    tmp = out.with_suffix(".tmp")
    with tarfile.open(p) as tf, open(tmp, "w") as f:
        for m in tf:
            if not m.isfile() or not m.name.endswith(".json"):
                continue
            d = json.load(tf.extractfile(m))
            base = m.name.split("/")[-1][:-5].split("_")
            for a in d.get("full articles", []):
                t = a.get("article") or ""
                hit = [k for k, rx in RX.items() if rx.search(t)] + [k for k, rx in NEAR.items() if near_hit(rx, t)]
                if hit:
                    n += 1
                    f.write(json.dumps({"year": year, "date": base[0], "page_seq": base[1].lstrip("p"), "lccn": base[2],
                                        "edition": (d.get("edition") or {}).get("edition", "ed-01"),
                                        "title": (d.get("lccn") or {}).get("title", ""), "leads": hit,
                                        "headline": a.get("headline", ""), "text": t}) + "\n")
    tmp.replace(out)
    Path(p).unlink()
    print(year, "hits", n, flush=True)


if __name__ == "__main__":
    args = sys.argv[1:]
    only = args[args.index("--only") + 1] if "--only" in args else None
    for y in [a for a in args if a.isdigit()]:
        scan(int(y), only)
