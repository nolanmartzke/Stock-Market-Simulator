#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed or not on PATH; install Node.js/npm and retry." >&2
  exit 1
fi

cd "$FRONTEND_DIR"

echo "Running frontend linting..."
npm run lint
