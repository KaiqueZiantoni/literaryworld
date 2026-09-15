import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { api, errorMessage } from '../../api/client'
import type { WorldBook, WorldGenre } from '../../api/types'
import { hashText, themeFor } from '../../theme/genres'
import type { WorldPalette } from '../../theme/genres'
import { useToast } from '../../ui/Toast'
import { useAuth } from '../auth/AuthContext'
import { figureForBook } from './figures'
import type { FigureComponent } from './figures'
import {
  Arbusto,
  Arvore,
  Banca,
  CasaGrande,
  CasaPequena,
  Cerca,
  Flor,
  Lago,
  Pedra,
  Placa,
  Poco,
  Poste,
  Tufo,
  Walker,
} from './sprites'
import type { Facing } from './sprites'

interface Props {
  worldUsername: string
  displayName: string
  genres: WorldGenre[]
  books: WorldBook[]
}

/* ── A grade do mundo ───────────────────────────────────────────── */
const REGION_W = 1040
const WORLD_H = 1080
const ROAD_Y = 470
const ROAD_H = 104
const WALK_SPEED = 5.4
const RUN_MULTIPLIER = 2.1
const NEAR_RADIUS = 125
const CAMERA_EASE = 0.12

const MOVE_KEYS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
  ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
  ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
}

interface Solid { x: number; y: number; w: number; h: number }
interface Prop { key: string; x: number; y: number; z: number; node: ReactNode }
interface Landmark {
  id: string
  book: WorldBook
  Figure: FigureComponent
  x: number
  y: number
  palette: WorldPalette
}

/* ══════════════════════════════════════════════════════════════════
   O MAPA
   ══════════════════════════════════════════════════════════════════ */

export function WorldMap({ worldUsername, displayName, genres, books }: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const isMyWorld = user?.username === worldUsername

  const regions = useMemo(() => genres.filter(genre => genre.booksFinished >= 1), [genres])
  const worldW = Math.max(regions.length, 1) * REGION_W

  /* A avaliação salva aqui não força recarregar o mundo inteiro — recarregar
     devolveria o caminhante ao ponto de partida no meio da exploração. */
  const [reviews, setReviews] = useState<Record<string, Pick<WorldBook, 'reviewRating' | 'reviewBody' | 'reviewSpoiler'>>>({})

  const readBooks = useMemo(
    () => books.filter(book => book.status === 'LIDO').map(book => ({ ...book, ...reviews[book.bookId] })),
    [books, reviews],
  )

  /* ── Cenário: calculado uma vez por mundo ───────────────────── */
  const { props: scenery, solids, landmarks } = useMemo(
    () => buildWorld(regions, readBooks),
    [regions, readBooks],
  )

  const solidsRef = useRef<Solid[]>(solids)
  solidsRef.current = solids
  const landmarksRef = useRef<Landmark[]>(landmarks)
  landmarksRef.current = landmarks

  /* ── Movimento: o que muda a 60fps não passa pelo React ─────── */
  const posRef = useRef({ x: 240, y: ROAD_Y + ROAD_H / 2 })
  const camRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef(new Set<string>())
  const runningRef = useRef(false)
  const touchRef = useRef<[number, number]>([0, 0])
  const viewportRef = useRef({ w: 1280, h: 800 })
  const stageRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  const [facing, setFacing] = useState<Facing>('down')
  const [walking, setWalking] = useState(false)
  const [regionIndex, setRegionIndex] = useState(0)
  const [nearId, setNearId] = useState<string | null>(null)

  const [dialogBook, setDialogBook] = useState<WorldBook | null>(null)
  const dialogOpenRef = useRef(false)
  dialogOpenRef.current = dialogBook !== null

  const nearLandmark = useMemo(
    () => landmarks.find(landmark => landmark.id === nearId) ?? null,
    [landmarks, nearId],
  )
  const currentRegion = regions[Math.min(regionIndex, Math.max(regions.length - 1, 0))]

  /** Leva o caminhante à entrada de uma vila e recoloca a câmera lá, sem animar a
      travessia — atravessar treze regiões a pé para reler uma resenha é castigo. */
  const travelTo = useCallback((index: number) => {
    posRef.current.x = index * REGION_W + REGION_W / 2
    posRef.current.y = ROAD_Y + ROAD_H / 2
    const { w: viewW, h: viewH } = viewportRef.current
    camRef.current.x = Math.min(Math.max(0, posRef.current.x - viewW / 2), Math.max(0, worldW - viewW))
    camRef.current.y = Math.min(Math.max(0, posRef.current.y - viewH / 2), Math.max(0, WORLD_H - viewH))
  }, [worldW])

  const openNearest = useCallback(() => {
    const near = landmarksRef.current.find(
      landmark => Math.hypot(posRef.current.x - landmark.x, posRef.current.y - landmark.y) < NEAR_RADIUS,
    )
    if (near) setDialogBook(near.book)
  }, [])

  /* ── Teclado ─────────────────────────────────────────────────── */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (dialogOpenRef.current) {
        if (event.key === 'Escape') setDialogBook(null)
        return
      }
      const target = event.target as HTMLElement | null
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return

      if (event.key === 'Shift') {
        runningRef.current = true
        return
      }
      if (MOVE_KEYS[event.key]) {
        event.preventDefault()
        keysRef.current.add(event.key)
        return
      }
      if (event.key === 'e' || event.key === 'E' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        openNearest()
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === 'Shift') runningRef.current = false
      keysRef.current.delete(event.key)
    }

    function onBlur() {
      keysRef.current.clear()
      runningRef.current = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [openNearest])

  /* ── Viewport ────────────────────────────────────────────────── */
  useEffect(() => {
    function measure() {
      viewportRef.current = { w: window.innerWidth, h: window.innerHeight }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  /* ── O laço do jogo ──────────────────────────────────────────── */
  useEffect(() => {
    let frame = 0
    let lastFacing: Facing = 'down'
    let lastWalking = false
    let lastRegion = -1
    let lastNear: string | null = null

    function blocked(x: number, y: number): boolean {
      // a caixa de colisão fica nos pés, não no corpo inteiro — é o que deixa o
      // caminhante passar "atrás" de uma casa sem travar no telhado
      const left = x - 11
      const right = x + 11
      const top = y - 10
      const bottom = y + 4
      return solidsRef.current.some(
        solid =>
          right > solid.x && left < solid.x + solid.w && bottom > solid.y && top < solid.y + solid.h,
      )
    }

    function tick() {
      frame = requestAnimationFrame(tick)

      const stage = stageRef.current
      const player = playerRef.current
      if (!stage || !player) return

      let dx = 0
      let dy = 0
      if (!dialogOpenRef.current) {
        for (const key of keysRef.current) {
          const move = MOVE_KEYS[key]
          if (move) {
            dx += move[0]
            dy += move[1]
          }
        }
        dx += touchRef.current[0]
        dy += touchRef.current[1]
      }

      const moving = dx !== 0 || dy !== 0
      if (moving) {
        const length = Math.hypot(dx, dy) || 1
        const speed = runningRef.current ? WALK_SPEED * RUN_MULTIPLIER : WALK_SPEED
        const vx = (dx / length) * speed
        const vy = (dy / length) * speed
        const position = posRef.current

        const nextX = Math.min(worldW - 40, Math.max(40, position.x + vx))
        if (!blocked(nextX, position.y)) position.x = nextX

        const nextY = Math.min(WORLD_H - 40, Math.max(60, position.y + vy))
        if (!blocked(position.x, nextY)) position.y = nextY

        const nextFacing: Facing =
          Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up'
        if (nextFacing !== lastFacing) {
          lastFacing = nextFacing
          setFacing(nextFacing)
        }
      }

      if (moving !== lastWalking) {
        lastWalking = moving
        setWalking(moving)
      }

      // câmera com atraso suave — corta o solavanco de colar no personagem
      const { w: viewW, h: viewH } = viewportRef.current
      const targetX = Math.min(Math.max(0, posRef.current.x - viewW / 2), Math.max(0, worldW - viewW))
      const targetY = Math.min(Math.max(0, posRef.current.y - viewH / 2), Math.max(0, WORLD_H - viewH))
      camRef.current.x += (targetX - camRef.current.x) * CAMERA_EASE
      camRef.current.y += (targetY - camRef.current.y) * CAMERA_EASE

      stage.style.transform = `translate3d(${-Math.round(camRef.current.x)}px, ${-Math.round(camRef.current.y)}px, 0)`
      player.style.transform = `translate3d(${Math.round(posRef.current.x - 24)}px, ${Math.round(posRef.current.y - 60)}px, 0)`
      player.style.zIndex = String(Math.round(posRef.current.y))

      const nextRegion = Math.min(Math.floor(posRef.current.x / REGION_W), Math.max(regions.length - 1, 0))
      if (nextRegion !== lastRegion) {
        lastRegion = nextRegion
        setRegionIndex(nextRegion)
      }

      const near = landmarksRef.current.find(
        landmark => Math.hypot(posRef.current.x - landmark.x, posRef.current.y - landmark.y) < NEAR_RADIUS,
      )
      const foundId = near?.id ?? null
      if (foundId !== lastNear) {
        lastNear = foundId
        setNearId(foundId)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [worldW, regions.length])

  const palette = themeFor(currentRegion?.slug).world

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none touch-none"
      style={{ backgroundColor: palette.grassDeep }}
    >
      {/* ── O mundo ─────────────────────────────────────────────── */}
      <div
        ref={stageRef}
        className="absolute top-0 left-0 will-change-transform"
        style={{ width: worldW, height: WORLD_H }}
      >
        <Terrain regions={regions} />

        {scenery.map(prop => (
          <div key={prop.key} className="absolute" style={{ left: prop.x, top: prop.y, zIndex: prop.z }}>
            {prop.node}
          </div>
        ))}

        {landmarks.map(landmark => {
          const near = landmark.id === nearId
          return (
            <div
              key={landmark.id}
              className="absolute"
              style={{
                left: landmark.x - 60,
                top: landmark.y - 110,
                width: 120,
                zIndex: Math.round(landmark.y),
              }}
            >
              <div
                className="flex flex-col items-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: near ? 'scale(1.1) translateY(-6px)' : 'none' }}
              >
                {near && (
                  <span
                    className="absolute bottom-0 h-10 w-24 rounded-full blur-xl"
                    style={{ background: landmark.palette.accent, opacity: 0.35 }}
                  />
                )}
                <div className="relative flex items-end justify-center h-[118px]">
                  <landmark.Figure palette={landmark.palette} />
                </div>
              </div>

              <p
                className={`text-center font-sans text-[12px] leading-tight mt-1 px-1 transition-all duration-300
                            ${near ? 'opacity-100 text-white' : 'opacity-0'}`}
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,1)' }}
              >
                {landmark.book.title}
              </p>

              {near && !dialogBook && (
                <div className="flex justify-center mt-1">
                  <span
                    className="font-pixel text-[7px] px-2.5 py-2 rounded border-2 border-[#2b2314] text-ink-950 lw-bob"
                    style={{ backgroundColor: landmark.palette.accent }}
                  >
                    E · LER
                  </span>
                </div>
              )}
            </div>
          )
        })}

        {/* o caminhante */}
        <div ref={playerRef} className="absolute top-0 left-0 will-change-transform">
          <PlayerSprite facing={facing} walking={walking} />
        </div>
      </div>

      {/* ── Luz e vinheta por cima do mundo ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 42%, transparent 42%, rgba(6,10,20,0.45) 100%)`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-soft-light transition-[background] duration-700"
        style={{ background: `linear-gradient(150deg, ${palette.accent}44, transparent 55%)` }}
      />

      {/* ── HUD ─────────────────────────────────────────────────── */}
      <WorldHud
        displayName={displayName}
        worldUsername={worldUsername}
        regions={regions}
        regionIndex={regionIndex}
        posRef={posRef}
        worldW={worldW}
        landmarkCount={new Set(landmarks.map(landmark => landmark.book.bookId)).size}
        isMyWorld={isMyWorld}
        onTravel={travelTo}
      />

      {currentRegion && <RegionBanner region={currentRegion} />}

      <TouchPad touchRef={touchRef} onInteract={openNearest} hasTarget={nearLandmark !== null} />

      {dialogBook && (
        <BookDialog
          book={dialogBook}
          palette={themeFor(dialogBook.genreSlug).world}
          isMyWorld={isMyWorld}
          displayName={displayName}
          onClose={() => setDialogBook(null)}
          onSaved={(bookId, review) => {
            setReviews(current => ({ ...current, [bookId]: review }))
            toast.success('avaliação guardada')
          }}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   TERRENO
   ══════════════════════════════════════════════════════════════════ */

function Terrain({ regions }: { regions: WorldGenre[] }) {
  return (
    <>
      {regions.map((region, index) => {
        const palette = themeFor(region.slug).world
        return (
          <div
            key={`terreno-${region.slug}`}
            className="absolute top-0"
            style={{
              left: index * REGION_W,
              width: REGION_W,
              height: WORLD_H,
              backgroundColor: palette.grass,
              /* Manchas largas e difusas de tom, pontilhado fino de folhagem e uma
                 grade de 32px quase invisível: textura de campo, não xadrez. */
              backgroundImage: `
                radial-gradient(ellipse 220px 150px at 20% 30%, ${palette.grassAlt}77, transparent 72%),
                radial-gradient(ellipse 180px 130px at 76% 64%, ${palette.grassAlt}55, transparent 72%),
                radial-gradient(ellipse 240px 160px at 48% 88%, ${palette.grassDeep}66, transparent 72%),
                radial-gradient(ellipse 160px 110px at 88% 16%, ${palette.grassDeep}44, transparent 72%),
                radial-gradient(2px 2px at 14% 20%, ${palette.grassDeep}, transparent),
                radial-gradient(2px 2px at 63% 44%, ${palette.grassDeep}, transparent),
                radial-gradient(2px 2px at 36% 74%, ${palette.grassAlt}, transparent),
                radial-gradient(2px 2px at 87% 86%, ${palette.grassDeep}, transparent),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 32px),
                repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 1px, transparent 1px 32px)`,
              backgroundSize: `
                640px 540px, 500px 430px, 720px 580px, 460px 400px,
                58px 58px, 94px 94px, 76px 76px, 112px 112px, 32px 32px, 32px 32px`,
              backgroundPosition: '0 0, 180px 80px, 60px 210px, 300px 30px, 0 0, 0 0, 0 0, 0 0, 0 0, 0 0',
            }}
          >
            {/* a fronteira entre regiões, marcada por uma faixa de terra mais escura */}
            {index > 0 && (
              <div
                className="absolute inset-y-0 -left-24 w-56"
                style={{ background: `linear-gradient(90deg, transparent, ${palette.grassDeep} 45%, transparent)` }}
              />
            )}
          </div>
        )
      })}

      {/* a estrada principal atravessa o mundo inteiro e costura as vilas */}
      <div
        className="absolute inset-x-0"
        style={{
          top: ROAD_Y,
          height: ROAD_H,
          backgroundColor: '#c9a678',
          backgroundImage: `
            radial-gradient(3px 3px at 12% 30%, rgba(0,0,0,0.14), transparent),
            radial-gradient(3px 3px at 48% 70%, rgba(0,0,0,0.12), transparent),
            radial-gradient(2px 2px at 76% 40%, rgba(255,255,255,0.3), transparent),
            radial-gradient(3px 3px at 92% 78%, rgba(0,0,0,0.12), transparent)`,
          backgroundSize: '150px 104px',
          boxShadow: 'inset 0 6px 0 #a8854f, inset 0 -6px 0 #a8854f',
        }}
      />
    </>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CONSTRUÇÃO DO MUNDO
   ══════════════════════════════════════════════════════════════════ */

function buildWorld(regions: WorldGenre[], readBooks: WorldBook[]) {
  const props: Prop[] = []
  const solids: Solid[] = []
  const landmarks: Landmark[] = []

  regions.forEach((region, index) => {
    const left = index * REGION_W
    const palette = themeFor(region.slug).world
    const seed = region.slug

    /* ── A vila, acima da estrada ─────────────────────────────── */
    const hallX = left + 170
    const hallY = 120
    props.push({ key: `sede-${seed}`, x: hallX, y: hallY, z: hallY + 170, node: <CasaGrande palette={palette} /> })
    solids.push({ x: hallX + 16, y: hallY + 70, w: 158, h: 105 })

    const cottageX = left + 470
    const cottageY = 210
    props.push({ key: `casa-${seed}`, x: cottageX, y: cottageY, z: cottageY + 105, node: <CasaPequena palette={palette} /> })
    solids.push({ x: cottageX + 12, y: cottageY + 42, w: 96, h: 62 })

    const stallX = left + 700
    const stallY = 250
    props.push({ key: `banca-${seed}`, x: stallX, y: stallY, z: stallY + 92, node: <Banca palette={palette} /> })
    solids.push({ x: stallX + 10, y: stallY + 30, w: 92, h: 58 })

    const wellX = left + 940
    const wellY = 245
    props.push({ key: `poco-${seed}`, x: wellX, y: wellY, z: wellY + 74, node: <Poco palette={palette} /> })
    solids.push({ x: wellX + 6, y: wellY + 34, w: 52, h: 38 })

    // cercas ladeando a sede
    props.push({ key: `cerca1-${seed}`, x: hallX - 118, y: hallY + 138, z: hallY + 160, node: <Cerca palette={palette} width={112} /> })
    props.push({ key: `cerca2-${seed}`, x: hallX + 196, y: hallY + 138, z: hallY + 160, node: <Cerca palette={palette} width={136} /> })

    // caminho da sede até a estrada
    props.push({
      key: `trilha-${seed}`,
      x: hallX + 76,
      y: hallY + 170,
      z: 1,
      node: (
        <div
          style={{
            width: 46,
            height: ROAD_Y - (hallY + 170) + 10,
            backgroundColor: '#c9a678',
            boxShadow: 'inset 5px 0 0 #a8854f, inset -5px 0 0 #a8854f',
          }}
        />
      ),
    })

    // a placa da vila
    props.push({
      key: `placa-${seed}`,
      x: left + REGION_W / 2 - 84,
      y: ROAD_Y - 74,
      z: ROAD_Y + 10,
      node: (
        <div className="relative">
          <Placa palette={palette} />
          <span className="absolute inset-x-0 top-[14px] text-center font-pixel text-[8px] text-ember-100 tracking-widest uppercase">
            {region.name.length > 14 ? `${region.name.slice(0, 13)}.` : region.name}
          </span>
        </div>
      ),
    })
    solids.push({ x: left + REGION_W / 2 - 10, y: ROAD_Y - 24, w: 20, h: 22 })

    // postes ao longo da estrada
    for (let post = 0; post < 4; post++) {
      const x = left + 150 + post * 320
      props.push({ key: `poste-${seed}-${post}`, x, y: ROAD_Y - 92, z: ROAD_Y + 4, node: <Poste palette={palette} /> })
    }

    /* ── O lago, abaixo da estrada ────────────────────────────── */
    const lakeX = left + 880
    const lakeY = 790
    props.push({ key: `lago-${seed}`, x: lakeX, y: lakeY, z: 2, node: <Lago palette={palette} width={280} height={175} /> })
    solids.push({ x: lakeX + 28, y: lakeY + 28, w: 224, h: 119 })

    /* ── Vegetação ────────────────────────────────────────────── */
    for (let i = 0; i < 110; i++) {
      const key = `${seed}-decor-${i}`
      const roll = hashText(key, 5) % 12
      const x = left + 30 + (hashText(key, 17) % (REGION_W - 90))
      let y = 90 + (hashText(key, 23) % (WORLD_H - 190))

      // nada nasce em cima da estrada
      if (y > ROAD_Y - 74 && y < ROAD_Y + ROAD_H + 26) y += 214
      if (y > WORLD_H - 90) y -= 330

      const tall = roll < 4
      if (overlaps(x, y, solids, tall ? 70 : 34)) continue

      const node =
        roll < 3 ? <Arvore palette={palette} /> :
        roll < 4 ? <Arvore palette={palette} size={58} /> :
        roll < 6 ? <Arbusto palette={palette} /> :
        roll < 7 ? <Pedra /> :
        roll < 10 ? <Tufo palette={palette} /> :
        <Flor palette={palette} />

      props.push({ key, x, y, z: Math.round(y + 40), node })

      if (tall) solids.push({ x: x + 22, y: y + 54, w: 30, h: 16 })
    }

    // a mata que fecha a região ao norte — duas fileiras, para ler como floresta
    for (let i = 0; i < 15; i++) {
      const x = left + 10 + i * 92
      props.push({ key: `${seed}-mata-a-${i}`, x, y: -34, z: 40, node: <Arvore palette={palette} size={78} /> })
      props.push({
        key: `${seed}-mata-b-${i}`,
        x: x + 46,
        y: 14,
        z: 70,
        node: <Arvore palette={palette} size={70} />,
      })
      solids.push({ x, y: 46, w: 92, h: 40 })
    }

    /* ── Os livros da região ──────────────────────────────────── */
    const regionBooks = readBooks.filter(book =>
      (book.genreSlugs?.length ? book.genreSlugs : [book.genreSlug]).includes(region.slug),
    )
    regionBooks.forEach((book, bookIndex) => {
      const Figure = figureForBook(book.title, region.slug)
      if (!Figure) return

      // distribuídos em faixas, para não empilharem uns nos outros
      const columns = Math.max(1, Math.min(4, Math.ceil(regionBooks.length / 2)))
      const column = bookIndex % columns
      const row = Math.floor(bookIndex / columns)
      const laneW = (REGION_W - 300) / columns
      const x = left + 190 + column * laneW + (hashText(book.title, 7) % Math.max(laneW - 130, 40))
      const y = ROAD_Y + ROAD_H + 90 + row * 165 + (hashText(book.title, 13) % 60)

      if (y > WORLD_H - 80) return

      landmarks.push({ id: `${region.slug}:${book.bookId}`, book, Figure, x, y, palette })
      solids.push({ x: x - 26, y: y - 24, w: 52, h: 30 })
    })
  })

  props.sort((a, b) => a.z - b.z)
  return { props, solids, landmarks }
}

/** Folga em volta do que já foi construído, para a vegetação não nascer dentro de uma casa. */
function overlaps(x: number, y: number, solids: Solid[], margin: number): boolean {
  return solids.some(
    solid =>
      x > solid.x - margin &&
      x < solid.x + solid.w + margin &&
      y > solid.y - margin - 30 &&
      y < solid.y + solid.h + margin,
  )
}

/* ══════════════════════════════════════════════════════════════════
   O SPRITE DO JOGADOR
   ══════════════════════════════════════════════════════════════════ */

/** Anima o passo por conta própria: o mapa inteiro não re-renderiza a 8fps por causa disso. */
function PlayerSprite({ facing, walking }: { facing: Facing; walking: boolean }) {
  const [step, setStep] = useState<0 | 1>(0)

  useEffect(() => {
    if (!walking) {
      setStep(0)
      return
    }
    const timer = window.setInterval(() => setStep(current => (current === 0 ? 1 : 0)), 140)
    return () => window.clearInterval(timer)
  }, [walking])

  return <Walker step={step} facing={facing} />
}

/* ══════════════════════════════════════════════════════════════════
   HUD
   ══════════════════════════════════════════════════════════════════ */

function WorldHud({
  displayName,
  worldUsername,
  regions,
  regionIndex,
  posRef,
  worldW,
  landmarkCount,
  isMyWorld,
  onTravel,
}: {
  displayName: string
  worldUsername: string
  regions: WorldGenre[]
  regionIndex: number
  posRef: React.RefObject<{ x: number; y: number }>
  worldW: number
  landmarkCount: number
  isMyWorld: boolean
  onTravel: (index: number) => void
}) {
  const [share, setShare] = useState(false)
  const minimapRef = useRef<HTMLSpanElement>(null)

  // o ponto do minimapa acompanha o caminhante sem custar um render por quadro
  useEffect(() => {
    let frame = 0
    function tick() {
      frame = requestAnimationFrame(tick)
      const dot = minimapRef.current
      if (!dot) return
      dot.style.left = `${Math.min(100, Math.max(0, (posRef.current.x / worldW) * 100))}%`
      dot.style.top = `${Math.min(100, Math.max(0, (posRef.current.y / WORLD_H) * 100))}%`
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [posRef, worldW])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/u/${worldUsername}`)
      setShare(true)
      window.setTimeout(() => setShare(false), 2200)
    } catch {
      setShare(false)
    }
  }

  return (
    <>
      {/* topo-esquerda: identidade */}
      <div className="absolute top-4 left-4 lw-dialog-frame rounded-lg px-4 py-3 max-w-[15rem]">
        <p className="font-pixel text-[8px] text-ember-400 uppercase tracking-widest">o mundo de</p>
        <p className="font-display text-lg text-ember-100 leading-tight truncate mt-1">{displayName}</p>
        <p className="font-sans text-[11px] text-slate-500 mt-1">
          {regions.length} {regions.length === 1 ? 'região' : 'regiões'} · {landmarkCount}{' '}
          {landmarkCount === 1 ? 'história' : 'histórias'}
        </p>
      </div>

      {/* topo-direita: minimapa + ações */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="lw-dialog-frame rounded-lg p-2 space-y-1.5">
          <p className="font-pixel text-[6px] text-slate-500 uppercase tracking-widest px-0.5">
            mapa · clique para viajar
          </p>
          <div className="relative flex gap-[2px] w-56 h-16 overflow-hidden rounded">
            {regions.map((region, index) => {
              const palette = themeFor(region.slug).world
              const here = index === regionIndex
              return (
                <button
                  key={region.slug}
                  onClick={() => onTravel(index)}
                  title={`ir para ${region.name}`}
                  className="grow rounded-sm transition-all duration-200 hover:brightness-125 relative group"
                  style={{
                    backgroundColor: palette.grass,
                    filter: here ? 'none' : 'saturate(0.75) brightness(0.8)',
                    boxShadow: here ? `inset 0 0 0 2px ${palette.accent}` : 'inset 0 0 0 1px rgba(0,0,0,0.35)',
                  }}
                >
                  <span
                    className="absolute inset-x-0 bottom-0 h-2/5 rounded-b-sm"
                    style={{ backgroundColor: palette.roof, opacity: 0.85 }}
                  />
                </button>
              )
            })}
            <span
              ref={minimapRef}
              className="absolute h-2.5 w-2.5 rounded-full bg-white border-2 border-black/70
                         -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow"
              style={{ left: '0%', top: '0%' }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          {isMyWorld && (
            <Link
              to="/"
              className="lw-dialog-frame rounded-lg px-3 py-2.5 font-pixel text-[7px] text-ember-200
                         hover:text-ember-100 hover:brightness-125 transition uppercase"
            >
              ← mesa
            </Link>
          )}
          <button
            onClick={copyLink}
            className="lw-dialog-frame rounded-lg px-3 py-2.5 font-pixel text-[7px] text-ember-200
                       hover:text-ember-100 hover:brightness-125 transition uppercase"
          >
            {share ? 'copiado!' : 'compartilhar'}
          </button>
        </div>
      </div>

      {/* rodapé: os controles */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:block pointer-events-none">
        <div className="lw-dialog-frame rounded-lg px-4 py-2.5 flex items-center gap-4">
          <span className="font-pixel text-[7px] text-slate-400 uppercase">
            <kbd className="text-ember-300">↑↓←→</kbd> andar
          </span>
          <span className="h-4 w-px bg-ink-700" />
          <span className="font-pixel text-[7px] text-slate-400 uppercase">
            <kbd className="text-ember-300">shift</kbd> correr
          </span>
          <span className="h-4 w-px bg-ink-700" />
          <span className="font-pixel text-[7px] text-slate-400 uppercase">
            <kbd className="text-ember-300">E</kbd> ler a história
          </span>
        </div>
      </div>
    </>
  )
}

/** A faixa com o nome da região, que aparece ao cruzar a fronteira. */
function RegionBanner({ region }: { region: WorldGenre }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = window.setTimeout(() => setVisible(false), 2600)
    return () => window.clearTimeout(timer)
  }, [region.slug])

  const palette = themeFor(region.slug).world

  return (
    <div
      className={`absolute top-28 left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-500
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div
        className="lw-dialog-frame rounded-lg px-7 py-3.5 text-center"
        style={{ boxShadow: `inset 0 0 0 2px ${palette.accent}, 0 16px 40px -12px rgba(0,0,0,0.9)` }}
      >
        <p className="font-pixel text-[7px] uppercase tracking-widest" style={{ color: palette.accent }}>
          vila
        </p>
        <p className="font-display text-2xl text-ember-100 tracking-[0.12em] uppercase mt-1.5">{region.name}</p>
        <p className="font-serif italic text-sm text-slate-400 mt-1">
          {region.booksFinished} {region.booksFinished === 1 ? 'história vivida' : 'histórias vividas'} ·{' '}
          {region.pagesRead.toLocaleString('pt-BR')} páginas
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   CONTROLE DE TOQUE
   ══════════════════════════════════════════════════════════════════ */

function TouchPad({
  touchRef,
  onInteract,
  hasTarget,
}: {
  touchRef: React.RefObject<[number, number]>
  onInteract: () => void
  hasTarget: boolean
}) {
  const set = (x: number, y: number) => () => {
    touchRef.current[0] = x
    touchRef.current[1] = y
  }
  const clear = () => {
    touchRef.current[0] = 0
    touchRef.current[1] = 0
  }

  const padButton =
    'lw-dialog-frame rounded-md h-12 w-12 flex items-center justify-center text-ember-200 font-pixel text-[10px] active:brightness-150'

  return (
    <div className="md:hidden absolute inset-x-0 bottom-5 px-5 flex items-end justify-between">
      <div className="grid grid-cols-3 gap-1.5">
        <span />
        <button className={padButton} onPointerDown={set(0, -1)} onPointerUp={clear} onPointerLeave={clear} aria-label="norte">▲</button>
        <span />
        <button className={padButton} onPointerDown={set(-1, 0)} onPointerUp={clear} onPointerLeave={clear} aria-label="oeste">◀</button>
        <span />
        <button className={padButton} onPointerDown={set(1, 0)} onPointerUp={clear} onPointerLeave={clear} aria-label="leste">▶</button>
        <span />
        <button className={padButton} onPointerDown={set(0, 1)} onPointerUp={clear} onPointerLeave={clear} aria-label="sul">▼</button>
        <span />
      </div>

      <button
        onClick={onInteract}
        disabled={!hasTarget}
        className={`lw-dialog-frame rounded-full h-16 w-16 font-pixel text-[11px] transition
                    ${hasTarget ? 'text-ember-200 lw-bob' : 'text-slate-700 opacity-50'}`}
      >
        E
      </button>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   A CAIXA DE DIÁLOGO
   ══════════════════════════════════════════════════════════════════ */

function Estrela({ filled, color, onClick }: { filled: boolean; color: string; onClick?: () => void }) {
  const star = (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 L14.9 8.6 L22 9.3 L16.7 14.1 L18.2 21.2 L12 17.5 L5.8 21.2 L7.3 14.1 L2 9.3 L9.1 8.6 Z"
        fill={filled ? color : 'transparent'}
        stroke={filled ? color : 'rgba(148,163,184,0.45)'}
        strokeWidth="1.6"
      />
    </svg>
  )
  if (!onClick) return star
  return (
    <button onClick={onClick} className="hover:scale-125 transition-transform duration-150" aria-label="dar nota">
      {star}
    </button>
  )
}

/** Texto que se escreve sozinho — o efeito de caixa de fala de RPG. */
function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState(enabled ? '' : text)

  useEffect(() => {
    if (!enabled) {
      setShown(text)
      return
    }
    setShown('')
    let index = 0
    const timer = window.setInterval(() => {
      index += 2
      setShown(text.slice(0, index))
      if (index >= text.length) window.clearInterval(timer)
    }, 16)
    return () => window.clearInterval(timer)
  }, [text, enabled])

  return { shown, done: shown.length >= text.length, reveal: () => setShown(text) }
}

function BookDialog({
  book,
  palette,
  isMyWorld,
  displayName,
  onClose,
  onSaved,
}: {
  book: WorldBook
  palette: WorldPalette
  isMyWorld: boolean
  displayName: string
  onClose: () => void
  onSaved: (bookId: string, review: Pick<WorldBook, 'reviewRating' | 'reviewBody' | 'reviewSpoiler'>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState(book.reviewRating ?? 0)
  const [body, setBody] = useState(book.reviewBody ?? '')
  const [spoiler, setSpoiler] = useState(book.reviewSpoiler ?? false)
  const [revealed, setRevealed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hidden = Boolean(book.reviewSpoiler) && !revealed
  const readable = book.reviewBody ?? ''
  const typed = useTypewriter(readable, !editing && !hidden && readable.length > 0)

  async function save() {
    if (rating < 1 || rating > 5) {
      setError('dê uma nota de 1 a 5 estrelas')
      return
    }
    if (!body.trim()) {
      setError('escreva o que essa história significou — até 1000 caracteres')
      return
    }

    setSaving(true)
    setError(null)
    try {
      const response = await api(`/books/${book.bookId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ rating, body: body.trim(), spoiler }),
      })
      if (!response.ok) {
        setError(await errorMessage(response, 'não foi possível salvar a avaliação'))
        return
      }
      onSaved(book.bookId, { reviewRating: rating, reviewBody: body.trim(), reviewSpoiler: spoiler })
      onClose()
    } catch {
      setError('o servidor não respondeu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="absolute inset-x-3 bottom-3 md:inset-x-16 lg:inset-x-32 z-50 lw-pop">
      <div className="lw-dialog-frame rounded-lg" style={{ boxShadow: `inset 0 0 0 2px ${palette.accent}66, 0 24px 60px -16px rgba(0,0,0,0.95)` }}>
        <div className="p-5 space-y-4 max-h-[52vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-lg text-ember-100 tracking-wide">{book.title}</h2>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <Estrela
                    key={value}
                    color={palette.accent}
                    filled={value <= (editing ? rating : book.reviewRating ?? 0)}
                    onClick={editing ? () => { setRating(value); setError(null) } : undefined}
                  />
                ))}
                {editing && rating > 0 && (
                  <span className="font-pixel text-[9px] text-slate-500 ml-2">{rating}/5</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 font-pixel text-[7px] text-slate-500 hover:text-ember-200 uppercase px-2 py-2
                         border border-ink-700 rounded hover:border-ember-400/50 transition"
            >
              esc
            </button>
          </div>

          {!editing ? (
            <>
              {readable ? (
                hidden ? (
                  <div className="space-y-3">
                    <p className="font-serif text-slate-400 blur-[5px] select-none line-clamp-3">{readable}</p>
                    <button
                      onClick={() => setRevealed(true)}
                      className="font-pixel text-[7px] uppercase px-3 py-2.5 rounded border-2 transition"
                      style={{ borderColor: `${palette.accent}88`, color: palette.accent }}
                    >
                      contém spoiler — revelar
                    </button>
                  </div>
                ) : (
                  <p
                    onClick={typed.reveal}
                    className="font-serif text-[17px] text-slate-100 leading-relaxed cursor-pointer min-h-[3rem]"
                  >
                    {typed.shown}
                    {!typed.done && <span className="lw-blink">▌</span>}
                  </p>
                )
              ) : (
                <p className="font-serif italic text-slate-500">
                  {isMyWorld
                    ? 'esta história ainda não tem a sua opinião registrada'
                    : `${displayName} ainda não deixou uma opinião sobre esta história`}
                </p>
              )}

              {isMyWorld && (
                <button
                  onClick={() => { setEditing(true); setError(null) }}
                  className="w-full rounded border-2 font-pixel text-[8px] uppercase py-3 transition hover:brightness-125"
                  style={{ borderColor: `${palette.accent}88`, color: palette.accent }}
                >
                  {readable ? 'editar minha avaliação' : 'avaliar esta história'}
                </button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <textarea
                autoFocus
                value={body}
                onChange={event => { setBody(event.target.value); setError(null) }}
                maxLength={1000}
                rows={4}
                placeholder="o que essa história significou para você? (sem spoilers... ou marque a caixinha)"
                className="lw-field font-serif text-[16px] resize-none"
              />
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 font-sans text-sm text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={spoiler}
                    onChange={event => setSpoiler(event.target.checked)}
                    className="accent-ember-400"
                  />
                  contém spoiler
                </label>
                <span className="font-sans text-xs text-slate-600 tabular-nums">{body.length}/1000</span>
              </div>

              {error && <p className="font-sans text-sm text-danger-400">{error}</p>}

              <div className="flex gap-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="grow rounded font-pixel text-[8px] uppercase py-3 text-ink-950 transition
                             hover:brightness-110 disabled:opacity-50"
                  style={{ backgroundColor: palette.accent }}
                >
                  {saving ? 'guardando...' : 'guardar avaliação'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded border border-ink-700 text-slate-400 font-pixel text-[8px] uppercase px-4
                             hover:text-slate-200 transition"
                >
                  cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
