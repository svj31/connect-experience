#!/bin/sh
# One time setup: installs both apps, creates env files and a random JWT secret.
set -e
cd "$(dirname "$0")/.."

echo "Installing backend and frontend dependencies..."
npm install --prefix backend
npm install --prefix frontend

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")
  sed -i.bak "s/^JWT_SECRET=.*/JWT_SECRET=$SECRET/" backend/.env && rm -f backend/.env.bak
  echo "Created backend/.env with a fresh JWT secret."
fi
if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
  echo "Created frontend/.env.local."
fi

echo ""
echo "Done. Start the app with:  npm run demo"
echo "Demo member: ava@saathverse.test   Demo admin: admin@saathverse.test   Password: saathverse123"
