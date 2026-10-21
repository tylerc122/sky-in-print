"""Run v2 triage on every article in the pre-drawn manual-search issues (no keyword filter). Resumable.

Usage: python -m skyinprint.triage_manual
Writes data/work/<year>/manual_triage_v2.jsonl for each ordinary-window year.
"""
import json
import time
from pathlib import Path

from skyinprint import flint, triage

ROOT = Path(__file__).resolve().parents[2]
YEARS = [1844, 1849, 1851, 1852, 1863, 1880, 1893, 1911, 1914, 1916]
PROMPT = (ROOT / "prereg" / "triage_prompt_v2.md").read_text()

digest = flint.model_digest()
for y in YEARS:
    src = ROOT / "data" / "work" / str(y) / "manual_issues.jsonl"
    out = ROOT / "data" / "work" / str(y) / "manual_triage_v2.jsonl"
    done = {json.loads(l)["key"] for l in open(out)} if out.exists() else set()
    arts = [json.loads(l) for l in open(src)]
    print(y, len(arts), "articles,", len(done), "done", flush=True)
    with open(out, "a") as f:
        for n, a in enumerate(arts):
            key = f"{a['file']}#{a['article_id']}"
            if key in done or not (a.get("text") or "").strip():
                continue
            if n % 25 == 0:
                flint.wait_for_turn(log=lambda s: print(s, flush=True))
            text, off = triage.excerpt(a["text"], a.get("headline", ""))
            user = f"Newspaper: {a['lccn']}\nPrinted: {a['date']}\nHeadline: {a.get('headline','')}\n\nArticle text:\n{text}"
            rec = {"key": key, "window": a["window"], "issue": a["issue"], "model_digest": digest}
            for attempt in range(3):
                try:
                    o, dt, _ = flint.chat_json(PROMPT, user)
                    rec.update(out=o, seconds=round(dt, 2))
                    break
                except Exception as e:
                    rec["error"] = f"{type(e).__name__}"
                    time.sleep(20)
            f.write(json.dumps(rec) + "\n")
            f.flush()
print("manual-issue triage done", flush=True)
