"""Build a human review page from a list of items, with sentence-boundary excerpts and per-item timing.

Each item: {id, title?, section?, paper, date, text (full article), scan, q, opts, centre?}. The page records the
answer, seconds since the previous answer (capped at 15 minutes for breaks) and how many times the scan was opened,
and exports them as TSV. Read the TSV back with read_answers().
Usage (from code): build(items, out_path, title, lede)
"""
import json
from pathlib import Path

from skyinprint.excerpts import display

HERE = Path(__file__).resolve().parent


def build(items, out, title, lede, store=None):
    rows = []
    for it in items:
        r = {k: v for k, v in it.items() if k not in ("text", "centre")}
        r["text"] = display(it["text"], it.get("centre"))
        rows.append(r)
    html = (HERE / "review_template.html").read_text()
    data = json.dumps(rows, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace("__DATA__", data).replace("__TITLE__", title).replace("__LEDE__", lede)
    html = html.replace("__STORE__", store or "sip-review-" + Path(out).stem)
    Path(out).write_text(html)
    return out


def read_answers(tsv_text):
    """Parse the copied answers: {id: {answer, seconds, scans, note}}."""
    out = {}
    for line in tsv_text.strip().splitlines()[2:]:
        f = line.split("\t") + [""] * 5
        out[f[0]] = {"answer": f[1], "seconds": int(f[2]) if f[2].isdigit() else None,
                     "scans": int(f[3] or 0), "note": f[4]}
    return out
