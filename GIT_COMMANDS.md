# Git commands for this update

Nothing has been committed or pushed. Run these yourself from the repository root, on the `version_2` branch.
The commits are split by area so the history is easy to review.

## 0. Check
```bash
git status
git branch --show-current   # version_2
```

## 1. Backend: Together plans
```bash
git add backend/src/db.ts backend/src/plans.ts backend/src/repo.ts backend/src/app.ts backend/src/routes/together.ts backend/src/routes/people.ts
git commit -m "feat(backend): Together plans with accept, decline, cancel and end

- plans table: one live invite per connected pair, pending invites lapse after a day
- GET /api/together/live lists received and sent plans and your open tables
- Accept, decline and end routes notify the other person with together:update"
```

## 2. Shared Orbit logo
```bash
git add frontend/src/components/brand/Logo.tsx frontend/src/app/icon.svg frontend/src/app/opengraph-image.tsx docs/brand
git commit -m "feat(brand): Shared Orbit logo on the ink tile with orbit, heartbeat and spark hover"
```

## 3. Discover roll and Together Live now
```bash
git add frontend/src/app/globals.css frontend/src/components/app/ProfileFeed.tsx frontend/src/components/app/Discover.tsx \
  frontend/src/components/app/LivePlans.tsx frontend/src/components/app/Together.tsx frontend/src/lib/live.tsx
git commit -m "feat(frontend): Discover roll with drag to like or pass, and Live now in Together

- Previous profile small on the left with undo, next two on the right
- Live now: join or decline invites, see answers, cancel or end plans, end tables
- Live notices when an invite is answered or called off"
```

## 4. Tests
```bash
git add backend/test frontend/tests
git commit -m "test: Together plans (API, component, end to end) and Discover drag"
```

## 5. Documentation
```bash
git add docs instructions GIT_COMMANDS.md
git commit -m "docs: logo, Discover roll and Together plans"
```

## 6. Check and push
```bash
git status                 # should be clean
git log --oneline -6
git push origin version_2
```

Then open a pull request into `main` (`gh pr create --base main --head version_2 --fill`), or merge locally:
```bash
git checkout main
git merge --no-ff version_2
git push origin main
```

## How to run
```bash
npm run setup   # first time: installs and creates backend/.env
npm run demo    # backend on :4000, frontend on :3000
```
Open http://localhost:3000 and use the demo buttons on the sign in page (member `ava@saathverse.test` or admin `admin@saathverse.test`, password `saathverse123`).
Tests: `npm test` (unit and integration), `npm run test:e2e` (Playwright). Full guide: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md).
