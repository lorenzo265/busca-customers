from __future__ import annotations

from io import BytesIO

import pandas as pd

from app.models.schemas import ExportRequest, ExportedFile


class ExportService:
    CSV_MEDIA_TYPE = "text/csv"
    XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    # define a ordem e o conjunto de colunas que devem sempre aparecer
    ALL_COLUMNS = [
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
    ]

    def export_records(self, request: ExportRequest) -> ExportedFile:
        # converte os modelos Pydantic em dicionários completos, incluindo None
        records = [record.model_dump(mode="python", exclude_none=False) for record in request.data]

        # cria DataFrame com todas as colunas, mesmo que vazias
        data_frame = pd.DataFrame(records, columns=self.ALL_COLUMNS)

        # garante que campos None apareçam como vazios, não “NaN”
        data_frame = data_frame.fillna("")

        if request.format == "csv":
            content = data_frame.to_csv(index=False, encoding="utf-8", sep="|").encode("utf-8")
            return ExportedFile(
                content=content,
                media_type=self.CSV_MEDIA_TYPE,
                filename="export.csv",
            )
        if request.format == "xlsx":
            buffer = BytesIO()
            #precisa de openpyxl instalado
            data_frame.to_excel(buffer, index=False)
            buffer.seek(0)
            return ExportedFile(
                content=buffer.read(),
                media_type=self.XLSX_MEDIA_TYPE,
                filename="export.xlsx",
            )

        raise ValueError("Unsupported export format")
