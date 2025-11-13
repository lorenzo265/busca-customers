"use client";

import { useMutation } from "@tanstack/react-query";
import type { ExportFormat, ExportRequest } from "@/types/search";

async function exportRequest({ format, ...payload }: ExportRequest) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...payload, format })
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao exportar os dados");
  }

  const blob = await response.blob();
  return { blob, format };
}

export function useExport() {
  return useMutation({
    mutationKey: ["export"],
    mutationFn: (payload: ExportRequest) => exportRequest(payload)
  });
}

export async function downloadBlob(blob: Blob, format: ExportFormat, prefix = "codex-export") {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${prefix}.${format}`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}