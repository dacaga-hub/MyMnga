<template>
  <div class="import">
    <button class="btn-import" @click="selectFolder">
      + ADD MANGA
    </button>
  </div>
</template>

<script setup lang="ts">
import { open, message } from '@tauri-apps/plugin-dialog'
import { readDir } from '@tauri-apps/plugin-fs'
import { useLibraryStore } from '../../stores/libraryStore'
import { getMangaByTitle } from '../../db/manga'

const store = useLibraryStore()

async function selectFolder() {
  try {
    const mangaPath = await open({
      directory: true,
      title: 'Select Manga Folder',
    })

    if (!mangaPath) return

    const entries = await readDir(mangaPath as string)

    const parts = (mangaPath as string).replace(/\\/g, '/').split('/')
    const title = parts[parts.length - 1]

    const existing = await getMangaByTitle(title)
    if (existing) {
      await message(`"${title}" is already in your library.`, {
        title: 'Already imported',
        kind: 'warning',
      })
      return
    }

    const coverEntry = entries.find(e =>
      e.name && /^cover\.(jpg|jpeg|png|webp)$/i.test(e.name)
    )
    const coverPath = coverEntry ? `${mangaPath}/${coverEntry.name}` : undefined

    const chapterFolders = entries.filter(e => e.name && /chapter/i.test(e.name))

    const mangaId = await store.addManga({
      title,
      cover_path: coverPath,
      status: 'reading',
    })

    for (const folder of chapterFolders) {
      const match = folder.name!.match(/(\d+(\.\d+)?)/)
      const number = match ? parseFloat(match[1]) : 0
      await store.addChapter({
        manga_id: mangaId,
        number,
        title: folder.name,
        folder_path: `${mangaPath}/${folder.name}`,
        read: false,
        last_page: 0,
      })
    }

    await message(`"${title}" imported with ${chapterFolders.length} chapters.`, { title: 'Import successful', kind: 'info' })
  } catch (err) {
    console.error('Import error:', err)
    await message(`${err}`, { title: 'Import error', kind: 'error' })
  }
}
</script>

<style scoped>
.btn-import {
  padding: 12px 24px;
  background-color: #ff6b35;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-import:hover {
  background-color: #e55a24;
}
</style>