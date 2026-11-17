# Revisión del repositorio `dacaga-hub/MyMnga` — rama `beta-manga-store`

Fecha: 2026-11-17 · Commit revisado: `db1b3bb` (idéntico a `main`).

Etiquetas de confianza: **[Seguro]** verificado ejecutando o leyendo el código · **[Probable]** inferencia sólida ·
**[Suponiendo]** relleno de huecos, verificar.

---

## 0. Lo que probablemente no quieres oír

1. **[Seguro] La app actual y `DB_MangaStore` son dos productos distintos.** El código es un _lector local_:
   Tauri + SQLite embebido + carpetas del disco del usuario. `DB_MangaStore` describe un _negocio multiusuario_
   (clientes, suscripciones, pagos, licencias, royalties) que **exige un servidor**. Ni una sola línea del código
   actual se reutiliza para la parte de negocio salvo la UI del lector. No es "añadir unas tablas": es añadir un
   backend, autenticación, almacenamiento de imágenes en la nube, pasarela de pago y despliegue.
2. **[Seguro] Hoy no se puede generar un ejecutable de release.** `npm run build` falla en `vue-tsc`
   (`ReaderView.vue:96`, `doublePage` declarado y no usado), y `tauri build` ejecuta `npm run build` como
   `beforeBuildCommand`. Nadie se ha dado cuenta porque no hay CI.
3. **[Seguro] La app nunca debe conectarse directamente a MySQL.** Cualquier credencial empaquetada en un binario
   de escritorio o un APK es extraíble. Entre la app y `DB_MangaStore` tiene que haber una API.
4. **[Probable] En móvil, el cobro de suscripciones digitales no es libre.** Apple (App Store Review Guidelines 3.1.1)
   y Google Play exigen su sistema de pago in-app para contenido digital, con comisión (15–30 %), salvo excepciones
   ("reader apps", regímenes UE/EE. UU. que han ido cambiando). Esto afecta directamente a `dcg_payment.method`
   (`T/P/B` no contempla IAP) y al cálculo de `income` de los royalties.
5. **[Seguro] La configuración de seguridad actual sería inaceptable en cuanto la app muestre contenido remoto:**
   `csp: null` + `assetProtocol.scope: ["**"]` + `fs:allow-read-file` sobre `**` ⇒ cualquier XSS lee cualquier
   fichero del disco del usuario.

---

## 1. Ajustes del repositorio (GitHub)

| #   | Hallazgo                                                                                                                                                                                                      | Confianza                                                                   | Gravedad   | Recomendación                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| R1  | `main` **sin protección** de rama. La mayoría de commits se hicieron con push directo a `main`; sólo hay 2 PR en toda la historia.                                                                            | [Seguro]                                                                    | Alta       | Regla de protección (o _ruleset_) en `main`: PR obligatoria, checks de CI obligatorios, sin force-push, historial lineal. |
| R2  | **Cero workflows de CI** en `main`.                                                                                                                                                                           | [Seguro]                                                                    | Alta       | Ver `docs/WORKFLOW.md` §4: typecheck, build, `cargo fmt/clippy/check`, build de Tauri por tag.                            |
| R3  | Rama huérfana `add-claude-github-actions-1781089041455` (10‑jun‑2026) con `.github/workflows/claude.yml` **nunca mergeada**. Su base es `3ee4bb6`; mergearla sólo añade el workflow y toca el README.         | [Seguro]                                                                    | Media      | Decidir: o se mergea (necesita el secreto `CLAUDE_CODE_OAUTH_TOKEN`) o se borra. Hoy es ruido.                            |
| R4  | `claude.yml` dispara con `@claude` en issues/comentarios. En un repo público, cualquiera puede mencionar.                                                                                                     | [Probable] la action filtra por permisos de escritura del autor por defecto | Media      | Verificar visibilidad del repo; si es público, mantener el filtro por defecto y no ampliar `allowed_tools`.               |
| R5  | Sin issues, sin milestones, sin Projects. El roadmap vive en una tabla del README que marca fases como "✅ Done" sin estarlo del todo.                                                                        | [Seguro]                                                                    | Media      | Issues + milestones por fase (ver ROADMAP).                                                                               |
| R6  | Sin `LICENSE`. Por defecto = "todos los derechos reservados".                                                                                                                                                 | [Seguro]                                                                    | Baja/Media | Decidir licencia si el repo es público.                                                                                   |
| R7  | Dos identidades de autor en el historial (`Daniel Caravaca Garcia` y `dacaga-hub`), y PR #1 viene de un fork de otra cuenta (`dacaga24-cpu`).                                                                 | [Seguro]                                                                    | Baja       | Unificar `git config user.name` en todas tus máquinas.                                                                    |
| R8  | La descripción del repo dice "reader" — coherente con el código, no con el proyecto Store.                                                                                                                    | [Seguro]                                                                    | Baja       | Actualizar cuando decidas el alcance.                                                                                     |
| R9  | No hay `.gitignore` en la raíz (sólo en `manga-reader/` y `src-tauri/`). Si añades `docs/`, `database/` o un backend en la raíz, no hay red de seguridad para `.env`, `node_modules`, dumps `.sql` con datos… | [Seguro]                                                                    | Media      | `.gitignore` raíz con `.env*`, `*.db`, `node_modules/`, `target/`, `dist/`.                                               |
| R10 | No hay Dependabot / Renovate.                                                                                                                                                                                 | [Seguro]                                                                    | Media      | `.github/dependabot.yml` para `npm` (manga-reader) y `cargo` (src-tauri), semanal.                                        |

### 1.1 Configuración de Claude Code en el repo (`.claude/`)

| #   | Hallazgo                                                                                                                                                                                                                                                                                                                                                                                                                  | Confianza |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| C1  | `settings.json` contiene un hook `PreToolUse` **placeholder** con `matcher: "ExampleToolName"` que nunca se ejecuta. Es ruido.                                                                                                                                                                                                                                                                                            | [Seguro]  |
| C2  | El hook `PostToolUse` de formateo llama a `npx --no-install prettier`, pero **`prettier` no está en `devDependencies`**: sólo funciona si la máquina tiene Prettier instalado globalmente (en este contenedor cloud sí; en tu PC, no lo sé). Si no está, falla en silencio (`>/dev/null 2>&1`, `exit 0`). Sin config de Prettier ⇒ cada máquina formatea distinto. Añadir `prettier` a `devDependencies` + `.prettierrc`. | [Seguro]  |
| C3  | La skill `codebase-onboarding` referencia `references/architecture-guide.md` y `references/deep-dive-guide.md`, que **no existen**. Su descripción ("Helps new developers understand the system works") es tan vaga que se dispara mal. Fija `model: sonnet`.                                                                                                                                                             | [Seguro]  |
| C4  | La skill `pr-description` asume `main` como base. Con `beta-manga-store` como staging, las PR de feature irán contra staging ⇒ el diff será incorrecto.                                                                                                                                                                                                                                                                   | [Seguro]  |
| C5  | No hay `CLAUDE.md`. Cualquier agente (yo incluido) tiene que redescubrir comandos, convenciones y el flujo de ramas en cada sesión.                                                                                                                                                                                                                                                                                       | [Seguro]  |

---

## 2. Revisión del código (`manga-reader/`)

Verificado: `npm ci` ✅ · `vue-tsc --noEmit` ❌ (1 error) · `vite build` ✅ · `npm audit` 5 vulnerabilidades _high_
(postcss, source-map-js — sólo en tooling de desarrollo) · `cargo` no ejecutado (requiere libs de WebKitGTK en este contenedor).

### 2.1 Bugs reales

| #   | Dónde                                             | Problema                                                                                                                                                                                                                                      | Confianza |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| B1  | `src/views/ReaderView.vue:96`                     | `doublePage` sin usar ⇒ `vue-tsc` falla ⇒ **`tauri build` falla**.                                                                                                                                                                            | [Seguro]  |
| B2  | `ReaderView.vue:114`                              | Orden de páginas con `localeCompare` sin `{ numeric: true }`: `10.jpg` va antes que `2.jpg`. Cualquier capítulo con páginas sin ceros a la izquierda se lee desordenado. Fix: `a.name!.localeCompare(b.name!, undefined, { numeric: true })`. | [Seguro]  |
| B3  | `ReaderView.vue:140`                              | Si la carpeta no tiene imágenes, `pages.length = 0`, `page >= 0` ⇒ el capítulo se marca como **leído**. En el modelo Store, `dcg_progress.state='T'` **genera royalties**: este patrón allí es dinero mal pagado.                             | [Seguro]  |
| B4  | `ReaderView.vue:105-126`                          | `loadChapter` sin `try/catch`: si la carpeta se movió/borró, rechazo no capturado y pantalla en blanco.                                                                                                                                       | [Seguro]  |
| B5  | `ImportManga.vue:45`                              | Sólo detecta capítulos cuyo nombre contenga `chapter`. `Ch. 01`, `Capítulo 1`, `001`, `第1話` se ignoran sin aviso.                                                                                                                           | [Seguro]  |
| B6  | `ImportManga.vue:54-55`                           | Número = primer número del nombre: `S2 Chapter 5` ⇒ 2; sin número ⇒ 0 (varios capítulos con número 0 ⇒ `getNextChapter` los salta).                                                                                                           | [Seguro]  |
| B7  | `ImportManga.vue:47-64` + `libraryStore.ts:34-37` | Import **no transaccional** y cuadrático: cada `addChapter` re-lee todos los capítulos. Si falla a mitad, queda un manga a medias que además bloquea reimportar (B8).                                                                         | [Seguro]  |
| B8  | `ImportManga.vue:31` + `001_initial.sql`          | Deduplicado sólo por título en la app; sin `UNIQUE` en BD. Dos carpetas con el mismo nombre en rutas distintas chocan; la misma ruta con otro nombre se duplica.                                                                              | [Seguro]  |
| B9  | `Sidebar.vue:13,17`                               | Enlaces a `/library` y `/search`, rutas inexistentes; no hay ruta 404 ⇒ vista vacía.                                                                                                                                                          | [Seguro]  |
| B10 | `MangaDetailView.vue:107`                         | `route.params.id` se lee una sola vez (no reactivo). El mismo bug que ya arreglaste en el Reader con `watch`. Hoy no se manifiesta porque no hay navegación detalle→detalle.                                                                  | [Seguro]  |

### 2.2 Seguridad (Tauri)

| #   | Dónde                                                       | Problema                                                                                                                                                                                                                                                                      | Confianza |
| --- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| S1  | `tauri.conf.json:21`                                        | `csp: null` desactiva la CSP.                                                                                                                                                                                                                                                 | [Seguro]  |
| S2  | `tauri.conf.json:22-25` + `capabilities/default.json:21-28` | Asset protocol y `fs:read-*` con scope `**`: la webview puede leer **cualquier fichero** del usuario (`~/.ssh`, etc.). Para un lector local se puede acotar al directorio de biblioteca elegido (scope dinámico con `fs_scope().allow_directory` desde Rust tras el diálogo). | [Seguro]  |
| S3  | `capabilities/default.json:9-10,21-28`                      | Permisos duplicados (`fs:allow-read-file` simple **y** con scope) y `fs:scope` sin parámetros: confuso, difícil de auditar.                                                                                                                                                   | [Seguro]  |
| S4  | `capabilities/default.json:15-18`                           | `sql:allow-execute` expone SQL arbitrario a la webview. Aceptable para SQLite local; **inviable** como patrón para el Store.                                                                                                                                                  | [Seguro]  |

### 2.3 Calidad / mantenibilidad

| #   | Hallazgo                                                                                                                                                                                                         | Confianza                                                               |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Q1  | Tailwind 4 instalado pero **no se usa**: todo es CSS `scoped` a mano (~1.000 líneas en 3 vistas, colores repetidos `#ff6b35`, `#0d0d0d`…). Elige uno: o Tailwind, o variables CSS (`--color-accent`).            | [Seguro]                                                                |
| Q2  | Vistas de 400+ líneas con _mock data_ de títulos reales (Vagabond, Berserk, Chainsaw Man…) y bloques HTML comentados. En una tienda pública, mostrar obras sin licencia es un problema legal además de estético. | [Seguro]                                                                |
| Q3  | `console.log('NEXT chapter result y algo mas:', …)` en `ReaderView.vue:145,149`.                                                                                                                                 | [Seguro]                                                                |
| Q4  | `types/index.ts`: `read: boolean`, pero SQLite devuelve `0/1`. El tipo miente.                                                                                                                                   | [Seguro]                                                                |
| Q5  | `libraryStore.fetchMangas`: `loading` no se resetea si falla (sin `try/finally`).                                                                                                                                | [Seguro]                                                                |
| Q6  | `removeManga` borra capítulos a mano antes del manga, aunque la FK tiene `ON DELETE CASCADE`.                                                                                                                    | [Probable] redundante: sqlx activa `foreign_keys` por defecto en SQLite |
| Q7  | Rutas construidas con `` `${a}/${b}` ``; mejor `join()` de `@tauri-apps/api/path` (Windows).                                                                                                                     | [Probable]                                                              |
| Q8  | `createWebHistory` en Tauri. Funciona, pero `createWebHashHistory` es lo habitual y evita problemas de recarga en rutas profundas.                                                                               | [Suponiendo]                                                            |
| Q9  | Sin tests, sin ESLint, sin Prettier, sin `vue-tsc` en CI.                                                                                                                                                        | [Seguro]                                                                |
| Q10 | Sin teclado en el lector (←/→, espacio), sin precarga de la página siguiente, sin modo scroll vertical (los webtoons lo necesitan).                                                                              | [Seguro]                                                                |
| Q11 | Boilerplate sin tocar: `<title>Tauri + Vue + Typescript App</title>`, favicon de Vite, `Cargo.toml` con `description = "A Tauri App"`, `authors = ["you"]`, `manga-reader/README.md` de plantilla.               | [Seguro]                                                                |
| Q12 | El README raíz describe ficheros que **no existen** (`src-tauri/src/commands/`, `MangaCard.vue`, `readerStore.ts`, `tailwind.config.ts`…).                                                                       | [Seguro]                                                                |

### 2.4 Preparación para móvil (Tauri v2 iOS/Android)

| #   | Hallazgo                                                                                                                                                                            | Confianza  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------- | -------- |
| M1  | No existe `src-tauri/gen/android` ni `gen/apple`: nunca se ha ejecutado `tauri android init` / `tauri ios init`.                                                                    | [Seguro]   |
| M2  | `vite.config.ts` no lee `TAURI_DEV_HOST`: en dispositivo físico el dev server no es accesible. La plantilla oficial de Tauri 2 incluye `host: process.env.TAURI_DEV_HOST            |            | false` y HMR por websocket. | [Seguro] |
| M3  | El flujo de import (`open({directory:true})` + `readDir` sobre ruta absoluta) es de escritorio. En Android devuelve URIs `content://` y en iOS el sandbox impide rutas arbitrarias. | [Probable] |
| M4  | El layout es de escritorio fijo (sidebar 200px, `height:100vh`, sin breakpoints, sin safe-areas).                                                                                   | [Seguro]   |
| M5  | **iOS requiere macOS + Xcode** para compilar y firmar; Android requiere SDK/NDK + JDK.                                                                                              | [Seguro]   |
| M6  | Pagos in-app: no hay plugin oficial de Tauri para StoreKit / Play Billing; existen plugins comunitarios.                                                                            | [Probable] |

### 2.5 Dependencias

`npm outdated` (relevantes): `@tauri-apps/*` 2.10→2.12, `plugin-sql` 2.4→2.6, `plugin-fs` 2.5→2.7, `vue` 3.5.30→3.5.45,
`vite` 6.4.1→6.4.6 (8.x disponible), `typescript` 5.6 (7.x disponible), `vue-tsc` 2→3, `pinia` 3→4, `vue-router` 4→5.
Recomendación: subir _patch/minor_ ya (sin riesgo); los _major_ (Vite 8, TS 7, Pinia 4, Router 5) en una PR aparte con CI verde.

---

## 3. Observaciones sobre la guía `DB_MangaStore` que afectan a la app

No toco tu trabajo de BD; sólo marco lo que la app va a necesitar o lo que puede romperla.

| #   | Punto                                                                                                                                                                                                                                                                                                                                                                                                                           | Confianza  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| D1  | **DATA CONTROL en MySQL:** `user_created VARCHAR(20) DEFAULT (CURRENT_USER())`. `CURRENT_USER()` devuelve `usuario@host`; con un usuario de aplicación real (p. ej. `mangastore_app@172.18.0.5`, 25 caracteres) el INSERT falla por _Data too long_ en modo estricto. Además, con una API todas las escrituras vienen del mismo usuario de BD: la columna no audita nada útil. La API debería escribir el id del cliente/admin. | [Probable] |
| D2  | **Royalties por `dcg_progress.state='T'`:** el estado lo marca el cliente ⇒ manipulable (abrir y cerrar capítulos). El servidor debe validar la lectura (tiempo mínimo, páginas vistas) antes de contarla. Ver B3: el lector actual ya marca "leído" un capítulo vacío.                                                                                                                                                         | [Probable] |
| D3  | **Falta dónde viven las páginas.** El modelo tiene `dcg_chapter` pero no `dcg_page` ni clave de almacenamiento (S3/R2). `folder_path` local no sirve en un servicio.                                                                                                                                                                                                                                                            | [Seguro]   |
| D4  | **`dcg_plan.devices`** no se puede aplicar sin una tabla de sesiones/dispositivos.                                                                                                                                                                                                                                                                                                                                              | [Seguro]   |
| D5  | **`dcg_license.fee`** (mínimo garantizado) no entra en la fórmula de §7.1. Y `dcg_contract.currency` puede no ser EUR mientras `income` sí.                                                                                                                                                                                                                                                                                     | [Seguro]   |
| D6  | **`dcg_payment.method`** (`T/P/B`) no contempla Apple IAP / Google Play Billing, ni el neto tras comisión de tienda (afecta a `income`).                                                                                                                                                                                                                                                                                        | [Probable] |
| D7  | **Idempotencia de webhooks** de pasarela: `u_dcg_payment1 (reference)` ayuda, bien visto.                                                                                                                                                                                                                                                                                                                                       | [Seguro]   |
| D8  | **RGPD:** fecha de nacimiento, país, email ⇒ consentimiento, derecho de supresión. Pero `dcg_subscription/payment` son `RESTRICT` ⇒ un cliente con pagos no se puede borrar: necesitarás _anonimización_, no borrado. Coherente con tu "en un negocio no se borra, se desactiva".                                                                                                                                               | [Probable] |

Fuera del alcance del ejercicio académico, pero necesarios para una app real: tokens de sesión/refresh, verificación de email,
recuperación de contraseña, tabla de páginas/activos, dispositivos, consentimientos, log de eventos de pasarela.

---

## 4. Prioridad de arreglos inmediatos (independientes de cualquier decisión)

1. B1 (desbloquea el build) · B2 (orden de páginas) · B3/B4 (lector robusto).
2. CI mínima + protección de `main`.
3. Limpiar `.claude/` (C1–C5) y añadir `CLAUDE.md`.
4. Acotar scopes de `fs`/asset y activar CSP (S1–S3).
5. `npm audit fix` + subir patch/minor.
