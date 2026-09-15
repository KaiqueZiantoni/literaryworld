import type { WorldPalette } from '../../theme/genres'

/**
 * O cenário do mundo, desenhado em grade de pixel.
 *
 * Toda peça recebe a paleta da região em que nasce — a mesma casa fica roxa em
 * Fantasia e azul-neon em Ficção Científica sem virar dois componentes.
 * `shapeRendering="crispEdges"` é o que impede o navegador de suavizar a borda e
 * transformar pixel art em borrão.
 */

interface Tinted {
  palette: WorldPalette
  size?: number
}

const PIXEL = { shapeRendering: 'crispEdges' as const, 'aria-hidden': true as const }

function Shadow({ x, y, width, height = 4 }: { x: number; y: number; width: number; height?: number }) {
  return <ellipse cx={x} cy={y} rx={width / 2} ry={height / 2} fill="rgba(0,0,0,0.28)" />
}

/* ══════════════════ CONSTRUÇÕES ══════════════════ */

/** A casa-sede da vila: é dela que sai a placa com o nome do gênero. */
export function CasaGrande({ palette, size = 190 }: Tinted) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 136 122" {...PIXEL}>
      <Shadow x={68} y={118} width={118} height={8} />

      {/* telhado */}
      <path d="M4 50 L68 6 L132 50 Z" fill={palette.roof} />
      <path d="M4 50 L68 6 L68 50 Z" fill={palette.roofShade} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={10 + i * 15} y={50 - i * 0} width="2" height="0" fill="none" />
      ))}
      <rect x="0" y="50" width="136" height="7" fill={palette.roofShade} />
      <rect x="0" y="50" width="136" height="2" fill="rgba(255,255,255,0.35)" />

      {/* corpo */}
      <rect x="12" y="57" width="112" height="58" fill={palette.wall} />
      <rect x="12" y="57" width="112" height="4" fill={palette.wallShade} />
      <rect x="12" y="109" width="112" height="6" fill={palette.wallShade} />
      {/* tábuas */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={12} y={65 + i * 8} width="112" height="1" fill="rgba(0,0,0,0.07)" />
      ))}

      {/* porta */}
      <rect x="57" y="78" width="24" height="37" fill={palette.roofShade} />
      <rect x="60" y="81" width="18" height="34" fill="#2b2314" />
      <rect x="74" y="97" width="3" height="3" fill={palette.accent} />
      {/* degrau */}
      <rect x="53" y="115" width="32" height="4" fill={palette.pathEdge} />

      {/* janelas acesas */}
      <rect x="24" y="70" width="22" height="20" fill="#2b2314" />
      <rect x="26" y="72" width="18" height="16" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.55;1" dur="4.6s" repeatCount="indefinite" />
      </rect>
      <rect x="34" y="72" width="2" height="16" fill="#2b2314" />
      <rect x="90" y="70" width="22" height="20" fill="#2b2314" />
      <rect x="92" y="72" width="18" height="16" fill={palette.accent} opacity="0.45" />
      <rect x="100" y="72" width="2" height="16" fill="#2b2314" />

      {/* toldo de livraria */}
      <rect x="20" y="90" width="30" height="5" fill={palette.roof} />
      <rect x="86" y="90" width="30" height="5" fill={palette.roof} />

      {/* chaminé */}
      <rect x="100" y="14" width="12" height="22" fill={palette.wallShade} />
      <rect x="98" y="12" width="16" height="5" fill={palette.roofShade} />
    </svg>
  )
}

export function CasaPequena({ palette, size = 118 }: Tinted) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 88 78" {...PIXEL}>
      <Shadow x={44} y={75} width={74} height={6} />
      <path d="M2 32 L44 4 L86 32 Z" fill={palette.roof} />
      <path d="M2 32 L44 4 L44 32 Z" fill={palette.roofShade} />
      <rect x="0" y="32" width="88" height="5" fill={palette.roofShade} />
      <rect x="10" y="37" width="68" height="36" fill={palette.wall} />
      <rect x="10" y="69" width="68" height="4" fill={palette.wallShade} />
      <rect x="36" y="50" width="16" height="23" fill="#2b2314" />
      <rect x="47" y="61" width="2" height="2" fill={palette.accent} />
      <rect x="17" y="45" width="14" height="13" fill="#2b2314" />
      <rect x="19" y="47" width="10" height="9" fill={palette.accent} opacity="0.65" />
      <rect x="57" y="45" width="14" height="13" fill="#2b2314" />
      <rect x="59" y="47" width="10" height="9" fill={palette.accent}>
        <animate attributeName="opacity" values="0.9;0.35;0.9" dur="5.4s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

/** Banca de livros — a vila precisa de um lugar onde a história circula. */
export function Banca({ palette, size = 110 }: Tinted) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 92 76" {...PIXEL}>
      <Shadow x={46} y={73} width={76} height={6} />
      <rect x="10" y="34" width="72" height="34" fill={palette.wall} />
      <rect x="10" y="64" width="72" height="4" fill={palette.wallShade} />
      {/* toldo listrado */}
      {Array.from({ length: 6 }, (_, i) => (
        <rect
          key={i}
          x={6 + i * 13}
          y="22"
          width="13"
          height="12"
          fill={i % 2 === 0 ? palette.roof : palette.wall}
        />
      ))}
      <rect x="6" y="20" width="80" height="3" fill={palette.roofShade} />
      <rect x="8" y="34" width="4" height="34" fill={palette.roofShade} />
      <rect x="80" y="34" width="4" height="34" fill={palette.roofShade} />
      {/* livros na bancada */}
      <rect x="18" y="44" width="6" height="16" fill="#b91c1c" />
      <rect x="26" y="40" width="6" height="20" fill="#2563eb" />
      <rect x="34" y="46" width="6" height="14" fill="#16a34a" />
      <rect x="42" y="42" width="6" height="18" fill={palette.accent} />
      <rect x="50" y="47" width="6" height="13" fill="#8b5cf6" />
      <rect x="58" y="43" width="6" height="17" fill="#f97316" />
      <rect x="16" y="60" width="56" height="3" fill="#2b2314" />
    </svg>
  )
}

/* ══════════════════ MOBÍLIA ══════════════════ */

export function Arvore({ palette, size = 74 }: Tinted) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 48 62" {...PIXEL}>
      <Shadow x={24} y={59} width={30} height={6} />
      <rect x="20" y="42" width="8" height="16" fill="#6b4a22" />
      <rect x="20" y="42" width="3" height="16" fill="#4a3116" />
      <rect x="6" y="22" width="36" height="22" rx="3" fill={palette.grassDeep} />
      <rect x="2" y="26" width="44" height="14" rx="3" fill={palette.grass} />
      <rect x="10" y="10" width="28" height="20" rx="3" fill={palette.grass} />
      <rect x="14" y="5" width="20" height="14" rx="3" fill={palette.grassAlt} />
      <rect x="18" y="9" width="5" height="4" fill="rgba(255,255,255,0.3)" />
      <rect x="28" y="18" width="5" height="4" fill="rgba(255,255,255,0.2)" />
      <rect x="10" y="30" width="5" height="4" fill="rgba(0,0,0,0.14)" />
    </svg>
  )
}

export function Arbusto({ palette, size = 46 }: Tinted) {
  return (
    <svg width={size} height={size * 0.76} viewBox="0 0 32 24" {...PIXEL}>
      <Shadow x={16} y={22} width={24} height={4} />
      <rect x="3" y="10" width="26" height="11" rx="3" fill={palette.grassDeep} />
      <rect x="7" y="5" width="18" height="11" rx="3" fill={palette.grass} />
      <rect x="10" y="7" width="5" height="3" fill={palette.grassAlt} />
      <rect x="19" y="12" width="5" height="3" fill={palette.grassAlt} />
    </svg>
  )
}

export function Flor({ palette, size = 26 }: Tinted) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" {...PIXEL}>
      <rect x="7" y="10" width="2" height="5" fill={palette.grassDeep} />
      <rect x="6" y="6" width="4" height="4" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.65;1" dur="3.4s" repeatCount="indefinite" />
      </rect>
      <rect x="6" y="2" width="4" height="4" fill={palette.roof} />
      <rect x="2" y="6" width="4" height="4" fill={palette.roof} />
      <rect x="10" y="6" width="4" height="4" fill={palette.roof} />
      <rect x="6" y="10" width="4" height="3" fill={palette.roof} />
    </svg>
  )
}

export function Pedra({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 24 17" {...PIXEL}>
      <Shadow x={12} y={16} width={20} height={3} />
      <rect x="3" y="6" width="18" height="9" fill="#7b8497" />
      <rect x="5" y="3" width="14" height="5" fill="#98a2b3" />
      <rect x="7" y="4" width="5" height="2" fill="#b7c0cc" />
      <rect x="3" y="13" width="18" height="2" fill="#5e6779" />
    </svg>
  )
}

export function Tufo({ palette, size = 28 }: Tinted) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 20 12" {...PIXEL}>
      <rect x="2" y="6" width="3" height="6" fill={palette.grassDeep} />
      <rect x="7" y="3" width="3" height="9" fill={palette.grassAlt} />
      <rect x="12" y="5" width="3" height="7" fill={palette.grassDeep} />
      <rect x="16" y="8" width="3" height="4" fill={palette.grassAlt} />
    </svg>
  )
}

export function Poste({ palette, size = 40 }: Tinted) {
  return (
    <svg width={size} height={size * 2.5} viewBox="0 0 28 74" {...PIXEL}>
      <Shadow x={14} y={72} width={18} height={4} />
      <rect x="11" y="16" width="6" height="56" fill="#39404f" />
      <rect x="11" y="16" width="2" height="56" fill="#232935" />
      <rect x="8" y="6" width="12" height="11" fill="#2b3140" />
      <rect x="10" y="8" width="8" height="8" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.6;1" dur="3.2s" repeatCount="indefinite" />
      </rect>
      <rect x="7" y="3" width="14" height="3" fill="#232935" />
    </svg>
  )
}

export function Poco({ palette, size = 64 }: Tinted) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 48 56" {...PIXEL}>
      <Shadow x={24} y={53} width={40} height={6} />
      <rect x="7" y="36" width="34" height="16" fill="#7b8497" />
      <rect x="7" y="36" width="34" height="4" fill="#98a2b3" />
      <rect x="11" y="40" width="26" height="9" fill={palette.water} />
      <rect x="13" y="42" width="8" height="3" fill="rgba(255,255,255,0.35)" />
      <rect x="9" y="28" width="5" height="11" fill="#6b4a22" />
      <rect x="34" y="28" width="5" height="11" fill="#6b4a22" />
      <path d="M5 28 L24 16 L43 28" stroke={palette.roof} strokeWidth="5" fill="none" />
      <rect x="22" y="24" width="4" height="9" fill="#4a3116" />
      <rect x="19" y="32" width="10" height="6" fill="#8a6a35" />
    </svg>
  )
}

export function Cerca({ palette, width = 110 }: { palette: WorldPalette; width?: number }) {
  const posts = Math.max(2, Math.floor(width / 24))
  return (
    <svg width={width} height={30} viewBox={`0 0 ${posts * 24} 26`} {...PIXEL}>
      <rect x="0" y="9" width={posts * 24} height="4" fill={palette.pathEdge} />
      <rect x="0" y="17" width={posts * 24} height="4" fill={palette.pathEdge} />
      {Array.from({ length: posts }, (_, i) => (
        <g key={i}>
          <rect x={i * 24 + 4} y="3" width="7" height="23" fill="#8a6a35" />
          <rect x={i * 24 + 4} y="3" width="3" height="23" fill="#6b4a22" />
          <rect x={i * 24 + 4} y="3" width="7" height="2" fill="#a88448" />
        </g>
      ))}
    </svg>
  )
}

/** A placa de entrada da vila — texto vai por cima, em HTML. */
export function Placa({ palette, width = 168 }: { palette: WorldPalette; width?: number }) {
  return (
    <svg width={width} height={62} viewBox="0 0 168 62" {...PIXEL}>
      <rect x="78" y="34" width="10" height="28" fill="#6b4a22" />
      <rect x="78" y="34" width="4" height="28" fill="#4a3116" />
      <rect x="4" y="4" width="160" height="34" fill="#8a6a35" />
      <rect x="4" y="4" width="160" height="4" fill="#a88448" />
      <rect x="4" y="34" width="160" height="4" fill="#4a3116" />
      <rect x="10" y="10" width="148" height="22" fill="#3d2a14" />
      <rect x="8" y="8" width="4" height="4" fill={palette.accent} />
      <rect x="156" y="8" width="4" height="4" fill={palette.accent} />
    </svg>
  )
}

/** Lago: dá respiro visual e serve de obstáculo natural. */
export function Lago({ palette, width = 240, height = 150 }: { palette: WorldPalette; width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 120 75" {...PIXEL}>
      <rect x="8" y="8" width="104" height="59" rx="10" fill={palette.pathEdge} opacity="0.5" />
      <rect x="12" y="12" width="96" height="51" rx="9" fill={palette.water} />
      <rect x="12" y="12" width="96" height="8" rx="4" fill="rgba(255,255,255,0.22)" />
      <rect x="24" y="30" width="22" height="3" fill="rgba(255,255,255,0.35)">
        <animate attributeName="x" values="24;34;24" dur="6s" repeatCount="indefinite" />
      </rect>
      <rect x="64" y="46" width="18" height="3" fill="rgba(255,255,255,0.25)">
        <animate attributeName="x" values="64;54;64" dur="7.5s" repeatCount="indefinite" />
      </rect>
      <rect x="72" y="22" width="14" height="6" rx="3" fill={palette.grass} />
      <rect x="30" y="52" width="12" height="5" rx="2" fill={palette.grass} />
    </svg>
  )
}

/* ══════════════════ O CAMINHANTE ══════════════════ */

export type Facing = 'down' | 'up' | 'left' | 'right'

const SKIN = '#f1c08a'
const SKIN_SHADE = '#d39a63'
const HAIR = '#3b2412'
const COAT = '#c2410c'
const COAT_SHADE = '#8a2a08'
const PANTS = '#26324f'
const BOOK = '#facc15'

/**
 * O leitor. Quatro direções, duas poses de passo — o mínimo que dá sensação de
 * caminhada sem virar um estudo de animação.
 */
export function Walker({ step, facing, size = 3 }: { step: 0 | 1; facing: Facing; size?: number }) {
  const back = facing === 'up'
  const side = facing === 'left' || facing === 'right'
  const flip = facing === 'left'
  const lift = step === 1

  return (
    <svg
      width={16 * size}
      height={22 * size}
      viewBox="0 0 16 22"
      {...PIXEL}
      style={{ transform: flip ? 'scaleX(-1)' : undefined, overflow: 'visible' }}
    >
      <ellipse cx="8" cy="21.4" rx="5" ry="1.4" fill="rgba(0,0,0,0.3)" />

      {/* pernas */}
      <rect x={lift ? 4 : 3} y="16" width="3" height={lift ? 4 : 5} fill={PANTS} />
      <rect x={lift ? 9 : 10} y="16" width="3" height={lift ? 5 : 4} fill={PANTS} />
      <rect x={lift ? 4 : 3} y={lift ? 20 : 21} width="4" height="1" fill="#1a1108" />
      <rect x={lift ? 9 : 10} y={lift ? 21 : 20} width="4" height="1" fill="#1a1108" />

      {/* casaco */}
      <rect x="3" y="9" width="10" height="8" fill={COAT} />
      <rect x="3" y="9" width="10" height="2" fill="#e2570f" />
      <rect x="3" y="15" width="10" height="2" fill={COAT_SHADE} />
      {!back && !side && <rect x="7" y="11" width="2" height="5" fill={COAT_SHADE} />}

      {/* braços */}
      <rect x={lift ? 1 : 2} y="10" width="2" height="5" fill={COAT_SHADE} />
      <rect x={lift ? 13 : 12} y="10" width="2" height="5" fill={COAT_SHADE} />

      {/* o livro debaixo do braço — é o que faz ele ser um leitor */}
      {!back && <rect x={side ? 11 : 12} y="12" width="3" height="4" fill={BOOK} />}
      {!back && <rect x={side ? 11 : 12} y="12" width="3" height="1" fill="#fde68a" />}

      {/* cabeça */}
      <rect x="4" y="3" width="8" height="7" fill={SKIN} />
      <rect x="4" y="9" width="8" height="1" fill={SKIN_SHADE} />
      <rect x="3" y="1" width="10" height="4" fill={HAIR} />
      <rect x="3" y="4" width="2" height="3" fill={HAIR} />
      <rect x="11" y="4" width="2" height="3" fill={HAIR} />

      {/* rosto — some quando ele anda de costas */}
      {!back && (
        <>
          <rect x={side ? 9 : 5} y="6" width="2" height="2" fill="#1a1108" />
          {!side && <rect x="9" y="6" width="2" height="2" fill="#1a1108" />}
          {!side && <rect x="7" y="8" width="2" height="1" fill={SKIN_SHADE} />}
        </>
      )}
    </svg>
  )
}
