from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd

from app.data_providers.csv_provider import CSVDataProvider


def _write_csv(path: Path, rows: list[dict[str, Any]]) -> Path:
    pd.DataFrame(rows).to_csv(path, index=False)
    return path


def test_find_rows_without_filters_returns_all_columns(tmp_path: Path) -> None:
    csv_path = _write_csv(
        tmp_path / "dataset.csv",
        [
            {
                "UF": "SP",
                "CNPJ": "123",
                "CEP": "01001000",
                "IE": "ISENTO",
                "FLAGS": "REV",
                "IND_ORGAO_GOVERNAMENTAL": "N",
                "COD_NATUREZA_JURIDICA": "2062",
                "TICO_CODIGO": "6",
                "ENTE_FEDERATIVO": "",
                "INSCR_SUFRAMA": "",
            }
        ],
    )

    provider = CSVDataProvider(data_file=csv_path)

    rows = provider.find_rows({}, None)

    assert len(rows) == 1
    row = rows[0]
    # garante que os campos do schema vieram
    for field in (
        "UF",
        "CNPJ",
        "CEP",
        "IE",
        "FLAGS",
        "IND_ORGAO_GOVERNAMENTAL",
        "COD_NATUREZA_JURIDICA",
        "TICO_CODIGO",
        "ENTE_FEDERATIVO",
        "INSCR_SUFRAMA",
    ):
        assert field in row
    assert row["UF"] == "SP"


def test_tico_codigo_filter_accepts_leading_zero_values(tmp_path: Path) -> None:
    csv_path = _write_csv(
        tmp_path / "dataset.csv",
        [
            {
                "UF": "PR",
                "CNPJ": "456",
                "CEP": "80000000",
                "IE": "ISENTO",
                "FLAGS": "",
                "IND_ORGAO_GOVERNAMENTAL": "N",
                "COD_NATUREZA_JURIDICA": "2062",
                "TICO_CODIGO": "03",
                "ENTE_FEDERATIVO": "",
                "INSCR_SUFRAMA": "",
            },
            {
                "UF": "SP",
                "CNPJ": "789",
                "CEP": "01002000",
                "IE": "ISENTO",
                "FLAGS": "",
                "IND_ORGAO_GOVERNAMENTAL": "N",
                "COD_NATUREZA_JURIDICA": "2062",
                "TICO_CODIGO": "06",
                "ENTE_FEDERATIVO": "",
                "INSCR_SUFRAMA": "",
            },
        ],
    )

    provider = CSVDataProvider(data_file=csv_path)

    rows = provider.find_rows({"TICO_CODIGO": 3}, None)

    assert len(rows) == 1
    assert rows[0]["UF"] == "PR"
    # aqui decide se quer valor normalizado ou original:
    assert rows[0]["TICO_CODIGO"] in ("3", "03")

