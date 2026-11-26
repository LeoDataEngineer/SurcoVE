import type { Consulta, Parcela } from '../types'

const CLAVE = 'surocve:parcela:v1'
const CAMPO = 'surocve:modo-campo:v1'
const CLAVE_CONSULTA = 'surocve:consulta:v1'

/** La parcela vive solo mientras dure la pestaña: al abrir de nuevo empieza vacía. */
export function cargarParcela(): Parcela | null {
  try {
    const raw = sessionStorage.getItem(CLAVE)
    return raw ? (JSON.parse(raw) as Parcela) : null
  } catch {
    return null
  }
}

export function guardarParcela(parcela: Parcela): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(parcela))
  } catch {
    // Almacenamiento no disponible: la app sigue funcionando en memoria.
  }
}

/** Elimina selecciones de versiones anteriores que usaban localStorage. */
export function limpiarSeleccionObsoleta(): void {
  try {
    localStorage.removeItem(CLAVE)
    localStorage.removeItem(CLAVE_CONSULTA)
  } catch {
    // Sin acceso a localStorage.
  }
}

export function cargarModoCampo(): boolean {
  try {
    return localStorage.getItem(CAMPO) === '1'
  } catch {
    return false
  }
}

export function guardarModoCampo(activo: boolean): void {
  try {
    localStorage.setItem(CAMPO, activo ? '1' : '0')
  } catch {
    // Sin persistencia.
  }
}

export function cargarConsulta(): Consulta | null {
  try {
    const raw = sessionStorage.getItem(CLAVE_CONSULTA)
    return raw ? (JSON.parse(raw) as Consulta) : null
  } catch {
    return null
  }
}

export function guardarConsulta(consulta: Consulta): void {
  try {
    sessionStorage.setItem(CLAVE_CONSULTA, JSON.stringify(consulta))
  } catch {
    // Sin persistencia.
  }
}
