import { NightAmbience } from '../../components/NightAmbience'
import { DEFAULT_THEME } from '../../theme/genres'

/**
 * O painel da esquerda das telas de entrada: uma torre-biblioteca em pixel art
 * sobre o céu noturno. É a primeira promessa visual do produto — o mundo
 * explorável começa aqui, não só depois do login.
 */
export function AuthScene({ quote, author }: { quote: string; author: string }) {
  return (
    <div className="relative hidden lg:flex flex-col justify-end overflow-hidden border-r border-ink-800">
      <NightAmbience palette={DEFAULT_THEME.night} seed="portao" moonAt="left" />

      {/* colinas ao fundo */}
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute bottom-40 inset-x-0 h-40 opacity-60" aria-hidden="true">
        <path d="M0 120 L0 70 Q60 30 120 62 Q190 96 250 54 Q320 12 400 58 L400 120 Z" fill="#10182e" />
      </svg>

      {/* a torre-biblioteca */}
      <svg
        viewBox="0 0 160 150"
        className="absolute bottom-[9.5rem] left-1/2 -translate-x-1/2 w-[22rem] lw-pixel"
        aria-hidden="true"
      >
        {/* torre alta */}
        <rect x="52" y="18" width="46" height="106" fill="#1b2440" />
        <rect x="52" y="18" width="46" height="5" fill="#0e1425" />
        <path d="M46 20 L75 2 L104 20 Z" fill="#8b5cf6" />
        <path d="M46 20 L75 2 L75 20 Z" fill="#6d3fe0" />
        <rect x="72" y="0" width="6" height="6" fill="#fcd34d" className="lw-blink" />

        {/* janelas acesas — cada uma é alguém lendo */}
        <rect x="60" y="32" width="12" height="14" fill="#0a0d1c" />
        <rect x="62" y="34" width="8" height="10" fill="#fbbf24" opacity="0.9" />
        <rect x="80" y="32" width="12" height="14" fill="#0a0d1c" />
        <rect x="82" y="34" width="8" height="10" fill="#fbbf24" opacity="0.35" />
        <rect x="60" y="56" width="12" height="14" fill="#0a0d1c" />
        <rect x="62" y="58" width="8" height="10" fill="#fbbf24" opacity="0.55" />
        <rect x="80" y="56" width="12" height="14" fill="#0a0d1c" />
        <rect x="82" y="58" width="8" height="10" fill="#22d3ee" opacity="0.6" />
        <rect x="60" y="80" width="12" height="14" fill="#0a0d1c" />
        <rect x="62" y="82" width="8" height="10" fill="#fbbf24" opacity="0.8" />
        <rect x="80" y="80" width="12" height="14" fill="#0a0d1c" />
        <rect x="82" y="82" width="8" height="10" fill="#fbbf24" opacity="0.25" />

        {/* porta */}
        <rect x="68" y="102" width="16" height="22" fill="#2b2314" />
        <rect x="70" y="105" width="12" height="19" fill="#3d3220" />
        <rect x="79" y="113" width="2" height="2" fill="#fcd34d" />

        {/* ala esquerda */}
        <rect x="16" y="72" width="36" height="52" fill="#1b2440" />
        <path d="M10 74 L34 56 L58 74 Z" fill="#f59e0b" />
        <path d="M10 74 L34 56 L34 74 Z" fill="#b45309" />
        <rect x="24" y="84" width="10" height="12" fill="#0a0d1c" />
        <rect x="26" y="86" width="6" height="8" fill="#fbbf24" opacity="0.7" />
        <rect x="38" y="84" width="10" height="12" fill="#0a0d1c" />
        <rect x="40" y="86" width="6" height="8" fill="#fbbf24" opacity="0.3" />

        {/* ala direita */}
        <rect x="98" y="80" width="34" height="44" fill="#1b2440" />
        <path d="M92 82 L115 64 L138 82 Z" fill="#22d3ee" />
        <path d="M92 82 L115 64 L115 82 Z" fill="#0e7490" />
        <rect x="106" y="92" width="10" height="12" fill="#0a0d1c" />
        <rect x="108" y="94" width="6" height="8" fill="#67e8f9" opacity="0.65" />

        {/* chão de pedra */}
        <rect x="0" y="124" width="160" height="6" fill="#141c30" />
        <rect x="0" y="130" width="160" height="20" fill="#0c1220" />

        {/* postes na calçada */}
        <rect x="8" y="106" width="3" height="20" fill="#0a0d1c" />
        <rect x="5" y="100" width="9" height="8" fill="#0a0d1c" />
        <rect x="7" y="102" width="5" height="5" fill="#fcd34d" opacity="0.9" />
        <rect x="146" y="106" width="3" height="20" fill="#0a0d1c" />
        <rect x="143" y="100" width="9" height="8" fill="#0a0d1c" />
        <rect x="145" y="102" width="5" height="5" fill="#fcd34d" opacity="0.9" />

        {/* o leitor a caminho da porta */}
        <g className="lw-bob">
          <rect x="112" y="108" width="10" height="4" fill="#05060d" />
          <rect x="113" y="112" width="8" height="8" fill="#d97706" />
          <rect x="112" y="120" width="10" height="6" fill="#0b0d18" />
          <rect x="121" y="114" width="4" height="5" fill="#e5e0d2" />
        </g>
      </svg>

      <div className="relative px-12 pb-14 space-y-3">
        <span className="block h-px w-16 bg-gradient-to-r from-ember-400/70 to-transparent" />
        <p className="font-serif italic text-2xl text-slate-300/90 leading-relaxed max-w-md">
          “{quote}”
        </p>
        <p className="font-pixel text-[8px] text-slate-500 tracking-widest uppercase">{author}</p>
      </div>
    </div>
  )
}
