export type ReadingStatus = 'QUERO_LER' | 'LENDO' | 'LIDO' | 'ABANDONADO'

export interface ShelfItem {
  id: string
  bookId: string
  title: string
  authors: string
  coverUrl: string
  pageCount: number | null
  status: ReadingStatus
  currentPage: number
  startedAt: string | null
  finishedAt: string | null
  genreSlug: string | null
}

export interface Genre {
  id: number
  slug: string
  name: string
}

export interface SearchResult {
  googleBooksId: string
  title: string
  authors: string
  pageCount: number
  coverUrl: string
}