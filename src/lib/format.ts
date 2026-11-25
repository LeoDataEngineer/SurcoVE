export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

export const redondear = (n: number, decimales = 0) => {
  const factor = 10 ** decimales
  return Math.round(n * factor) / factor
}

export function nombreMes(mes: number): string {
  return MESES[mes - 1] ?? String(mes)
}

export function firmarNumero(n: number): string {
  return `${n > 0 ? '+' : ''}${redondear(n, 1)}`
}
