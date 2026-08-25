export interface Atmosphere {
  sky: [string, string, string]
  moon: string
  moonHalo: string
  aurora: string
  horizon: string
}

export const DEFAULT_ATMOSPHERE: Atmosphere = {
  sky: ['#070a14', '#0d1226', '#1c1640'],
  moon: '#fde68a',
  moonHalo: 'rgba(251,191,36,0.35)',
  aurora: 'rgba(129,140,248,0.22)',
  horizon: 'rgba(129,140,248,0.30)',
}

export const GENRE_ATMOSPHERES: Record<string, Atmosphere> = {
  'terror':            { sky: ['#160404', '#2b0707', '#4a0d0d'], moon: '#ef4444', moonHalo: 'rgba(220,38,38,0.45)',  aurora: 'rgba(185,28,28,0.25)',  horizon: 'rgba(185,28,28,0.40)' },
  'suspense':          { sky: ['#070a14', '#0d1226', '#1c1640'], moon: '#fde68a', moonHalo: 'rgba(251,191,36,0.35)', aurora: 'rgba(129,140,248,0.22)', horizon: 'rgba(129,140,248,0.30)' },
  'fantasia':          { sky: ['#120724', '#251047', '#41207a'], moon: '#e9d5ff', moonHalo: 'rgba(192,132,252,0.50)', aurora: 'rgba(168,85,247,0.35)', horizon: 'rgba(168,85,247,0.45)' },
  'ficcao-cientifica': { sky: ['#02090f', '#073050', '#0a4d80'], moon: '#7dd3fc', moonHalo: 'rgba(56,189,248,0.50)', aurora: 'rgba(14,165,233,0.30)', horizon: 'rgba(14,165,233,0.42)' },
  'romance':           { sky: ['#1c0613', '#38102a', '#571a42'], moon: '#fbcfe8', moonHalo: 'rgba(244,114,182,0.48)', aurora: 'rgba(236,72,153,0.30)', horizon: 'rgba(236,72,153,0.40)' },
  'aventura':          { sky: ['#05170c', '#0d2f19', '#154d28'], moon: '#fde68a', moonHalo: 'rgba(251,191,36,0.42)', aurora: 'rgba(34,197,94,0.28)',  horizon: 'rgba(34,197,94,0.38)' },
  'autoajuda':         { sky: ['#04150f', '#0b2f26', '#11503f'], moon: '#a7f3d0', moonHalo: 'rgba(52,211,153,0.45)', aurora: 'rgba(16,185,129,0.28)', horizon: 'rgba(16,185,129,0.40)' },
  'drama':             { sky: ['#170f04', '#2f2009', '#4d3510'], moon: '#fcd34d', moonHalo: 'rgba(251,191,36,0.40)', aurora: 'rgba(217,119,6,0.25)',  horizon: 'rgba(217,119,6,0.36)' },
  'biografia':         { sky: ['#170e03', '#301d08', '#4f300e'], moon: '#fbbf24', moonHalo: 'rgba(217,119,6,0.45)',  aurora: 'rgba(180,83,9,0.26)',   horizon: 'rgba(180,83,9,0.38)' },
  'historia':          { sky: ['#151003', '#2c2107', '#48370c'], moon: '#facc15', moonHalo: 'rgba(202,138,4,0.45)',  aurora: 'rgba(161,98,7,0.26)',   horizon: 'rgba(161,98,7,0.38)' },
  'poesia':            { sky: ['#100720', '#211040', '#391d6b'], moon: '#ddd6fe', moonHalo: 'rgba(167,139,250,0.50)', aurora: 'rgba(139,92,246,0.32)', horizon: 'rgba(139,92,246,0.42)' },
  'classico':          { sky: ['#160c03', '#2e1908', '#4c2a0e'], moon: '#fdba74', moonHalo: 'rgba(180,83,9,0.45)',   aurora: 'rgba(154,52,18,0.26)',  horizon: 'rgba(154,52,18,0.38)' },
  'tecnico':           { sky: ['#080d16', '#14223a', '#213a61'], moon: '#bae6fd', moonHalo: 'rgba(148,163,184,0.40)', aurora: 'rgba(56,189,248,0.24)', horizon: 'rgba(71,105,145,0.36)' },
  'infantojuvenil':    { sky: ['#150e02', '#2e1f05', '#4d3409'], moon: '#fed7aa', moonHalo: 'rgba(251,146,60,0.50)', aurora: 'rgba(250,204,21,0.30)', horizon: 'rgba(249,115,22,0.42)' },
  'quadrinhos':        { sky: ['#190409', '#330a14', '#551122'], moon: '#fca5a5', moonHalo: 'rgba(239,68,68,0.48)',  aurora: 'rgba(250,204,21,0.28)', horizon: 'rgba(225,29,72,0.42)' },
}

export function atmosphereFor(slug: string | null): Atmosphere {
  return (slug && GENRE_ATMOSPHERES[slug]) || DEFAULT_ATMOSPHERE
}