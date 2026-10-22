#!/usr/bin/env bash
# Copy results from Cygnus back to the Mac (needs the open socket).
# Pilot triage (data/work) plus every sweep year whose triage is finished (data/sweep/<year> with TRIAGED).
set -euo pipefail
cd "$(dirname "$0")/.."
source .deploy.env
sock="$HOME/.ssh/sky-in-print/cygnus.sock"
host="$CYGNUS_SSH_ADDRESS"
ssh -S "$sock" -O check "$host" >/dev/null 2>&1 || { echo "Open the socket first: bash scripts/connect-cygnus.sh"; exit 1; }
ssh -S "$sock" -o BatchMode=yes "$host" 'cd ~/apps/sky-in-print && {
  ls data/work/*/triage_v2.jsonl data/TRIAGE_DONE data/SWEEP_DONE 2>/dev/null
  for d in data/sweep/*/; do [[ -f "$d/TRIAGED" ]] && ls "$d"*; done
} | tar -czf - -T -' | tar -xzf -
ssh -S "$sock" -o BatchMode=yes "$host" 'cd ~/apps/sky-in-print && docker compose logs --tail 2 sweep'
echo "Pulled: $(ls -d data/sweep/*/ 2>/dev/null | wc -l | tr -d ' ') finished sweep years."
