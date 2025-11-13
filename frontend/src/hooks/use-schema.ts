"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { SchemaResponse } from "@/types/search";

export function useSchema() {
  return useQuery({
    queryKey: ["schema"],
    queryFn: () => apiFetch<SchemaResponse>("/schema"),
    staleTime: 1000 * 60 * 5
  });
}