import type { ReactNode } from 'react'
import { anioReciente, gold, indicadores } from '../lib/gold'

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <h3 className="font-display text-lg font-bold">{titulo}</h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/65">{children}</div>
    </section>
  )
}

export function Guia() {
  return (
    <div className="space-y-5">
      <Tarjeta titulo="Primero: ¿qué número estoy viendo?">
        <p>
          El número grande de cada sensor es <strong className="text-white">un mes y un año concretos</strong>,
          no un promedio. Por ejemplo, 47,7 mm en noviembre de {anioReciente()}{' '}
          significa la lluvia total de ese noviembre en el estado que tengas elegido.
        </p>
        <p>
          El promedio de esos mismos meses está en la línea de la serie histórica, no en el número grande.
          Fíjate también en la anomalía y en el percentil: ahí está la comparación con lo que suele pasar.
        </p>
        <p>
          Si mueves los controles de escenario, el valor se recalcula como un <em>"¿qué pasaría si?"</em>. Es una
          exploración de sensibilidad, no un pronóstico del clima.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Qué significa cada una de las ocho señales">
        <dl className="space-y-3">
          {indicadores.map((ind) => (
            <div key={ind.id} className="rounded-2xl border border-white/10 bg-noche/40 p-3">
              <dt className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold text-white">{ind.nombre}</span>
                <span className="text-xs text-white/45">{ind.unidad}</span>
              </dt>
              <dd className="mt-1 space-y-1">
                <p>{ind.descripcion}</p>
                <p className="text-white/50">Umbral de referencia: {ind.umbral}</p>
              </dd>
            </div>
          ))}
        </dl>
      </Tarjeta>

      <Tarjeta titulo="Cómo leer el panel de una señal">
        <ul className="space-y-2">
          <li><strong className="text-white">Valor:</strong> dato del mes y año seleccionados, redondeado a un decimal.</li>
          <li>
            <strong className="text-white">Serie histórica · mismo mes:</strong> cada punto es el valor de ese mes
            en un año distinto. El eje horizontal son los años (por ejemplo, 2001 a 2025); el vertical es el valor
            de la señal. No son los meses del año.
          </li>
          <li>
            <strong className="text-white">Anomalía (σ):</strong> cuánto se aparta del promedio de ese mes. −1,0 quiere decir
            una desviación por debajo; +1,0, por encima. La "σ" es la unidad de esa distancia.
          </li>
          <li><strong className="text-white">Percentil:</strong> 8 significa que 8 de cada 100 años tuvieron un valor igual o menor.</li>
          <li><strong className="text-white">En rango / Atención / Riesgo:</strong> comparación con un umbral orientativo, no una alerta oficial.</li>
          <li><strong className="text-white">Umbral de referencia:</strong> la pauta que usa la app para colorear cada estado.</li>
        </ul>
      </Tarjeta>

      <Tarjeta titulo="Mi parcela">
        <p>
          Al abrir la app, «Mi parcela» está vacía. Elige el estado (entre los 23 estados y el Distrito Capital),
          el cultivo, el mes, el año y al menos una prioridad para poder analizar. Cada estado tiene su propia
          lista de cultivos. Esa elección se usa en todas las secciones mientras la pestaña esté abierta;
          al abrir la app de nuevo, empieza sin selección.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Consultar otro mes">
        <p>
          En ese mismo selector puedes elegir el mes y el año que quieres consultar. Si eliges un año sin datos
          observados, como 2026, el número grande es el promedio de ese mes en los años disponibles, con tu
          escenario aplicado.
        </p>
        <p>
          En ese caso verás la etiqueta <strong className="text-white">Promedio histórico</strong> y una nota:
          es una <strong className="text-white">tendencia con datos históricos, no un pronóstico</strong>.
          La anomalía y el percentil aparecen solo cuando eliges un año con dato observado.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Escenarios y rotaciones">
        <p>
          Un escenario cambia la temperatura y la lluvia sobre el histórico para comparar opciones. Una rotación
          propone una secuencia de cultivos y le da un puntaje de 0 a 100 según el clima y tus prioridades.
          El puntaje sirve para ordenar alternativas entre sí, no para predecir cosechas.
        </p>
        <dl className="space-y-2">
          {gold.dimensiones.estrategia.map((e) => (
            <div key={e.id} className="rounded-xl bg-noche/40 p-3">
              <dt className="text-sm font-semibold text-white">{e.nombre}</dt>
              <dd className="text-xs text-white/55">{e.descripcion}</dd>
            </div>
          ))}
        </dl>
        <p>
          La herramienta orienta la decisión: no da dosis de químicos, no sustituye la observación de campo
          ni el criterio de un agrónomo local.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Ficha para el campo">
        <p>
          La ficha reúne tu parcela, las señales y las rotaciones en un texto que puedes copiar o descargar.
          Incluye una sugerencia sobre el riego, la vigilancia y la rotación, calculada con el mes y el año
          que elegiste. Es una orientación: decide con tu observación de campo y un agrónomo local.
        </p>
      </Tarjeta>
    </div>
  )
}
