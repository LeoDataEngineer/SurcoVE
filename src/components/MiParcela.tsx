import { MESES } from '../lib/format'
import { anioReciente, aniosDisponibles, cultivos, prioridades, zonas, nombreCultivo, nombreZona } from '../lib/gold'
import { guardarConsulta, guardarParcela } from '../lib/storage'
import type { Consulta, Parcela, PrioridadId } from '../types'

interface Props {
  parcela: Parcela
  onChange: (parcela: Parcela) => void
  consulta: Consulta
  onConsultaChange: (consulta: Consulta) => void
}

/** Selector compacto y permanente: reemplaza la pantalla de inicio. */
export function MiParcela({ parcela, onChange, consulta, onConsultaChange }: Props) {
  const anios = [...aniosDisponibles(), anioReciente() + 1]
  const esFuturo = consulta.anio > anioReciente()

  const cambiarConsulta = (cambios: Partial<Consulta>) => {
    const nueva = { ...consulta, ...cambios }
    guardarConsulta(nueva)
    onConsultaChange(nueva)
  }

  const actualizar = (cambios: Partial<Parcela>) => {
    const nueva = { ...parcela, ...cambios }
    guardarParcela(nueva)
    onChange(nueva)
  }

  const alternar = (id: PrioridadId) => {
    actualizar({
      prioridades: parcela.prioridades.includes(id)
        ? parcela.prioridades.filter((p) => p !== id)
        : [...parcela.prioridades, id],
    })
  }

  return (
    <details id="parcela" className="mb-8 scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.03]">
      <summary className="flex min-h-[56px] cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-hoja">Mi parcela</span>
        <span className="text-sm text-white/75">
          {nombreZona(parcela.zona)} · {nombreCultivo(parcela.cultivo)} ·{' '}
          {MESES[consulta.mes - 1]} {consulta.anio} ·{' '}
          {parcela.prioridades.length ? parcela.prioridades.length + ' prioridades' : 'general'}
        </span>
        <span className="ml-auto text-xs text-white/40">Cambiar ▾</span>
      </summary>

      <div className="border-t border-white/10 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Estado</span>
            <select
              value={parcela.zona}
              onChange={(e) => actualizar({ zona: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-noche px-3 text-sm"
            >
              {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Cultivo actual</span>
            <select
              value={parcela.cultivo}
              onChange={(e) => actualizar({ cultivo: e.target.value })}
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-noche px-3 text-sm"
            >
              {cultivos.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {c.familia}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Mes a consultar</span>
            <select
              value={consulta.mes}
              onChange={(e) => cambiarConsulta({ mes: Number(e.target.value) })}
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-noche px-3 text-sm"
            >
              {MESES.map((nombre, i) => <option key={nombre} value={i + 1}>{nombre}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Año</span>
            <select
              value={consulta.anio}
              onChange={(e) => cambiarConsulta({ anio: Number(e.target.value) })}
              className="min-h-[44px] w-full rounded-xl border border-white/15 bg-noche px-3 text-sm"
            >
              {anios.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}{anio > anioReciente() ? ' (sin datos observados)' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-white/45">
          {esFuturo
            ? `Para ${consulta.anio} mostramos el promedio de ${MESES[consulta.mes - 1].toLowerCase()} entre ${aniosDisponibles()[0]} y ${anioReciente()} con tu escenario. Es una tendencia con datos históricos, no un pronóstico.`
            : 'Mes y año con datos observados.'}
        </p>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm font-semibold">Qué te importa más</legend>
          <div className="flex flex-wrap gap-2">
            {prioridades.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => alternar(p.id)}
                aria-pressed={parcela.prioridades.includes(p.id)}
                className={`min-h-[44px] rounded-full border px-4 text-sm transition ${parcela.prioridades.includes(p.id)
                  ? 'border-sol bg-sol/20 text-sol'
                  : 'border-white/15 text-white/60 hover:border-white/30'}`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </fieldset>

        <p className="mt-4 text-xs text-white/40">
          Guardado solo en este dispositivo. Puedes cambiarlo aquí en cualquier página.
        </p>
      </div>
    </details>
  )
}
