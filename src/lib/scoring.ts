import type {
  Cultivo,
  Escenario,
  Estrategia,
  IndicadorId,
  MesRueda,
  PrioridadId,
  SensorValor,
} from '../types'
import { clamp, MESES, nombreMes, redondear } from './format'
import { CAMPO, anioReciente, claveMes, cultivos, gold, hecho, zonas } from './gold'

const media = (valores: number[]) => valores.reduce((a, b) => a + b, 0) / (valores.length || 1)

/** Serie observada del mes, o promedio histórico si el año no tiene datos. */
function baseMes(zona: string, mes: number, anio: number): Record<string, number> {
  const vista = gold.vista[zona] ?? {}
  const exacta = vista[claveMes(mes, anio)]
  if (exacta) return exacta

  const sufijo = `-${String(mes).padStart(2, '0')}`
  const historicas = Object.keys(vista).filter((t) => t.endsWith(sufijo)).map((t) => vista[t])
  const claves = Object.keys(historicas[0] ?? {})
  return Object.fromEntries(claves.map((clave) => [clave, media(historicas.map((h) => h[clave] ?? 0))]))
}

/** Aplica los deltas del escenario a la vista mensual de la capa oro. */
export function climaMes(
  zona: string,
  mes: number,
  escenario: Escenario,
  anio = anioReciente(),
): Record<string, number> {
  const base = baseMes(zona, mes, anio)
  const lluvia = (base.lluvia ?? 0) * (1 + escenario.lluvia / 100)
  const tmax = (base.tmax ?? 26) + escenario.temp
  const tmin = (base.tmin ?? 18) + escenario.temp
  const et0 = (base.et0 ?? 100) + escenario.temp * 6
  return {
    ...base,
    lluvia,
    tmax,
    tmin,
    et0,
    balance: lluvia - et0,
    calor: Math.max(0, (base.calor ?? 0) + escenario.temp * 3),
    heladas: Math.max(0, (base.heladas ?? 0) - escenario.temp * 3),
    vigor: clamp((base.vigor ?? 50) + escenario.lluvia * 0.25 - escenario.temp * 4),
    erosion: clamp((base.erosion ?? 30) * (1 + Math.max(0, -escenario.lluvia) / 100)),
  }
}

function estado(id: IndicadorId, valor: number): SensorValor['estado'] {
  switch (id) {
    case 'calor':
      return valor <= 8 ? 'bien' : valor <= 15 ? 'atencion' : 'riesgo'
    case 'lluvia':
      return valor >= 120 && valor <= 320 ? 'bien' : valor >= 70 ? 'atencion' : 'riesgo'
    case 'humedad':
      return valor >= 60 ? 'bien' : valor >= 45 ? 'atencion' : 'riesgo'
    case 'sequia':
      return valor <= 100 ? 'bien' : valor <= 150 ? 'atencion' : 'riesgo'
    case 'vigor':
      return valor >= 65 ? 'bien' : valor >= 45 ? 'atencion' : 'riesgo'
    case 'balance':
      return valor >= -20 ? 'bien' : valor >= -60 ? 'atencion' : 'riesgo'
    case 'erosion':
      return valor <= 35 ? 'bien' : valor <= 55 ? 'atencion' : 'riesgo'
    case 'heladas':
      return valor === 0 ? 'bien' : valor <= 2 ? 'atencion' : 'riesgo'
  }
}

const COLORES: Record<SensorValor['estado'], string> = {
  bien: '#5cc9a7',
  atencion: '#f3c969',
  riesgo: '#f07c6a',
}

export function sensores(
  zona: string,
  mes: number,
  escenario: Escenario,
  anio = anioReciente(),
): SensorValor[] {
  const tiempo = claveMes(mes, anio)
  const clima = climaMes(zona, mes, escenario, anio)
  const sufijo = `-${String(mes).padStart(2, '0')}`
  return gold.dimensiones.indicador.map((ind) => {
    const valor = clima[CAMPO[ind.id]] ?? 0
    const registro = hecho(zona, tiempo, ind.id)
    const historico = Object.keys(gold.vista[zona] ?? {})
      .filter((t) => t.endsWith(sufijo))
      .sort()
      .map((t) => gold.vista[zona][t][CAMPO[ind.id]] ?? 0)
    return {
      id: ind.id,
      nombre: ind.nombre,
      unidad: ind.unidad,
      valor: redondear(valor, 1),
      anomalia: registro?.anomalia ?? 0,
      percentil: registro?.percentil ?? 50,
      confianza: ind.confianza,
      estado: estado(ind.id, valor),
      color: COLORES[estado(ind.id, valor)],
      fuente: ind.fuente,
      proxy: ind.proxy,
      descripcion: ind.descripcion,
      umbral: ind.umbral,
      historico,
      esPromedio: !registro,
    }
  })
}

type Componentes = Record<PrioridadId | 'calor' | 'heladas', number>

function componentes(cultivo: Cultivo, clima: Record<string, number>): Componentes {
  const calorObjetivo = clima.tmax ?? 26
  const calor = clamp(100 - Math.max(0, calorObjetivo - cultivo.temp_opt) * 4
    - Math.max(0, calorObjetivo - cultivo.temp_max) * 8)
  const agua = clamp(100 - Math.max(0, cultivo.agua - (clima.lluvia ?? 0)) * 0.45
    + cultivo.sequia * 18 + clamp((clima.balance ?? 0) + 100) * 0.12)
  const heladas = cultivo.temp_opt <= 21
    ? clamp(100 - (clima.heladas ?? 0) * 35)
    : 100
  return {
    calor,
    agua,
    heladas,
    suelo: cultivo.fijador_n ? 95 : 45,
    erosion: clamp(28 + cultivo.cobertura * 72 - (clima.erosion ?? 0) * 0.15),
    forraje: cultivo.forraje ? 92 : 38,
    mercado: cultivo.mercado * 100,
  }
}

export function scoreCultivo(
  cultivo: Cultivo,
  clima: Record<string, number>,
  prioridades: PrioridadId[],
): number {
  const c = componentes(cultivo, clima)
  const general = media([c.calor, c.agua, c.heladas, c.suelo, c.erosion, c.forraje, c.mercado])
  if (!prioridades.length) return clamp(general)
  return clamp(0.5 * general + 0.5 * media(prioridades.map((p) => c[p])))
}

function cultivoPorId(id: string): Cultivo {
  return cultivos.find((c) => c.id === id) ?? cultivos[0]
}

/** Cultivos del propio estado que mejor toleran calor y sequía. */
function resilientesDe(zona: string, base: string): string[] {
  const propia = zonas.find((z) => z.id === zona)?.cultivos ?? []
  const candidatos = propia
    .filter((id) => id !== base)
    .map((id) => cultivos.find((c) => c.id === id))
    .filter((c): c is Cultivo => Boolean(c))
    .sort((a, b) => (b.sequia + b.cobertura) - (a.sequia + a.cobertura))
    .slice(0, 2)
    .map((c) => c.id)
  return candidatos.length ? candidatos : ['sorgo', 'frijol']
}

const evidenciaPrioridad: Record<PrioridadId, IndicadorId[]> = {
  agua: ['lluvia', 'balance', 'humedad'],
  suelo: ['vigor', 'balance'],
  erosion: ['erosion', 'lluvia'],
  forraje: ['lluvia', 'vigor'],
  mercado: ['calor', 'lluvia'],
}

export function estrategias(
  zona: string,
  cultivoActualId: string,
  prioridades: PrioridadId[],
  escenario: Escenario,
  anio = anioReciente(),
): Estrategia[] {
  const actual = cultivoPorId(cultivoActualId)
  const propia = zonas.find((z) => z.id === zona)?.cultivos ?? []
  const leguminaria = actual.fijador_n && propia.includes('mani')
    ? 'mani'
    : ['frijol', 'mani', 'soya'].find((id) => propia.includes(id)) ?? 'frijol'
  const secuencias: Array<{ id: string; nombre: string; ids: string[] }> = [
    { id: 'actual', nombre: 'Rotación actual', ids: [actual.id] },
    { id: 'legumbre', nombre: 'Con leguminaria', ids: [leguminaria, actual.id] },
    { id: 'resiliente', nombre: 'Resiliente al clima', ids: resilientesDe(zona, actual.id) },
  ]

  return secuencias.map((seq) => {
    const cultivosSeq = seq.ids.map(cultivoPorId)
    const puntajes: number[] = []
    const porMes: Record<string, number[]> = {}
    prioridades.forEach((p) => { porMes[p] = [] })
    for (let mes = 1; mes <= 12; mes += 1) {
      const clima = climaMes(zona, mes, escenario, anio)
      cultivosSeq.forEach((c) => {
        puntajes.push(scoreCultivo(c, clima, prioridades))
        const cps = componentes(c, clima)
        prioridades.forEach((p) => porMes[p].push(cps[p]))
      })
    }
    const evidencia = [
      ...new Set(prioridades.flatMap((p) => evidenciaPrioridad[p])),
    ]
    const porPrioridad = Object.fromEntries(
      prioridades.map((p) => [p, redondear(media(porMes[p]))]),
    )
    const usaFijador = cultivosSeq.some((c) => c.fijador_n)
    const agua = redondear(media(cultivosSeq.map((c) => c.agua)))
    const cobertura = redondear(media(cultivosSeq.map((c) => c.cobertura)), 2)

    const textos: Record<string, { porQue: string; beneficios: string[]; brechas: string[]; riesgos: string[] }> = {
      actual: {
        porQue: 'Es la línea base contra la que se comparan las otras opciones.',
        beneficios: ['Mercado y laboreo conocidos', 'Semilla disponible'],
        brechas: ['Rendimiento real de tu parcela', 'Fertilización actual'],
        riesgos: ['Repetir la misma familia puede agotar nutrientes y romper menos ciclos de plagas.'],
      },
      legumbre: {
        porQue: `${cultivoPorId(leguminaria).nombre} devuelve nitrógeno al suelo y rompe el ciclo del ${actual.nombre.toLowerCase()}.`,
        beneficios: ['Menos fertilizante nitrogenado', 'Más cobertura del suelo', 'Ciclo de plagas interrumpido'],
        brechas: ['Precio local de la leguminaria', 'Disponibilidad de semilla'],
        riesgos: ['La leguminaria puede sufrir si el mes de siembra es caluroso; ajusta la fecha con la rueda.'],
      },
      resiliente: {
        porQue: 'Prioriza cultivos con tolerancia al calor y la sequía según la climatología del estado.',
        beneficios: ['Menor demanda de riego', 'Suelo cubierto más tiempo', 'Opción forrajera'],
        brechas: ['Acceso a mercado para el cultivo alternativo', 'Maquinaria disponible'],
        riesgos: ['Revisa el calendario de heladas en la rueda antes de fijar la fecha.'],
      },
    }

    return {
      id: seq.id,
      nombre: seq.nombre,
      cultivos: seq.ids,
      puntaje: redondear(media(puntajes)),
      porPrioridad,
      porQue: textos[seq.id].porQue,
      evidencia: evidencia.length ? evidencia : ['lluvia', 'calor'],
      beneficios: textos[seq.id].beneficios,
      brechas: textos[seq.id].brechas,
      riesgos: textos[seq.id].riesgos,
      agua,
      cobertura,
      nitrogeno: usaFijador,
    }
  })
}

export function mejoresMeses(
  cultivoId: string,
  zona: string,
  prioridades: PrioridadId[],
  escenario: Escenario,
  anio = anioReciente(),
): Array<{ mes: number; nombre: string; puntaje: number }> {
  const cultivo = cultivoPorId(cultivoId)
  return MESES.map((nombre, i) => {
    const mes = i + 1
    return {
      mes,
      nombre,
      puntaje: redondear(scoreCultivo(cultivo, climaMes(zona, mes, escenario, anio), prioridades)),
    }
  }).sort((a, b) => b.puntaje - a.puntaje)
}

export function ruedaSiembra(
  cultivoId: string,
  zona: string,
  prioridades: PrioridadId[],
  escenario: Escenario,
  anio = anioReciente(),
): MesRueda[] {
  const cultivo = cultivoPorId(cultivoId)
  return MESES.map((_, i) => {
    const mes = i + 1
    const clima = climaMes(zona, mes, escenario, anio)
    const idoneidad = scoreCultivo(cultivo, clima, prioridades)
    const siembra = clamp(idoneidad * 0.85 + (clima.lluvia >= 80 ? 15 : -10)
      - (clima.heladas > 0 ? 30 : 0))
    const cosecha = clamp(media(
      Array.from({ length: cultivo.ciclo }, (_, k) =>
        scoreCultivo(cultivo, climaMes(zona, ((mes + k - 1) % 12) + 1, escenario, anio), prioridades)),
    ))
    const riesgo = clamp((clima.calor > 12 ? 28 : 0) + (clima.heladas > 0 ? 34 : 0)
      + ((clima.balance ?? 0) < -60 ? 24 : 0) + (clima.erosion ?? 0) * 0.18)
    return { mes, nombre: nombreMes(mes), siembra, cosecha, riesgo, idoneidad }
  })
}
