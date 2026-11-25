import type { Estrategia, IndicadorId, SensorValor } from '../types'
import { redondear } from './format'

/** Sugerencia práctica con los mismos datos que ya ve el agricultor en la ficha. */
export function sugerenciaCampo(sensores: SensorValor[], estrategias: Estrategia[]): string[] {
  const senal = (id: IndicadorId) => sensores.find((s) => s.id === id)
  const lluvia = senal('lluvia')?.valor ?? 0
  const balance = senal('balance')?.valor ?? 0
  const riesgos = sensores.filter((s) => s.estado === 'riesgo')
  const mejor = [...estrategias].sort((a, b) => b.puntaje - a.puntaje)[0]

  const riego = lluvia >= 120 && balance >= -20
    ? `Con ${redondear(lluvia)} mm de lluvia y un balance de ${redondear(balance)} mm, no hace falta regar de forma preventiva. Observa el suelo antes de decidir.`
    : `Con ${redondear(lluvia)} mm de lluvia y un balance de ${redondear(balance)} mm, conviene programar el riego al inicio y vigilar la semana siguiente.`

  const vigilancia = riesgos.length
    ? `Vigila ${riesgos.map((s) => s.nombre.toLowerCase()).join(', ')}: están en estado de riesgo con el escenario elegido.`
    : 'Ninguna señal está en riesgo con el escenario elegido. Mantén la vigilancia de lluvia y vigor.'

  const rotacion = mejor
    ? `La rotación mejor valorada es «${mejor.nombre}» (${mejor.puntaje}/100). ${mejor.porQue} Compárala con la rueda y con tu experiencia.`
    : 'Compara las rotaciones con la rueda de siembra y con tu experiencia.'

  return [riego, vigilancia, rotacion]
}
