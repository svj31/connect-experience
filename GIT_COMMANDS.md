# Git commands for this update

Nothing has been committed or pushed. Run these yourself from the repository root.
The commits are split by area so the history is easy to review. `git add -A` on both the old and new folder
names lets git record `server/` to `backend/` and `web/` to `frontend/` as renames.

## 0. Check and branch
```bash
git status
git checkout -b feat/saathverse
```

## 1. Backend
```bash
git add -A server backend ':!backend/test'
git commit -m "feat(backend): SaathVerse API with profiles, Vibe Match, Bond, connections and admin

- Rename server/ to backend/ and migrate the SQLite schema in place
- Dating profile, privacy per section and settings; profile export
- Vibe Match, Bond levels and streaks, personalised suggestions
- Connections with requests, mutual matches and shared spaces; Discover filters
- Deep Talk activity, personalised Would You Rather, locked tables
- Admin role, invite code sign up, moderation actions and audit log
- One click demo accounts and seeded demo history"
```

## 2. Backend tests
```bash
git add -A backend/test
git commit -m "test(backend): cover matching, bond, privacy, connections and admin (98 tests)"
```

## 3. Frontend
```bash
git add -A web frontend ':!frontend/tests'
git commit -m "feat(frontend): SaathVerse redesign with member app and admin console

- Rename web/ to frontend/; violet, lilac and rose theme with dark mode
- Animated Shared Orbit logo, themed cursor, starfield, loaders and celebrations
- New landing page with interactive demos and member and admin sign in
- Dashboard, Discover, Connections, Chats, Together, Moments, Profile, Settings, Safety
- Room with floating chat, grouped activities and personalised ideas
- Admin overview, reports, members, audit log and profile"
```

## 4. Frontend tests
```bash
git add -A frontend/tests
git commit -m "test(frontend): component tests and end to end journeys (31 unit, 27 e2e)"
```

## 5. Tooling, demo data and instructions
```bash
git add scripts demo_data instructions package.json .gitignore .env.example
git commit -m "chore: setup and demo scripts, demo data and walkthroughs"
```

## 6. Documentation
```bash
git add -A docs README.md SETUP_INSTRUCTIONS.md GIT_COMMANDS.md
git commit -m "docs: plan, architecture, testing, summary, brand and setup guide for SaathVerse"
```

## 7. Check and push
```bash
git status                 # should be clean
git log --oneline -8
git push -u origin feat/saathverse
```

Then open a pull request into `main` on GitHub (or with the CLI: `gh pr create --base main --fill`),
or merge locally:
```bash
git checkout main
git merge --no-ff feat/saathverse
git push origin main
```
