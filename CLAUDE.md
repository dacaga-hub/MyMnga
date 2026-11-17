# CLAUDE.md

## Project

MyMnga: desktop manga app (Tauri 2 + Vue 3 + TypeScript + Pinia + SQLite) evolving into **MangaStore**,
a subscription manga platform. Roadmap, review and workflow live in `docs/`.

Decisions (2026-11-17): real product · backend Node + TypeScript + MySQL 8 · desktop only for now.

## Branches

- Work on `beta-manga-store` (staging) or `feat/*`, `fix/*`, `chore/*`, `docs/*` branches cut from it.
- **Do not touch `main`** until the owner says so.
- Conventional Commits: `feat|fix|refactor|perf|test|docs|chore|ci|build|db(scope): summary`.

## Ownership

- `database/` (DB_MangaStore `.xml` / `.sql`) is the owner's personal academic work. Do not create or edit it unless asked.

## Commands (run from `manga-reader/`)

```bash
npm ci
npm run tauri dev          # desktop app with hot reload
npx vue-tsc --noEmit       # typecheck (CI gate)
npx vite build             # frontend build (CI gate)
```

From `manga-reader/src-tauri/`:

```bash
cargo fmt --check
cargo clippy --all-targets -- -D warnings
```

`tauri build` runs `npm run build` first, so a `vue-tsc` error breaks the release build.

## Conventions

- DB access only through `src/db/*.ts`; SQLite migrations in `src-tauri/migrations/` — never edit an applied migration, add a new one.
- Changes to `src-tauri/capabilities/` or `tauri.conf.json` security settings must be justified in the PR.
- No debug `console.log` in committed code.
