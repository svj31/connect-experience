#!/bin/sh
# Deletes the local SQLite database and seeds fresh demo data. Local development only.
set -e
cd "$(dirname "$0")/../backend"
rm -f data/saathverse.db data/saathverse.db-wal data/saathverse.db-shm
npm run seed
