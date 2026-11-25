import { gold } from '../lib/gold'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-noche/60 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-display text-xl font-bold">SurcoVE</p>
            <p className="mt-2 text-sm text-white/55">
              Brújula climática para Venezuela. Un proyecto independiente para el reto
              NASA Space Apps 2026 «Field Shift». No afiliado ni respaldado por la NASA.
            </p>
            <p className="mt-3 text-xs text-white/40">Periodo de datos: {gold.meta.periodo}.</p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/40">De dónde vienen los datos</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {gold.dimensiones.fuente.filter((fuente) => fuente.live).map((fuente) => (
                <a
                  key={fuente.id}
                  href={fuente.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs hover:border-white/25"
                >
                  <span className="block font-semibold text-white/80">{fuente.nombre}</span>
                  <span className="mt-1 block leading-relaxed text-white/45">
                    Datos climáticos usados para calcular las señales de tu estado.
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-sol/20 bg-sol/5 p-3 text-xs leading-relaxed text-white/55">
              La herramienta ayuda a identificar patrones y opciones; no reemplaza
              el criterio del agricultor ni la revisión de un agrónomo local.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
