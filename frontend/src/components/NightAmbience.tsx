import type { Atmosphere } from './atmospheres'
import { DEFAULT_ATMOSPHERE } from './atmospheres'

export function NightAmbience({ atmosphere = DEFAULT_ATMOSPHERE }: { atmosphere?: Atmosphere }) {
  const [top, mid, bottom] = atmosphere.sky

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: `linear-gradient(to bottom, ${top}, ${mid}, ${bottom})` }}
      />

      {/* a aurora — a faixa de luz do gênero atravessando o céu */}
      <div
        className="absolute -top-20 left-0 right-0 h-[45vh] blur-3xl transition-all duration-1000"
        style={{
          background: `linear-gradient(115deg, transparent 15%, ${atmosphere.aurora} 45%, transparent 80%)`,
        }}
      />

      {/* o horizonte — a cidade distante brilhando no rodapé */}
      <div
        className="absolute bottom-0 inset-x-0 h-72 blur-2xl transition-all duration-1000"
        style={{ background: `linear-gradient(to top, ${atmosphere.horizon}, transparent)` }}
      />

      {/* estrelas */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 15% 25%, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 45% 12%, rgba(255,255,255,0.6), transparent), radial-gradient(1.5px 1.5px at 75% 30%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 30% 55%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 88% 65%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 60% 80%, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 10% 85%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 95% 15%, rgba(255,255,255,0.7), transparent)',
        }}
      />

      {/* vinheta suave */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.30)_100%)]" />
    </div>
  )
}