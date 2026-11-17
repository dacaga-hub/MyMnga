# Workflow de desarrollo — MyMnga

Propuesta. Nada de esto está aplicado todavía en GitHub.

---

## 1. Ramas

```
main ───────────────●──────────────────●────────▶   estable · sólo vía PR desde beta · cada merge = tag vX.Y.Z
                    ▲                  ▲
beta-manga-store ──●┴──●──●──●──●──●──┴──●─────▶   staging/integración · sólo vía PR
                       ▲     ▲     ▲
feat/xxx ──────────────┘     │     │                una rama por issue, vida corta (< 1 semana)
fix/xxx ─────────────────────┘     │
db/xxx  ───────────────────────────┘                (trabajo de DB_MangaStore)
```

| Rama                                           | Origen             | Destino                          | Merge                                               | Protección                                                       |
| ---------------------------------------------- | ------------------ | -------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------- |
| `main`                                         | —                  | —                                | —                                                   | PR obligatoria, CI obligatoria, sin force-push, historial lineal |
| `beta-manga-store`                             | `main`             | `main`                           | _merge commit_ (conserva la historia de la release) | PR obligatoria, CI obligatoria, sin force-push                   |
| `feat/*`, `fix/*`, `db/*`, `chore/*`, `docs/*` | `beta-manga-store` | `beta-manga-store`               | _squash_ (1 commit = 1 issue)                       | —                                                                |
| `hotfix/*`                                     | `main`             | `main` **y** back-merge a `beta` | squash                                              | —                                                                |

Nombre: `feat/42-login-screen` (número de issue + slug).

> [Probable] Para un desarrollador en solitario, esto es el máximo razonable. Si te pesa, la versión mínima es:
> `main` protegido + ramas de feature + squash. `beta-manga-store` aporta valor sobre todo cuando haya backend
> desplegado (entorno staging real).

## 2. Commits

Ya usas _Conventional Commits_ (`feat:`, `fix:`…). Formalizarlo:

```
<tipo>(<ámbito opcional>): <resumen en imperativo, ≤ 72 car.>

tipos: feat · fix · refactor · perf · test · docs · chore · ci · build · db
ámbitos: reader · library · import · api · db · tauri · mobile · ui
```

Permite generar el CHANGELOG y la versión automáticamente (release-please o semantic-release).

## 3. Issues, milestones y tablero

- Un **milestone por fase** del ROADMAP (`F0 Saneamiento`, `F1 DB`, …).
- **Labels**: `type:bug` `type:feat` `type:chore` · `area:reader` `area:db` `area:api` `area:mobile` · `prio:high/med/low` · `blocked`.
- **Plantillas** en `.github/ISSUE_TEMPLATE/` (bug, feature) y `.github/pull_request_template.md`
  (Qué / Por qué / Cambios / Cómo probar / Checklist) — alineada con tu skill `pr-description`.
- Tablero GitHub Projects: `Backlog → Ready → In progress → In review → Done`.

## 4. CI/CD (GitHub Actions)

### 4.1 `ci.yml` — en cada PR y push a `main`/`beta-manga-store`

| Job                                | Pasos                                                                                                         | Tiempo aprox.       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------- |
| `frontend`                         | `npm ci` · `npm run lint` · `vue-tsc --noEmit` · `vite build` · tests (Vitest)                                | 1–2 min             |
| `rust`                             | deps de sistema (`libwebkit2gtk-4.1-dev` …) · `cargo fmt --check` · `cargo clippy -D warnings` · `cargo test` | 4–8 min (con caché) |
| `db` _(cuando exista `database/`)_ | servicio MySQL 8 · cargar `DB_MangaStore.sql` + `seed.sql` · ejecutar `tests.sql`                             | 1 min               |

Filtrado por rutas (`paths:`) para no compilar Rust cuando sólo cambian docs.

### 4.2 `release.yml` — al crear un tag `v*` en `main`

- `tauri-apps/tauri-action` en matriz `ubuntu / windows / macos` → borrador de GitHub Release con instaladores.
- Más adelante: job Android (`tauri android build`) y iOS (runner macOS + secretos de firma).

### 4.3 Otros

- `dependabot.yml`: `npm` en `/manga-reader`, `cargo` en `/manga-reader/src-tauri`, `github-actions` en `/`; semanal, agrupando patch/minor.
- `claude.yml` (si lo mantienes): sólo responde a menciones `@claude` de usuarios con escritura.

## 5. Definition of Done (por PR)

- [ ] CI verde.
- [ ] Sin `console.log` de depuración ni código comentado nuevo.
- [ ] Si toca BD: migración nueva (nunca editar una ya aplicada) y tipos TS actualizados.
- [ ] Si toca permisos Tauri (`capabilities/`): justificado en la PR.
- [ ] README / docs actualizados si cambia cómo se arranca o se usa.
- [ ] Probado manualmente en desktop (y en Android a partir de la Fase 2).

## 6. Versionado y releases

- SemVer. `0.x` hasta la Fase 7. Fuente única de versión: `package.json`, `Cargo.toml` y `tauri.conf.json` deben coincidir (release-please puede actualizar los tres).
- Release = PR `beta-manga-store → main` + tag + `release.yml`.

## 7. Uso de Claude Code en el repo

- `CLAUDE.md` en la raíz con: comandos (`npm run tauri dev`, `vue-tsc`, `cargo clippy`), flujo de ramas de este documento, convenciones de commits, y "no tocar `database/` salvo que se pida" (es tu trabajo personal).
- Hook de formateo: añadir `prettier` a `devDependencies` para que funcione en cualquier máquina.
- Skill `pr-description`: usar `git diff origin/beta-manga-store...HEAD` en lugar de `main...HEAD`.
