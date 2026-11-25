import type { Consulta, Escenario, IndicadorId, Parcela } from '../types'
import { redondear, nombreMes } from './format'
import { anioReciente, gold, indicadores, nombreCultivo, nombreZona } from './gold'
import { climaMes, estrategias, mejoresMeses, sensores } from './scoring'

export interface Respuesta {
  texto: string
  etiqueta: string
  evidencia: IndicadorId[]
  confianza: number
  sugerencias: string[]
}

const quitarAcentos = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const PREGUNTAS_SUGERIDAS = [
  '¿Debo regar este mes?',
  '¿Cuándo siembro maíz?',
  '¿Qué rotación me conviene?',
  '¿Qué riesgos tiene mi estado?',
  '¿Qué significa balance hídrico?',
]

export function responder(
  pregunta: string,
  parcela: Parcela,
  escenario: Escenario,
  consulta: Consulta = { mes: new Date().getMonth() + 1, anio: anioReciente() },
): Respuesta {
  const q = quitarAcentos(pregunta)
  const { mes, anio } = consulta
  const clima = climaMes(parcela.zona, mes, escenario, anio)
  const cultivo = nombreCultivo(parcela.cultivo)
  const zona = nombreZona(parcela.zona)
  const sugerencias = PREGUNTAS_SUGERIDAS.slice(0, 3)

  if (/reg|irrig|humedad|sequia/.test(q)) {
    const suficiente = clima.lluvia >= 120 && clima.balance >= -20
    const texto = suficiente
      ? `No regar de forma preventiva en ${zona} en ${nombreMes(mes)} de ${anio}: la lluvia estimada es ${redondear(clima.lluvia)} mm y el balance hídrico ${redondear(clima.balance)} mm. Si tu suelo drena rápido, decide con tu observación de campo.`
      : `Programa el riego en ${zona} en ${nombreMes(mes)} de ${anio}: la lluvia estimada es ${redondear(clima.lluvia)} mm y el balance ${redondear(clima.balance)} mm. Conviene regar al inicio y vigilar la semana siguiente.`
    return { texto, etiqueta: 'Riego', evidencia: ['lluvia', 'balance', 'humedad'], confianza: 0.7, sugerencias }
  }

  if (/sembr|plantar|cuando|epoca|calendario/.test(q)) {
    const mejor = mejoresMeses(parcela.cultivo, parcela.zona, parcela.prioridades, escenario, anio)[0]
    return {
      texto: `Para ${cultivo} en ${zona}, el mes con mejor ajuste es ${nombreMes(mejor.mes)} (puntaje ${mejor.puntaje}/100), considerando temperatura, lluvia y tus prioridades. Confirma la fecha con la rueda de siembra.`,
      etiqueta: 'Siembra',
      evidencia: ['calor', 'lluvia', 'vigor'],
      confianza: 0.62,
      sugerencias,
    }
  }

  if (/rotac|alternativ|que sembrar|legumbre|suelo/.test(q)) {
    const opciones = estrategias(parcela.zona, parcela.cultivo, parcela.prioridades, escenario, anio)
      .sort((a, b) => b.puntaje - a.puntaje)
    const mejor = opciones[0]
    return {
      texto: `La opción mejor valorada para ${zona} es «${mejor.nombre}» con ${mejor.puntaje}/100. ${mejor.porQue} Sigue siendo una orientación: compárala con la rueda y con tu experiencia.`,
      etiqueta: 'Rotación',
      evidencia: mejor.evidencia,
      confianza: 0.66,
      sugerencias,
    }
  }

  if (/riesgo|helad|calor|erosion|inund|sequia/.test(q)) {
    const lista = sensores(parcela.zona, mes, escenario, anio)
      .filter((s) => s.estado === 'riesgo')
    if (!lista.length) {
      return {
        texto: `En ${zona} no hay señales en estado de riesgo para ${nombreMes(mes)} de ${anio} con el escenario actual. Mantén la vigilancia de lluvia y vigor.`,
        etiqueta: 'Riesgos',
        evidencia: ['lluvia', 'vigor'],
        confianza: 0.6,
        sugerencias,
      }
    }
    const nombres = lista.map((s) => s.nombre.toLowerCase()).join(', ')
    return {
      texto: `Las señales en riesgo en ${zona} son: ${nombres}. Revisa sus umbrales en la brújula y decide con un agrónomo local si cambias la fecha de siembra.`,
      etiqueta: 'Riesgos',
      evidencia: lista.map((s) => s.id),
      confianza: 0.64,
      sugerencias,
    }
  }

  const mencionado = indicadores.find((ind) =>
    quitarAcentos(`${ind.nombre} ${ind.id}`).split(' ').some((palabra) => palabra.length > 3 && q.includes(palabra)))
  if (mencionado || /que es|explica|significa/.test(q)) {
    const ind = mencionado ?? indicadores[5]
    return {
      texto: `${ind.nombre}: ${ind.descripcion} Unidad: ${ind.unidad}. Mírala en la brújula para ver su tendencia y su umbral.`,
      etiqueta: 'Glosario',
      evidencia: [ind.id],
      confianza: ind.confianza,
      sugerencias,
    }
  }

  return {
    texto: `Puedo ayudarte con riego, fecha de siembra, rotaciones, riesgos y significado de las señales. Estoy leyendo los datos de ${zona} para ${cultivo}.`,
    etiqueta: 'Ayuda',
    evidencia: ['lluvia', 'calor'],
    confianza: 0.5,
    sugerencias: PREGUNTAS_SUGERIDAS,
  }
}

export function recomendacionInicial(parcela: Parcela): string {
  const rec = gold.hechos.recomendacion.find((r) => r.zona === parcela.zona)
  return rec?.texto ?? 'Selecciona tu zona para ver recomendaciones.'
}
