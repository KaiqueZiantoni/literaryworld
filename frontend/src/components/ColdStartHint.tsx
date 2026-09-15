import { useEffect, useState } from 'react'

/**
 * O contêiner gratuito do backend hiberna depois de quinze minutos sem tráfego,
 * e a primeira visita paga a partida da JVM. Sem aviso, essa espera parece
 * travamento; com aviso, parece o que é. A frase só entra depois que a demora
 * deixa de ser normal, para quem chega com o servidor quente nunca a ver.
 */
export function ColdStartHint({ afterMs = 3500 }: { afterMs?: number }) {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const relogio = window.setTimeout(() => setVisivel(true), afterMs)
    return () => window.clearTimeout(relogio)
  }, [afterMs])

  if (!visivel) return null

  return (
    <p className="lw-fade-in font-serif italic text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
      o servidor gratuito hiberna quando ninguém está lendo — a primeira visita
      leva alguns segundos para acordá-lo
    </p>
  )
}
