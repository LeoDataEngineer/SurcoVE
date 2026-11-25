import { useState } from 'react'
import { Compass, Menu, Sun, X } from 'lucide-react'
import type { Seccion } from '../lib/navegacion'
import { PAGINAS } from '../lib/navegacion'

interface Props {
  seccion: Seccion
  modoCampo: boolean
  onToggleCampo: () => void
  onCambiarParcela: () => void
}

export function Header({ seccion, modoCampo, onToggleCampo, onCambiarParcela }: Props) {
  const [abierto, setAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-noche/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <a href="/index.html" className="flex items-center gap-2" aria-label="Ir a la brújula">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-hoja to-sol text-noche">
            <Compass size={22} />
          </span>
          <span className="text-left">
            <span className="block font-display text-lg font-bold leading-none">SurcoVE</span>
            <span className="block text-[10px] uppercase tracking-widest text-white/45">Brújula climática</span>
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {PAGINAS.map((pagina) => (
            <a
              key={pagina.id}
              href={pagina.ruta}
              aria-current={seccion === pagina.id ? 'page' : undefined}
              className={`rounded-full px-3 py-2 text-sm transition ${seccion === pagina.id
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
            >
              {pagina.etiqueta}
            </a>
          ))}
        </nav>

        <button
          onClick={onToggleCampo}
          className={`ml-auto hidden min-h-[44px] items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition lg:flex ${modoCampo
            ? 'border-sol/60 bg-sol/20 text-sol'
            : 'border-white/15 text-white/60 hover:text-white'}`}
          title="Aumentar contraste y tamaño de texto"
        >
          <Sun size={16} /> Modo campo
        </button>

        <button
          onClick={() => { onCambiarParcela(); setAbierto(false) }}
          className="hidden min-h-[44px] rounded-full bg-hoja px-4 py-2 text-xs font-bold text-noche transition hover:brightness-110 sm:block"
        >
          Mi parcela
        </button>

        <button
          onClick={() => setAbierto((v) => !v)}
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-white/15 lg:hidden"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
        >
          {abierto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {abierto && (
        <nav className="border-t border-white/10 px-4 pb-4 lg:hidden" aria-label="Navegación móvil">
          <div className="grid grid-cols-2 gap-2 pt-3">
            {PAGINAS.map((pagina) => (
              <a
                key={pagina.id}
                href={pagina.ruta}
                aria-current={seccion === pagina.id ? 'page' : undefined}
                className={`flex min-h-[44px] items-center rounded-xl px-3 text-sm ${seccion === pagina.id
                  ? 'bg-hoja/20 text-hoja'
                  : 'bg-white/5 text-white/70'}`}
              >
                {pagina.etiqueta}
              </a>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={onToggleCampo}
              className="min-h-[44px] flex-1 rounded-xl border border-white/15 text-sm"
            >
              {modoCampo ? 'Modo campo: activo' : 'Modo campo'}
            </button>
            <button
              onClick={() => { onCambiarParcela(); setAbierto(false) }}
              className="min-h-[44px] flex-1 rounded-xl bg-hoja text-sm font-bold text-noche"
            >
              Mi parcela
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
