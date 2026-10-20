"""Triage every pilot year (except the debug year) as its filtered output appears. Resumable."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
YEARS = [1844, 1849, 1851, 1852, 1863, 1870, 1871, 1872, 1873, 1874, 1875, 1876, 1877, 1878, 1879, 1880, 1893, 1911, 1914, 1916]
pending = list(YEARS)
while pending:
    for y in list(pending):
        if (ROOT / "data" / "work" / str(y) / "stats.json").exists():
            print(f"=== triage {y}", flush=True)
            r = subprocess.run([sys.executable, "-m", "skyinprint.triage", str(y)], cwd=ROOT)
            if r.returncode == 0:
                pending.remove(y)
    if pending:
        time.sleep(120)
print("all years triaged", flush=True)
(ROOT / "data" / "TRIAGE_DONE").write_text(time.strftime("%Y-%m-%dT%H:%M:%S\n"))
if os.environ.get("SKY_IDLE_AFTER_DONE"):  # keep the container up so restart policies do not loop
    while True:
        time.sleep(3600)
