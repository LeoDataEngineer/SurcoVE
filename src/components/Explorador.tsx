import { useState } from 'react'
import type { Zona } from '../types'
import { gold } from '../lib/gold'

interface Props {
  zonas: Zona[]
  zonaActiva: string
  onSelect: (id: string) => void
}

// Contorno de Venezuela derivado de Natural Earth 1:50m (dominio público),
// proyectado al mismo viewBox que los puntos de las capitales.
const SILUETA = 'M 336.3 128.0 L 333.4 128.9 L 333.5 128.2 L 334.2 127.0 L 335.7 126.7 L 336.3 126.3 L 337.2 126.0 L 337.8 126.0 L 338.3 126.4 L 337.0 127.0 L 336.3 128.0 Z M 263.6 77.4 L 264.4 80.8 L 264.1 81.4 L 262.0 83.6 L 260.2 83.8 L 258.7 83.7 L 257.6 83.3 L 256.1 81.8 L 254.7 82.3 L 251.3 81.7 L 250.3 81.2 L 251.6 79.5 L 254.0 78.7 L 254.9 78.6 L 255.6 79.7 L 257.3 80.6 L 259.3 80.7 L 259.8 79.0 L 262.6 76.5 L 263.6 77.4 Z M 230.9 83.1 L 229.6 83.7 L 227.2 83.1 L 226.0 82.3 L 226.8 81.4 L 228.7 81.4 L 230.6 82.5 L 230.9 83.1 Z M 332.1 134.9 L 330.6 135.4 L 330.3 132.9 L 330.8 132.2 L 333.3 130.1 L 334.0 129.8 L 334.5 130.2 L 334.4 130.7 L 335.6 131.6 L 335.3 132.8 L 334.0 134.1 L 332.1 134.9 Z M 355.6 143.0 L 360.0 149.2 L 360.1 149.8 L 359.6 150.6 L 356.8 152.1 L 356.2 152.8 L 355.2 155.6 L 351.7 157.1 L 349.3 159.0 L 347.7 160.6 L 346.9 161.3 L 343.7 161.7 L 342.6 162.7 L 341.4 165.8 L 340.4 167.2 L 338.8 168.7 L 338.7 169.6 L 341.0 173.1 L 341.4 174.2 L 340.7 175.8 L 340.8 176.9 L 342.0 178.3 L 343.4 178.7 L 344.8 178.1 L 346.6 178.1 L 347.7 178.5 L 348.2 178.9 L 348.3 180.0 L 347.5 182.2 L 346.5 183.7 L 341.9 185.9 L 339.9 187.2 L 338.8 188.2 L 336.3 187.7 L 335.0 187.7 L 334.1 188.5 L 333.5 189.1 L 331.8 189.2 L 329.5 189.6 L 328.5 190.1 L 327.7 191.2 L 327.1 192.8 L 327.6 194.7 L 328.4 196.4 L 328.3 197.9 L 328.9 202.3 L 328.2 203.3 L 326.6 204.4 L 324.7 206.4 L 322.6 209.2 L 323.0 210.1 L 328.0 216.0 L 333.1 222.0 L 338.2 227.9 L 338.9 228.2 L 339.9 228.9 L 340.8 231.0 L 341.5 233.2 L 341.5 234.4 L 340.9 235.8 L 339.7 237.5 L 338.2 238.8 L 336.0 240.0 L 334.2 241.0 L 332.8 243.9 L 331.9 244.9 L 331.1 245.3 L 329.5 245.7 L 327.0 245.6 L 325.3 245.3 L 323.2 247.5 L 320.5 248.3 L 318.7 251.2 L 312.3 253.5 L 306.0 255.3 L 304.3 256.0 L 298.1 254.5 L 296.7 254.9 L 294.9 256.3 L 293.4 257.4 L 292.0 257.5 L 290.9 258.0 L 290.2 260.0 L 289.6 266.8 L 287.4 268.8 L 284.8 268.8 L 282.9 266.4 L 280.7 264.6 L 276.9 260.4 L 275.9 259.9 L 274.9 259.9 L 271.4 261.2 L 269.7 260.6 L 268.3 260.0 L 266.1 260.2 L 262.0 260.2 L 259.5 260.3 L 258.2 259.1 L 257.1 256.8 L 256.3 255.9 L 255.4 255.2 L 253.9 254.9 L 247.4 254.9 L 246.2 254.9 L 245.3 254.5 L 244.0 252.4 L 242.7 251.5 L 241.1 251.5 L 240.4 252.6 L 243.1 256.2 L 243.9 258.2 L 246.4 261.0 L 253.4 267.0 L 254.7 268.9 L 254.6 271.4 L 254.5 275.1 L 254.7 278.7 L 256.6 283.7 L 259.1 288.9 L 259.8 292.2 L 259.3 294.6 L 258.8 295.9 L 258.9 296.5 L 259.4 297.0 L 261.8 297.7 L 266.9 298.2 L 270.0 298.2 L 274.7 298.8 L 275.0 300.6 L 274.5 303.6 L 273.6 305.3 L 272.9 305.8 L 270.3 306.2 L 267.6 308.0 L 263.7 309.8 L 261.5 310.1 L 260.6 310.4 L 259.8 311.0 L 259.1 311.7 L 258.4 315.1 L 257.2 318.9 L 255.1 321.2 L 252.7 323.1 L 250.3 323.3 L 248.3 323.1 L 247.4 323.7 L 246.0 325.2 L 244.0 327.2 L 242.4 328.2 L 240.4 328.1 L 238.2 329.0 L 235.4 330.6 L 233.5 331.9 L 231.9 334.1 L 229.7 336.3 L 227.3 337.9 L 226.2 339.9 L 224.6 342.5 L 222.7 342.5 L 222.5 341.0 L 223.4 338.6 L 222.4 336.5 L 220.5 335.4 L 219.6 335.0 L 218.8 335.2 L 216.5 336.2 L 213.8 338.1 L 212.1 339.4 L 210.6 340.1 L 207.4 340.6 L 204.8 340.9 L 203.7 340.5 L 201.7 339.1 L 197.1 334.8 L 191.0 329.0 L 190.5 327.3 L 190.8 325.5 L 189.7 323.0 L 189.0 320.3 L 188.4 319.4 L 188.3 317.3 L 186.9 313.7 L 185.9 310.7 L 184.8 309.2 L 185.3 307.9 L 184.8 306.7 L 184.0 305.6 L 182.8 302.2 L 183.3 300.8 L 182.9 299.3 L 181.9 298.3 L 180.5 297.3 L 178.6 295.0 L 176.3 292.9 L 175.2 292.1 L 174.4 291.7 L 173.7 289.7 L 173.2 289.1 L 172.0 288.9 L 169.6 288.1 L 167.4 289.1 L 167.3 287.5 L 168.0 286.6 L 175.6 279.1 L 179.5 275.7 L 179.9 275.1 L 180.3 274.4 L 180.5 273.3 L 179.7 272.1 L 176.0 266.3 L 174.8 265.2 L 173.5 264.3 L 172.1 261.9 L 170.4 256.3 L 169.2 253.4 L 168.8 251.3 L 168.9 248.8 L 168.5 246.9 L 167.5 245.6 L 167.5 241.6 L 168.5 234.8 L 168.7 229.7 L 168.2 226.2 L 169.1 223.5 L 171.3 221.7 L 172.6 218.9 L 172.8 215.1 L 174.2 211.9 L 176.6 209.5 L 177.5 207.0 L 176.7 204.7 L 176.4 203.1 L 174.4 201.6 L 170.5 200.5 L 167.4 200.3 L 165.5 201.6 L 160.6 202.7 L 152.7 203.7 L 146.3 203.7 L 141.5 202.7 L 137.8 203.0 L 135.3 204.8 L 133.6 205.2 L 132.5 204.2 L 131.4 203.9 L 129.7 204.5 L 129.5 204.3 L 125.7 199.5 L 122.3 195.1 L 118.3 189.9 L 113.7 183.9 L 112.9 183.5 L 111.5 183.5 L 109.6 183.6 L 106.7 183.0 L 104.7 182.1 L 103.1 181.3 L 100.3 180.2 L 98.3 180.0 L 96.5 180.3 L 91.7 182.4 L 88.9 182.6 L 86.8 182.7 L 81.0 181.6 L 77.1 181.5 L 72.5 182.2 L 70.6 182.6 L 67.8 181.5 L 66.0 179.8 L 64.2 176.0 L 63.0 172.9 L 60.9 172.3 L 58.5 171.8 L 57.4 170.8 L 56.7 169.0 L 56.5 166.7 L 56.7 163.1 L 57.0 161.7 L 57.3 157.8 L 58.6 155.7 L 59.4 154.7 L 59.3 153.0 L 58.6 149.6 L 58.0 147.2 L 55.4 144.5 L 52.0 141.0 L 50.6 135.4 L 48.9 128.8 L 47.5 128.1 L 46.3 128.4 L 45.0 128.1 L 43.8 125.4 L 42.6 124.9 L 40.7 125.9 L 39.4 126.6 L 35.9 127.3 L 35.2 126.6 L 35.4 125.8 L 36.9 123.4 L 38.6 120.3 L 40.6 117.5 L 42.5 114.6 L 43.8 111.5 L 44.8 105.4 L 45.4 101.2 L 47.1 93.7 L 50.3 87.7 L 51.4 84.9 L 54.3 81.3 L 55.6 79.4 L 57.3 77.9 L 62.0 75.8 L 67.7 65.5 L 69.0 63.9 L 74.7 62.3 L 79.1 61.1 L 82.4 59.9 L 83.5 59.2 L 84.3 58.9 L 83.6 60.1 L 82.1 61.6 L 80.3 62.5 L 71.2 64.8 L 70.2 65.3 L 69.0 66.3 L 69.0 68.5 L 69.3 70.2 L 72.0 75.9 L 73.0 77.3 L 76.6 80.4 L 75.8 80.9 L 74.5 80.9 L 75.4 84.9 L 77.6 87.7 L 77.7 89.5 L 76.0 94.9 L 73.0 98.1 L 70.8 101.9 L 69.1 103.4 L 65.3 110.8 L 68.2 115.3 L 68.6 117.5 L 71.0 120.7 L 72.7 121.7 L 73.7 123.0 L 73.2 125.2 L 74.2 128.1 L 75.5 129.7 L 77.1 130.3 L 79.1 130.3 L 84.8 128.3 L 86.2 127.5 L 87.1 125.9 L 89.9 122.7 L 90.1 118.6 L 90.7 113.6 L 90.0 110.4 L 87.0 105.8 L 85.7 102.5 L 82.7 99.5 L 80.9 94.2 L 80.1 92.6 L 79.6 90.4 L 78.9 86.4 L 80.9 84.9 L 80.7 81.7 L 85.7 80.8 L 96.3 75.5 L 102.9 74.1 L 110.4 71.3 L 112.2 69.9 L 113.7 67.6 L 114.8 67.3 L 118.8 69.5 L 120.7 68.7 L 121.5 67.0 L 120.4 63.7 L 118.1 63.7 L 111.4 64.9 L 110.7 63.5 L 110.7 62.2 L 109.1 58.3 L 110.1 55.3 L 111.1 52.9 L 113.1 51.9 L 115.9 50.9 L 118.1 52.5 L 119.4 54.0 L 120.1 55.5 L 120.5 59.5 L 121.7 63.6 L 122.9 66.4 L 124.8 68.6 L 126.3 68.4 L 127.4 68.1 L 134.4 67.6 L 138.7 69.1 L 144.1 69.8 L 149.2 72.9 L 154.4 76.7 L 155.8 79.4 L 156.2 82.1 L 157.5 83.8 L 156.2 85.6 L 156.9 88.7 L 158.4 91.7 L 160.6 93.6 L 167.1 94.2 L 174.0 92.9 L 184.8 91.7 L 188.3 90.7 L 206.1 90.1 L 209.5 91.6 L 209.8 93.0 L 209.8 94.1 L 215.6 99.6 L 220.3 100.4 L 224.3 102.1 L 228.4 103.0 L 232.9 104.4 L 235.4 104.2 L 237.3 103.7 L 239.6 103.7 L 255.5 94.5 L 264.0 94.8 L 265.3 94.2 L 266.4 93.4 L 263.3 92.0 L 256.2 91.4 L 254.1 92.4 L 252.8 90.0 L 255.2 90.1 L 263.0 89.3 L 272.1 89.8 L 279.4 88.2 L 283.1 87.9 L 285.3 88.2 L 291.1 87.1 L 302.2 88.4 L 310.9 87.3 L 309.9 88.9 L 307.0 89.8 L 302.4 90.1 L 298.9 92.3 L 291.4 91.9 L 286.1 92.7 L 287.8 93.3 L 287.8 95.5 L 288.5 96.0 L 289.2 96.0 L 291.0 97.7 L 291.5 98.8 L 292.1 101.1 L 291.3 103.6 L 290.2 104.7 L 292.4 104.4 L 293.6 103.2 L 293.4 102.0 L 293.6 100.6 L 294.8 101.1 L 295.6 101.7 L 298.4 108.2 L 300.3 111.7 L 300.8 111.5 L 301.3 111.4 L 301.8 110.8 L 302.7 109.1 L 303.4 110.2 L 303.9 110.6 L 304.3 110.7 L 303.9 109.2 L 304.5 107.3 L 304.3 106.7 L 305.1 106.5 L 306.1 106.8 L 307.6 107.3 L 310.2 109.5 L 311.9 111.7 L 312.1 112.9 L 312.7 113.6 L 313.8 114.4 L 314.3 115.5 L 314.4 113.7 L 313.8 112.4 L 313.6 110.9 L 317.0 110.8 L 317.9 108.8 L 319.7 110.0 L 324.6 115.5 L 326.4 116.4 L 331.7 117.4 L 335.0 120.0 L 337.0 122.4 L 335.8 124.8 L 332.7 126.1 L 331.4 127.6 L 330.7 129.1 L 330.7 130.6 L 329.8 132.4 L 329.6 133.0 L 329.1 135.5 L 327.8 138.5 L 326.1 141.7 L 317.2 141.8 L 319.4 143.1 L 321.4 144.0 L 324.7 146.5 L 327.3 144.5 L 331.1 144.4 L 335.2 142.2 L 336.8 141.9 L 344.4 143.0 L 346.3 141.4 L 347.8 141.0 L 352.0 141.3 L 355.6 143.0 Z'

function proyecto(lon: number, lat: number): [number, number] {
  return [20 + ((lon + 74) / 15) * 360, 360 - (lat / 13) * 330]
}

const sinAcentos = (texto: string) => texto.toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export function Explorador({ zonas, zonaActiva, onSelect }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const filtradas = zonas.filter((z) => sinAcentos(`${z.nombre} ${z.capital}`).includes(sinAcentos(busqueda)))
  const dibujar = [...zonas].sort((a, b) => Number(a.id === zonaActiva) - Number(b.id === zonaActiva))

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="rounded-3xl border border-white/10 bg-noche/40 p-3">
        <svg viewBox="0 0 400 380" className="w-full" role="img" aria-label="Mapa de Venezuela con los 23 estados y el Distrito Capital">
          <defs>
            <linearGradient id="mapa-venezuela" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#17475b" />
              <stop offset="100%" stopColor="#0b2534" />
            </linearGradient>
          </defs>
          <path
            d={SILUETA}
            fill="url(#mapa-venezuela)"
            stroke="#7dddbb"
            strokeOpacity="0.9"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <text x="200" y="370" textAnchor="middle" className="fill-white/40 text-[10px] uppercase tracking-[0.2em]">
            Venezuela
          </text>
          {dibujar.map((zona) => {
            const [x, y] = proyecto(zona.lon, zona.lat)
            const balance = gold.hechos.clima_resumen[zona.id]?.balance_medio ?? 0
            const presion = Math.max(0, Math.min(100, 50 - balance / 3))
            const color = presion > 65 ? '#f07c6a' : presion > 45 ? '#f3c969' : '#5cc9a7'
            const activa = zona.id === zonaActiva
            return (
              <g
                key={zona.id}
                onClick={() => onSelect(zona.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(zona.id) }}
                role="button"
                tabIndex={0}
                aria-label={`Seleccionar estado ${zona.nombre}`}
                className="cursor-pointer outline-none"
              >
                <title>{zona.nombre}</title>
                <circle cx={x} cy={y} r={activa ? 14 : 9} fill={color} fillOpacity={activa ? 0.35 : 0.18} />
                <circle cx={x} cy={y} r={activa ? 7 : 5} fill={color} stroke={activa ? '#fff' : 'none'} strokeWidth="1.5" />
                {activa && <text x={x + 12} y={y + 4} className="fill-white text-[11px] font-semibold">{zona.nombre}</text>}
              </g>
            )
          })}
        </svg>
        <p className="px-2 pb-1 text-center text-[11px] text-white/40">
          Los 23 estados y el Distrito Capital. Toca un punto o busca un estado en la lista.
        </p>
      </div>

      <div>
        <label className="mb-3 block">
          <span className="sr-only">Buscar estado</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar estado o capital"
            className="min-h-[44px] w-full rounded-xl border border-white/15 bg-noche/60 px-4 text-sm placeholder:text-white/30"
          />
        </label>
        <p className="mb-3 text-[11px] text-white/45">{filtradas.length} de {zonas.length} estados</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {filtradas.map((zona) => {
            const resumen = gold.hechos.clima_resumen[zona.id] ?? {}
            return (
              <button
                key={zona.id}
                onClick={() => onSelect(zona.id)}
                className={`min-h-[44px] rounded-2xl border p-4 text-left transition ${zona.id === zonaActiva
                  ? 'border-hoja bg-hoja/10'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/25'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-bold">{zona.nombre}</h3>
                  <span className="text-xs text-white/45">{zona.altura_m} m</span>
                </div>
                <p className="mt-1 text-[11px] text-white/50">Capital: {zona.capital}</p>
                <p className="mt-2 text-xs text-white/60">{zona.descripcion}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <div className="text-white/45">Lluvia</div>
                    <div className="font-bold">{Math.round(resumen.lluvia_media ?? 0)} mm</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <div className="text-white/45">Demanda de agua</div>
                    <div className="font-bold">{Math.round(resumen.et0_media ?? 0)} mm</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.04] p-1.5">
                    <div className="text-white/45">Calor</div>
                    <div className="font-bold">{Math.round(resumen.calor_medio ?? 0)} d</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
