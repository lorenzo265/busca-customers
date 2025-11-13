"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { SearchRequest, SearchResponse } from "@/types/search";

export function useSearch(initialRequest?: SearchRequest) {
  const [payload, setPayload] = useState<SearchRequest | null>(initialRequest ?? null);

  const canExecute = Boolean(
    payload &&
      ((payload.query && payload.query.trim().length > 0) ||
        Object.keys(payload.filters ?? {}).length > 0)
  );

  const query = useQuery({
    queryKey: ["search", payload],
    queryFn: () =>
      apiFetch<SearchResponse>("/search", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    enabled: canExecute
  });

  return {
    ...query,
    payload,
    search: (request: SearchRequest) => setPayload(request),
    clear: () => setPayload(null)
  };
}