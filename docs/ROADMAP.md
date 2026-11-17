# Roadmap — de lector local a MangaStore (desktop primero)

Estado: **decisiones tomadas el 2026-11-17** (ver §5). Producto real · backend Node + TypeScript + MySQL ·
sólo desktop por ahora · todo el trabajo en `beta-manga-store`, `main` no se toca de momento.

Etiquetas: **[Seguro]** · **[Probable]** · **[Suponiendo]**.

---

## 1. Punto de partida

| Pieza             | Hoy                                    | Necesario para MangaStore                                                       |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Cliente           | Tauri 2 + Vue 3, desktop, lector local | Mismo cliente, multiplataforma, con login y catálogo remoto                     |
| Datos             | SQLite embebido (2 tablas)             | MySQL 8 `DB_MangaStore` (21 tablas) **en servidor** + caché local en el cliente |
| Imágenes          | Carpetas del disco del usuario         | Almacenamiento de objetos (S3 / Cloudflare R2) + URLs firmadas                  |
| Lógica de negocio | Ninguna                                | API: auth, regla de acceso §1.4, progreso, pagos, royalties                     |
| Pagos             | —                                      | Pasarela web (Stripe/Redsys) y, en móvil, IAP de Apple/Google                   |
| Operación         | —                                      | Hosting, backups, logs, CI/CD, firma de binarios                                |

---

## 2. Arquitectura objetivo recomendada

```
 ┌───────────── Cliente (un solo código Vue 3 + TS) ─────────────┐
 │  Tauri 2 desktop (Win/macOS/Linux)  ·  Tauri 2 Android / iOS │
 │  Pinia · Router · SQLite local = caché offline + progreso    │
 └───────────────▲───────────────────────────────▲──────────────┘
                 │ HTTPS/JSON (JWT)              │ URLs firmadas (imágenes)
 ┌───────────────┴──────────┐        ┌───────────┴──────────────┐
 │  API (backend)           │───────▶│  Object storage (R2/S3)  │
 │  auth · catálogo · acceso│        └──────────────────────────┘
 │  progreso · pagos · jobs │◀── webhooks ── Stripe / Apple / Google
 └───────────────┬──────────┘
                 │ usuario de BD con mínimos privilegios
          ┌──────┴───────┐
          │  MySQL 8     │  DB_MangaStore (tu modelo)
          └──────────────┘
```

**Por qué así** [Probable]:

- Reutilizas el 100 % del frontend Vue en todas las plataformas (Tauri 2 soporta Android/iOS).
- La regla de acceso (§1.4 de la guía) y el cálculo de royalties (§7.1) **tienen que** ejecutarse en servidor; si viven en el cliente, se saltan.
- MySQL 8 coincide con tu `.sql`: no duplicas el modelado.

**Alternativas que descarto como primera opción** (abiertas a debate en §5):

- _Supabase/Firebase (BaaS)_: más rápido para empezar, pero Postgres/NoSQL ≠ tu modelo MySQL y la lógica de royalties acaba en funciones repartidas. [Probable]
- _Capacitor en lugar de Tauri mobile_: ecosistema móvil más maduro (plugins de IAP oficiales de comunidad grande), pero tendrías dos runtimes (Tauri desktop + Capacitor móvil). [Probable]
- _React Native/Flutter_: reescritura total del frontend. No compensa con la base Vue que tienes. [Seguro]

---

## 3. Fases

Cada fase = un _milestone_ en GitHub con sus issues. Criterio de salida explícito; si no se cumple, no se pasa de fase.

### Fase 0 — Saneamiento (≈1 semana) · _independiente de decisiones_

- Arreglar build (`vue-tsc`), orden de páginas, marcar-leído en carpeta vacía, errores del lector (REVIEW B1–B4).
- CI: typecheck + build front + `cargo fmt --check` + `cargo clippy` (ver WORKFLOW §4).
- Protección de `main`, Dependabot, `.gitignore` raíz, `CLAUDE.md`, limpiar `.claude/`.
- README real (lo que existe, cómo arrancar).
- **Salida:** CI verde en PR; `npm run tauri build` genera instalador en tu máquina.

### Fase 1 — Base de datos `DB_MangaStore` (tú, en paralelo) · _tu proyecto personal_

- `database/DB_MangaStore.xml` + `database/DB_MangaStore.sql` + `database/seed.sql` (datos §9) + `database/tests.sql` (inserciones que deben fallar).
- Opcional: `docker-compose.yml` con MySQL 8 para levantarla en un comando.
- Opcional (CI): job que levanta MySQL, ejecuta `.sql` + `seed.sql` y comprueba que las inserciones de §9 fallan.
- **Salida:** las 21 tablas cargan; todas las pruebas de §9 dan el resultado esperado.

### Fase 2 — Spike de contenido remoto (≈1 semana) · _reduce el mayor riesgo técnico_

- Prueba de concepto del lector con imágenes **remotas** (bucket R2/S3 o servidor local con un capítulo de dominio público o propio).
- Acotar permisos de Tauri (CSP, scopes de `fs`/asset) para contenido remoto.
- Móvil **aplazado** hasta después de la v1 (decisión 2026-11-17). Para no cerrar la puerta: nada de APIs sólo-desktop en el código nuevo.
- **Salida:** la app desktop lee un capítulo remoto con CSP activa.

### Fase 3 — API v1: catálogo y cuentas

- Proyecto `server/`: Node + TypeScript (Fastify) + MySQL 8. Conexión a `DB_MangaStore` (export SQL de tu modelo Axional).
- Auth: registro, login, hash `argon2id`/`bcrypt` en `pwdhash`, JWT + refresh, verificación de email.
- Endpoints de solo lectura: mangas, géneros, autores, capítulos (filtrados por licencia activa y país del cliente).
- Endpoint `can-read(chapter)` = consulta §7.2 en servidor; URLs firmadas de páginas sólo si `can-read` es cierto.
- OpenAPI generado ⇒ cliente TypeScript generado para Vue.
- **Salida:** cliente sin suscripción lee capítulos gratis; capítulo de pago devuelve 403. Tests de los 6 casos de §9.

### Fase 4 — Cliente conectado

- Pantallas: login/registro, catálogo, ficha, lector remoto, biblioteca (`dcg_client_manga`), progreso y marcadores sincronizados.
- SQLite local pasa a ser caché + cola offline de progreso.
- Decisión sobre el modo "importar carpeta local" (ver §5).
- **Salida:** flujo completo §1.3 pasos 1, 2, 6 desde desktop.

### Fase 5 — Suscripciones y pagos

- Planes, suscripción, cupones; pasarela web (Stripe Checkout/Billing o Redsys) con webhooks idempotentes.
- Móvil (cuando se retome): IAP o modelo "reader app". Desktop no tiene esa restricción.
- Validación en servidor de recibos; nunca confiar en el cliente.
- **Salida:** suscripción de punta a punta en modo _test_ de la pasarela; renovación y cancelación correctas.

### Fase 6 — Back-office y royalties

- Panel de administración web (puede ser la misma app Vue en modo web): editoriales, contratos, licencias, moderación de reseñas.
- Job mensual de liquidación §7.1 → `dcg_royalty_h/l`; export CSV/PDF para la editorial.
- Validación anti-fraude de "lecturas" (REVIEW D2).
- **Salida:** liquidación de un mes con datos de prueba coincide con cálculo manual.

### Fase 7 — Release

- Firma de código: Windows (certificado), macOS (Developer ID + notarización) si se distribuye para Mac.
- Auto-update de Tauri (`tauri-plugin-updater`).
- Política de privacidad, términos, RGPD, edad mínima (`agerating`).
- **Salida:** v1.0.0 publicada en al menos un canal.

---

## 4. Riesgos principales

| Riesgo                                                                | Prob.            | Impacto                       | Mitigación                                                             |
| --------------------------------------------------------------------- | ---------------- | ----------------------------- | ---------------------------------------------------------------------- |
| **Contenido**: sin licencias reales no hay catálogo legal que mostrar | Alta [Seguro]    | Bloqueante para producto real | Usar obras de dominio público / propias / Creative Commons para demo   |
| Tauri mobile inmaduro para IAP / lector fluido                        | Media [Probable] | Alto                          | Spike en Fase 2 antes de invertir más                                  |
| No tener Mac ⇒ sin iOS                                                | Depende de ti    | Medio                         | Android primero; CI con runner macOS de GitHub para iOS más adelante   |
| Comisión de tiendas rompe el margen de royalties                      | Media [Probable] | Alto                          | Modelo "reader app" o precio distinto en móvil; reflejarlo en `income` |
| Alcance excesivo para una persona                                     | Alta [Probable]  | Alto                          | Milestones cortos; el back-office puede ser SQL a mano hasta la Fase 6 |

---

## 5. Decisiones

| # | Decisión | Respuesta |
|---|----------|-----------|
| 1 | Naturaleza | BD = formación académica (Axional); app = **producto real** personal. |
| 2 | Backend | **Node + TypeScript + MySQL**. |
| 3 | Plataformas | **Sólo desktop** por ahora. |
| 4 | Ramas | Trabajo en `beta-manga-store`; **no tocar `main`** de momento. |
| 5 | "Importar carpeta local" | **Pendiente.** Recomendación: retirarla del cliente de la tienda. |
| 6 | Repo público/privado, licencia | Pendiente. |
| 7 | ¿`DB_MangaStore` en `database/` de este repo? | Pendiente. |
| 8 | Rama del workflow de Claude: ¿merge o borrar? | Pendiente. |
