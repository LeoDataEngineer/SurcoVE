import { arc, pie, type PieArcDatum } from 'd3-shape'
import type { MesRueda } from '../types'
import { nombreMes } from '../lib/format'

interface Props {
  meses: MesRueda[]
  mesActual: number
}

const color = (mes: MesRueda) => mes.idoneidad >= 70 ? '#5cc9a7' : mes.idoneidad >= 50 ? '#f3c969' : '#f07c6a'

export function Rueda({ meses, mesActual }: Props) {
  const arcos = pie<MesRueda>().value(() => 1).sort(null)(meses)
  const generador = arc<PieArcDatum<MesRueda>>()
    .innerRadius(88)
    .outerRadius(168)
    .padAngle(0.025)
    .cornerRadius(8)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-center">
      <div className="mx-auto w-full max-w-[420px]">
        <svg viewBox="-200 -200 400 400" className="w-full" role="img" aria-label="Rueda de siembra de doce meses">
          <circle r="82" fill="#0b1f3a" stroke="#ffffff" strokeOpacity="0.08" />
          {arcos.map((arco) => (
            <g key={arco.data.mes}>
              <path
                d={generador(arco) ?? ''}
                fill={color(arco.data)}
                fillOpacity={arco.data.mes === mesActual ? 0.95 : 0.55}
                stroke={arco.data.mes === mesActual ? '#ffffff' : 'none'}
                strokeOpacity={arco.data.mes === mesActual ? 0.6 : 0}
              />
              <text
                x={generador.centroid(arco)[0]}
                y={generador.centroid(arco)[1]}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-white text-[13px] font-bold"
              >
                {nombreMes(arco.data.mes)}
              </text>
            </g>
          ))}
          <text y="-8" textAnchor="middle" className="fill-white/45 text-[11px]">Mejor mes</text>
          <text y="18" textAnchor="middle" className="fill-white font-display text-xl font-bold">
            {meses.reduce((best, m) => m.idoneidad > best.idoneidad ? m : best, meses[0]).nombre}
          </text>
        </svg>
      </div>

      <div>
        <p className="mb-3 text-sm text-white/60">
          Cada sector muestra el ajuste del cultivo en ese mes. El borde blanco marca el mes actual.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {meses.map((mes) => (
            <div key={mes.mes} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{mes.nombre}</span>
                <span className="text-xs" style={{ color: color(mes) }}>{Math.round(mes.idoneidad)}</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${mes.idoneidad}%`, background: color(mes) }} />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-white/45">
                <span>Siembra {Math.round(mes.siembra)}</span>
                <span>Riesgo {Math.round(mes.riesgo)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-white/50">
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-hoja" />Buen ajuste</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-sol" />Aceptable</span>
          <span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f07c6a]" />Vigilar</span>
        </div>
      </div>
    </div>
  )
}
