# Setup instructions

## Requirements
- Node.js 20 or newer (`node -v`) and npm
- macOS, Linux or Windows (use Git Bash or WSL for the `.sh` scripts on Windows)

## 1. Install
```bash
npm run setup
```
This installs `backend/` and `frontend/`, copies `backend/.env.example` to `backend/.env` with a random
`JWT_SECRET`, and copies `frontend/.env.example` to `frontend/.env.local`.

Manual alternative:
```bash
npm run install:all
cp backend/.env.example backend/.env           # then set JWT_SECRET to 32+ random characters
cp frontend/.env.example frontend/.env.local
```

## 2. Run
```bash
npm run demo
```
or in two terminals:
```bash
npm run dev:backend    # http://localhost:4000 (API and sockets)
npm run dev:frontend   # http://localhost:3000 (open this)
```
On first start the backend fills the empty database with 14 demo people, connections, a week of history,
open tables and sample reports. `npm run reset-db` starts over.

## 3. Sign in
| Who | How |
| --- | --- |
| Demo member | Landing page **Try the live demo**, or `ava@saathverse.test` / `saathverse123` |
| Second member for live play | Private window: `rohan@saathverse.test` / `saathverse123` |
| Demo admin | **Sign in > Admin > Use the demo admin account**, or `admin@saathverse.test` / `saathverse123` |
| New member | **Join free** |
| New admin | `/signup?as=admin` with invite code `SAATH-ADMIN-2026` (change `ADMIN_INVITE_CODE` in `backend/.env`) |

## 4. Test
```bash
npm test                          # backend and frontend unit and integration
npm run build --prefix frontend   # stop any running frontend server first
npm run test:e2e                  # first time: npx playwright install chromium --prefix frontend
```

## 5. Production build
```bash
npm run build --prefix frontend
NODE_ENV=production npm start --prefix backend
npm start --prefix frontend
```
For a real launch set `JWT_SECRET`, `ADMIN_INVITE_CODE`, `DEMO_LOGIN=off`, `SEED_DEMO=off`, `WEB_ORIGIN`,
`API_ORIGIN`, `NEXT_PUBLIC_SOCKET_URL` and `NEXT_PUBLIC_SITE_URL`, and serve over HTTPS.

## Troubleshooting
| Problem | Fix |
| --- | --- |
| Port 3000 or 4000 in use | Stop the other process, or change `PORT` (backend) and the URLs in both env files |
| "Demo accounts are not available" | Run `npm run seed` |
| Pages show unstyled after a rebuild | Stop `next start`, rebuild, start again |
| `better-sqlite3` install error | Use Node 20+, then `npm rebuild better-sqlite3 --prefix backend` |
