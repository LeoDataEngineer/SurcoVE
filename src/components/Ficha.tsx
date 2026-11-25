import { useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import type { Consulta, Escenario, Estrategia, Parcela, SensorValor } from '../types'
import { MESES } from '../lib/format'
import { anioReciente, nombreCultivo, nombreZona } from '../lib/gold'
import { sugerenciaCampo } from '../lib/recomendacion'

interface Props {
  parcela: Parcela
  sensores: SensorValor[]
  estrategias: Estrategia[]
  escenario: Escenario
  consulta: Consulta
}

export function Ficha({ parcela, sensores, estrategias, escenario, consulta }: Props) {
  const [copiado, setCopiado] = useState(false)
  const esFuturo = consulta.anio > anioReciente()
  const mesNombre = MESES[consulta.mes - 1]
  const sugerencia = sugerenciaCampo(sensores, estrategias)

  const texto = [
    'SurcoVE · Ficha de campo',
    `Estado: ${nombreZona(parcela.zona)}`,
    `Cultivo actual: ${nombreCultivo(parcela.cultivo)}`,
    `Mes consultado: ${mesNombre} de ${consulta.anio}`,
    `Prioridades: ${parcela.prioridades.join(', ') || 'general'}`,
    `Escenario: +${escenario.temp} °C, lluvia ${escenario.lluvia} %`,
    ...(esFuturo
      ? ['Valores: promedio histórico de ese mes. Tendencia con datos históricos, no un pronóstico.']
      : []),
    '',
    'Señales:',
    ...sensores.map((s) => `- ${s.nombre}: ${s.valor} ${s.unidad} (${s.estado})`),
    '',
    'Rotaciones:',
    ...estrategias.map((e) => `- ${e.nombre}: ${e.puntaje}/100 · ${e.cultivos.map(nombreCultivo).join(' → ')}`),
    '',
    'Sugerencia para tu parcela:',
    ...sugerencia.map((linea) => `- ${linea}`),
    '',
    'Datos climáticos: NASA POWER 2001-2025.',
    'Herramienta de apoyo: no sustituye al agrónomo ni da dosis de químicos.',
  ].join('\n')

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  const descargar = () => {
    const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }))
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `surocve-${parcela.zona}.txt`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="font-display text-lg font-bold">Ficha para el campo</h3>
      <p className="mt-1 text-sm text-white/60">
        Resume tu parcela, te sugiere qué hacer con las señales y muestra las rotaciones. Cópiala al celular o descárgala para leerla sin internet.
      </p>
      <pre className="mt-4 max-h-96 overflow-auto rounded-2xl bg-noche/60 p-3 text-[11px] leading-relaxed text-white/60 whitespace-pre-wrap">
        {texto}
      </pre>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={copiar} className="flex min-h-[44px] items-center gap-2 rounded-xl border border-white/15 px-4 text-sm">
          {copiado ? <Check size={16} className="text-hoja" /> : <Copy size={16} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        <button onClick={descargar} className="flex min-h-[44px] items-center gap-2 rounded-xl bg-hoja px-4 text-sm font-bold text-noche">
          <Download size={16} /> Descargar .txt
        </button>
      </div>
    </div>
  )
}
