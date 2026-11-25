"""Capa ORO: modelo estrella en CSV + export JSON para el frontend."""
from __future__ import annotations

import csv
import json
from collections import defaultdict
from datetime import datetime, timezone
from statistics import mean, pstdev

from pathlib import Path

ROOT = Path(__file__).resolve().parent
PLATA = ROOT / "data" / "plata"
ORO = ROOT / "data" / "oro"

CULTIVOS = [
    dict(id="maiz", nombre="Maíz", familia="Cereal", ciclo=4, temp_opt=24, temp_max=32,
         agua=110, sequia=0.35, fijador_n=False, cobertura=0.5, forraje=True, mercado=0.9),
    dict(id="arroz", nombre="Arroz", familia="Cereal", ciclo=4, temp_opt=26, temp_max=34,
         agua=180, sequia=0.15, fijador_n=False, cobertura=0.7, forraje=False, mercado=0.8),
    dict(id="sorgo", nombre="Sorgo", familia="Cereal", ciclo=4, temp_opt=27, temp_max=38,
         agua=70, sequia=0.9, fijador_n=False, cobertura=0.6, forraje=True, mercado=0.5),
    dict(id="cana", nombre="Caña de azúcar", familia="Cereal", ciclo=12, temp_opt=26, temp_max=35,
         agua=140, sequia=0.45, fijador_n=False, cobertura=0.9, forraje=True, mercado=0.85),
    dict(id="frijol", nombre="Frijol", familia="Legumbre", ciclo=3, temp_opt=23, temp_max=30,
         agua=90, sequia=0.3, fijador_n=True, cobertura=0.7, forraje=False, mercado=0.8),
    dict(id="mani", nombre="Maní", familia="Legumbre", ciclo=4, temp_opt=26, temp_max=34,
         agua=80, sequia=0.7, fijador_n=True, cobertura=0.6, forraje=True, mercado=0.75),
    dict(id="soya", nombre="Soya", familia="Legumbre", ciclo=4, temp_opt=25, temp_max=33,
         agua=100, sequia=0.4, fijador_n=True, cobertura=0.7, forraje=True, mercado=0.9),
    dict(id="yuca", nombre="Yuca", familia="Raíz", ciclo=10, temp_opt=27, temp_max=36,
         agua=90, sequia=0.8, fijador_n=False, cobertura=0.8, forraje=True, mercado=0.7),
    dict(id="platano", nombre="Plátano", familia="Perenne", ciclo=12, temp_opt=27, temp_max=34,
         agua=150, sequia=0.3, fijador_n=False, cobertura=0.95, forraje=False, mercado=0.85),
    dict(id="cafe", nombre="Café", familia="Perenne", ciclo=12, temp_opt=21, temp_max=29,
         agua=120, sequia=0.35, fijador_n=False, cobertura=0.95, forraje=False, mercado=0.95),
    dict(id="cacao", nombre="Cacao", familia="Perenne", ciclo=12, temp_opt=26, temp_max=33,
         agua=160, sequia=0.2, fijador_n=False, cobertura=0.95, forraje=False, mercado=0.9),
    dict(id="papa", nombre="Papa", familia="Raíz", ciclo=3, temp_opt=18, temp_max=26,
         agua=100, sequia=0.25, fijador_n=False, cobertura=0.7, forraje=False, mercado=0.8),
    dict(id="tomate", nombre="Tomate", familia="Hortaliza", ciclo=3, temp_opt=23, temp_max=32,
         agua=130, sequia=0.25, fijador_n=False, cobertura=0.6, forraje=False, mercado=0.85),
    dict(id="aguacate", nombre="Aguacate", familia="Perenne", ciclo=12, temp_opt=24, temp_max=32,
         agua=110, sequia=0.4, fijador_n=False, cobertura=0.95, forraje=False, mercado=0.95),
    dict(id="banano", nombre="Banano", familia="Perenne", ciclo=12, temp_opt=27, temp_max=34,
         agua=160, sequia=0.3, fijador_n=False, cobertura=0.9, forraje=False, mercado=0.8),
    dict(id="cebolla", nombre="Cebolla", familia="Hortaliza", ciclo=4, temp_opt=20, temp_max=30,
         agua=120, sequia=0.3, fijador_n=False, cobertura=0.5, forraje=False, mercado=0.8),
    dict(id="aji", nombre="Ají", familia="Hortaliza", ciclo=5, temp_opt=25, temp_max=33,
         agua=110, sequia=0.35, fijador_n=False, cobertura=0.6, forraje=False, mercado=0.75),
    dict(id="algodon", nombre="Algodón", familia="Fibra", ciclo=5, temp_opt=26, temp_max=35,
         agua=90, sequia=0.7, fijador_n=False, cobertura=0.7, forraje=False, mercado=0.6),
    dict(id="girasol", nombre="Girasol", familia="Oleaginosa", ciclo=4, temp_opt=25, temp_max=34,
         agua=90, sequia=0.65, fijador_n=False, cobertura=0.7, forraje=False, mercado=0.6),
    dict(id="quinua", nombre="Quinua", familia="Cereal", ciclo=4, temp_opt=18, temp_max=26,
         agua=70, sequia=0.8, fijador_n=False, cobertura=0.6, forraje=True, mercado=0.5),
    dict(id="batata", nombre="Batata", familia="Raíz", ciclo=5, temp_opt=25, temp_max=33,
         agua=100, sequia=0.6, fijador_n=False, cobertura=0.8, forraje=True, mercado=0.65),
    dict(id="pina", nombre="Piña", familia="Perenne", ciclo=18, temp_opt=26, temp_max=34,
         agua=120, sequia=0.5, fijador_n=False, cobertura=0.8, forraje=False, mercado=0.7),
    dict(id="mango", nombre="Mango", familia="Perenne", ciclo=24, temp_opt=27, temp_max=36,
         agua=110, sequia=0.6, fijador_n=False, cobertura=0.95, forraje=False, mercado=0.75),
    dict(id="naranja", nombre="Naranja", familia="Perenne", ciclo=24, temp_opt=25, temp_max=34,
         agua=130, sequia=0.5, fijador_n=False, cobertura=0.9, forraje=False, mercado=0.8),
    dict(id="limon", nombre="Limón", familia="Perenne", ciclo=24, temp_opt=25, temp_max=34,
         agua=120, sequia=0.55, fijador_n=False, cobertura=0.9, forraje=False, mercado=0.8),
    dict(id="lechuga", nombre="Lechuga", familia="Hortaliza", ciclo=2, temp_opt=18, temp_max=27,
         agua=100, sequia=0.2, fijador_n=False, cobertura=0.5, forraje=False, mercado=0.75),
    dict(id="zanahoria", nombre="Zanahoria", familia="Hortaliza", ciclo=3, temp_opt=18, temp_max=27,
         agua=110, sequia=0.3, fijador_n=False, cobertura=0.5, forraje=False, mercado=0.75),
    dict(id="palma", nombre="Palma aceitera", familia="Perenne", ciclo=36, temp_opt=27, temp_max=35,
         agua=180, sequia=0.5, fijador_n=False, cobertura=0.95, forraje=False, mercado=0.8),
]

INDICADORES = [
    dict(id="calor", nombre="Días de calor", unidad="días/mes", fuente="NASA POWER", resolucion="0.5° diario",
         umbral="> 10 días con máxima ≥ 32 °C", descripcion="Días por mes con temperatura máxima de 32 °C o más.", proxy=False, confianza=0.9),
    dict(id="lluvia", nombre="Lluvia", unidad="mm/mes", fuente="NASA POWER", resolucion="0.5° diario",
         umbral="< 40 mm en meses de siembra", descripcion="Lluvia total caída en el mes en el estado elegido.", proxy=False, confianza=0.9),
    dict(id="humedad", nombre="Humedad relativa", unidad="%", fuente="NASA POWER", resolucion="0.5° diario",
         umbral="< 55 %", descripcion="Humedad media del aire; orienta la demanda de agua de los cultivos.", proxy=False, confianza=0.85),
    dict(id="sequia", nombre="Demanda de agua", unidad="mm/mes", fuente="NASA POWER + Hargreaves", resolucion="0.5° mensual",
         umbral="> 150 mm/mes", descripcion="Agua que la atmósfera pide al suelo; se estima a partir del clima.", proxy=True, confianza=0.65),
    dict(id="vigor", nombre="Vigor vegetativo", unidad="índice 0-100", fuente="Proxy local (POWER)", resolucion="0.5° mensual",
         umbral="< 45", descripcion="Verdor estimado con la lluvia, la humedad y el calor.", proxy=True, confianza=0.5),
    dict(id="balance", nombre="Balance hídrico", unidad="mm/mes", fuente="NASA POWER + Hargreaves", resolucion="0.5° mensual",
         umbral="< -60 mm", descripcion="Cuánta agua gana o pierde el suelo: lluvia menos demanda de la atmósfera.", proxy=True, confianza=0.7),
    dict(id="erosion", nombre="Riesgo de erosión", unidad="índice 0-100", fuente="SRTM (referencia) + POWER", resolucion="referencia por estado",
         umbral="> 55", descripcion="Riesgo estimado con la pendiente del estado y la lluvia más fuerte del mes.", proxy=True, confianza=0.55),
    dict(id="heladas", nombre="Días de helada", unidad="días/mes", fuente="NASA POWER", resolucion="0.5° diario",
         umbral="> 0 días en época de floración", descripcion="Días por mes con temperatura mínima de 2 °C o menos.", proxy=False, confianza=0.9),
]

PRIORIDADES = [
    dict(id="agua", nombre="Ahorrar agua", descripcion="Preferir cultivos con menor demanda hídrica."),
    dict(id="suelo", nombre="Alimentar el suelo", descripcion="Priorizar leguminarias fijadoras de nitrógeno."),
    dict(id="erosion", nombre="Evitar erosión", descripcion="Priorizar cobertura permanente del suelo."),
    dict(id="forraje", nombre="Forraje para animales", descripcion="Priorizar cultivos aprovechables como alimento animal."),
    dict(id="mercado", nombre="Vender bien", descripcion="Priorizar cultivos con mercado más sólido."),
]

ESTRATEGIAS = [
    dict(id="actual", nombre="Rotación actual", descripcion="Repetir el cultivo actual como línea base de comparación."),
    dict(id="legumbre", nombre="Con leguminaria", descripcion="Intercalar una leguminaria que devuelve nitrógeno al suelo."),
    dict(id="resiliente", nombre="Resiliente al clima", descripcion="Cultivos tolerantes al calor y la sequía con el suelo cubierto."),
]

ESCENARIOS = [
    dict(id="actual", nombre="Clima observado", temp=0, lluvia=0),
    dict(id="calor1", nombre="+1 °C", temp=1, lluvia=0),
    dict(id="calor2", nombre="+2 °C y 15 % menos lluvia", temp=2, lluvia=-15),
    dict(id="calor3", nombre="+3 °C y 25 % menos lluvia", temp=3, lluvia=-25),
]

FUENTES = [
    dict(id="power", nombre="NASA POWER", detalle="Agroclimatology: T2M, T2M_MAX, T2M_MIN, PRECTOTCORR, RH2M, ALLSKY_SFC_SW_DWN.",
         url="https://power.larc.nasa.gov/", tipo="NASA", live=True),
    dict(id="hargreaves", nombre="Hargreaves-Samani", detalle="ET₀ estimada con temperatura y radiación extraterrestres aproximadas para 10°N.",
         url="https://www.fao.org/docrep/X0490E/x0490e0j.htm", tipo="metodología", live=False),
    dict(id="srtm", nombre="SRTM (referencia)", detalle="Pendiente aproximada por estado, no producto descargado en esta versión.",
         url="https://www.earthdata.nasa.gov/data/instruments/srtm", tipo="NASA", live=False),
    dict(id="soilgrids", nombre="ISRIC SoilGrids", detalle="Pendiente de integración para textura, pH y carbono.",
         url="https://soilgrids.org/", tipo="complemento", live=False),
]

CAMPO_INDICADOR = {
    "calor": "calor", "lluvia": "lluvia", "humedad": "humedad", "sequia": "et0",
    "vigor": "vigor", "balance": "balance", "erosion": "erosion", "heladas": "heladas",
}

POR_ID = {c["id"]: c for c in CULTIVOS}


def resilientes_de(cultivos_zona: list[str], base: str) -> list[str]:
    """Dos cultivos del propio estado que mejor toleran calor y sequía."""
    candidatos = [POR_ID[i] for i in cultivos_zona
                  if i != base and i in POR_ID]
    candidatos.sort(key=lambda c: (c["sequia"], c["cobertura"]), reverse=True)
    return [c["id"] for c in candidatos[:2]] or ["sorgo", "frijol"]


def limite(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return round(max(lo, min(hi, v)), 2)


def escribir_csv(ruta: Path, columnas: list[str], filas: list[dict]) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    with ruta.open("w", newline="", encoding="utf-8") as manejador:
        escritor = csv.DictWriter(manejador, fieldnames=columnas)
        escritor.writeheader()
        for fila in filas:
            escritor.writerow({c: fila.get(c, "") for c in columnas})


def leer_estados() -> list[dict]:
    return json.loads((ROOT / "estados.json").read_text(encoding="utf-8"))

PASOS = ["anio", "mes", "trimestre", "estacion"]
CAMPOS_VISTA = ["zona", "tiempo", "t2m", "tmax", "tmin", "lluvia", "humedad",
                "calor", "heladas", "et0", "lluvia_max", "balance", "vigor", "erosion"]


def num(valor: str) -> float:
    return float(valor)


def leer_plata() -> dict[str, dict[str, dict]]:
    series: dict[str, dict[str, dict]] = {}
    for ruta in sorted(PLATA.glob("mensual_*.csv")):
        zona = ruta.stem.removeprefix("mensual_")
        series[zona] = {}
        with ruta.open(encoding="utf-8", newline="") as manejador:
            for fila in csv.DictReader(manejador):
                series[zona][fila["tiempo"]] = {
                    clave: num(fila[clave]) for clave in CAMPOS_VISTA[2:]
                }
    return series


def hechos_clima(series: dict[str, dict[str, dict]]) -> tuple[list[dict], list[dict]]:
    hechos: list[dict] = []
    vista: list[dict] = []
    for zona, mensual in series.items():
        for ind in INDICADORES:
            por_mes: dict[int, list[float]] = defaultdict(list)
            for tiempo, fila in mensual.items():
                por_mes[int(tiempo[5:7])].append(fila[CAMPO_INDICADOR[ind["id"]]])
            medias = {m: mean(v) for m, v in por_mes.items()}
            desvios = {m: (pstdev(v) or 1.0) for m, v in por_mes.items()}
            for tiempo in sorted(mensual):
                valor = mensual[tiempo][CAMPO_INDICADOR[ind["id"]]]
                mes = int(tiempo[5:7])
                orden = sorted(por_mes[mes])
                hechos.append(dict(
                    zona=zona, tiempo=tiempo, indicador=ind["id"], valor=round(valor, 2),
                    anomalia=round((valor - medias[mes]) / desvios[mes], 2),
                    percentil=round(100 * sum(1 for v in orden if v <= valor) / len(orden), 1),
                    confianza=ind["confianza"],
                ))
        for tiempo in sorted(mensual):
            vista.append({"zona": zona, "tiempo": tiempo, **mensual[tiempo]})
    return hechos, vista


def dimension_tiempo(hechos: list[dict]) -> list[dict]:
    tiempos = sorted({h["tiempo"] for h in hechos})
    filas = []
    for tiempo in tiempos:
        anio, mes = int(tiempo[:4]), int(tiempo[5:7])
        estacion = "sequía" if mes <= 4 else ("lluvia" if mes <= 10 else "transición")
        filas.append(dict(id=tiempo, anio=anio, mes=mes,
                          trimestre=(mes - 1) // 3 + 1, estacion=estacion))
    return filas


def recomendaciones(series: dict[str, dict[str, dict]]) -> list[dict]:
    salida = []
    for zona, mensual in series.items():
        mes_actual = datetime.now(timezone.utc).month
        clave = f"{max(mensual)[:4]}-{mes_actual:02d}"
        fila = mensual.get(clave) or mensual[max(mensual)]
        suficiente = fila["lluvia"] >= 120 and fila["balance"] > 0
        texto = (
            f"No regar de forma preventiva. La lluvia media de este mes es {fila['lluvia']:.0f} mm "
            f"y el balance hídrico {fila['balance']:.0f} mm."
            if suficiente else
            f"Regar en el momento de siembra y vigilar la semana siguiente. Lluvia media "
            f"{fila['lluvia']:.0f} mm y balance {fila['balance']:.0f} mm."
        )
        salida.append(dict(zona=zona, fecha=clave, tipo="riego",
                           severidad="baja" if suficiente else "media", texto=texto,
                           evidencia="|".join(["lluvia", "balance", "humedad"]), confianza=0.7))
        mejor = max(mensual, key=lambda t: mensual[t]["vigor"])
        salida.append(dict(zona=zona, fecha=mejor, tipo="siembra", severidad="informativa",
                           texto=f"El mes con mayor vigor estimado histórico es {mejor[5:7]}/{mejor[:4]}.",
                           evidencia="|".join(["vigor", "lluvia", "calor"]), confianza=0.55))
    return salida


def resumen(series: dict[str, dict[str, dict]]) -> list[dict]:
    salida = []
    for zona, mensual in series.items():
        ultimos = [f for t, f in mensual.items() if int(t[:4]) >= 2016]
        salida.append(dict(
            zona=zona,
            lluvia_media=round(mean(f["lluvia"] for f in ultimos), 1),
            et0_media=round(mean(f["et0"] for f in ultimos), 1),
            calor_medio=round(mean(f["calor"] for f in ultimos), 1),
            heladas_medias=round(mean(f["heladas"] for f in ultimos), 2),
            balance_medio=round(mean(f["balance"] for f in ultimos), 1),
        ))
    return salida


def clima_escenario(fila: dict, esc: dict) -> dict:
    lluvia = fila["lluvia"] * (1 + esc["lluvia"] / 100)
    et0 = fila["et0"] + esc["temp"] * 6
    return dict(
        tmax=fila["tmax"] + esc["temp"],
        lluvia=lluvia,
        et0=et0,
        balance=lluvia - et0,
        calor=fila["calor"] + esc["temp"] * 3,
        heladas=max(0, fila["heladas"] - esc["temp"] * 3),
        erosion=fila["erosion"],
    )


def aptitud(cultivo: dict, clima: dict) -> float:
    calor = limite(100 - max(0, clima["tmax"] - cultivo["temp_opt"]) * 4
                   - max(0, clima["tmax"] - cultivo["temp_max"]) * 8)
    agua = limite(100 - max(0, cultivo["agua"] - clima["lluvia"]) * 0.45
                  + cultivo["sequia"] * 18 + limite(clima["balance"] + 100) * 0.12)
    heladas = 100 if cultivo["temp_opt"] > 21 else limite(100 - clima["heladas"] * 35)
    suelo = 95 if cultivo["fijador_n"] else 45
    erosion = limite(28 + cultivo["cobertura"] * 72 - clima["erosion"] * 0.15)
    return mean([calor, agua, heladas, suelo, erosion, cultivo["mercado"] * 100])


def rotaciones(series: dict[str, dict[str, dict]], zonas: list[dict]) -> list[dict]:
    por_id = {c["id"]: c for c in CULTIVOS}
    por_zona = {z["id"]: z for z in zonas}
    filas = []
    for zona, mensual in series.items():
        cultivos_zona = por_zona[zona]["cultivos"]
        base = "maiz" if "maiz" in cultivos_zona else cultivos_zona[0]
        legumbre = next((i for i in ("mani", "frijol", "soya") if i in cultivos_zona), "frijol")
        secuencias = {
            "actual": [base],
            "legumbre": [legumbre, base],
            "resiliente": resilientes_de(cultivos_zona, base),
        }
        for esc in ESCENARIOS:
            for estrategia in ESTRATEGIAS:
                ids = secuencias[estrategia["id"]]
                cultivos_seq = [por_id[i] for i in ids]
                puntajes = []
                for mes in range(1, 13):
                    clave = f"{max(mensual)[:4]}-{mes:02d}"
                    if clave not in mensual:
                        continue
                    clima = clima_escenario(mensual[clave], esc)
                    puntajes.extend(aptitud(c, clima) for c in cultivos_seq)
                evidencia = ["lluvia", "balance"] if estrategia["id"] == "actual" else (
                    ["vigor", "balance"] if estrategia["id"] == "legumbre" else ["calor", "erosion"])
                filas.append(dict(
                    zona=zona, escenario=esc["id"], estrategia=estrategia["id"],
                    cultivos="|".join(ids), puntaje=round(mean(puntajes), 2),
                    agua=round(mean(c["agua"] for c in cultivos_seq), 1),
                    cobertura=round(mean(c["cobertura"] for c in cultivos_seq), 2),
                    nitrogeno=any(c["fijador_n"] for c in cultivos_seq),
                    evidencia="|".join(evidencia),
                ))
    return filas


def escribir_tablas(zonas: list[dict], series: dict[str, dict[str, dict]]) -> None:
    ORO.mkdir(parents=True, exist_ok=True)
    hechos, vista = hechos_clima(series)
    escribir_csv(ORO / "dim_tiempo.csv", ["id", *PASOS], dimension_tiempo(hechos))
    escribir_csv(ORO / "dim_espacio.csv",
                 ["id", "nombre", "capital", "estados", "lat", "lon", "altura_m", "pendiente_pct",
                  "cultivos", "descripcion"],
                 [{**z, "estados": "|".join(z["estados"]), "cultivos": "|".join(z["cultivos"])}
                  for z in zonas])
    escribir_csv(ORO / "dim_indicador.csv",
                 ["id", "nombre", "unidad", "fuente", "resolucion", "umbral", "descripcion",
                  "proxy", "confianza"], INDICADORES)
    escribir_csv(ORO / "dim_cultivo.csv",
                 ["id", "nombre", "familia", "ciclo", "temp_opt", "temp_max", "agua", "sequia",
                  "fijador_n", "cobertura", "forraje", "mercado"], CULTIVOS)
    escribir_csv(ORO / "dim_prioridad.csv", ["id", "nombre", "descripcion"], PRIORIDADES)
    escribir_csv(ORO / "dim_estrategia.csv", ["id", "nombre", "descripcion"], ESTRATEGIAS)
    escribir_csv(ORO / "dim_escenario.csv", ["id", "nombre", "temp", "lluvia"], ESCENARIOS)
    escribir_csv(ORO / "dim_fuente.csv", ["id", "nombre", "detalle", "url", "tipo", "live"], FUENTES)
    escribir_csv(ORO / "fact_clima_mensual.csv",
                 ["zona", "tiempo", "indicador", "valor", "anomalia", "percentil", "confianza"], hechos)
    escribir_csv(ORO / "fact_recomendacion.csv",
                 ["zona", "fecha", "tipo", "severidad", "texto", "evidencia", "confianza"],
                 recomendaciones(series))
    escribir_csv(ORO / "fact_rotacion.csv",
                 ["zona", "escenario", "estrategia", "cultivos", "puntaje", "agua", "cobertura",
                  "nitrogeno", "evidencia"], rotaciones(series, zonas))
    escribir_csv(ORO / "agg_clima_resumen.csv",
                 ["zona", "lluvia_media", "et0_media", "calor_medio", "heladas_medias", "balance_medio"],
                 resumen(series))
    escribir_csv(ORO / "vista_zona_mes.csv", CAMPOS_VISTA, vista)
    print(f"  -> {len(hechos)} hechos climáticos y {len(vista)} filas de vista ancha")


def leer_tabla(nombre: str) -> list[dict]:
    with (ORO / nombre).open(encoding="utf-8", newline="") as manejador:
        return list(csv.DictReader(manejador))


def exportar_json(filas_clima: int) -> dict:
    """Reconstruye el JSON de servicio leyendo las tablas CSV de la capa oro."""
    tiempo = [{**f, "anio": int(f["anio"]), "mes": int(f["mes"]),
               "trimestre": int(f["trimestre"])} for f in leer_tabla("dim_tiempo.csv")]
    espacio = [{**z, "lat": float(z["lat"]), "lon": float(z["lon"]),
                "altura_m": float(z["altura_m"]), "pendiente_pct": float(z["pendiente_pct"]),
                "estados": z["estados"].split("|"), "cultivos": z["cultivos"].split("|")}
               for z in leer_tabla("dim_espacio.csv")]
    indicador = [{**i, "proxy": i["proxy"] == "True", "confianza": float(i["confianza"])}
                 for i in leer_tabla("dim_indicador.csv")]
    cultivo = [{**c, **{k: int(c[k]) for k in ["ciclo", "temp_opt", "temp_max"]},
                "agua": float(c["agua"]), "sequia": float(c["sequia"]),
                "fijador_n": c["fijador_n"] == "True", "cobertura": float(c["cobertura"]),
                "forraje": c["forraje"] == "True", "mercado": float(c["mercado"])}
               for c in leer_tabla("dim_cultivo.csv")]
    clima = [{**h, "anomalia": float(h["anomalia"]), "percentil": float(h["percentil"]),
              "confianza": float(h["confianza"]), "valor": float(h["valor"])}
             for h in leer_tabla("fact_clima_mensual.csv")]
    recomendacion = [{**r, "evidencia": r["evidencia"].split("|"),
                      "confianza": float(r["confianza"])} for r in leer_tabla("fact_recomendacion.csv")]
    rotacion = [{**r, "puntaje": float(r["puntaje"]), "agua": float(r["agua"]),
                 "cobertura": float(r["cobertura"]), "nitrogeno": r["nitrogeno"] == "True",
                 "cultivos": r["cultivos"].split("|"), "evidencia": r["evidencia"].split("|")}
                for r in leer_tabla("fact_rotacion.csv")]
    resumen_tabla = leer_tabla("agg_clima_resumen.csv")
    resumen = {r["zona"]: {k: float(v) for k, v in r.items() if k != "zona"} for r in resumen_tabla}
    vista: dict[str, dict[str, dict]] = {}
    for fila in leer_tabla("vista_zona_mes.csv"):
        vista.setdefault(fila["zona"], {})[fila["tiempo"]] = {
            k: float(v) for k, v in fila.items() if k not in ("zona", "tiempo")
        }

    return {
        "meta": {
            "proyecto": "SurcoVE",
            "generado": datetime.now(timezone.utc).isoformat(),
            "periodo": "2001-01 a 2025-12",
            "patron": "medallion: bronce -> plata -> oro (tablas CSV)",
            "grano_hecho_clima": "estado x mes x indicador",
            "filas_clima": filas_clima,
            "nota": "Datos NASA POWER reales. Indicadores marcados como proxy no son productos NASA directos.",
        },
        "dimensiones": {
            "tiempo": tiempo, "espacio": espacio, "indicador": indicador, "cultivo": cultivo,
            "prioridad": leer_tabla("dim_prioridad.csv"),
            "estrategia": leer_tabla("dim_estrategia.csv"),
            "escenario": [{**e, "temp": int(e["temp"]), "lluvia": int(e["lluvia"])}
                          for e in leer_tabla("dim_escenario.csv")],
            "fuente": [{**f, "live": f["live"] == "True"} for f in leer_tabla("dim_fuente.csv")],
        },
        "hechos": {
            "clima_mensual": clima, "recomendacion": recomendacion,
            "rotacion": rotacion, "clima_resumen": resumen,
        },
        "vista": vista,
    }


def main() -> None:
    zonas = leer_estados()
    series = leer_plata()
    if not series:
        raise FileNotFoundError("No hay CSV en la capa plata. Ejecuta plata.py primero.")
    print("[oro] escribiendo tablas CSV ...", flush=True)
    escribir_tablas(zonas, series)
    filas = sum(1 for _ in leer_tabla("fact_clima_mensual.csv"))
    gold = exportar_json(filas)
    contenido = json.dumps(gold, ensure_ascii=False, separators=(",", ":"))
    destino = ORO / "gold.json"
    destino.write_text(contenido, encoding="utf-8")
    publico = ROOT.parent / "public"
    publico.mkdir(parents=True, exist_ok=True)
    (publico / "gold.json").write_text(contenido, encoding="utf-8")
    print(f"Listo: {len(list(ORO.glob('*.csv')))} tablas CSV + gold.json "
          f"({destino.stat().st_size / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
