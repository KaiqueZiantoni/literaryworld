/** Silhueta do conteúdo enquanto ele chega — no lugar do texto "carregando". */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`lw-skeleton rounded-md ${className}`} aria-hidden="true" />
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/60 overflow-hidden">
      <Skeleton className="h-52 w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  )
}

export function ShelfSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {Array.from({ length: count }, (_, index) => (
        <BookCardSkeleton key={index} />
      ))}
    </div>
  )
}
