# SurcoVE

Brújula climática para agricultores venezolanos. Web app responsive y offline-first que usa
datos reales de **NASA POWER** para orientar riego, fecha de siembra y rotaciones de cultivos.

Proyecto independiente para el reto **NASA Space Apps 2026 · Field Shift: Adapting Farms with NASA Data**.
No afiliado ni respaldado por la NASA.

## Requisitos

- Node.js 20+
- Python 3.10+ (solo para regenerar datos; usa únicamente la biblioteca estándar)

## Comandos

```bash
npm install          # instalar dependencias del frontend
npm run data         # orquesta bronce.py -> plata.py -> oro.py (descarga NASA POWER)
python pipeline/bronce.py   # solo ingesta cruda y manifiesto
python pipeline/plata.py    # solo limpieza y CSV mensuales
python pipeline/oro.py      # solo modelo estrella en CSV + export JSON
npm run dev          # servidor de desarrollo
npm run build        # build de producción en dist/
npm run preview      # servir el build
```

Verificación antes de commit:

```bash
npm run lint
npm run typecheck
npm run build
```

En PowerShell 5 ejecuta los tres comandos por separado: `&&` no es un separador válido.

Si los archivos `bronce/power_*.json` ya existen, `npm run data` los reutiliza y solo
recalcula plata y oro. Elimínalos para forzar una descarga nueva.

## Arquitectura de datos (medallion ELT)

Cada capa tiene su propio script (`bronce.py`, `plata.py`, `oro.py`); `orquestador.py` solo
las orquesta. Cada script es independiente y define las constantes que necesita.

```
pipeline/data/bronce/   JSON crudo de NASA POWER + manifiesto_ingesta.json (hash y fecha)
pipeline/data/plata/    mensual_<estado>.csv: tipado, limpio y con flag de calidad
pipeline/data/oro/      13 tablas CSV del modelo estrella + gold.json
public/gold.json        export desde CSV, servido con fetch (sin backend)
```

**Capa Oro (CSV)**
- Hechos: `fact_clima_mensual.csv` (grano `estado × mes × indicador`),
  `fact_recomendacion.csv`, `fact_rotacion.csv` (línea base por escenario).
- Agregación: `agg_clima_resumen.csv` y `vista_zona_mes.csv` (tabla ancha).
- Dimensiones: `dim_tiempo.csv`, `dim_espacio.csv`, `dim_indicador.csv`,
  `dim_cultivo.csv`, `dim_prioridad.csv`, `dim_estrategia.csv`,
  `dim_escenario.csv`, `dim_fuente.csv`.
- `oro.py` reconstruye `gold.json` leyendo esos CSV y lo copia a `public/`.
  `src/lib/gold.ts` lo descarga con `fetch` al arrancar y el service worker lo
  guarda en caché para el modo campo; el JS del bundle queda sin los ~8 MB.
  La app recalcula rotaciones interactivas en `src/lib/scoring.ts`; el CSV es la
  línea base OLAP con prioridad general.
- `pipeline/estados.json` define las 24 entidades (23 estados + Distrito Capital)
  con su capital y su lista de cultivos; `dim_cultivo.csv` incluye 28 cultivos.
  Cada entidad tiene su propio punto NASA POWER en su capital.

## Fuentes y límites

- **NASA POWER**: temperatura, lluvia, humedad y radiación diaria (2001–2025), descargada en vivo.
- **ET₀**: estimación Hargreaves-Samani (proxy documentado).
- **Vigor, balance, erosión**: indicadores derivados, no productos NASA directos. Están marcados
  como proxies en `gold.json`; la interfaz no muestra ese detalle técnico.
- **SRTM / SoilGrids / MODIS / SMAP / GRACE / CMIP6**: referenciados en provenance; pendientes
  de integración. No se asumen credenciales Earthdata.
- El asistente «La brújula responde» usa reglas deterministas sobre los datos climáticos, sin LLM.
- La herramienta orienta la decisión; no da dosis de químicos ni sustituye al agrónomo local.

## Interfaz

- Brújula con 8 sensores orbitales y detalle de tendencia, comparación y umbral.
- Rueda de siembra circular de 12 meses.
- Tres rotaciones comparadas con radar de prioridades.
- Laboratorio de escenarios (temperatura y lluvia).
- Explorador de los 23 estados + Distrito Capital, con mapa de puntos, búsqueda
  por nombre o capital y una ficha climática por estado.
- Asistente por reglas con chips de evidencia.
- Ficha de campo descargable, modo campo de alto contraste y PWA offline.
- Guía de datos: significado de las 8 señales y cómo leer valor, serie histórica,
  anomalía, percentil, estados y escenarios. Solo explica lo que aparece en la
  interfaz; no muestra siglas internas, linaje ni columnas del pipeline.
- Cada apartado es una **página HTML independiente** (`index.html`, `rueda.html`,
  ...), con navegación normal en la misma pestaña: `/guia.html`, `/mapa.html`, etc.
- No hay pantalla de inicio: el selector «Mi parcela» está arriba de cada página.
  Arranca vacío: hay que elegir estado, cultivo, mes, año y al menos una prioridad
  antes de ver análisis. La selección se conserva al navegar entre páginas con
  `sessionStorage`, pero se borra al abrir la app de nuevo. El mapa y la guía se
  pueden consultar sin esa selección. El modo campo funciona offline en las 8 páginas.
- El selector permite elegir mes y año. Para un año sin dato observado (por ejemplo
  enero de 2026), `baseMes()` promedia ese mes de 2001–2025 y aplica el escenario;
  la interfaz lo marca como «Promedio histórico» y aclara que es una tendencia con
  datos históricos, no un pronóstico. Anomalía y percentil solo se muestran con
  años observados.

Ver `AGENTS.md` para convenciones y restricciones del proyecto.
