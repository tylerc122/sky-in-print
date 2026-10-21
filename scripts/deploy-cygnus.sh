#!/usr/bin/env bash
# Deploy the triage worker to Cygnus over the open socket. Usage: deploy-cygnus.sh [--with-data]
set -euo pipefail
cd "$(dirname "$0")/.."
source .deploy.env
sock="$HOME/.ssh/sky-in-print/cygnus.sock"
host="$CYGNUS_SSH_ADDRESS"
ssh -S "$sock" -O check "$host" >/dev/null 2>&1 || { echo "Open the socket first: bash scripts/connect-cygnus.sh"; exit 1; }
run() { ssh -S "$sock" -o BatchMode=yes "$host" "$@"; }
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

run 'bash -s' <<'REMOTE'
set -euo pipefail
t="$HOME/apps/sky-in-print"
[[ -L "$t" ]] && { echo "refusing symlinked target" >&2; exit 1; }
[[ -e "$t" && ! -f "$t/.sky-in-print-managed" ]] && { echo "refusing unmanaged existing directory" >&2; exit 1; }
mkdir -p "$t/data/work"; chmod 700 "$t"; touch "$t/.sky-in-print-managed"
REMOTE

# Code: an allowlist only.
COPYFILE_DISABLE=1 tar --no-xattrs -czf "$tmp/code.tgz" --exclude='__pycache__' --exclude='*.pyc' \
  -C cygnus Dockerfile compose.yaml -C .. src prereg
scp -q -o ControlPath="$sock" "$tmp/code.tgz" cygnus/.env "$host:apps/sky-in-print/"
run 'cd ~/apps/sky-in-print && tar -xzf code.tgz && rm code.tgz && chmod 600 .env'

if [[ "${1:-}" == "--with-data" ]]; then
  if run 'ls ~/apps/sky-in-print/data/work/*/triage_v2.jsonl' >/dev/null 2>&1; then
    echo "Remote already has triage output; refusing to overwrite it."; exit 1
  fi
  files=$(ls data/work/*/candidates.jsonl data/work/*/stats.json data/work/*/triage_v2.jsonl 2>/dev/null | grep -v '/1859/')
  COPYFILE_DISABLE=1 tar --no-xattrs -czf "$tmp/data.tgz" $files
  scp -q -o ControlPath="$sock" "$tmp/data.tgz" "$host:apps/sky-in-print/"
  run 'cd ~/apps/sky-in-print && tar -xzf data.tgz && rm data.tgz'
fi

run 'cd ~/apps/sky-in-print && docker compose up -d --build --remove-orphans 2>&1 | tail -3 && docker compose ps'
