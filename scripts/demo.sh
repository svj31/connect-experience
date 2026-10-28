#!/bin/sh
# Starts the backend and the frontend together for a demo. Ctrl+C stops both.
set -e
cd "$(dirname "$0")/.."
[ -f backend/.env ] || sh scripts/setup.sh

npm run dev --prefix backend &
BACKEND=$!
trap 'kill $BACKEND 2>/dev/null' EXIT INT TERM

echo "Backend starting on http://localhost:4000 (demo people are added to an empty database)"
npm run dev --prefix frontend
