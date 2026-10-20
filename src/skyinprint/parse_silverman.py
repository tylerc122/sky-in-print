"""Parse Silverman's NSSDC aurora files into one table: date, place, state/country, source file.

Header lines look like ' 1860    1    1  SAUK CITY           WISCONSIN'. Lines that follow
(observer notes) are attached as 'note' where present (New England series).
"""
import csv
import glob
import re

US_STATES = {s.upper() for s in """Alabama Alaska Arizona Arkansas California Colorado Connecticut Delaware Florida Georgia
Idaho Illinois Indiana Iowa Kansas Kentucky Louisiana Maine Maryland Massachusetts Michigan Minnesota Mississippi
Missouri Montana Nebraska Nevada Ohio Oklahoma Oregon Pennsylvania Tennessee Texas Utah Vermont Virginia Washington
Wisconsin Wyoming""".split()} | {"NEW HAMPSHIRE", "NEW JERSEY", "NEW MEXICO", "NEW YORK", "NORTH CAROLINA", "NORTH DAKOTA",
"RHODE ISLAND", "SOUTH CAROLINA", "SOUTH DAKOTA", "WEST VIRGINIA", "DISTRICT OF COLUMBIA", "DAKOTA TERRITORY", "INDIAN TERRITORY",
"WASHINGTON TERRITORY", "UTAH TERRITORY", "NEBRASKA TERRITORY", "KANSAS TERRITORY", "MINNESOTA TERRITORY", "WISCONSIN TERRITORY"}
hdr = re.compile(r"^\s?(1[5-9]\d\d)\s+(\d{1,2})\s+(\d{1,2})\s+(\S.{0,30}?\S)\s{2,}(\S.*?)\s*$")
rows = []
for path in sorted(glob.glob("reference/silverman/**/*.txt", recursive=True)):
    src = path.split("reference/silverman/")[1]
    cur = None
    for line in open(path, encoding="latin-1"):
        m = hdr.match(line.rstrip("\n"))
        if m:
            y, mo, d, place, region = m.groups()
            if not (1 <= int(mo) <= 12 and 1 <= int(d) <= 31):
                continue
            cur = [f"{int(y):04d}-{int(mo):02d}-{int(d):02d}", place.strip(), region.strip(), region.strip().upper() in US_STATES, src, ""]
            rows.append(cur)
        elif cur is not None and line.strip() and "new_england" in src:
            cur[5] = (cur[5] + " " + line.strip())[:500]
with open("reference/silverman/silverman_parsed.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["date", "place", "region", "us", "source_file", "note"])
    w.writerows(rows)
us = [r for r in rows if r[3]]
print(len(rows), "rows;", len(us), "US rows;", len({r[0] for r in us}), "distinct US dates")
