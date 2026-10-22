"""Load v2 triage results: last record per article, manual labels override, errors excluded."""
import glob
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load(year=None, workdir="work"):
    recs = {}
    pat = f"data/{workdir}/{year}/triage_v2.jsonl" if year else f"data/{workdir}/*/triage_v2.jsonl"
    for p in sorted(glob.glob(str(ROOT / pat))):
        for line in open(p):
            r = json.loads(line)
            if "error" in r and r["key"] in recs:
                continue
            recs[r["key"]] = r
    for p in glob.glob(str(ROOT / "results/manual/*.jsonl")):
        for line in open(p):
            m = json.loads(line)
            if m["key"] in recs or year is None:
                recs[m["key"]] = {**recs.get(m["key"], {}), **m}
                recs[m["key"]].pop("error", None)
    return recs
