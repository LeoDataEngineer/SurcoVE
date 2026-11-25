"""Capa PLATA: limpieza, casteo, control de calidad y agregación mensual."""
from __future__ import annotations

import csv
import json
import math
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BRONCE = ROOT / "data" / "bronce"
PLATA = ROOT / "data" / "plata"
RA_MJ = [32, 35, 37, 38, 38, 36, 36, 37, 36, 34, 32, 31]


def limite(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return round(max(lo, min(hi, v)), 2)


def leer_estados() -> list[dict]:
    return json.loads((ROOT / "estados.json").read_text(encoding="utf-8"))


def escribir_csv(ruta: Path, columnas: list[str], filas: list[dict]) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    with ruta.open("w", newline="", encoding="utf-8") as manejador:
        escritor = csv.DictWriter(manejador, fieldnames=columnas)
        escritor.writeheader()
        for fila in filas:
            escritor.writerow({c: fila.get(c, "") for c in columnas})

CAMPOS = ["tiempo", "t2m", "tmax", "tmin", "lluvia", "humedad", "calor",
          "heladas", "et0", "lluvia_max", "balance", "vigor", "erosion", "dq_flag"]


def mensualizar(crudo: dict) -> dict[str, dict]:
    param = crudo["properties"]["parameter"]
    acum: dict[str, dict] = {}
    for fecha in sorted(param["T2M"].keys()):
        clave = f"{fecha[:4]}-{fecha[4:6]}"
        fila = acum.setdefault(clave, dict(t2m=[], tmax=[], tmin=[], lluvia=[], humedad=[],
                                           calor=0, heladas=0, et0=0.0, lluvia_max=0.0))
        t2m = param["T2M"][fecha]
        tmax = param["T2M_MAX"][fecha]
        tmin = param["T2M_MIN"][fecha]
        lluvia = param["PRECTOTCORR"][fecha]
        hum = param["RH2M"][fecha]
        if min(t2m, tmax, tmin, hum) <= -900 or lluvia <= -900:
            continue
        fila["t2m"].append(t2m)
        fila["tmax"].append(tmax)
        fila["tmin"].append(tmin)
        fila["lluvia"].append(lluvia)
        fila["humedad"].append(hum)
        if tmax >= 32:
            fila["calor"] += 1
        if tmin <= 2:
            fila["heladas"] += 1
        fila["lluvia_max"] = max(fila["lluvia_max"], lluvia)
        ra = RA_MJ[int(fecha[4:6]) - 1]
        fila["et0"] += 0.0023 * (t2m + 17.8) * math.sqrt(max(tmax - tmin, 0.0)) * ra

    salida: dict[str, dict] = {}
    for clave, fila in acum.items():
        if not fila["t2m"]:
            continue
        tmax_medio = statistics.mean(fila["tmax"])
        pp = round(sum(fila["lluvia"]), 1)
        et0 = round(fila["et0"], 1)
        balance = round(pp - et0, 1)
        vigor = limite(40 + 0.15 * min(pp, 300) - 0.25 * max(0, -balance)
                       - 1.5 * max(0, tmax_medio - 30))
        salida[clave] = dict(
            t2m=round(statistics.mean(fila["t2m"]), 2),
            tmax=round(tmax_medio, 2),
            tmin=round(statistics.mean(fila["tmin"]), 2),
            lluvia=pp,
            humedad=round(statistics.mean(fila["humedad"]), 1),
            calor=fila["calor"],
            heladas=fila["heladas"],
            et0=et0,
            lluvia_max=round(fila["lluvia_max"], 1),
            balance=balance,
            vigor=round(vigor, 1),
        )
    return salida


def main() -> None:
    PLATA.mkdir(parents=True, exist_ok=True)
    for zona in leer_estados():
        origen = BRONCE / f"power_{zona['id']}.json"
        if not origen.exists():
            raise FileNotFoundError(f"Falta capa bronce: {origen}. Ejecuta bronce.py primero.")
        print(f"[plata] {zona['nombre']} ...", flush=True)
        crudo = json.loads(origen.read_text(encoding="utf-8"))
        mensual = mensualizar(crudo)
        filas = []
        for tiempo in sorted(mensual):
            fila = dict(mensual[tiempo])
            fila["erosion"] = round(limite(12 + zona["pendiente_pct"] * 1.6
                                             + fila["lluvia_max"] * 0.9), 2)
            fila["dq_flag"] = "ok" if fila["lluvia"] >= 0 else "revisar"
            filas.append({"tiempo": tiempo, **fila})
        destino = PLATA / f"mensual_{zona['id']}.csv"
        escribir_csv(destino, CAMPOS, filas)
        print(f"  -> {destino.name} ({len(filas)} meses)")


if __name__ == "__main__":
    main()
