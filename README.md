# Manga Reader — Project Structure

## Tech Stack

| Layer | Technology |
|-------|------------|
| Desktop Framework | Tauri v2 |
| Frontend | Vue 3 + TypeScript |
| Global State | Pinia |
| Routing | Vue Router |
| Local Database | SQLite (via `tauri-plugin-sql`) |
| Styles | TailwindCSS |

---

## Folder Structure

```
manga-reader/
│
├── src-tauri/                        # Native backend (Rust + Tauri)
│   ├── src/
│   │   ├── main.rs                   # Tauri entry point
│   │   └── commands/                 # Rust commands exposed to frontend
│   │       ├── mod.rs
│   │       ├── library.rs            # Read/write local library
│   │       └── filesystem.rs         # File and image access
│   ├── migrations/                   # SQLite migrations
│   │   └── 001_initial.sql
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json               # App configuration
│
├── src/                              # Vue 3 Frontend
│   │
│   ├── assets/                       # Static resources
│   │   └── styles/
│   │       └── main.css
│   │
│   ├── components/                   # Reusable components
│   │   ├── library/
│   │   │   ├── MangaCard.vue         # Single manga card
│   │   │   ├── MangaGrid.vue         # Library grid
│   │   │   └── ChapterList.vue       # Chapter list for a manga
│   │   ├── reader/
│   │   │   ├── PageViewer.vue        # Single page viewer
│   │   │   ├── ReaderControls.vue    # Reader controls (nav, zoom)
│   │   │   └── ReaderLayout.vue      # Reader container layout
│   │   └── ui/
│   │       ├── Sidebar.vue
│   │       └── TopBar.vue
│   │
│   ├── views/                        # Views (pages)
│   │   ├── HomeView.vue              # Main library
│   │   ├── MangaDetailView.vue       # Info + chapter list
│   │   └── ReaderView.vue            # Chapter reader
│   │
│   ├── stores/                       # Global state (Pinia)
│   │   ├── libraryStore.ts           # Mangas and chapters
│   │   └── readerStore.ts            # Reader state (page, zoom...)
│   │
│   ├── router/
│   │   └── index.ts                  # App routes
│   │
│   ├── db/
│   │   ├── index.ts                  # DB initialization
│   │   ├── manga.ts                  # Manga queries
│   │   └── chapter.ts                # Chapter queries
│   │
│   ├── types/
│   │   └── index.ts                  # Global TypeScript types
│   │
│   ├── App.vue
│   └── main.ts
│
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## Data Model (SQLite)

### Table `mangas`

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER PK | Unique ID |
| `title` | TEXT | Manga title |
| `author` | TEXT | Author |
| `cover_path` | TEXT | Path to cover image |
| `status` | TEXT | `reading` / `completed` / `on_hold` |
| `created_at` | DATETIME | Date added |

### Table `chapters`

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER PK | Unique ID |
| `manga_id` | INTEGER FK | Reference to `mangas.id` |
| `number` | REAL | Chapter number |
| `title` | TEXT | Chapter title (optional) |
| `folder_path` | TEXT | Path to folder with images |
| `read` | BOOLEAN | Whether it has been read |
| `last_page` | INTEGER | Last page read |
| `created_at` | DATETIME | Date added |

---

## App Routes (Vue Router)

| Route | View | Description |
|-------|------|-------------|
| `/` | `HomeView` | Manga library |
| `/manga/:id` | `MangaDetailView` | Detail + chapter list |
| `/reader/:chapterId` | `ReaderView` | Chapter reader |

---

## Development Phases

| Phase | Goal | Status |
|-------|------|--------|
| **1 — Setup** | Initialize Tauri + Vue 3 + dependencies | ⬜ Pending |
| **2 — Database** | Create SQLite schema and base queries | ⬜ Pending |
| **3 — Library** | UI to list and organize mangas | ⬜ Pending |
| **4 — Reader** | Image viewer per chapter | ⬜ Pending |
| **5 — Import** | Load local folders/files | ⬜ Pending |
| **6 — Cloud** | Remote sync | ⬜ Future |