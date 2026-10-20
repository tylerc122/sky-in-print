"""Parse NASA Five Millennium eclipse catalog pages into one CSV (date, type, kind)."""
import csv
import glob
import re

MON = {m: i for i, m in enumerate("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(), 1)}
row = re.compile(r"^\s*(?:<a[^>]*>)?\d{5}(?:</a>)?\s+(?:<a[^>]*>)?\s*(\d{4}) (\w{3}) (\d{2})(?:</a>)?\s+(?:<a[^>]*>)?(\d{2}:\d{2}:\d{2})(?:</a>)?"
                 r"\s+-?\d+\s+-?\d+\s+(?:<a[^>]*>)?\s*\d+(?:</a>)?\s+(\w+)")
out = []
for path in sorted(glob.glob("reference/eclipses/*.html")):
    kind = "solar" if "/SE" in path else "lunar"
    for line in open(path, encoding="latin-1"):
        m = row.match(line)
        if m:
            y, mo, d, t, typ = m.groups()
            out.append([f"{y}-{MON[mo]:02d}-{d}", t, kind, typ])
with open("reference/eclipses/eclipses_1701_2000.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["date_tdt", "greatest_eclipse_td", "kind", "type"])
    w.writerows(out)
print(len(out), "eclipses;", sum(r[2] == "solar" for r in out), "solar")
