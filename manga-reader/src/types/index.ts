export interface Manga {
  id?: number
  title: string
  author?: string
  cover_path?: string
  status: 'reading' | 'completed' | 'on_hold'
  created_at?: string
}

export interface Chapter {
  id?: number
  manga_id: number
  number: number
  title?: string
  folder_path: string
  read: boolean
  last_page: number
  created_at?: string
}