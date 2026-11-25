import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import type { Consulta, Escenario, IndicadorId, Parcela } from '../types'
import { PREGUNTAS_SUGERIDAS, responder, type Respuesta } from '../lib/assistant'
import { nombreCultivo, nombreIndicador, nombreZona } from '../lib/gold'

interface Props {
  parcela: Parcela
  escenario: Escenario
  consulta: Consulta
  onVerSensor: (id: IndicadorId) => void
}

interface Mensaje extends Respuesta {
  id: number
  pregunta: string
}

export function Asistente({ parcela, escenario, consulta, onVerSensor }: Props) {
  const [texto, setTexto] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([])

  const enviar = (pregunta: string) => {
    if (!pregunta.trim()) return
    const respuesta = responder(pregunta, parcela, escenario, consulta)
    setMensajes((prev) => [...prev, { id: Date.now(), pregunta, ...respuesta }])
    setTexto('')
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    enviar(texto)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="flex min-h-[360px] flex-col rounded-3xl border border-white/10 bg-noche/40">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 p-3 text-sm">
            Hola. Estoy leyendo los datos de <b>{nombreZona(parcela.zona)}</b> para {nombreCultivo(parcela.cultivo)}.
            Pregúntame por riego, siembra, rotaciones o riesgos.
          </div>
          {mensajes.map((mensaje) => (
            <div key={mensaje.id} className="space-y-2">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-hoja/20 p-3 text-sm">{mensaje.pregunta}</div>
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.05] p-3">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-hoja">
                    {mensaje.etiqueta}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/80">{mensaje.texto}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mensaje.evidencia.map((id) => (
                    <button
                      key={id}
                      onClick={() => onVerSensor(id)}
                      className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/60 hover:border-hoja hover:text-hoja"
                    >
                      {nombreIndicador(id)} ↗
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/10 p-3">
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej. ¿Debo regar este mes?"
            className="min-h-[44px] flex-1 rounded-xl border border-white/15 bg-white/[0.04] px-3 text-sm"
            aria-label="Escribe tu pregunta"
          />
          <button type="submit" className="grid h-11 w-11 place-items-center rounded-xl bg-hoja text-noche" aria-label="Enviar pregunta">
            <Send size={18} />
          </button>
        </form>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Preguntas frecuentes</p>
        <div className="grid gap-2">
          {PREGUNTAS_SUGERIDAS.map((pregunta) => (
            <button
              key={pregunta}
              onClick={() => enviar(pregunta)}
              className="min-h-[44px] rounded-xl border border-white/10 bg-white/[0.03] px-3 text-left text-sm text-white/70 hover:border-hoja/50"
            >
              {pregunta}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-sol/20 bg-sol/5 p-3 text-xs leading-relaxed text-white/55">
          Responde con reglas sencillas a partir de las señales de tu parcela. No inventa respuestas,
          no da dosis de químicos y no sustituye la observación de campo ni al agrónomo.
        </div>
      </div>
    </div>
  )
}
