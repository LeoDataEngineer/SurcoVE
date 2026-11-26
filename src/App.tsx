import { useMemo, useState } from 'react'
import type { Consulta, Escenario, IndicadorId, Parcela } from './types'
import { nombreMes } from './lib/format'
import { anioReciente, aniosDisponibles, cultivos, gold, zonas, nombreZona, nombreCultivo, nombrePrioridad } from './lib/gold'
import type { Seccion } from './lib/navegacion'
import {
  estrategias as calcularEstrategias,
  mejoresMeses,
  ruedaSiembra,
  sensores as calcularSensores,
} from './lib/scoring'
import { cargarConsulta, cargarModoCampo, cargarParcela, guardarConsulta, guardarModoCampo, guardarParcela, limpiarSeleccionObsoleta } from './lib/storage'
import { Header } from './components/Header'
import { MiParcela } from './components/MiParcela'
import { Brujula } from './components/Brujula'
import { SensorPanel } from './components/SensorPanel'
import { Rueda } from './components/Rueda'
import { Estrategias } from './components/Estrategias'
import { Escenarios } from './components/Escenarios'
import { Explorador } from './components/Explorador'
import { Asistente } from './components/Asistente'
import { Ficha } from './components/Ficha'
import { Footer } from './components/Footer'
import { Guia } from './components/Guia'

function porDefecto(): Parcela {
  limpiarSeleccionObsoleta()
  const guardada = cargarParcela()
  if (
    guardada
    && guardada.zona
    && guardada.cultivo
    && Array.isArray(guardada.prioridades)
    && guardada.prioridades.length > 0
    && zonas.some((z) => z.id === guardada.zona)
    && cultivos.some((c) => c.id === guardada.cultivo)
  ) return guardada
  return { zona: '', cultivo: '', prioridades: [] }
}

function consultaInicial(): Consulta {
  const guardada = cargarConsulta()
  const anios = [...aniosDisponibles(), anioReciente() + 1]
  if (
    guardada
    && guardada.mes >= 1
    && guardada.mes <= 12
    && anios.includes(guardada.anio)
  ) return guardada
  return { mes: 0, anio: 0 }
}

function sensorDelHash(): IndicadorId | null {
  const hash = window.location.hash.replace('#', '') as IndicadorId
  return gold.dimensiones.indicador.some((i) => i.id === hash) ? hash : null
}

function Titulo({ ojo, titulo, texto }: { ojo: string; titulo: string; texto: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-hoja">{ojo}</p>
      <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">{titulo}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">{texto}</p>
    </div>
  )
}

function AvisoSeleccion({ onAbrir }: { onAbrir: () => void }) {
  return (
    <div className="mb-8 rounded-3xl border border-sol/40 bg-sol/10 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sol">Antes de analizar</p>
      <h2 className="mt-1 font-display text-xl font-bold">Elige los datos de tu parcela</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/65">
        Selecciona el estado, el cultivo, el mes, el año y al menos una prioridad en «Mi parcela».
        Cuando esté listo, esta página mostrará el análisis.
      </p>
      <button
        onClick={onAbrir}
        className="mt-4 min-h-[44px] rounded-xl border border-sol/50 bg-sol/20 px-5 text-sm font-semibold text-sol"
      >
        Abrir Mi parcela
      </button>
    </div>
  )
}

export default function App({ seccion }: { seccion: Seccion }) {
  const [parcela, setParcela] = useState<Parcela>(porDefecto)
  const [escenario, setEscenario] = useState<Escenario>({ temp: 0, lluvia: 0 })
  const [sensorActivo, setSensorActivo] = useState<IndicadorId | null>(sensorDelHash)
  const [modoCampo, setModoCampo] = useState(() => cargarModoCampo())
  const [consulta, setConsulta] = useState<Consulta>(consultaInicial)
  const { mes, anio } = consulta
  const esFuturo = anio > anioReciente()
  const activa = parcela
  const listo = Boolean(
    activa.zona && activa.cultivo && activa.prioridades.length > 0 && mes && anio,
  )

  const datos = useMemo(() => {
    if (!listo) return null
    return {
      sensores: calcularSensores(activa.zona, mes, escenario, anio),
      estrategias: calcularEstrategias(activa.zona, activa.cultivo, activa.prioridades, escenario, anio),
      rueda: ruedaSiembra(activa.cultivo, activa.zona, activa.prioridades, escenario, anio),
      mejores: mejoresMeses(activa.cultivo, activa.zona, activa.prioridades, escenario, anio).slice(0, 3),
    }
  }, [listo, activa.zona, activa.cultivo, activa.prioridades, escenario, mes, anio])

  const sensores = datos?.sensores ?? []
  const estrategias = datos?.estrategias ?? []
  const rueda = datos?.rueda ?? []
  const mejores = datos?.mejores ?? []
  const sensor = sensores.find((s) => s.id === sensorActivo) ?? null

  const guardar = (nueva: Parcela) => {
    guardarParcela(nueva)
    setParcela(nueva)
  }

  const guardarConsultaActual = (nueva: Consulta) => {
    guardarConsulta(nueva)
    setConsulta(nueva)
  }

  const alternarCampo = () => {
    const siguiente = !modoCampo
    guardarModoCampo(siguiente)
    setModoCampo(siguiente)
  }

  const abrirParcela = () => {
    const elemento = document.getElementById('parcela')
    if (elemento instanceof HTMLDetailsElement) elemento.open = true
    elemento?.scrollIntoView({ block: 'start' })
  }

  const verSensor = (id: IndicadorId) => {
    window.location.href = `${import.meta.env.BASE_URL}index.html#${id}`
  }

  return (
    <div className={modoCampo ? 'modo-campo' : ''}>
      <Header
        seccion={seccion}
        modoCampo={modoCampo}
        onToggleCampo={alternarCampo}
        onCambiarParcela={abrirParcela}
      />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-10 sm:px-6">
        {seccion === 'brujula' && (
          <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-hoja">Para qué sirve SurcoVE</p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Planifica tu siembra con el clima de tu estado
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/60">
              Reunimos el clima histórico de los 23 estados y el Distrito Capital para ayudarte a decidir qué
              sembrar y cuándo. Puedes mirar ocho señales, comparar rotaciones, explorar el mapa y llevarte una
              ficha para el campo que funciona sin internet.
            </p>
          </section>
        )}

        <MiParcela
          parcela={activa}
          onChange={setParcela}
          consulta={consulta}
          onConsultaChange={guardarConsultaActual}
        />

        {!listo && seccion !== 'mapa' && seccion !== 'guia' && (
          <AvisoSeleccion onAbrir={abrirParcela} />
        )}

        {listo && seccion === 'brujula' && (
          <section>
            <Titulo
              ojo="Brújula de decisiones"
              titulo={`${nombreZona(activa.zona)} vista desde ocho señales`}
              texto={esFuturo
                ? `${nombreMes(mes)} de ${anio}: mostramos el promedio de ese mes entre ${aniosDisponibles()[0]} y ${anioReciente()} con tu escenario. Es una tendencia con datos históricos, no un pronóstico.`
                : 'Toca un sensor para ver su tendencia, su comparación con el histórico y su umbral. La brújula se actualiza con tu estado, tus prioridades y el escenario que elijas.'}
            />
            <div className="relative z-10 mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-3xl border border-white/10 bg-noche/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">Tu configuración</p>
                <p className="mt-1 font-display text-lg font-bold">
                  {nombreCultivo(activa.cultivo)} en {nombreZona(activa.zona)}
                </p>
                <p className="mt-1 text-xs text-white/45">
                  {nombreMes(mes)} {anio}{esFuturo ? ' · tendencia histórica' : ' · dato observado'}
                </p>
              </div>
              <p className="text-sm text-white/60">
                Prioridades: {activa.prioridades.length
                  ? activa.prioridades.map(nombrePrioridad).join(', ')
                  : 'ninguna (evaluación general)'}
              </p>
              <div className="sm:ml-auto">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-white/40">Mejores meses</p>
                <div className="flex flex-wrap gap-2">
                  {mejores.map((m) => (
                    <span key={m.mes} className="rounded-full border border-hoja/40 bg-hoja/10 px-3 py-1 text-xs text-hoja">
                      {m.nombre} · {m.puntaje}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
              <Brujula
                sensores={sensores}
                zona={nombreZona(activa.zona)}
                mes={mes}
                anio={anio}
                activo={sensorActivo}
                onSelect={setSensorActivo}
              />
              <div>
                {sensor ? (
                  <SensorPanel sensor={sensor} onClose={() => setSensorActivo(null)} />
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-white/55">
                    Toca un sensor de la brújula para ver su tendencia, su comparación con el histórico y su umbral.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {listo && seccion === 'rueda' && (
          <section>
            <Titulo
              ojo="Calendario circular"
              titulo="Rueda de siembra"
              texto={`Cada sector evalúa ${nombreCultivo(activa.cultivo)} en ese mes con la climatología de ${nombreZona(activa.zona)} y tus prioridades.`}
            />
            <Rueda meses={rueda} mesActual={mes} />
          </section>
        )}

        {listo && seccion === 'rotaciones' && (
          <section>
            <Titulo
              ojo="Tres caminos"
              titulo="Rotaciones comparadas"
              texto="La actual como línea base, una con leguminaria y una resiliente al clima. Cada opción explica su evidencia, beneficios, brechas y riesgos."
            />
            <Estrategias estrategias={estrategias} />
          </section>
        )}

        {listo && seccion === 'escenarios' && (
          <section>
            <Titulo
              ojo="Laboratorio"
              titulo="¿Qué pasa si cambia el clima?"
              texto="Mueve los controles y observa cómo responden las señales, la rueda y las rotaciones. Es una exploración de sensibilidad sobre el histórico."
            />
            <Escenarios escenario={escenario} onChange={setEscenario} />
          </section>
        )}

        {seccion === 'mapa' && (
          <section>
            <Titulo
              ojo="Cobertura nacional"
              titulo="Explora Venezuela por estados"
              texto="Los 23 estados y el Distrito Capital, con la capital de cada uno como punto de consulta. Toca un punto o busca un estado en la lista: se guarda en Mi parcela. Completa los demás campos para analizar."
            />
            <Explorador zonas={zonas} zonaActiva={activa.zona} onSelect={(id) => guardar({ ...activa, zona: id })} />
          </section>
        )}

        {listo && seccion === 'asistente' && (
          <section>
            <Titulo
              ojo="La brújula responde"
              titulo="Pregunta con datos"
              texto="Con reglas claras: cada respuesta muestra las señales en las que se apoya."
            />
            <Asistente parcela={activa} escenario={escenario} consulta={consulta} onVerSensor={verSensor} />
          </section>
        )}

        {listo && seccion === 'ficha' && (
          <section className="max-w-3xl">
            <Titulo
              ojo="Para llevar"
              titulo="Ficha para el campo"
              texto="Un resumen que puedes copiar o descargar para leerlo sin internet."
            />
            <Ficha parcela={activa} sensores={sensores} estrategias={estrategias} escenario={escenario} consulta={consulta} />
          </section>
        )}

        {seccion === 'guia' && (
          <section className="max-w-5xl">
            <Titulo
              ojo="Aprender a leer"
              titulo="Guía de datos"
              texto="Qué significa cada señal, cada sigla y cada comparación. Lenguaje sencillo, sin fórmulas escondidas."
            />
            <Guia />
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
