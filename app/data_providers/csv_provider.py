from __future__ import annotations
import os
from pathlib import Path
from typing import Any, Dict, List
import pandas as pd

# app/data_providers/csv_provider.py

# pasta "app" (parent do data_providers)
APP_DIR = Path(__file__).resolve().parent.parent
# default: app/data/base.csv (ajuste aqui se seu CSV estiver noutro lugar)
DEFAULT_DATA_FILE = APP_DIR / "data" / "base.csv"

# permite sobrescrever com variável de ambiente DATA_FILE
ENV_DATA_FILE = os.getenv("DATA_FILE")
DATA_FILE = Path(ENV_DATA_FILE).resolve() if ENV_DATA_FILE else DEFAULT_DATA_FILE


class CSVDataProvider:
    def __init__(self, data_file: Path | None = None) -> None:
        self._data_file = Path(data_file) if data_file else DATA_FILE
        if not self._data_file.exists():
            raise FileNotFoundError(
                f"CSV not found: {self._data_file}\n"
                f"Put your file at {DEFAULT_DATA_FILE} or set DATA_FILE env var."
            )

    def find_rows(self, filters: Dict[str, Any], limit: int | None = None) -> List[Dict[str, Any]]:
        df = pd.read_csv(self._data_file, dtype=str, keep_default_na=False, encoding="utf-8-sig").fillna("")
        df.columns = [c.strip() for c in df.columns]
        if "TICO_CODIGO" in df.columns:
            df["TICO_CODIGO"] = df["TICO_CODIGO"].map(lambda s: (s or "").strip().lstrip("0") or ("0" if (s or "").strip() != "" else ""))

        for key, value in filters.items():
            if key in ("Quantity",):
                continue
            if key not in df.columns:
                raise ValueError(f"Unknown column: {key}")
            if key == "TICO_CODIGO":
                norm = (str(value).strip().lstrip("0") or "0") if str(value).strip() != "" else ""
                df = df[df["TICO_CODIGO"] == norm]
            else:
                df = df[df[key].astype(str) == str(value)]

        if limit is not None:
            df = df.head(limit)

        records = df.to_dict(orient="records")
        for r in records:
            for f in ("TICO_CODIGO", "FLAGS", "ENTE_FEDERATIVO", "INSCR_SUFRAMA"):
                if r.get(f) == "":
                    r[f] = None
        return records
