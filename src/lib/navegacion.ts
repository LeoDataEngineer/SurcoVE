export type Seccion =
  | 'brujula'
  | 'rueda'
  | 'rotaciones'
  | 'escenarios'
  | 'mapa'
  | 'asistente'
  | 'ficha'
  | 'guia'

export interface Pagina {
  id: Seccion
  ruta: string
  etiqueta: string
}

/** Cada sección es una página HTML independiente en la misma pestaña. */
export const PAGINAS: Pagina[] = [
  { id: 'brujula', ruta: '/index.html', etiqueta: 'Brújula' },
  { id: 'rueda', ruta: '/rueda.html', etiqueta: 'Rueda' },
  { id: 'rotaciones', ruta: '/rotaciones.html', etiqueta: 'Rotaciones' },
  { id: 'escenarios', ruta: '/escenarios.html', etiqueta: 'Escenarios' },
  { id: 'mapa', ruta: '/mapa.html', etiqueta: 'Mapa' },
  { id: 'asistente', ruta: '/asistente.html', etiqueta: 'Asistente' },
  { id: 'ficha', ruta: '/ficha.html', etiqueta: 'Ficha' },
  { id: 'guia', ruta: '/guia.html', etiqueta: 'Guía' },
]

const POR_ARCHIVO: Record<string, Seccion> = {
  'index.html': 'brujula',
  'rueda.html': 'rueda',
  'rotaciones.html': 'rotaciones',
  'escenarios.html': 'escenarios',
  'mapa.html': 'mapa',
  'asistente.html': 'asistente',
  'ficha.html': 'ficha',
  'guia.html': 'guia',
}

export function seccionDesdeRuta(ruta: string): Seccion {
  const archivo = ruta.split('/').pop() || 'index.html'
  return POR_ARCHIVO[archivo] ?? 'brujula'
}

export function rutaDe(id: Seccion): string {
  return PAGINAS.find((pagina) => pagina.id === id)?.ruta ?? '/index.html'
}
