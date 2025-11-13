from __future__ import annotations

from typing import List

from app.data_providers.csv_provider import CSVDataProvider
from app.domain.query_normalizer import NormalizedQuery, normalize_search_query
from app.models.schemas import RecordSchema, SearchRequest


class SearchServiceError(Exception):
    """Erro de domínio para buscas inválidas (ex.: coluna desconhecida)."""
    pass


class DataFileNotFound(SearchServiceError):
    """Arquivo de dados (CSV) não encontrado."""
    pass


class SearchService:
    def __init__(self, data_provider: CSVDataProvider | None = None) -> None:
        self._data_provider = data_provider or CSVDataProvider()

    def search_records(self, request: SearchRequest) -> List[RecordSchema]:
        # 1) normaliza o que veio da API (Contribuinte -> TICO_CODIGO, extrai limit)
        normalized_query: NormalizedQuery = normalize_search_query(request)

        # 2) busca no provider, traduzindo erros para o domínio
        try:
            raw_records = self._data_provider.find_rows(
                normalized_query.filters,
                normalized_query.limit,
            )
        except FileNotFoundError as exc:
            raise DataFileNotFound(str(exc)) from exc
        except ValueError as exc:
            raise SearchServiceError(str(exc)) from exc

        # 3) valida e normaliza saída via Pydantic
        return [RecordSchema(**r) for r in raw_records]


