import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { line, curveMonotoneX } from 'd3-shape'
import { scaleLinear } from 'd3-scale'
import { X } from 'lucide-react'
import type { SensorValor } from '../types'
import { redondear } from '../lib/format'
import { anioReciente } from '../lib/gold'

interface Props {
  sensor: SensorValor
  onClose: () => void
}

const ESTADOS = {
  bien: { texto: 'En rango', clase: 'text-hoja border-hoja/40 bg-hoja/10' },
  atencion: { texto: 'Atención', clase: 'text-sol border-sol/40 bg-sol/10' },
  riesgo: { texto: 'Riesgo', clase: 'text-[#f07c6a] border-[#f07c6a]/40 bg-[#f07c6a]/10' },
}

export function SensorPanel({ sensor, onClose }: Props) {
  const ruta = useMemo(() => {
    const datos = sensor.historico
    if (datos.length < 2) return ''
    const x = scaleLinear().domain([0, datos.length - 1]).range([8, 492])
    const min = Math.min(...datos)
    const max = Math.max(...datos)
    const y = scaleLinear().domain([min, max]).range([104, 12])
    return line<number>().x((_, i) => x(i)).y((d) => y(d)).curve(curveMonotoneX)(datos) ?? ''
  }, [sensor.historico])

  const estado = ESTADOS[sensor.estado]
  const anioFinal = anioReciente()
  const anioInicial = anioFinal - sensor.historico.length + 1
  const anioMedio = anioInicial + Math.floor((sensor.historico.length - 1) / 2)

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">Señal seleccionada</p>
          <h3 className="font-display text-xl font-bold">{sensor.nombre}</h3>
        </div>
        <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl border border-white/15" aria-label="Cerrar detalle">
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <span className="font-display text-4xl font-bold" style={{ color: sensor.color }}>
          {sensor.valor}
        </span>
        <span className="pb-1 text-sm text-white/50">{sensor.unidad}</span>
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          {sensor.esPromedio && (
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-white/60">
              Promedio histórico
            </span>
          )}
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${estado.clase}`}>{estado.texto}</span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-noche/40 p-3">
        <div className="mb-1 flex justify-between gap-2 text-[11px] text-white/45">
          <span>Serie histórica · mismo mes</span>
          <span>{sensor.historico.length} años</span>
        </div>
        <svg viewBox="0 0 500 120" className="h-24 w-full" role="img" aria-label={`Tendencia histórica de ${sensor.nombre} entre ${anioInicial} y ${anioFinal}`}>
          <line x1="8" y1="110" x2="492" y2="110" stroke="#ffffff" strokeOpacity="0.1" />
          <path d={ruta} fill="none" stroke={sensor.color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="mt-1 flex justify-between text-[10px] text-white/35">
          <span>{anioInicial}</span>
          <span>{anioMedio}</span>
          <span>{anioFinal}</span>
        </div>
        <div className="mt-1 flex flex-wrap justify-between gap-1 text-[11px] text-white/50">
          {sensor.esPromedio ? (
            <span>Tendencia con datos históricos, no un pronóstico.</span>
          ) : (
            <>
              <span>Anomalía: {redondear(sensor.anomalia, 2)} σ</span>
              <span>Percentil: {redondear(sensor.percentil)}</span>
            </>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/70">{sensor.descripcion}</p>
      <p className="mt-2 text-xs text-white/45">Umbral de referencia: {sensor.umbral}</p>
    </motion.aside>
  )
}
