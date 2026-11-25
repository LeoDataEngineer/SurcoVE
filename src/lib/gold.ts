import type {
  Cultivo,
  Gold,
  HechoClima,
  Indicador,
  IndicadorId,
  Zona,
} from '../types'

type Prioridad = Gold['dimensiones']['prioridad'][number]

/** Datos de la capa Oro. Se cargan una vez desde /gold.json, fuera del bundle JS. */
export let gold!: Gold
export let zonas!: Zona[]
export let indicadores!: Indicador[]
export let cultivos!: Cultivo[]
export let prioridades!: Prioridad[]

let indice: Map<string, HechoClima> = new Map()

export async function cargarGold(): Promise<void> {
  const url = `${import.meta.env.BASE_URL}gold.json`
  const respuesta = await fetch(url)
  if (!respuesta.ok) throw new Error(`No se pudo cargar ${url}: ${respuesta.status}`)
  const datos = (await respuesta.json()) as Gold

  gold = datos
  zonas = datos.dimensiones.espacio
  indicadores = datos.dimensiones.indicador
  cultivos = datos.dimensiones.cultivo
  prioridades = datos.dimensiones.prioridad

  indice = new Map()
  for (const hecho of datos.hechos.clima_mensual) {
    indice.set(`${hecho.zona}|${hecho.tiempo}|${hecho.indicador}`, hecho)
  }
}

export const CAMPO: Record<IndicadorId, string> = {
  calor: 'calor',
  lluvia: 'lluvia',
  humedad: 'humedad',
  sequia: 'et0',
  vigor: 'vigor',
  balance: 'balance',
  erosion: 'erosion',
  heladas: 'heladas',
}

export function hecho(zona: string, tiempo: string, indicador: IndicadorId): HechoClima | undefined {
  return indice.get(`${zona}|${tiempo}|${indicador}`)
}

export function aniosDisponibles(): number[] {
  return [...new Set(gold.dimensiones.tiempo.map((t) => Number(t.id.slice(0, 4))))].sort((a, b) => a - b)
}

export function anioReciente(): number {
  const tiempos = gold.dimensiones.tiempo.map((t) => t.id)
  return Number(tiempos[tiempos.length - 1].slice(0, 4))
}

export function claveMes(mes: number, anio = anioReciente()): string {
  return `${anio}-${String(mes).padStart(2, '0')}`
}

export function nombreCultivo(id: string): string {
  return cultivos.find((c) => c.id === id)?.nombre ?? id
}

export function nombreZona(id: string): string {
  return zonas.find((z) => z.id === id)?.nombre ?? id
}

export function nombreIndicador(id: string): string {
  return indicadores.find((i) => i.id === id)?.nombre ?? id
}

export function nombrePrioridad(id: string): string {
  return prioridades.find((p) => p.id === id)?.nombre ?? id
}
