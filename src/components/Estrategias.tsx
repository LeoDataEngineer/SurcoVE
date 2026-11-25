import type { Estrategia } from '../types'
import { nombreCultivo, nombreIndicador, prioridades } from '../lib/gold'

interface Props {
  estrategias: Estrategia[]
}

function Radar({ estrategia }: { estrategia: Estrategia }) {
  const ejes = prioridades
  const puntos = ejes.map((eje, i) => {
    const angulo = (i * 2 * Math.PI / ejes.length) - Math.PI / 2
    const valor = (estrategia.porPrioridad[eje.id] ?? 50) / 100
    return `${60 + Math.cos(angulo) * 44 * valor},${60 + Math.sin(angulo) * 44 * valor}`
  }).join(' ')

  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" role="img" aria-label="Compatibilidad con tus prioridades">
      {[0.25, 0.5, 0.75, 1].map((factor) => (
        <polygon
          key={factor}
          points={ejes.map((_, i) => {
            const angulo = (i * 2 * Math.PI / ejes.length) - Math.PI / 2
            return `${60 + Math.cos(angulo) * 44 * factor},${60 + Math.sin(angulo) * 44 * factor}`
          }).join(' ')}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.12"
        />
      ))}
      <polygon points={puntos} fill="#5cc9a7" fillOpacity="0.25" stroke="#5cc9a7" strokeWidth="2" />
    </svg>
  )
}

export function Estrategias({ estrategias }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {estrategias.map((estrategia, index) => (
        <article
          key={estrategia.id}
          className={`flex flex-col rounded-3xl border p-5 ${index === 0
            ? 'border-white/10 bg-white/[0.02]'
            : 'border-hoja/25 bg-gradient-to-b from-hoja/[0.08] to-transparent'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-white/40">
                {index === 0 ? 'Línea base' : 'Alternativa'}
              </p>
              <h3 className="font-display text-lg font-bold">{estrategia.nombre}</h3>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold text-hoja">{estrategia.puntaje}</div>
              <div className="text-[10px] text-white/40">/ 100</div>
            </div>
          </div>

          <div className="my-3 flex flex-wrap gap-1.5">
            {estrategia.cultivos.map((id) => (
              <span key={id} className="rounded-full border border-white/15 px-2.5 py-1 text-xs">
                {nombreCultivo(id)}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Radar estrategia={estrategia} />
            <div className="flex-1 space-y-1 text-xs text-white/60">
              <div>Agua: {estrategia.agua} mm/mes</div>
              <div>Cobertura: {Math.round(estrategia.cobertura * 100)} %</div>
              <div>Fija nitrógeno: {estrategia.nitrogeno ? 'Sí' : 'No'}</div>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-white/70">{estrategia.porQue}</p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-white/40">Se apoya en:</span>
            {estrategia.evidencia.map((id) => (
              <span key={id} className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/50">
                {nombreIndicador(id)}
              </span>
            ))}
          </div>

          <details className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
            <summary className="cursor-pointer font-semibold text-white/80">Beneficios, brechas y riesgos</summary>
            <div className="mt-2 space-y-2">
              <div><b className="text-hoja">Beneficios:</b> {estrategia.beneficios.join(' · ')}</div>
              <div><b className="text-sol">Brechas:</b> {estrategia.brechas.join(' · ')}</div>
              <div><b className="text-[#f07c6a]">Riesgos:</b> {estrategia.riesgos.join(' · ')}</div>
            </div>
          </details>
        </article>
      ))}
    </div>
  )
}
