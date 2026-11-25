import { motion, useReducedMotion } from 'framer-motion'
import type { IndicadorId, SensorValor } from '../types'
import { nombreMes } from '../lib/format'

interface Props {
  sensores: SensorValor[]
  zona: string
  mes: number
  anio: number
  activo: IndicadorId | null
  onSelect: (id: IndicadorId) => void
}

export function Brujula({ sensores, zona, mes, anio, activo, onSelect }: Props) {
  const reducirMovimiento = useReducedMotion()

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="nucleo" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#1d4c5a" />
            <stop offset="70%" stopColor="#0b1f3a" />
            <stop offset="100%" stopColor="#061225" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="49" fill="#071630" stroke="#ffffff" strokeOpacity="0.08" />
        <circle cx="50" cy="50" r="41" fill="none" stroke="#5cc9a7" strokeOpacity="0.18" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="#ffffff" strokeOpacity="0.08" />
        <circle cx="50" cy="50" r="22" fill="url(#nucleo)" stroke="#5cc9a7" strokeOpacity="0.25" />
        {Array.from({ length: 8 }, (_, i) => {
          const ang = (i * 45 - 90) * Math.PI / 180
          return (
            <line
              key={i}
              x1={50 + Math.cos(ang) * 28}
              y1={50 + Math.sin(ang) * 28}
              x2={50 + Math.cos(ang) * 39}
              y2={50 + Math.sin(ang) * 39}
              stroke="#ffffff"
              strokeOpacity="0.1"
            />
          )
        })}
        <motion.circle
          cx="50" cy="50" r="24" fill="none" stroke="#5cc9a7" strokeWidth="0.5"
          animate={reducirMovimiento ? { r: 24, opacity: 0.35 } : { r: [23, 26, 23], opacity: [0.5, 0.1, 0.5] }}
          transition={reducirMovimiento ? undefined : { duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div className="px-6">
          <p className="text-[10px] uppercase tracking-[0.22em] text-hoja/70">Estado activo</p>
          <p className="font-display text-lg font-bold leading-tight sm:text-2xl">{zona}</p>
          <p className="mt-1 text-[11px] text-white/45">{nombreMes(mes)} {anio} · 8 señales</p>
        </div>
      </div>

      {sensores.map((sensor, i) => {
        const ang = (i * 360 / sensores.length - 90) * Math.PI / 180
        const x = 50 + Math.cos(ang) * 38
        const y = 50 + Math.sin(ang) * 38
        const seleccionado = activo === sensor.id
        return (
          <div
            key={sensor.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <motion.button
              onClick={() => onSelect(sensor.id)}
              whileHover={reducirMovimiento ? undefined : { scale: 1.07 }}
              whileTap={reducirMovimiento ? undefined : { scale: 0.96 }}
              className={`flex h-[58px] w-[58px] flex-col items-center justify-center rounded-full border text-center shadow-sensor sm:h-[78px] sm:w-[78px] ${seleccionado
                ? 'border-white bg-white/15'
                : 'border-white/15 bg-noche/85 hover:border-white/40'}`}
              aria-label={`Ver señal ${sensor.nombre}: ${sensor.valor} ${sensor.unidad}`}
              aria-pressed={seleccionado}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sensor.color }} />
              <span className="mt-0.5 font-display text-[11px] font-bold leading-none sm:text-sm">{sensor.valor}</span>
              <span className="mt-0.5 max-w-[52px] truncate text-[8px] text-white/55 sm:text-[10px]">{sensor.nombre}</span>
            </motion.button>
          </div>
        )
      })}
    </div>
  )
}
