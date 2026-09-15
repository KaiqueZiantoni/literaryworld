export type ReadingStatus = 'QUERO_LER' | 'LENDO' | 'LIDO' | 'ABANDONADO'

export interface ShelfItem {
  id: string
  bookId: string
  title: string
  authors: string
  coverUrl: string | null
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

export interface WorldGenre {
  slug: string
  name: string
  booksFinished: number
  pagesRead: number
}

export interface WorldBook {
  bookId: string
  title: string
  coverUrl: string
  status: ReadingStatus
  progressPercent: number
  genreSlug: string | null
  genreSlugs: string[]
  reviewRating: number | null
  reviewBody: string | null
  reviewSpoiler: boolean | null
}

export interface World {
  username: string
  displayName: string
  genres: WorldGenre[]
  books: WorldBook[]
}

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  QUERO_LER: 'quero ler',
  LENDO: 'lendo',
  LIDO: 'lido',
  ABANDONADO: 'abandonado',
}

export function progressPercent(item: ShelfItem): number {
  if (item.status === 'LIDO') return 100
  if (!item.pageCount || item.pageCount === 0) return 0
  return Math.min(100, Math.round((item.currentPage / item.pageCount) * 100))
}
