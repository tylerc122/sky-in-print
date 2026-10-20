#!/usr/bin/env bash
# Run in your own Terminal. SSH asks for the password; nothing is saved.
set -euo pipefail
cd "$(dirname "$0")/.."
source .deploy.env
dir="$HOME/.ssh/sky-in-print"
mkdir -p "$dir" && chmod 700 "$dir"
sock="$dir/cygnus.sock"
if ssh -S "$sock" -O check "$CYGNUS_SSH_ADDRESS" >/dev/null 2>&1; then
  echo "Cygnus connection already open."; exit 0
fi
ssh -M -S "$sock" -o ControlPersist=15m -o ConnectTimeout=10 -fN "$CYGNUS_SSH_ADDRESS"
echo "Cygnus connection ready (expires after 15 idle minutes). Return to the chat and say connected."
