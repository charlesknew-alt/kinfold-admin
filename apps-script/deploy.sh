#!/usr/bin/env bash
# Run from a machine with clasp logged in to the Kinfold Apps Script project.
# Typical: Git Bash / WSL on Charles's PC after copying files into C:\Projects\kinfold
set -euo pipefail
ROOT="${1:-.}"
cd "$ROOT"
echo "== clasp whoami / status =="
clasp login --status || true
echo "== pushing =="
clasp push -f
echo "== creating/deploying web app version =="
# Creates a new versioned deployment of the existing web app (if clasp is linked)
clasp deploy -d "invoicing+pricing fixes $(date -u +%Y-%m-%dT%H%MZ)" || clasp version "invoicing+pricing fixes" || true
clasp deployments || true
echo "Done. Hard-refresh owner/admin portals."
