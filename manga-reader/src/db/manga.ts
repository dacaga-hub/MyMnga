import { getDb } from './index'
import type { Manga } from '../types'

export async function getAllMangas(): Promise<Manga[]> {
  const db = await getDb()
  return await db.select('SELECT * FROM mangas ORDER BY created_at DESC')
}

export async function getMangaById(id: number): Promise<Manga | null> {
  const db = await getDb()
  const results = await db.select<Manga[]>('SELECT * FROM mangas WHERE id = ?', [id])
  return results[0] ?? null
}

export async function insertManga(manga: Omit<Manga, 'id' | 'created_at'>): Promise<number> {
  const db = await getDb()
  const result = await db.execute(
    'INSERT INTO mangas (title, author, cover_path, status) VALUES (?, ?, ?, ?)',
    [manga.title, manga.author ?? null, manga.cover_path ?? null, manga.status]
  )
  return result.lastInsertId ?? 0
}

export async function deleteManga(id: number): Promise<void> {
  const db = await getDb()
  await db.execute('DELETE FROM mangas WHERE id = ?', [id])
}