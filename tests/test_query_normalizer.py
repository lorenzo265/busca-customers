import pytest

from app.domain.query_normalizer import normalize_search_query
from app.models.schemas import SearchRequest


def test_contribuinte_true_sets_expected_tico():


    request = SearchRequest(UF="SP", Contribuinte=True, Quantity=5)

    normalized = normalize_search_query(request)

    assert normalized.filters["UF"] == "SP"

    assert normalized.filters["TICO_CODIGO"] == "3"   # era 3

    assert normalized.limit == 5


def test_contribuinte_false_sets_expected_tico():
    request = SearchRequest(Contribuinte=False)

    normalized = normalize_search_query(request)


    assert normalized.filters["TICO_CODIGO"] == "6"   # era 6

    assert normalized.limit is None


def test_explicit_tico_is_not_overridden_by_contribuinte():
    # usuário mandou explicitamente o tico
    request = SearchRequest(TICO_CODIGO="8", Contribuinte=True, Quantity=1)

    normalized = normalize_search_query(request)

    # se veio explícito, não troca
    assert normalized.filters["TICO_CODIGO"] == "8"
    assert normalized.limit == 1


def test_placeholder_strings_are_filtered_out():
    # model_construct pra montar rápido sem validação
    request = SearchRequest.model_construct(
        UF=" string ",
        CNPJ="12345678901234",
        IE="   ",
        TICO_CODIGO="String",
        Contribuinte=True,
    )

    normalized = normalize_search_query(request)

    # " string " vira placeholder -> some
    assert "UF" not in normalized.filters
    # "   " também some
    assert "IE" not in normalized.filters
    # CNPJ válido fica
    assert normalized.filters["CNPJ"] == "12345678901234"
    # como TICO veio placeholder, e veio Contribuinte=True, cai na regra e vira "3"
    assert normalized.filters["TICO_CODIGO"] == "3"


def test_ignores_unknown_fields():
    # pydantic v2: model_validate
    request = SearchRequest.model_validate({"UF": "RJ", "Unknown": "value"})

    normalized = normalize_search_query(request)

    assert normalized.filters == {"UF": "RJ"}


@pytest.mark.parametrize("quantity", [None, 1, 5])
def test_limit_values(quantity):
    request = SearchRequest(Quantity=quantity) if quantity is not None else SearchRequest()

    normalized = normalize_search_query(request)

    expected = quantity if quantity is not None else None
    assert normalized.limit == expected
