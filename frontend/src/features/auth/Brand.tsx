/** A marca, escrita do mesmo jeito nas duas telas de entrada. */
export function Brand({ tagline }: { tagline: string }) {
  return (
    <div className="text-center space-y-3">
      <h1
        className="font-display font-semibold text-ember-100 tracking-[0.1em] uppercase leading-tight
                   drop-shadow-[0_0_34px_rgba(251,191,36,0.3)]"
        style={{ fontSize: 'clamp(1.6rem, 4.4vw, 2.4rem)' }}
      >
        Literary<span className="text-ember-400">World</span>
      </h1>
      <div className="flex items-center justify-center gap-2.5">
        <span className="h-px w-8 bg-ink-700" />
        <span className="font-pixel text-[7px] text-ember-400/70 uppercase tracking-widest">press start</span>
        <span className="h-px w-8 bg-ink-700" />
      </div>
      <p className="font-serif italic text-lg text-slate-400">{tagline}</p>
    </div>
  )
}
