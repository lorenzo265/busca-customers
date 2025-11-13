"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SearchRequest } from "@/types/search";

const STORAGE_KEY = "codex:saved-filters";

export interface SavedFilter {
  id: string;
  name: string;
  payload: SearchRequest;
  createdAt: string;
}

export function useSavedFilters() {
  const [filters, setFilters] = useState<SavedFilter[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFilters(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to parse saved filters", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const create = useCallback((name: string, payload: SearchRequest) => {
    setFilters((current) => [
      {
        id: crypto.randomUUID(),
        name,
        payload,
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setFilters((current) => current.filter((item) => item.id !== id));
  }, []);

  const update = useCallback((id: string, name: string) => {
    setFilters((current) =>
      current.map((item) => (item.id === id ? { ...item, name } : item))
    );
  }, []);

  return useMemo(
    () => ({
      filters,
      create,
      remove,
      update
    }),
    [filters, create, remove, update]
  );
}
