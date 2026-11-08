import json, re, sys, glob
from pathlib import Path
ROOT = Path(sys.argv[1])
F = {f['name']: f for f in json.load(open('recall2.json'))}
names = sys.argv[2:]
CTX = r"(meteor|aerolit|fire ?ball|ball of fire|stone|fell from|fell in|sky|heavens|explosion|thunder)"
for n in names:
    f = F[n]; base = re.sub(r"\s*\(.*?\)", "", n).strip()
    rx = re.compile(rf"\b{re.escape(base)}\b.{{0,400}}{CTX}|{CTX}.{{0,400}}\b{re.escape(base)}\b", re.I | re.S)
    print("==", n, f["year"])
    shown = 0
    for yy in (f["year"], f["year"] + 1):
        for d in glob.glob(str(ROOT / f"data/*/{yy}/candidates.jsonl")):
            tri = {}
            tp = Path(d).parent / "triage_v2.jsonl"
            if tp.exists():
                for l in open(tp):
                    r = json.loads(l)
                    if "out" in r: tri[r["key"]] = r["out"]
            for l in open(d):
                c = json.loads(l); txt = (c.get("headline") or "") + "\n" + (c.get("text") or "")
                m = rx.search(txt)
                if not m or shown >= 4: continue
                o = tri.get(f'{c["file"]}#{c["article_id"]}', {})
                s = max(0, m.start() - 80)
                print("  ", c["date"], o.get("type"), o.get("observation"), "|", re.sub(r"\s+", " ", txt[s:m.end() + 80])[:330])
                shown += 1
