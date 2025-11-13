from __future__ import annotations

from typing import Any, Dict, NamedTuple

from app.models.schemas import SearchRequest

ALLOWED_FILTER_FIELDS = {
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
}


# valores que o front costuma mandar só pra preencher, mas não devem filtrar
PLACEHOLDER_STRINGS = {"", "string", " ", "null", "none"}


def _is_placeholder_value(value: Any) -> bool:
    if isinstance(value, str):
        normalized = value.strip().casefold()
        return normalized in PLACEHOLDER_STRINGS
    return False



class NormalizedQuery(NamedTuple):
    filters: Dict[str, Any]
    limit: int | None


def normalize_search_query(request: SearchRequest) -> NormalizedQuery:
    payload = request.model_dump(exclude_unset=True)

    limit = payload.pop("Quantity", None)
    contrib = payload.pop("Contribuinte", None)


    # mantém só campos permitidos, com valor, e que NÃO são placeholder
    filters: Dict[str, Any] = {
        key: value
        for key, value in payload.items()
        if key in ALLOWED_FILTER_FIELDS
        and value is not None
        and not _is_placeholder_value(value)
    }

    # se veio contribuinte mas não veio TICO_CODIGO, definimos nós
    if contrib is not None and "TICO_CODIGO" not in filters:
        filters["TICO_CODIGO"] = "3" if contrib else "6"

    # normaliza o limit
    limit_value = max(int(limit), 1) if isinstance(limit, int) else None

    return NormalizedQuery(filters=filters, limit=limit_value)
