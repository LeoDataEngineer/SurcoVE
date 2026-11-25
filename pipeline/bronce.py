"""Capa BRONCE: ingesta cruda e inmutable de NASA POWER."""
from __future__ import annotations

import hashlib
import json
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BRONCE = ROOT / "data" / "bronce"
PARAMETROS = ["T2M", "T2M_MAX", "T2M_MIN", "PRECTOTCORR", "RH2M", "ALLSKY_SFC_SW_DWN"]


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def url_power(zona: dict) -> str:
    params = ",".join(PARAMETROS)
    return (f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters={params}"
            f"&community=AG&longitude={zona['lon']}&latitude={zona['lat']}"
            f"&start=20010101&end=20251231&format=JSON")


def leer_estados() -> list[dict]:
    return json.loads((ROOT / "estados.json").read_text(encoding="utf-8"))


def obtener_bronce(zona: dict) -> tuple[dict, dict]:
    BRONCE.mkdir(parents=True, exist_ok=True)
    destino = BRONCE / f"power_{zona['id']}.json"
    url = url_power(zona)
    if destino.exists():
        datos = destino.read_bytes()
        crudo = json.loads(datos.decode("utf-8"))
        manifest = dict(
            zona=zona["id"], url=url, archivo=destino.name, sha256=sha256(datos),
            descargado=False, filas=len(next(iter(crudo["properties"]["parameter"].values()))),
        )
        return crudo, manifest
    for intento in range(3):
        try:
            with urllib.request.urlopen(url, timeout=120) as respuesta:
                datos = respuesta.read()
            destino.write_bytes(datos)
            crudo = json.loads(datos.decode("utf-8"))
            manifest = dict(
                zona=zona["id"], url=url, archivo=destino.name, sha256=sha256(datos),
                descargado=True, filas=len(next(iter(crudo["properties"]["parameter"].values()))),
            )
            return crudo, manifest
        except Exception as exc:  # pragma: no cover - depende de red
            if intento == 2:
                raise RuntimeError(f"No se pudo descargar POWER para {zona['id']}: {exc}") from exc
    raise AssertionError


def main() -> None:
    entradas = []
    for zona in leer_estados():
        print(f"[bronce] {zona['nombre']} ...", flush=True)
        _, manifest = obtener_bronce(zona)
        entradas.append(manifest)
    manifiesto = BRONCE / "manifiesto_ingesta.json"
    manifiesto.write_text(
        json.dumps(dict(generado=datetime.now(timezone.utc).isoformat(), entradas=entradas),
                   ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Listo: {len(entradas)} archivos crudos + {manifiesto.name}")


if __name__ == "__main__":
    main()
