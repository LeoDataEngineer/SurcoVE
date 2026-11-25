# AGENTS.md

## Proyecto
SurcoVE — web app para agricultores de Venezuela, basada en el reto
NASA Space Apps 2026 "Field Shift: Adapting Farms with NASA Data".

## Estado del repo
App funcional: Vite + React + TS, pipeline Python y build estático.
No hay CI ni tests automatizados todavía. Si aparecen workflows, documentarlos aquí.

## Arquitectura acordada
- Stack real: Vite + React + TypeScript + Tailwind + Framer Motion +
  SVG/D3 (d3-scale, d3-shape). Mapa SVG propio, sin Leaflet. Consultas en
  memoria con selectores TS, sin DuckDB-WASM. Sin backend. PWA con `public/sw.js`.
- Datos ELT medallion con un script por capa: `pipeline/bronce.py` (crudo
  inmutable + `manifiesto_ingesta.json`), `pipeline/plata.py` (CSV mensual
  tipado, limpieza, QC) y `pipeline/oro.py` (modelo estrella en CSV).
  `pipeline/orquestador.py` solo orquesta los tres; cada script define lo que necesita.
  `oro.py` escribe 13 CSV en `pipeline/data/oro/` y desde ellos reconstruye
  `oro/gold.json` y `public/gold.json`. El frontend no llama APIs en runtime:
  `src/lib/gold.ts` carga `public/gold.json` con `fetch` antes de renderizar,
  así los ~8 MB de datos quedan fuera del bundle JS. `public/sw.js` precachea
  `gold.json` para que el modo campo funcione sin red.
- Entidades: los 23 estados de Venezuela + Distrito Capital, definidos en
  `pipeline/estados.json` (id, nombre, capital, lat/lon, altura, pendiente,
  cultivos y descripción). El catálogo tiene 28 cultivos. El campo interno se
  llama `zona` por compatibilidad, pero la interfaz siempre dice "estado".
- Oro CSV: `fact_clima_mensual.csv` (57.600 filas, grano estado × mes × indicador),
  `fact_recomendacion.csv`, `fact_rotacion.csv` (base por escenario),
  `vista_zona_mes.csv`, `agg_clima_resumen.csv` y 8 `dim_*.csv`.
  En el JSON servido: `hechos.clima_mensual`, `hechos.recomendacion`,
  `hechos.rotacion` y `vista[estado][mes][indicador]`. Las rotaciones
  interactivas se recalculan en `src/lib/scoring.ts`.
- Fuentes: solo NASA POWER se descarga realmente. GPM/MODIS/SMAP/GRACE/SRTM/
  CMIP6/SoilGrids aparecen en provenance, sin datos integrados ni credenciales
  Earthdata. ET₀, vigor, balance y erosión están marcados como proxies.
- UI multipágina (Vite MPA, 8 archivos HTML en raíz, navegación normal en la
  misma pestaña): `index.html` (brújula), `rueda.html`, `rotaciones.html`,
  `escenarios.html`, `mapa.html`, `asistente.html`, `ficha.html`, `guia.html`.
  No hay página única tipo landing ni pantalla de inicio/onboarding: el selector
  `MiParcela` es un `<details>` integrado arriba de cada página y persiste en
  `localStorage` (`src/lib/storage.ts`). `src/lib/navegacion.ts` mapea ruta →
  sección; `src/main.tsx` pasa la sección a `App`. `public/sw.js` precachea las
  8 páginas. La guía explica solo lo que aparece en la interfaz: las 8 señales,
  valor, serie histórica, anomalía/percentil, estados, escenarios y rotaciones.
  Brújula con 8 "sensores" (evitar llamarlos "medallones" en la interfaz; ese
  término corresponde a las capas de datos) y asistente "La brújula responde"
  por reglas, sin LLM ni mascota. La interfaz no muestra linaje Bronce→Plata→Oro,
  siglas de NASA POWER, columnas del pipeline, banderas de calidad ni niveles de
  confianza: esos conceptos quedan en el pipeline y en la documentación técnica.

## Restricciones de producto
Español, lenguaje llano, mobile-first, targets ≥44 px, `prefers-reduced-motion`,
WCAG AA. Sin login: "Mi parcela" se guarda localmente. No dar dosis de
químicos ni sustituir el criterio del agrónomo.

## Comandos
Ver `README.md` para setup y comandos exactos.
Verificación antes de commit (ejecutar por separado; PowerShell 5 no acepta `&&`):
`npm run lint`, `npm run typecheck`, `npm run build`.

## Regla de verdad
Si documentación, config o scripts contradicen este archivo, prevalece
lo ejecutable y se actualiza este archivo.
