#!/usr/bin/env python3
"""Orquestador del pipeline ELT: bronce -> plata -> oro.

Las capas también se pueden ejecutar de forma independiente:
    python pipeline/bronce.py
    python pipeline/plata.py
    python pipeline/oro.py

Ejecutar todo:
    python pipeline/orquestador.py
"""
from __future__ import annotations

import bronce
import oro
import plata


def main() -> None:
    print("=== BRONCE ===", flush=True)
    bronce.main()
    print("=== PLATA ===", flush=True)
    plata.main()
    print("=== ORO ===", flush=True)
    oro.main()


if __name__ == "__main__":
    main()
