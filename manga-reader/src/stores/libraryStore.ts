import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Manga, Chapter } from '../types'
import { getAllMangas, insertManga, deleteManga } from '../db/manga'
import { getChaptersByManga, insertChapter, deleteChaptersByManga } from '../db/chapter'

export const useLibraryStore = defineStore('library', () => {
  const mangas = ref<Manga[]>([])
  const currentChapters = ref<Chapter[]>([])
  const loading = ref(false)

  async function fetchMangas() {
    loading.value = true
    mangas.value = await getAllMangas()
    loading.value = false
  }

  async function addManga(manga: Omit<Manga, 'id' | 'created_at'>) {
    const id = await insertManga(manga)
    await fetchMangas()
    return id
  }

  async function removeManga(id: number) {
  await deleteChaptersByManga(id)
  await deleteManga(id)
  await fetchMangas()
}

  async function fetchChapters(mangaId: number) {
    currentChapters.value = await getChaptersByManga(mangaId)
  }

  async function addChapter(chapter: Omit<Chapter, 'id' | 'created_at'>) {
    await insertChapter(chapter)
    await fetchChapters(chapter.manga_id)
  }

  return {
    mangas,
    currentChapters,
    loading,
    fetchMangas,
    addManga,
    removeManga,
    fetchChapters,
    addChapter,
  }
})