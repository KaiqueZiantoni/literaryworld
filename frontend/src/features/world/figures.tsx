import type { ReactElement } from 'react'
import type { WorldPalette } from '../../theme/genres'
import { hashText } from '../../theme/genres'

/**
 * Os marcos do mundo: cada livro concluído vira uma peça de cenário na vila do
 * seu gênero. É o cruzamento que o produto promete — a estante lida virando
 * paisagem de jogo, com o vocabulário visual que o leitor reconhece do gênero.
 *
 * Alguns títulos famosos têm peça própria (a curadoria); o resto sorteia dentro
 * do conjunto do gênero, sempre pelo mesmo hash, para que o mundo não embaralhe
 * a cada visita.
 */

export interface FigureProps {
  palette: WorldPalette
  size?: number
}

export type FigureComponent = (props: FigureProps) => ReactElement

const PIXEL = { shapeRendering: 'crispEdges' as const, 'aria-hidden': true as const }

function Base({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  return <ellipse cx={cx} cy={cy} rx={w / 2} ry={w / 8} fill="rgba(0,0,0,0.3)" />
}

/* ───────────────────────── FANTASIA ───────────────────────── */

export function Dragao({ palette, size = 108 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 72 62" {...PIXEL}>
      <Base cx={36} cy={59} w={44} />
      <path d="M34 20 L54 4 L58 22 Z" fill={palette.roof} />
      <path d="M34 20 L54 4 L46 18 Z" fill={palette.roofShade} />
      <rect x="20" y="24" width="28" height="16" fill={palette.roof} />
      <rect x="20" y="36" width="28" height="4" fill={palette.roofShade} />
      <rect x="12" y="18" width="14" height="12" fill={palette.roof} />
      <rect x="6" y="22" width="8" height="6" fill={palette.roofShade} />
      <rect x="14" y="21" width="4" height="4" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.4;1" dur="2.4s" repeatCount="indefinite" />
      </rect>
      <rect x="19" y="14" width="4" height="5" fill={palette.roofShade} />
      <rect x="25" y="12" width="4" height="7" fill={palette.roofShade} />
      <rect x="22" y="40" width="6" height="12" fill={palette.roofShade} />
      <rect x="40" y="40" width="6" height="12" fill={palette.roofShade} />
      <path d="M48 30 L68 36 L50 40 Z" fill={palette.roofShade} />
      <rect x="4" y="26" width="6" height="3" fill={palette.accent} opacity="0.85" />
    </svg>
  )
}

export function EspadaNaPedra({ palette, size = 74 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 44 58" {...PIXEL}>
      <Base cx={22} cy={55} w={34} />
      <rect x="6" y="38" width="32" height="14" fill="#7b8497" />
      <rect x="8" y="34" width="28" height="6" fill="#98a2b3" />
      <rect x="10" y="35" width="8" height="3" fill="#b7c0cc" />
      <rect x="20" y="8" width="4" height="28" fill="#dbe2ea" />
      <rect x="20" y="8" width="2" height="28" fill="#a9b4c2" />
      <rect x="14" y="20" width="16" height="3" fill={palette.accent} />
      <rect x="20" y="23" width="4" height="5" fill={palette.roofShade} />
      <rect x="19" y="4" width="6" height="5" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.5;1" dur="2.8s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function CristalMagico({ palette, size = 60 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 36 48" {...PIXEL}>
      <Base cx={18} cy={45} w={28} />
      <rect x="6" y="38" width="24" height="7" fill={palette.pathEdge} />
      <path d="M18 2 L30 20 L18 42 L6 20 Z" fill={palette.accent} opacity="0.92">
        <animate attributeName="opacity" values="0.92;0.6;0.92" dur="3.6s" repeatCount="indefinite" />
      </path>
      <path d="M18 2 L18 42 L6 20 Z" fill={palette.roof} opacity="0.75" />
      <rect x="15" y="12" width="4" height="10" fill="rgba(255,255,255,0.6)" />
    </svg>
  )
}

export function TorreMago({ palette, size = 86 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 48 72" {...PIXEL}>
      <Base cx={24} cy={69} w={38} />
      <path d="M8 22 L24 0 L40 22 Z" fill={palette.roof} />
      <path d="M8 22 L24 0 L24 22 Z" fill={palette.roofShade} />
      <rect x="10" y="22" width="28" height="46" fill={palette.wall} />
      <rect x="10" y="22" width="28" height="3" fill={palette.wallShade} />
      <rect x="10" y="64" width="28" height="4" fill={palette.wallShade} />
      <rect x="18" y="30" width="12" height="12" fill="#2b2314" />
      <rect x="20" y="32" width="8" height="8" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.45;1" dur="3.8s" repeatCount="indefinite" />
      </rect>
      <rect x="19" y="50" width="10" height="18" fill="#2b2314" />
      <rect x="22" y="-2" width="4" height="4" fill={palette.accent} />
    </svg>
  )
}

export function Cogumelo({ palette, size = 46 }: FigureProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...PIXEL}>
      <Base cx={16} cy={30} w={22} />
      <rect x="12" y="17" width="8" height="12" fill="#f5ecd8" />
      <rect x="12" y="17" width="3" height="12" fill="#d8cdb4" />
      <path d="M2 17 Q16 0 30 17 Z" fill={palette.roof} />
      <rect x="7" y="10" width="5" height="4" fill="#fff" opacity="0.8" />
      <rect x="18" y="8" width="6" height="5" fill="#fff" opacity="0.8" />
      <rect x="14" y="13" width="4" height="3" fill="#fff" opacity="0.6" />
    </svg>
  )
}

/* ───────────────────── FICÇÃO CIENTÍFICA ───────────────────── */

export function NaveEspacial({ palette, size = 94 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 64 44" {...PIXEL}>
      <ellipse cx="32" cy="41" rx="20" ry="3" fill={palette.accent} opacity="0.25" />
      <g className="lw-bob">
        <ellipse cx="32" cy="26" rx="28" ry="8" fill={palette.wallShade} />
        <ellipse cx="32" cy="23" rx="28" ry="8" fill={palette.wall} />
        <ellipse cx="32" cy="16" rx="14" ry="10" fill={palette.accent} opacity="0.55" />
        <ellipse cx="32" cy="17" rx="10" ry="7" fill="#0a0d1c" opacity="0.45" />
        <rect x="28" y="13" width="4" height="4" fill="#fff" opacity="0.7" />
        <rect x="10" y="25" width="5" height="4" fill={palette.accent}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
        </rect>
        <rect x="29" y="27" width="5" height="4" fill={palette.accent}>
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
        </rect>
        <rect x="48" y="25" width="5" height="4" fill={palette.accent}>
          <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  )
}

export function Robo({ palette, size = 68 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" {...PIXEL}>
      <Base cx={20} cy={47} w={30} />
      <rect x="19" y="2" width="2" height="5" fill={palette.wallShade} />
      <rect x="17" y="0" width="6" height="3" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="10" y="7" width="20" height="14" fill={palette.wall} />
      <rect x="10" y="7" width="20" height="3" fill="#fff" opacity="0.35" />
      <rect x="13" y="12" width="14" height="6" fill="#0a0d1c" />
      <rect x="15" y="14" width="3" height="3" fill={palette.accent} />
      <rect x="22" y="14" width="3" height="3" fill={palette.accent} />
      <rect x="11" y="22" width="18" height="16" fill={palette.wallShade} />
      <rect x="15" y="26" width="10" height="7" fill={palette.accent} opacity="0.7" />
      <rect x="5" y="23" width="5" height="13" fill={palette.wall} />
      <rect x="30" y="23" width="5" height="13" fill={palette.wall} />
      <rect x="12" y="39" width="6" height="8" fill={palette.wallShade} />
      <rect x="22" y="39" width="6" height="8" fill={palette.wallShade} />
    </svg>
  )
}

export function Portal({ palette, size = 78 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 44 56" {...PIXEL}>
      <Base cx={22} cy={53} w={36} />
      <ellipse cx="22" cy="26" rx="18" ry="24" fill={palette.roofShade} />
      <ellipse cx="22" cy="26" rx="13" ry="19" fill={palette.accent} opacity="0.85">
        <animate attributeName="ry" values="19;17;19" dur="3.4s" repeatCount="indefinite" />
      </ellipse>
      <ellipse cx="22" cy="26" rx="7" ry="12" fill="#fff" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.18;0.5" dur="2.6s" repeatCount="indefinite" />
      </ellipse>
      <rect x="2" y="48" width="40" height="5" fill={palette.pathEdge} />
    </svg>
  )
}

export function Satelite({ palette, size = 72 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 44 48" {...PIXEL}>
      <Base cx={22} cy={45} w={30} />
      <rect x="19" y="30" width="6" height="14" fill={palette.wallShade} />
      <rect x="10" y="42" width="24" height="4" fill={palette.pathEdge} />
      <path d="M6 18 Q22 0 38 18 Z" fill={palette.wall} />
      <path d="M10 18 Q22 5 34 18 Z" fill={palette.accent} opacity="0.55" />
      <rect x="20" y="10" width="4" height="10" fill={palette.wallShade} />
      <rect x="18" y="6" width="8" height="5" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.35;1" dur="2.2s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function Terminal({ palette, size = 66 }: FigureProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" {...PIXEL}>
      <Base cx={20} cy={38} w={30} />
      <rect x="4" y="4" width="32" height="26" rx="2" fill={palette.wallShade} />
      <rect x="7" y="7" width="26" height="19" fill="#04140c" />
      <rect x="10" y="10" width="12" height="2" fill={palette.accent} />
      <rect x="10" y="14" width="18" height="2" fill={palette.accent} opacity="0.75" />
      <rect x="10" y="18" width="8" height="2" fill={palette.accent} opacity="0.55" />
      <rect x="20" y="18" width="3" height="2" fill={palette.accent} className="lw-blink" />
      <rect x="14" y="30" width="12" height="4" fill={palette.wall} />
      <rect x="8" y="34" width="24" height="4" fill={palette.wallShade} />
    </svg>
  )
}

export function Servidor({ palette, size = 62 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 36 50" {...PIXEL}>
      <Base cx={18} cy={47} w={28} />
      <rect x="5" y="3" width="26" height="42" fill={palette.wallShade} />
      <rect x="5" y="3" width="26" height="3" fill={palette.wall} />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i}>
          <rect x={8} y={9 + i * 7} width="20" height="5" fill="#0a0d1c" />
          <rect x={10} y={10 + i * 7} width="3" height="3" fill={palette.accent}>
            <animate
              attributeName="opacity"
              values="1;0.2;1"
              dur={`${1.2 + i * 0.35}s`}
              repeatCount="indefinite"
            />
          </rect>
          <rect x={15} y={10 + i * 7} width="10" height="3" fill={palette.roof} opacity="0.4" />
        </g>
      ))}
    </svg>
  )
}

/* ───────────────────────── ROMANCE ───────────────────────── */

export function CoracaoPixel({ palette, size = 58 }: FigureProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" {...PIXEL}>
      <Base cx={16} cy={30} w={20} />
      <g className="lw-bob">
        <rect x="4" y="8" width="8" height="4" fill={palette.roof} />
        <rect x="20" y="8" width="8" height="4" fill={palette.roof} />
        <rect x="2" y="12" width="28" height="4" fill={palette.roof} />
        <rect x="4" y="16" width="24" height="4" fill={palette.roof} />
        <rect x="8" y="20" width="16" height="3" fill={palette.roofShade} />
        <rect x="12" y="23" width="8" height="3" fill={palette.roofShade} />
        <rect x="6" y="10" width="5" height="4" fill="#fff" opacity="0.55" />
      </g>
    </svg>
  )
}

export function BancoDePraca({ palette, size = 88 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.68} viewBox="0 0 60 40" {...PIXEL}>
      <Base cx={30} cy={38} w={46} />
      <rect x="6" y="10" width="48" height="4" fill={palette.roof} />
      <rect x="6" y="16" width="48" height="4" fill={palette.roof} />
      <rect x="4" y="24" width="52" height="5" fill={palette.roofShade} />
      <rect x="8" y="29" width="5" height="9" fill="#4a3116" />
      <rect x="47" y="29" width="5" height="9" fill="#4a3116" />
      <rect x="8" y="8" width="5" height="18" fill="#4a3116" />
      <rect x="47" y="8" width="5" height="18" fill="#4a3116" />
      <rect x="24" y="18" width="7" height="7" fill={palette.accent} opacity="0.9" />
    </svg>
  )
}

export function Roseira({ palette, size = 58 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 34 40" {...PIXEL}>
      <Base cx={17} cy={37} w={26} />
      <rect x="6" y="26" width="22" height="11" fill={palette.pathEdge} />
      <rect x="6" y="26" width="22" height="3" fill={palette.wall} />
      <rect x="16" y="14" width="3" height="13" fill={palette.grassDeep} />
      <rect x="9" y="18" width="3" height="9" fill={palette.grassDeep} />
      <rect x="23" y="20" width="3" height="7" fill={palette.grassDeep} />
      <rect x="13" y="8" width="8" height="7" fill={palette.roof} />
      <rect x="15" y="6" width="4" height="3" fill={palette.roof} />
      <rect x="6" y="13" width="6" height="6" fill={palette.roof} />
      <rect x="21" y="15" width="6" height="6" fill={palette.roof} />
      <rect x="15" y="10" width="3" height="2" fill="#fff" opacity="0.5" />
    </svg>
  )
}

export function CartaSelada({ palette, size = 56 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 36 29" {...PIXEL}>
      <Base cx={18} cy={27} w={28} />
      <g className="lw-bob">
        <rect x="3" y="4" width="30" height="20" fill="#f5ecd8" />
        <rect x="3" y="4" width="30" height="3" fill="#fff" />
        <path d="M3 4 L18 16 L33 4" stroke="#c9bda2" strokeWidth="2" fill="none" />
        <rect x="14" y="12" width="8" height="8" fill={palette.roof} />
        <rect x="16" y="14" width="4" height="4" fill={palette.accent} />
      </g>
    </svg>
  )
}

/* ───────────────────────── TERROR ───────────────────────── */

export function CasaAssombrada({ palette, size = 120 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.92} viewBox="0 0 100 92" {...PIXEL}>
      <Base cx={50} cy={89} w={84} />
      <path d="M4 46 L30 22 L56 46 Z" fill={palette.roofShade} />
      <path d="M46 42 L74 16 L98 42 Z" fill={palette.roof} />
      <rect x="10" y="46" width="44" height="42" fill={palette.wallShade} />
      <rect x="50" y="42" width="44" height="46" fill={palette.wall} />
      <rect x="50" y="42" width="44" height="3" fill={palette.wallShade} />
      <rect x="69" y="2" width="6" height="16" fill={palette.wallShade} />
      <rect x="18" y="56" width="11" height="13" fill="#0a0d1c" />
      <rect x="20" y="58" width="7" height="9" fill="#dc2626" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="5s" repeatCount="indefinite" />
      </rect>
      <rect x="66" y="52" width="11" height="13" fill="#0a0d1c" />
      <rect x="68" y="54" width="7" height="9" fill={palette.accent} opacity="0.5" />
      <rect x="82" y="52" width="9" height="13" fill="#0a0d1c" />
      <rect x="62" y="70" width="16" height="18" fill="#2b2314" />
      <rect x="74" y="79" width="2" height="2" fill={palette.accent} />
      {/* tábuas tortas na fachada */}
      <rect x="14" y="72" width="36" height="3" fill="#4a3116" transform="rotate(-6 32 73)" />
    </svg>
  )
}

export function ArvoreMorta({ palette, size = 96 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 72 84" {...PIXEL}>
      <Base cx={36} cy={81} w={34} />
      <rect x="31" y="40" width="10" height="40" fill="#3a2a18" />
      <rect x="31" y="40" width="4" height="40" fill="#241a0e" />
      <path
        d="M36 44 Q28 34 18 30 M36 52 Q46 44 56 42 M36 34 Q30 24 32 12 M52 42 Q58 34 60 24 M18 30 Q12 24 12 16"
        stroke="#3a2a18"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="28" y="10" width="5" height="4" fill={palette.accent} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.25;0.8" dur="3.5s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function Lapide({ palette, size = 56 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 44 52" {...PIXEL}>
      <Base cx={22} cy={50} w={36} />
      <path d="M8 48 L8 16 Q8 4 22 4 Q36 4 36 16 L36 48 Z" fill="#7b8497" />
      <path d="M8 48 L8 16 Q8 4 22 4 L22 48 Z" fill="#98a2b3" />
      <rect x="15" y="18" width="14" height="3" fill="#5e6779" />
      <rect x="20" y="12" width="4" height="16" fill="#5e6779" />
      <rect x="4" y="46" width="36" height="4" fill={palette.grassDeep} />
      <rect x="12" y="32" width="20" height="2" fill="#5e6779" opacity="0.7" />
    </svg>
  )
}

export function GatoPreto({ palette, size = 60 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 60 54" {...PIXEL}>
      <Base cx={30} cy={51} w={38} />
      <rect x="10" y="34" width="32" height="14" rx="5" fill="#12131c" />
      <rect x="34" y="20" width="18" height="16" rx="3" fill="#12131c" />
      <path d="M36 20 L34 8 L42 16 Z" fill="#12131c" />
      <path d="M48 18 L52 7 L54 18 Z" fill="#12131c" />
      <path d="M10 40 Q2 32 6 22" stroke="#12131c" strokeWidth="5" strokeLinecap="round" fill="none" />
      <rect x="14" y="46" width="6" height="5" fill="#12131c" />
      <rect x="30" y="46" width="6" height="5" fill="#12131c" />
      <rect x="38" y="26" width="4" height="4" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.25;1" dur="4.2s" repeatCount="indefinite" />
      </rect>
      <rect x="45" y="26" width="4" height="4" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.25;1" dur="4.2s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function Abobora({ palette, size = 54 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 36 31" {...PIXEL}>
      <Base cx={18} cy={29} w={28} />
      <rect x="16" y="2" width="4" height="5" fill={palette.grassDeep} />
      <rect x="4" y="7" width="28" height="20" rx="7" fill="#e8701a" />
      <rect x="4" y="7" width="9" height="20" rx="6" fill="#c65a10" />
      <rect x="24" y="7" width="8" height="20" rx="6" fill="#c65a10" />
      <path d="M11 14 L15 14 L13 18 Z" fill="#2b1205" />
      <path d="M21 14 L25 14 L23 18 Z" fill="#2b1205" />
      <rect x="12" y="21" width="12" height="3" fill="#2b1205" />
      <rect x="14" y="20" width="3" height="2" fill="#2b1205" />
      <rect x="20" y="20" width="3" height="2" fill="#2b1205" />
    </svg>
  )
}

/* ───────────────────────── SUSPENSE ───────────────────────── */

export function Lampiao({ palette, size = 62 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.7} viewBox="0 0 36 62" {...PIXEL}>
      <Base cx={18} cy={59} w={26} />
      <rect x="15" y="20" width="6" height="38" fill="#2b3140" />
      <rect x="15" y="20" width="2" height="38" fill="#1a1f2b" />
      <rect x="10" y="55" width="16" height="5" fill="#2b3140" />
      <path d="M11 6 L25 6 L23 20 L13 20 Z" fill="#2b3140" />
      <rect x="14" y="9" width="8" height="9" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.55;1" dur="2.9s" repeatCount="indefinite" />
      </rect>
      <rect x="12" y="3" width="12" height="3" fill="#1a1f2b" />
      <ellipse cx="18" cy="13" rx="16" ry="13" fill={palette.accent} opacity="0.14" />
    </svg>
  )
}

export function Corvo({ palette, size = 62 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 60 48" {...PIXEL}>
      <Base cx={30} cy={45} w={26} />
      <rect x="22" y="18" width="22" height="16" rx="5" fill="#12131c" />
      <rect x="38" y="10" width="14" height="12" rx="4" fill="#12131c" />
      <path d="M50 14 L58 17 L50 20 Z" fill={palette.accent} />
      <path d="M10 22 Q20 14 26 20 Q20 30 10 28 Z" fill="#1a1b26" />
      <rect x="24" y="33" width="4" height="10" fill="#12131c" />
      <rect x="34" y="33" width="4" height="10" fill="#12131c" />
      <rect x="43" y="14" width="4" height="4" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.3;1" dur="3.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function Detetive({ palette, size = 62 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.6} viewBox="0 0 40 64" {...PIXEL}>
      <Base cx={20} cy={61} w={30} />
      <rect x="8" y="2" width="24" height="4" fill="#1f2433" />
      <rect x="11" y="5" width="18" height="7" fill="#2b3140" />
      <rect x="12" y="12" width="16" height="6" fill="#e0b48a" />
      <rect x="14" y="14" width="3" height="2" fill="#12131c" />
      <rect x="22" y="14" width="3" height="2" fill="#12131c" />
      <rect x="7" y="18" width="26" height="30" fill="#3b4250" />
      <rect x="7" y="18" width="26" height="3" fill="#4b5364" />
      <rect x="18" y="21" width="4" height="27" fill="#2b3140" />
      <rect x="3" y="20" width="5" height="22" fill="#2b3140" />
      <rect x="32" y="20" width="5" height="22" fill="#2b3140" />
      <rect x="10" y="48" width="8" height="12" fill="#1f2433" />
      <rect x="22" y="48" width="8" height="12" fill="#1f2433" />
      <rect x="33" y="38" width="5" height="8" fill={palette.accent} opacity="0.8" />
    </svg>
  )
}

export function RelogioBolso({ palette, size = 58 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 44 60" {...PIXEL}>
      <Base cx={22} cy={57} w={30} />
      <rect x="20" y="0" width="4" height="8" fill={palette.wallShade} />
      <circle cx="22" cy="32" r="21" fill={palette.wallShade} />
      <circle cx="22" cy="32" r="17" fill="#f5ecd8" />
      <rect x="21" y="18" width="2" height="14" fill="#2b2314" />
      <rect x="22" y="31" width="11" height="2" fill={palette.roof} />
      <circle cx="22" cy="32" r="2" fill="#2b2314" />
      <rect x="21" y="20" width="2" height="3" fill="#2b2314" />
      <rect x="33" y="31" width="3" height="2" fill="#2b2314" />
      <rect x="21" y="42" width="2" height="3" fill="#2b2314" />
      <rect x="8" y="31" width="3" height="2" fill="#2b2314" />
    </svg>
  )
}

export function CabineTelefonica({ palette, size = 72 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.75} viewBox="0 0 40 70" {...PIXEL}>
      <Base cx={20} cy={67} w={34} />
      <rect x="4" y="4" width="32" height="62" fill={palette.roof} />
      <rect x="4" y="4" width="32" height="7" fill={palette.roofShade} />
      <rect x="4" y="62" width="32" height="4" fill={palette.roofShade} />
      <rect x="9" y="14" width="22" height="44" fill="#0a0d1c" />
      <rect x="11" y="16" width="18" height="40" fill={palette.accent} opacity="0.3" />
      <rect x="19" y="16" width="2" height="40" fill={palette.roofShade} />
      <rect x="11" y="34" width="18" height="2" fill={palette.roofShade} />
      <rect x="12" y="6" width="16" height="4" fill={palette.wall} />
      <rect x="31" y="34" width="4" height="6" fill={palette.wallShade} />
    </svg>
  )
}

/* ────────────────────── DRAMA / BIOGRAFIA ────────────────────── */

export function MascaraTeatro({ palette, size = 76 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 56 48" {...PIXEL}>
      <Base cx={28} cy={45} w={40} />
      <rect x="2" y="6" width="26" height="32" rx="8" fill={palette.wall} />
      <rect x="7" y="15" width="6" height="4" fill="#2b2314" />
      <rect x="17" y="15" width="6" height="4" fill="#2b2314" />
      <path d="M8 26 Q15 33 22 26" stroke="#2b2314" strokeWidth="3" fill="none" />
      <rect x="28" y="10" width="26" height="32" rx="8" fill={palette.roof} />
      <rect x="33" y="19" width="6" height="4" fill="#2b2314" />
      <rect x="43" y="19" width="6" height="4" fill="#2b2314" />
      <path d="M34 33 Q41 26 48 33" stroke="#2b2314" strokeWidth="3" fill="none" />
    </svg>
  )
}

export function Estatua({ palette, size = 72 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 40 62" {...PIXEL}>
      <Base cx={20} cy={59} w={34} />
      <rect x="4" y="48" width="32" height="10" fill={palette.wallShade} />
      <rect x="4" y="48" width="32" height="3" fill={palette.wall} />
      <rect x="8" y="44" width="24" height="5" fill={palette.wallShade} />
      <rect x="13" y="18" width="14" height="27" fill="#d7d3cb" />
      <rect x="13" y="18" width="5" height="27" fill="#bab5ac" />
      <rect x="14" y="6" width="12" height="12" rx="4" fill="#d7d3cb" />
      <rect x="14" y="6" width="4" height="12" rx="3" fill="#bab5ac" />
      <rect x="27" y="22" width="5" height="14" fill="#d7d3cb" />
      <rect x="30" y="18" width="4" height="6" fill={palette.accent} />
      <rect x="8" y="22" width="5" height="12" fill="#d7d3cb" />
    </svg>
  )
}

export function Microfone({ palette, size = 56 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.7} viewBox="0 0 32 54" {...PIXEL}>
      <Base cx={16} cy={51} w={26} />
      <rect x="6" y="48" width="20" height="4" fill="#2b3140" />
      <rect x="14" y="20" width="4" height="30" fill="#39404f" />
      <rect x="9" y="4" width="14" height="18" rx="7" fill={palette.wallShade} />
      <rect x="11" y="6" width="10" height="14" rx="5" fill="#1a1f2b" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x="11" y={7 + i * 4} width="10" height="1.5" fill={palette.accent} opacity="0.7" />
      ))}
    </svg>
  )
}

/* ───────────────────────── AVENTURA ───────────────────────── */

export function BauTesouro({ palette, size = 74 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 48 40" {...PIXEL}>
      <Base cx={24} cy={38} w={40} />
      <path d="M4 18 Q24 2 44 18 Z" fill="#8a6a35" />
      <rect x="4" y="16" width="40" height="4" fill="#4a3116" />
      <rect x="4" y="20" width="40" height="16" fill="#8a6a35" />
      <rect x="4" y="32" width="40" height="4" fill="#6b4a22" />
      <rect x="20" y="14" width="8" height="12" fill={palette.accent} />
      <rect x="22" y="19" width="4" height="5" fill="#4a3116" />
      <rect x="8" y="8" width="4" height="10" fill="#a88448" />
      <rect x="36" y="8" width="4" height="10" fill="#a88448" />
      <rect x="14" y="6" width="5" height="4" fill={palette.accent} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2.6s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function Bussola({ palette, size = 58 }: FigureProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" {...PIXEL}>
      <Base cx={20} cy={38} w={30} />
      <circle cx="20" cy="19" r="17" fill="#8a6a35" />
      <circle cx="20" cy="19" r="13" fill="#f5ecd8" />
      <path d="M20 8 L24 19 L20 30 L16 19 Z" fill={palette.roof} />
      <path d="M20 8 L24 19 L20 19 Z" fill="#dc2626" />
      <circle cx="20" cy="19" r="2" fill="#2b2314" />
      <rect x="19" y="3" width="2" height="3" fill="#8a6a35" />
    </svg>
  )
}

export function Tocha({ palette, size = 50 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.8} viewBox="0 0 28 50" {...PIXEL}>
      <Base cx={14} cy={47} w={22} />
      <rect x="11" y="18" width="6" height="30" fill="#6b4a22" />
      <rect x="11" y="18" width="2" height="30" fill="#4a3116" />
      <rect x="8" y="14" width="12" height="6" fill="#3a2a18" />
      <path d="M14 0 Q22 8 19 15 L9 15 Q6 8 14 0 Z" fill="#f97316">
        <animate attributeName="opacity" values="1;0.75;1" dur="0.9s" repeatCount="indefinite" />
      </path>
      <path d="M14 4 Q19 9 17 14 L11 14 Q9 9 14 4 Z" fill={palette.accent}>
        <animate attributeName="opacity" values="0.9;1;0.9" dur="0.7s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

export function Farol({ palette, size = 84 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.75} viewBox="0 0 48 84" {...PIXEL}>
      <Base cx={24} cy={81} w={40} />
      <rect x="8" y="72" width="32" height="9" fill={palette.pathEdge} />
      <path d="M14 70 L34 70 L30 22 L18 22 Z" fill={palette.wall} />
      <path d="M14 70 L24 70 L22 22 L18 22 Z" fill={palette.wallShade} />
      <rect x="16" y="36" width="16" height="7" fill={palette.roof} />
      <rect x="15" y="52" width="18" height="7" fill={palette.roof} />
      <rect x="16" y="12" width="16" height="11" fill="#2b2314" />
      <rect x="18" y="14" width="12" height="7" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite" />
      </rect>
      <path d="M32 14 L48 6 L48 24 Z" fill={palette.accent} opacity="0.2">
        <animate attributeName="opacity" values="0.2;0.04;0.2" dur="2.4s" repeatCount="indefinite" />
      </path>
      <path d="M12 6 L24 0 L36 6 Z" fill={palette.roofShade} />
    </svg>
  )
}

/* ───────────────── HISTÓRIA / CLÁSSICO / POESIA ───────────────── */

export function ColunaGrega({ palette, size = 62 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.7} viewBox="0 0 36 62" {...PIXEL}>
      <Base cx={18} cy={59} w={32} />
      <rect x="2" y="52" width="32" height="7" fill={palette.wallShade} />
      <rect x="4" y="48" width="28" height="5" fill="#d7d3cb" />
      <rect x="9" y="12" width="18" height="37" fill="#e6e2da" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={11 + i * 4} y="12" width="1.5" height="37" fill="#bab5ac" />
      ))}
      <rect x="4" y="6" width="28" height="6" fill="#d7d3cb" />
      <rect x="2" y="2" width="32" height="5" fill="#e6e2da" />
      <rect x="14" y="0" width="8" height="3" fill={palette.accent} opacity="0.8" />
    </svg>
  )
}

export function Ampulheta({ palette, size = 54 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 32 48" {...PIXEL}>
      <Base cx={16} cy={45} w={28} />
      <rect x="2" y="2" width="28" height="5" fill="#8a6a35" />
      <rect x="2" y="40" width="28" height="5" fill="#8a6a35" />
      <path d="M7 7 L25 7 L18 24 L25 40 L7 40 L14 24 Z" fill="#cfe8f5" opacity="0.6" />
      <path d="M9 9 L23 9 L17 23 Z" fill={palette.accent} opacity="0.9" />
      <path d="M11 38 L21 38 L16 30 Z" fill={palette.accent} />
      <rect x="15" y="23" width="2" height="8" fill={palette.accent} />
    </svg>
  )
}

export function Pergaminho({ palette, size = 64 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.92} viewBox="0 0 44 40" {...PIXEL}>
      <Base cx={22} cy={38} w={34} />
      <rect x="6" y="6" width="32" height="28" fill="#f5ecd8" />
      <rect x="6" y="6" width="32" height="3" fill="#fff" />
      <rect x="2" y="4" width="6" height="32" rx="3" fill="#8a6a35" />
      <rect x="36" y="4" width="6" height="32" rx="3" fill="#8a6a35" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x="11" y={12 + i * 4} width={i % 2 ? 16 : 22} height="1.5" fill="#a8a08c" />
      ))}
      <rect x="11" y="30" width="8" height="2" fill={palette.roof} />
    </svg>
  )
}

export function PenaTinteiro({ palette, size = 60 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 40 50" {...PIXEL}>
      <Base cx={20} cy={47} w={30} />
      <rect x="6" y="32" width="22" height="14" rx="3" fill="#2b3140" />
      <rect x="6" y="32" width="22" height="4" fill="#3b4250" />
      <rect x="10" y="36" width="14" height="8" fill={palette.roof} opacity="0.85" />
      <path d="M30 2 Q38 14 26 34 Q22 22 30 2 Z" fill="#f5ecd8" />
      <path d="M30 2 Q34 14 27 30" stroke="#c9bda2" strokeWidth="1.5" fill="none" />
      <rect x="24" y="32" width="3" height="5" fill={palette.accent} />
    </svg>
  )
}

/* ──────────────────── AUTOAJUDA / NATUREZA ──────────────────── */

export function Broto({ palette, size = 56 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 36 42" {...PIXEL}>
      <Base cx={18} cy={39} w={28} />
      <rect x="7" y="28" width="22" height="12" fill={palette.pathEdge} />
      <rect x="7" y="28" width="22" height="3" fill="#8a6a35" />
      <rect x="16" y="12" width="4" height="18" fill={palette.grassDeep} />
      <path d="M16 18 Q6 14 4 4 Q16 6 18 18 Z" fill={palette.grass} />
      <path d="M20 22 Q30 18 32 8 Q20 10 18 22 Z" fill={palette.grassAlt} />
      <rect x="15" y="6" width="6" height="5" fill={palette.accent}>
        <animate attributeName="opacity" values="1;0.55;1" dur="3.2s" repeatCount="indefinite" />
      </rect>
    </svg>
  )
}

export function Montanha({ palette, size = 104 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 72 52" {...PIXEL}>
      <Base cx={36} cy={50} w={56} />
      <path d="M2 48 L24 8 L46 48 Z" fill={palette.grassDeep} />
      <path d="M24 8 L46 48 L30 48 Z" fill={palette.grass} />
      <path d="M17 22 L24 8 L31 22 Z" fill="#f1f5f9" />
      <path d="M32 48 L52 18 L70 48 Z" fill={palette.grassDeep} opacity="0.85" />
      <path d="M46 26 L52 18 L58 26 Z" fill="#f1f5f9" />
      <rect x="22" y="2" width="4" height="4" fill={palette.accent} />
    </svg>
  )
}

/* ───────────────────── INFANTOJUVENIL ───────────────────── */

export function Pipa({ palette, size = 60 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 36 54" {...PIXEL}>
      <g className="lw-bob">
        <path d="M18 2 L32 18 L18 38 L4 18 Z" fill={palette.roof} />
        <path d="M18 2 L18 38 L4 18 Z" fill={palette.accent} />
        <rect x="17" y="2" width="2" height="36" fill="rgba(0,0,0,0.25)" />
        <rect x="4" y="17" width="28" height="2" fill="rgba(0,0,0,0.25)" />
        <path d="M18 38 Q24 44 18 48 Q12 52 18 54" stroke={palette.wall} strokeWidth="2" fill="none" />
        <rect x="14" y="42" width="8" height="3" fill={palette.roofShade} />
        <rect x="14" y="49" width="8" height="3" fill={palette.roofShade} />
      </g>
    </svg>
  )
}

export function UrsoPelucia({ palette, size = 58 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.1} viewBox="0 0 40 44" {...PIXEL}>
      <Base cx={20} cy={42} w={32} />
      <circle cx="10" cy="9" r="6" fill="#a97445" />
      <circle cx="30" cy="9" r="6" fill="#a97445" />
      <circle cx="10" cy="9" r="3" fill="#c99a6c" />
      <circle cx="30" cy="9" r="3" fill="#c99a6c" />
      <rect x="8" y="6" width="24" height="18" rx="8" fill="#c08553" />
      <rect x="14" y="14" width="12" height="8" rx="4" fill="#e0b48a" />
      <rect x="14" y="12" width="4" height="3" fill="#2b2314" />
      <rect x="23" y="12" width="4" height="3" fill="#2b2314" />
      <rect x="18" y="17" width="4" height="3" fill="#2b2314" />
      <rect x="9" y="24" width="22" height="16" rx="7" fill="#c08553" />
      <rect x="14" y="28" width="12" height="9" rx="4" fill="#e0b48a" />
      <rect x="2" y="25" width="8" height="7" rx="3" fill="#a97445" />
      <rect x="30" y="25" width="8" height="7" rx="3" fill="#a97445" />
      <rect x="26" y="21" width="6" height="5" fill={palette.roof} />
    </svg>
  )
}

export function FogueteBrinquedo({ palette, size = 60 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 32 50" {...PIXEL}>
      <Base cx={16} cy={47} w={26} />
      <path d="M16 0 L24 14 L24 36 L8 36 L8 14 Z" fill={palette.wall} />
      <path d="M16 0 L16 36 L8 36 L8 14 Z" fill={palette.wallShade} />
      <circle cx="16" cy="17" r="5" fill={palette.accent} />
      <circle cx="16" cy="17" r="2.5" fill="#0a0d1c" opacity="0.5" />
      <path d="M8 28 L2 40 L8 36 Z" fill={palette.roof} />
      <path d="M24 28 L30 40 L24 36 Z" fill={palette.roof} />
      <rect x="10" y="36" width="12" height="4" fill={palette.roofShade} />
      <path d="M11 40 Q16 50 21 40 Z" fill="#f97316">
        <animate attributeName="opacity" values="1;0.5;1" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  )
}

/* ───────────────────────── QUADRINHOS ───────────────────────── */

export function Fliperama({ palette, size = 74 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.55} viewBox="0 0 44 68" {...PIXEL}>
      <Base cx={22} cy={65} w={38} />
      <rect x="4" y="4" width="36" height="60" fill={palette.roof} />
      <rect x="4" y="4" width="36" height="5" fill={palette.wall} />
      <rect x="4" y="59" width="36" height="5" fill={palette.roofShade} />
      <rect x="8" y="11" width="28" height="7" fill="#0a0d1c" />
      <rect x="10" y="12" width="24" height="5" fill={palette.accent} className="lw-blink" />
      <rect x="8" y="21" width="28" height="22" fill="#0a0d1c" />
      <rect x="10" y="23" width="24" height="18" fill="#061428" />
      <rect x="13" y="27" width="4" height="4" fill={palette.accent} />
      <rect x="20" y="31" width="4" height="4" fill="#f472b6" />
      <rect x="27" y="26" width="4" height="4" fill="#22d3ee" />
      <rect x="14" y="36" width="16" height="3" fill="#4ade80" />
      <rect x="8" y="46" width="28" height="10" fill={palette.roofShade} />
      <rect x="12" y="49" width="5" height="5" rx="2" fill="#dc2626" />
      <rect x="20" y="49" width="5" height="5" rx="2" fill="#facc15" />
      <rect x="28" y="49" width="5" height="5" rx="2" fill="#22d3ee" />
    </svg>
  )
}

export function BalaoPow({ palette, size = 74 }: FigureProps) {
  return (
    <svg width={size} height={size * 0.86} viewBox="0 0 56 48" {...PIXEL}>
      <g className="lw-bob">
        <path
          d="M28 2 L34 12 L46 8 L43 20 L54 26 L43 32 L46 44 L34 40 L28 48 L22 40 L10 44 L13 32 L2 26 L13 20 L10 8 L22 12 Z"
          fill={palette.accent}
        />
        <path
          d="M28 8 L32 15 L41 12 L39 21 L47 26 L39 31 L41 40 L32 37 L28 43 L24 37 L15 40 L17 31 L9 26 L17 21 L15 12 L24 15 Z"
          fill={palette.roof}
        />
        <rect x="15" y="22" width="4" height="8" fill="#fff" />
        <rect x="19" y="22" width="3" height="3" fill="#fff" />
        <rect x="19" y="27" width="3" height="3" fill="#fff" />
        <rect x="25" y="22" width="3" height="8" fill="#fff" />
        <rect x="28" y="22" width="3" height="3" fill="#fff" />
        <rect x="28" y="27" width="3" height="3" fill="#fff" />
        <rect x="34" y="22" width="3" height="8" fill="#fff" />
        <rect x="40" y="22" width="3" height="8" fill="#fff" />
        <rect x="37" y="27" width="3" height="3" fill="#fff" />
      </g>
    </svg>
  )
}

export function EmblemaHeroi({ palette, size = 66 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" {...PIXEL}>
      <Base cx={20} cy={45} w={30} />
      <rect x="17" y="30" width="6" height="14" fill={palette.wallShade} />
      <path d="M4 4 L36 4 L36 24 L20 38 L4 24 Z" fill={palette.roof} />
      <path d="M8 8 L32 8 L32 22 L20 33 L8 22 Z" fill={palette.accent} />
      <path d="M20 10 L26 20 L20 18 L14 20 Z" fill={palette.roofShade} />
      <rect x="18" y="18" width="4" height="10" fill={palette.roofShade} />
    </svg>
  )
}

/* ─────────────────────── ICÔNICOS ─────────────────────── */

export function BalaoVermelho({ size = 52 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.9} viewBox="0 0 40 76" {...PIXEL}>
      <g className="lw-bob">
        <ellipse cx="20" cy="22" rx="15" ry="19" fill="#dc2626" />
        <ellipse cx="14" cy="14" rx="4" ry="6" fill="rgba(255,255,255,0.35)" />
        <path d="M17 41 L23 41 L20 47 Z" fill="#b91c1c" />
      </g>
      <path d="M20 46 Q23 55 18 62 Q15 69 20 76" stroke="rgba(226,232,240,0.45)" strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function HomemDeGiz({ size = 58 }: FigureProps) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 44 58" {...PIXEL}>
      <g stroke="rgba(241,245,249,0.9)" strokeWidth="3" strokeLinecap="round" fill="none">
        <circle cx="22" cy="10" r="7" />
        <line x1="22" y1="17" x2="22" y2="38" />
        <line x1="22" y1="24" x2="8" y2="32" />
        <line x1="22" y1="24" x2="36" y2="32" />
        <line x1="22" y1="38" x2="12" y2="54" />
        <line x1="22" y1="38" x2="32" y2="54" />
      </g>
    </svg>
  )
}

/* ═════════════ O SORTEIO E A CURADORIA ═════════════ */

const GENRE_FIGURES: Record<string, FigureComponent[]> = {
  fantasia: [Dragao, EspadaNaPedra, CristalMagico, TorreMago, Cogumelo],
  'ficcao-cientifica': [NaveEspacial, Robo, Portal, Satelite, Terminal],
  romance: [CoracaoPixel, BancoDePraca, Roseira, CartaSelada],
  terror: [CasaAssombrada, ArvoreMorta, Lapide, GatoPreto, Abobora],
  suspense: [Lampiao, Corvo, Detetive, RelogioBolso, CabineTelefonica],
  drama: [MascaraTeatro, Estatua, BancoDePraca, Lampiao],
  aventura: [BauTesouro, Bussola, Tocha, Farol, Montanha],
  biografia: [Estatua, Microfone, PenaTinteiro, Pergaminho],
  historia: [ColunaGrega, Ampulheta, Pergaminho, Estatua],
  poesia: [PenaTinteiro, Pergaminho, Lampiao, CristalMagico],
  autoajuda: [Broto, Montanha, Farol, Bussola],
  tecnico: [Terminal, Servidor, Robo, Satelite],
  classico: [ColunaGrega, Estatua, Ampulheta, PenaTinteiro],
  infantojuvenil: [Pipa, UrsoPelucia, FogueteBrinquedo, Cogumelo],
  quadrinhos: [Fliperama, BalaoPow, EmblemaHeroi, CabineTelefonica],
}

/** Títulos com peça própria — o prazer de reconhecer o livro no mapa. */
const ICONIC: { match: RegExp; figure: FigureComponent }[] = [
  { match: /\bit\b|a coisa/i, figure: BalaoVermelho },
  { match: /homem de giz/i, figure: HomemDeGiz },
  { match: /senhor dos an[eé]is|hobbit|silmarillion/i, figure: EspadaNaPedra },
  { match: /duna|dune|funda[cç][aã]o|marciano/i, figure: NaveEspacial },
  { match: /1984|admir[aá]vel mundo novo|fahrenheit/i, figure: Terminal },
  { match: /drácula|dracula|frankenstein|exorcista/i, figure: CasaAssombrada },
  { match: /sherlock|holmes|agatha|orient expresse?|assassinato no/i, figure: RelogioBolso },
  { match: /pequeno pr[ií]ncipe/i, figure: Pipa },
  { match: /harry potter|narnia|percy jackson/i, figure: TorreMago },
  { match: /ilha do tesouro|moby|volta ao mundo/i, figure: BauTesouro },
  { match: /odisseia|il[ií]ada|repúblic|rep[uú]blica/i, figure: ColunaGrega },
  { match: /watchmen|batman|homem-aranha|x-men|sandman/i, figure: EmblemaHeroi },
]

export function figureForBook(title: string, genreSlug: string | null): FigureComponent | null {
  const iconic = ICONIC.find(entry => entry.match.test(title))
  if (iconic) return iconic.figure

  const set = GENRE_FIGURES[genreSlug ?? '']
  if (!set || set.length === 0) {
    // gênero sem conjunto próprio ainda ganha um marco — nenhum livro fica invisível
    return [Pergaminho, Estatua, CristalMagico, Lampiao][hashText(title) % 4]
  }

  return set[hashText(title) % set.length]
}
