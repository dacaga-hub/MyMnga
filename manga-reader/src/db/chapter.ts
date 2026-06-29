import { getDb } from './index'
import type { Chapter } from '../types'

export async function getChaptersByManga(mangaId: number): Promise<Chapter[]> {
  const db = await getDb()
  return await db.select(
    'SELECT * FROM chapters WHERE manga_id = ? ORDER BY number ASC',
    [mangaId]
  )
}

export async function insertChapter(chapter: Omit<Chapter, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb()
  const result = await db.execute(
    'INSERT INTO chapters (manga_id, number, title, folder_path, read, last_page) VALUES (?, ?, ?, ?, ?, ?)',
    [chapter.manga_id, chapter.number, chapter.title ?? null, chapter.folder_path, chapter.read ? 1 : 0, chapter.last_page]
  )
  return result.lastInsertId ?? 0
}

export async function updateChapterProgress(id: number, lastPage: number, read: boolean): Promise<void> {
  const db = await getDb()
  await db.execute(
    'UPDATE chapters SET last_page = ?, read = ? WHERE id = ?',
    [lastPage, read ? 1 : 0, id]
  )
}

export async function deleteChapter(id: number): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM chapters WHERE id = ?', [id])
}

export async function getChapterById(id: number): Promise<Chapter | null> {
  const db = await getDb()
  const results = await db.select<Chapter[]>('SELECT * FROM chapters WHERE id = ?', [id])
  return results[0] ?? null
}

export async function deleteChaptersByManga(mangaId: number): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM chapters WHERE manga_id = ?', [mangaId])
}

export async function getNextChapter(mangaId: number, currentNumber: number): Promise<Chapter | null> {
  const db = await getDb()
  const results = await db.select<Chapter[]>(
    'SELECT * FROM chapters WHERE manga_id = ? AND number > ? ORDER BY number ASC LIMIT 1',
    [mangaId, currentNumber]
  )
  return results[0] ?? null
}

