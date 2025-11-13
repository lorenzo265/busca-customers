from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List

from app.models.schemas import RecordSchema, SearchRequest
from app.services.search_service import SearchService


@dataclass
class DummyProvider:
    expected_records: List[Dict[str, object]]

    def find_rows(self, filters, limit):
        self.filters = filters
        self.limit = limit
        return self.expected_records


def test_search_service_returns_record_schemas():
    records = [
        {"UF": "SP", "CNPJ": "123", "TICO_CODIGO": "3"},
        {"UF": "SP", "CNPJ": "456", "TICO_CODIGO": "3"},

    ]
    provider = DummyProvider(expected_records=records)
    service = SearchService(data_provider=provider)

    response = service.search_records(SearchRequest(UF="SP", Quantity=2))

    assert all(isinstance(item, RecordSchema) for item in response)
    assert provider.filters == {"UF": "SP"}
    assert provider.limit == 2


def test_search_service_respects_contribuinte_mapping():

    provider = DummyProvider(expected_records=[{"UF": "RJ", "TICO_CODIGO": "6"}])

    service = SearchService(data_provider=provider)

    response = service.search_records(SearchRequest(UF="RJ", Contribuinte=False))

    assert response[0].UF == "RJ"

    assert provider.filters == {"UF": "RJ", "TICO_CODIGO": "6"}
    assert provider.limit is None


def test_search_service_ignores_placeholder_values():
    # o provider vai devolver sempre essa linha
    records = [{"UF": "SP", "TICO_CODIGO": "3"}]
    provider = DummyProvider(expected_records=records)
    service = SearchService(data_provider=provider)

    # 1ª chamada: usuário mandou vários "string"/"   " -> devem ser ignorados
    response_with_placeholders = service.search_records(
        SearchRequest.model_construct(
            UF="string",          # placeholder
            CNPJ="   ",           # placeholder
            TICO_CODIGO="String", # placeholder
            Contribuinte=True,    # regra válida
        )
    )
    filters_with_placeholders = dict(provider.filters)
    limit_with_placeholders = provider.limit

    # 2ª chamada: só a regra válida
    response_without_placeholders = service.search_records(
        SearchRequest(Contribuinte=True)
    )
    filters_without_placeholders = dict(provider.filters)
    limit_without_placeholders = provider.limit

    # como os placeholders são ignorados, o filtro final tem que ser o mesmo
    assert filters_with_placeholders == {"TICO_CODIGO": "3"}
    assert filters_with_placeholders == filters_without_placeholders

    # não mandamos Quantity, então não deve ter limit
    assert limit_with_placeholders is None
    assert limit_without_placeholders is None

    # e as respostas devem ser iguais
    assert response_with_placeholders == response_without_placeholders



