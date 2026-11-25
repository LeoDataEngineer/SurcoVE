import type { Escenario } from '../types'
import { gold } from '../lib/gold'

interface Props {
  escenario: Escenario
  onChange: (escenario: Escenario) => void
}

export function Escenarios({ escenario, onChange }: Props) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 flex justify-between text-sm font-semibold">
            <span>Aumento de temperatura</span>
            <span className="text-sol">+{escenario.temp} °C</span>
          </span>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={escenario.temp}
            onChange={(e) => onChange({ ...escenario, temp: Number(e.target.value) })}
            className="h-11 w-full accent-sol"
          />
        </label>
        <label className="block">
          <span className="mb-2 flex justify-between text-sm font-semibold">
            <span>Cambio de lluvia</span>
            <span className="text-hoja">{escenario.lluvia > 0 ? '+' : ''}{escenario.lluvia} %</span>
          </span>
          <input
            type="range"
            min={-30}
            max={10}
            step={5}
            value={escenario.lluvia}
            onChange={(e) => onChange({ ...escenario, lluvia: Number(e.target.value) })}
            className="h-11 w-full accent-hoja"
          />
        </label>
        <p className="rounded-xl border border-sol/20 bg-sol/5 p-3 text-xs leading-relaxed text-white/60">
          El laboratorio mueve la temperatura y la lluvia sobre lo observado (2001–2025).
          Es una exploración para comparar opciones, no un pronóstico del clima.
        </p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Ajustes rápidos</p>
        <div className="grid gap-2">
          {gold.dimensiones.escenario.map((esc) => (
            <button
              key={esc.id}
              onClick={() => onChange({ temp: esc.temp, lluvia: esc.lluvia })}
              className={`min-h-[44px] rounded-xl border px-3 text-left text-sm ${escenario.temp === esc.temp && escenario.lluvia === esc.lluvia
                ? 'border-hoja bg-hoja/15 text-white'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/25'}`}
            >
              {esc.nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
