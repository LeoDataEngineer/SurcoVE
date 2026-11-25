export type IndicadorId =
  | 'calor'
  | 'lluvia'
  | 'humedad'
  | 'sequia'
  | 'vigor'
  | 'balance'
  | 'erosion'
  | 'heladas'

export type PrioridadId = 'agua' | 'suelo' | 'erosion' | 'forraje' | 'mercado'

export interface Meta {
  proyecto: string
  generado: string
  periodo: string
  patron: string
  grano_hecho_clima: string
  filas_clima: number
  nota: string
}

export interface Indicador {
  id: IndicadorId
  nombre: string
  unidad: string
  fuente: string
  resolucion: string
  umbral: string
  descripcion: string
  proxy: boolean
  confianza: number
}

export interface Zona {
  id: string
  nombre: string
  capital: string
  estados: string[]
  lat: number
  lon: number
  altura_m: number
  pendiente_pct: number
  cultivos: string[]
  descripcion: string
}

export interface Cultivo {
  id: string
  nombre: string
  familia: string
  ciclo: number
  temp_opt: number
  temp_max: number
  agua: number
  sequia: number
  fijador_n: boolean
  cobertura: number
  forraje: boolean
  mercado: number
}

export interface HechoClima {
  zona: string
  tiempo: string
  indicador: IndicadorId
  valor: number
  anomalia: number
  percentil: number
  confianza: number
}

export interface Recomendacion {
  zona: string
  fecha: string
  tipo: string
  severidad: string
  texto: string
  evidencia: IndicadorId[]
  confianza: number
}

export interface Rotacion {
  zona: string
  escenario: string
  estrategia: string
  cultivos: string[]
  puntaje: number
  agua: number
  cobertura: number
  nitrogeno: boolean
  evidencia: IndicadorId[]
}

export interface Gold {
  meta: Meta
  dimensiones: {
    tiempo: Array<{ id: string; anio: number; mes: number; trimestre: number; estacion: string }>
    espacio: Zona[]
    indicador: Indicador[]
    cultivo: Cultivo[]
    prioridad: Array<{ id: PrioridadId; nombre: string; descripcion: string }>
    estrategia: Array<{ id: string; nombre: string; descripcion: string }>
    escenario: Array<{ id: string; nombre: string; temp: number; lluvia: number }>
    fuente: Array<{ id: string; nombre: string; detalle: string; url: string; tipo: string; live: boolean }>
  }
  hechos: {
    clima_mensual: HechoClima[]
    recomendacion: Recomendacion[]
    rotacion: Rotacion[]
    clima_resumen: Record<string, Record<string, number>>
  }
  vista: Record<string, Record<string, Record<string, number>>>
}

export interface Parcela {
  zona: string
  cultivo: string
  prioridades: PrioridadId[]
}

export interface Consulta {
  mes: number
  anio: number
}

export interface Escenario {
  temp: number
  lluvia: number
}

export interface SensorValor {
  id: IndicadorId
  nombre: string
  unidad: string
  valor: number
  anomalia: number
  percentil: number
  confianza: number
  estado: 'bien' | 'atencion' | 'riesgo'
  color: string
  fuente: string
  proxy: boolean
  descripcion: string
  umbral: string
  historico: number[]
  esPromedio: boolean
}

export interface Estrategia {
  id: string
  nombre: string
  cultivos: string[]
  puntaje: number
  porPrioridad: Record<string, number>
  porQue: string
  evidencia: IndicadorId[]
  beneficios: string[]
  brechas: string[]
  riesgos: string[]
  agua: number
  cobertura: number
  nitrogeno: boolean
}

export interface MesRueda {
  mes: number
  nombre: string
  siembra: number
  cosecha: number
  riesgo: number
  idoneidad: number
}
