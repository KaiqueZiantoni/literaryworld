/**
 * A identidade visual de cada gênero, em um lugar só.
 *
 * Dois conjuntos de cor por gênero, porque as duas telas pedem coisas opostas:
 * `night` veste a interface (mesa, modais, login) em tom de biblioteca à noite;
 * `world` veste o mapa explorável com a paleta saturada de cartucho portátil.
 */

export interface NightPalette {
  sky: [string, string, string]
  moon: string
  moonHalo: string
  aurora: string
  horizon: string
}

export interface WorldPalette {
  skyTop: string
  skyBottom: string
  grass: string
  grassAlt: string
  grassDeep: string
  path: string
  pathEdge: string
  roof: string
  roofShade: string
  wall: string
  wallShade: string
  accent: string
  water: string
}

export interface GenreTheme {
  slug: string
  name: string
  night: NightPalette
  world: WorldPalette
}

export const DEFAULT_THEME: GenreTheme = {
  slug: '__default__',
  name: 'Mundo',
  night: {
    sky: ['#05060f', '#0b1022', '#1b1640'],
    moon: '#fde68a',
    moonHalo: 'rgba(251,191,36,0.35)',
    aurora: 'rgba(129,140,248,0.22)',
    horizon: 'rgba(129,140,248,0.30)',
  },
  world: {
    skyTop: '#1e3a8a', skyBottom: '#60a5fa',
    grass: '#3fa35a', grassAlt: '#4cb869', grassDeep: '#2b7a45',
    path: '#d9b382', pathEdge: '#a97f52',
    roof: '#f59e0b', roofShade: '#b45309',
    wall: '#efe4c9', wallShade: '#c4b294',
    accent: '#fcd34d', water: '#2f86c9',
  },
}

export const GENRE_THEMES: Record<string, GenreTheme> = {
  fantasia: {
    slug: 'fantasia', name: 'Fantasia',
    night: {
      sky: ['#120724', '#251047', '#41207a'], moon: '#e9d5ff',
      moonHalo: 'rgba(192,132,252,0.50)', aurora: 'rgba(168,85,247,0.35)', horizon: 'rgba(168,85,247,0.45)',
    },
    world: {
      skyTop: '#4c2a9e', skyBottom: '#b79cf0',
      grass: '#3fa35a', grassAlt: '#55bd70', grassDeep: '#2a7a44',
      path: '#d9b382', pathEdge: '#a97f52',
      roof: '#8b5cf6', roofShade: '#5b21b6',
      wall: '#efe4c9', wallShade: '#bfae8e',
      accent: '#fcd34d', water: '#4f8fe0',
    },
  },
  'ficcao-cientifica': {
    slug: 'ficcao-cientifica', name: 'Ficção Científica',
    night: {
      sky: ['#02090f', '#073050', '#0a4d80'], moon: '#7dd3fc',
      moonHalo: 'rgba(56,189,248,0.50)', aurora: 'rgba(14,165,233,0.30)', horizon: 'rgba(14,165,233,0.42)',
    },
    world: {
      skyTop: '#0b2f5e', skyBottom: '#38bdf8',
      grass: '#2f8f8a', grassAlt: '#3fa9a3', grassDeep: '#1f6b68',
      path: '#9aa7bd', pathEdge: '#66738b',
      roof: '#22d3ee', roofShade: '#0e7490',
      wall: '#d7e7f3', wallShade: '#9db3c6',
      accent: '#67e8f9', water: '#1d9bd1',
    },
  },
  romance: {
    slug: 'romance', name: 'Romance',
    night: {
      sky: ['#1c0613', '#38102a', '#571a42'], moon: '#fbcfe8',
      moonHalo: 'rgba(244,114,182,0.48)', aurora: 'rgba(236,72,153,0.30)', horizon: 'rgba(236,72,153,0.40)',
    },
    world: {
      skyTop: '#9d174d', skyBottom: '#fbcfe8',
      grass: '#5fbd74', grassAlt: '#74d089', grassDeep: '#3f9457',
      path: '#f0c9b0', pathEdge: '#c99a7f',
      roof: '#ec4899', roofShade: '#9d174d',
      wall: '#fff1f5', wallShade: '#d9bcc6',
      accent: '#fb7185', water: '#5aa6e0',
    },
  },
  terror: {
    slug: 'terror', name: 'Terror',
    night: {
      sky: ['#160404', '#2b0707', '#4a0d0d'], moon: '#ef4444',
      moonHalo: 'rgba(220,38,38,0.45)', aurora: 'rgba(185,28,28,0.25)', horizon: 'rgba(185,28,28,0.40)',
    },
    world: {
      skyTop: '#2a1030', skyBottom: '#7c3a63',
      grass: '#3c6b48', grassAlt: '#4a7f57', grassDeep: '#27492f',
      path: '#7a6a5c', pathEdge: '#4d4139',
      roof: '#b91c1c', roofShade: '#7f1d1d',
      wall: '#cfc5b4', wallShade: '#968d7e',
      accent: '#a3e635', water: '#2f5f6b',
    },
  },
  suspense: {
    slug: 'suspense', name: 'Suspense',
    night: {
      sky: ['#070a14', '#0d1226', '#1c1640'], moon: '#fde68a',
      moonHalo: 'rgba(251,191,36,0.35)', aurora: 'rgba(129,140,248,0.22)', horizon: 'rgba(129,140,248,0.30)',
    },
    world: {
      skyTop: '#1b2750', skyBottom: '#5b73b8',
      grass: '#44795c', grassAlt: '#548e6d', grassDeep: '#2f5a43',
      path: '#b9a888', pathEdge: '#877a5f',
      roof: '#f59e0b', roofShade: '#b45309',
      wall: '#e5e0d2', wallShade: '#aba796',
      accent: '#fbbf24', water: '#35699e',
    },
  },
  drama: {
    slug: 'drama', name: 'Drama',
    night: {
      sky: ['#170f04', '#2f2009', '#4d3510'], moon: '#fcd34d',
      moonHalo: 'rgba(251,191,36,0.40)', aurora: 'rgba(217,119,6,0.25)', horizon: 'rgba(217,119,6,0.36)',
    },
    world: {
      skyTop: '#9a3412', skyBottom: '#fcd34d',
      grass: '#74a95d', grassAlt: '#88bd6e', grassDeep: '#548044',
      path: '#e0b68b', pathEdge: '#ac8663',
      roof: '#c2410c', roofShade: '#7c2d12',
      wall: '#f5e6cf', wallShade: '#c2b096',
      accent: '#fb923c', water: '#3f87b5',
    },
  },
  aventura: {
    slug: 'aventura', name: 'Aventura',
    night: {
      sky: ['#05170c', '#0d2f19', '#154d28'], moon: '#fde68a',
      moonHalo: 'rgba(251,191,36,0.42)', aurora: 'rgba(34,197,94,0.28)', horizon: 'rgba(34,197,94,0.38)',
    },
    world: {
      skyTop: '#0e7490', skyBottom: '#7dd3fc',
      grass: '#3fa35a', grassAlt: '#56bd6f', grassDeep: '#277c43',
      path: '#e6c88f', pathEdge: '#b09565',
      roof: '#16a34a', roofShade: '#14532d',
      wall: '#fdf0d5', wallShade: '#c9bb9c',
      accent: '#facc15', water: '#25a0c9',
    },
  },
  biografia: {
    slug: 'biografia', name: 'Biografia',
    night: {
      sky: ['#170e03', '#301d08', '#4f300e'], moon: '#fbbf24',
      moonHalo: 'rgba(217,119,6,0.45)', aurora: 'rgba(180,83,9,0.26)', horizon: 'rgba(180,83,9,0.38)',
    },
    world: {
      skyTop: '#92400e', skyBottom: '#fcd9a0',
      grass: '#7f9b4e', grassAlt: '#95b05e', grassDeep: '#5e763a',
      path: '#d6b98c', pathEdge: '#a48a64',
      roof: '#a16207', roofShade: '#713f12',
      wall: '#f3e3c3', wallShade: '#c0b18f',
      accent: '#eab308', water: '#3f87b5',
    },
  },
  historia: {
    slug: 'historia', name: 'História',
    night: {
      sky: ['#151003', '#2c2107', '#48370c'], moon: '#facc15',
      moonHalo: 'rgba(202,138,4,0.45)', aurora: 'rgba(161,98,7,0.26)', horizon: 'rgba(161,98,7,0.38)',
    },
    world: {
      skyTop: '#3f4a5e', skyBottom: '#a8b8c9',
      grass: '#6b8f4e', grassAlt: '#7ea45c', grassDeep: '#4d6b38',
      path: '#c7b299', pathEdge: '#96846f',
      roof: '#b45309', roofShade: '#78350f',
      wall: '#e7dfd0', wallShade: '#b0a795',
      accent: '#d4a017', water: '#4a7fa6',
    },
  },
  poesia: {
    slug: 'poesia', name: 'Poesia',
    night: {
      sky: ['#100720', '#211040', '#391d6b'], moon: '#ddd6fe',
      moonHalo: 'rgba(167,139,250,0.50)', aurora: 'rgba(139,92,246,0.32)', horizon: 'rgba(139,92,246,0.42)',
    },
    world: {
      skyTop: '#4c1d95', skyBottom: '#c4b5fd',
      grass: '#5b9a6e', grassAlt: '#6eb082', grassDeep: '#3f7553',
      path: '#cbbfd9', pathEdge: '#9a8fac',
      roof: '#8b5cf6', roofShade: '#5b21b6',
      wall: '#efe9fb', wallShade: '#bdb6cd',
      accent: '#ddd6fe', water: '#5f8fd6',
    },
  },
  autoajuda: {
    slug: 'autoajuda', name: 'Autoajuda',
    night: {
      sky: ['#04150f', '#0b2f26', '#11503f'], moon: '#a7f3d0',
      moonHalo: 'rgba(52,211,153,0.45)', aurora: 'rgba(16,185,129,0.28)', horizon: 'rgba(16,185,129,0.40)',
    },
    world: {
      skyTop: '#0f766e', skyBottom: '#a7f3d0',
      grass: '#34c184', grassAlt: '#4ad69a', grassDeep: '#1f8f60',
      path: '#dcd3b4', pathEdge: '#a89f83',
      roof: '#10b981', roofShade: '#065f46',
      wall: '#ecfdf5', wallShade: '#b6ccc2',
      accent: '#6ee7b7', water: '#2aa3c4',
    },
  },
  tecnico: {
    slug: 'tecnico', name: 'Técnico',
    night: {
      sky: ['#080d16', '#14223a', '#213a61'], moon: '#bae6fd',
      moonHalo: 'rgba(148,163,184,0.40)', aurora: 'rgba(56,189,248,0.24)', horizon: 'rgba(71,105,145,0.36)',
    },
    world: {
      skyTop: '#0f172a', skyBottom: '#475569',
      grass: '#2f6f5e', grassAlt: '#3d8472', grassDeep: '#1f4f43',
      path: '#94a3b8', pathEdge: '#64748b',
      roof: '#38bdf8', roofShade: '#0369a1',
      wall: '#cbd5e1', wallShade: '#94a3b8',
      accent: '#4ade80', water: '#1e6f9e',
    },
  },
  classico: {
    slug: 'classico', name: 'Clássico',
    night: {
      sky: ['#160c03', '#2e1908', '#4c2a0e'], moon: '#fdba74',
      moonHalo: 'rgba(180,83,9,0.45)', aurora: 'rgba(154,52,18,0.26)', horizon: 'rgba(154,52,18,0.38)',
    },
    world: {
      skyTop: '#57534e', skyBottom: '#ddd6ce',
      grass: '#7d9b52', grassAlt: '#91b061', grassDeep: '#5c763c',
      path: '#d8cfc0', pathEdge: '#a79e8f',
      roof: '#9f1239', roofShade: '#6b0f27',
      wall: '#faf5eb', wallShade: '#c5bfb2',
      accent: '#d6bd7a', water: '#4d86ad',
    },
  },
  infantojuvenil: {
    slug: 'infantojuvenil', name: 'Infantojuvenil',
    night: {
      sky: ['#150e02', '#2e1f05', '#4d3409'], moon: '#fed7aa',
      moonHalo: 'rgba(251,146,60,0.50)', aurora: 'rgba(250,204,21,0.30)', horizon: 'rgba(249,115,22,0.42)',
    },
    world: {
      skyTop: '#0ea5e9', skyBottom: '#bae6fd',
      grass: '#5cc47a', grassAlt: '#74d68e', grassDeep: '#3f9c63',
      path: '#eec278', pathEdge: '#b98f47',
      roof: '#f472b6', roofShade: '#be1e6f',
      wall: '#fff7ed', wallShade: '#d6c8b6',
      accent: '#fb923c', water: '#38bdf8',
    },
  },
  quadrinhos: {
    slug: 'quadrinhos', name: 'Quadrinhos',
    night: {
      sky: ['#190409', '#330a14', '#551122'], moon: '#fca5a5',
      moonHalo: 'rgba(239,68,68,0.48)', aurora: 'rgba(250,204,21,0.28)', horizon: 'rgba(225,29,72,0.42)',
    },
    world: {
      skyTop: '#b91c1c', skyBottom: '#fbbf24',
      grass: '#4aa96c', grassAlt: '#5fc083', grassDeep: '#2f7a4c',
      path: '#eddb92', pathEdge: '#b5a055',
      roof: '#2563eb', roofShade: '#1e3a8a',
      wall: '#fef9c3', wallShade: '#c9c393',
      accent: '#ef4444', water: '#2563eb',
    },
  },
}

export function themeFor(slug: string | null | undefined): GenreTheme {
  return (slug && GENRE_THEMES[slug]) || DEFAULT_THEME
}

export function nightFor(slug: string | null | undefined): NightPalette {
  return themeFor(slug).night
}

export function worldFor(slug: string | null | undefined): WorldPalette {
  return themeFor(slug).world
}

/** Cor sólida da capa tipográfica, quando o livro não tem imagem. */
export const COVER_COLORS: Record<string, [string, string]> = {
  fantasia: ['#3b0764', '#7c3aed'],
  'ficcao-cientifica': ['#082f49', '#0891b2'],
  romance: ['#4a044e', '#db2777'],
  terror: ['#450a0a', '#b91c1c'],
  suspense: ['#1e1b4b', '#4f46e5'],
  drama: ['#422006', '#c2410c'],
  aventura: ['#052e16', '#16a34a'],
  biografia: ['#431407', '#a16207'],
  historia: ['#3f2d04', '#b45309'],
  poesia: ['#2e1065', '#7c3aed'],
  autoajuda: ['#064e3b', '#059669'],
  tecnico: ['#0f172a', '#0284c7'],
  classico: ['#451a03', '#9f1239'],
  infantojuvenil: ['#7c2d12', '#f472b6'],
  quadrinhos: ['#7f1d1d', '#2563eb'],
}

const FALLBACK_COVERS: [string, string][] = [
  ['#1e1b4b', '#4f46e5'],
  ['#450a0a', '#b91c1c'],
  ['#052e16', '#16a34a'],
  ['#3b0764', '#7c3aed'],
  ['#431407', '#a16207'],
  ['#082f49', '#0891b2'],
]

export function hashText(text: string, salt = 0): number {
  let hash = salt
  for (let index = 0; index < text.length; index++) {
    hash = (hash * 33 + text.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

export function coverGradient(title: string, genreSlug: string | null): [string, string] {
  if (genreSlug && COVER_COLORS[genreSlug]) return COVER_COLORS[genreSlug]
  return FALLBACK_COVERS[hashText(title) % FALLBACK_COVERS.length]
}
