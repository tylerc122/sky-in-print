#!/usr/bin/env bash
# Copy triage results from Cygnus back to the Mac (needs the open socket).
set -euo pipefail
cd "$(dirname "$0")/.."
source .deploy.env
sock="$HOME/.ssh/sky-in-print/cygnus.sock"
host="$CYGNUS_SSH_ADDRESS"
ssh -S "$sock" -O check "$host" >/dev/null 2>&1 || { echo "Open the socket first: bash scripts/connect-cygnus.sh"; exit 1; }
ssh -S "$sock" -o BatchMode=yes "$host" 'cd ~/apps/sky-in-print && tar -czf - data/work/*/triage_v2.jsonl $(ls data/TRIAGE_DONE 2>/dev/null)' | tar -xzf -
ssh -S "$sock" -o BatchMode=yes "$host" 'cd ~/apps/sky-in-print && docker compose logs --tail 3 triage'
echo "Pulled. Lines per year:"; wc -l data/work/*/triage_v2.jsonl | tail -n +1
