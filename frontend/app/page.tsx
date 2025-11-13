"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type FieldType = "string" | "boolean" | "int";

interface SchemaResponse {
  fields: Record<string, FieldType>;
}

interface SearchRow {
  [key: string]: string | number | boolean | null;
}

interface SearchResponse {
  count: number;
  results: SearchRow[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Page() {
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [searchResult, setSearchResult] = useState<SearchResponse>({
    count: 0,
    results: [],
  });
  const [loadingSchema, setLoadingSchema] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoadingSchema(true);
    fetch(`${API_URL}/schema`)
      .then((r) => r.json())
      .then((data: SchemaResponse) => {
        setSchema(data);
        const base: Record<string, any> = {};
        Object.keys(data.fields).forEach((k) => (base[k] = ""));
        setFieldValues(base);
        setSelectedFields(["UF", "Contribuinte", "Quantity"].filter((f) =>
          Object.keys(data.fields).includes(f)
        ));
      })
      .catch(() => setError("Erro ao carregar o schema do backend."))
      .finally(() => setLoadingSchema(false));
  }, []);

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field)
        ? prev.filter((f) => f !== field)
        : [...prev, field]
    );
  };

  const handleFieldValueChange = (field: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const runSearch = async () => {
    if (!schema) return;
    if (selectedFields.length === 0) {
      setError("Selecione pelo menos um campo na barra da esquerda.");
      return;
    }

    const payload: Record<string, any> = {};

    for (const field of selectedFields) {
      const type = schema.fields[field];
      const rawValue = fieldValues[field];

      if (rawValue === "" || rawValue === null || typeof rawValue === "undefined") {
        continue;
      }

      if (type === "int") {
        const n = Number(rawValue);
        if (!Number.isNaN(n) && n > 0) {
          payload[field] = n;
        } else {
          setError(`O campo ${field} precisa ser um número maior que 0.`);
          return;
        }
      } else if (type === "boolean") {
        if (rawValue === "true" || rawValue === true) {
          payload[field] = true;
        } else if (rawValue === "false" || rawValue === false) {
          payload[field] = false;
        } else {
          continue;
        }
      } else {
        payload[field] = String(rawValue).trim();
      }
    }

    if (Object.keys(payload).length === 0) {
      setError("Preencha pelo menos um valor nos campos selecionados.");
      return;
    }

    setLoadingSearch(true);
    setError("");

    try {
      const resp = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt);
      }

      const data: SearchResponse = await resp.json();
      setSearchResult(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao buscar dados.");
    } finally {
      setLoadingSearch(false);
    }
  };

  const clearAll = () => {
    if (!schema) return;
    const base: Record<string, any> = {};
    Object.keys(schema.fields).forEach((k) => (base[k] = ""));
    setFieldValues(base);
    setSelectedFields([]);
    setSearchResult({ count: 0, results: [] });
    setError("");
  };

  const exportCsv = async () => {
    if (!searchResult.results.length) return;
    const resp = await fetch(`${API_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: searchResult.results,
        format: "csv",
      }),
    });
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // AQUI está o ajuste: mandando "xslsx" para combinar com teu backend antigo
  const exportXlsx = async () => {
    if (!searchResult.results.length) return;
    const resp = await fetch(`${API_URL}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: searchResult.results,
        format: "xslsx", // <- se você já arrumou o backend, troque para "xlsx"
      }),
    });
    if (!resp.ok) {
      console.error("Falha ao exportar XLSX", await resp.text());
      return;
    }
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex bg-[#0F2744]">
      {/* sidebar */}
      <aside className="w-64 bg-[#0F2744] text-white flex flex-col gap-6 p-6">
        <h1 className="text-xl font-bold tracking-tight">B-CSV</h1>

        <div>
          <h2 className="text-sm font-semibold mb-3">Filtros</h2>
          <div className="flex gap-2 mb-4">
            <Button
              variant="primary"
              onClick={runSearch}
              isLoading={loadingSearch}
              className="flex-1"
            >
              Apply
            </Button>
            <Button variant="ghost" onClick={clearAll}>
              Clear
            </Button>
          </div>

          {loadingSchema ? (
            <p className="text-xs text-white/60">Carregando campos…</p>
          ) : null}

          {schema && (
            <div className="flex flex-col gap-2 max-h-[420px] overflow-auto pr-1">
              {Object.keys(schema.fields).map((field) => (
                <label key={field} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field)}
                    onChange={() => toggleField(field)}
                  />
                  <span>{field}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-white/10 text-center">
          <img
            src="/Dell-Logo.png"
            alt="Dell logo"
            className="w-20 mx-auto mb-2 filter brightness-0 invert"
          />
          <p className="text-xs text-white/60">Dell Technologies</p>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 bg-[#F4F6FA] rounded-l-3xl p-8 flex gap-6">
        <div className="flex-1 flex flex-col gap-4">
          {/* linha de planilha */}
          <Card className="p-4 flex flex-wrap gap-4 items-end">
            {selectedFields.length === 0 ? (
              <p className="text-sm text-slate-400">
                Selecione campos na esquerda para preencher aqui.
              </p>
            ) : null}

            {schema &&
              selectedFields.map((field) => {
                const type = schema.fields[field];
                if (type === "boolean") {
                  return (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">
                        {field}
                      </label>
                      <select
                        value={fieldValues[field] ?? ""}
                        onChange={(e) => handleFieldValueChange(field, e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
                      >
                        <option value="">—</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </div>
                  );
                }
                if (type === "int") {
                  return (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">
                        {field}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={fieldValues[field] ?? ""}
                        onChange={(e) => handleFieldValueChange(field, e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm w-28"
                      />
                    </div>
                  );
                }
                return (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-500">
                      {field}
                    </label>
                    <Input
                      value={fieldValues[field] ?? ""}
                      onChange={(e) => handleFieldValueChange(field, e.target.value)}
                      className="w-52 bg-white"
                      placeholder={`Valor para ${field}`}
                    />
                  </div>
                );
              })}

            <Button onClick={runSearch} isLoading={loadingSearch} className="h-9">
              Search
            </Button>
          </Card>

          {error && (
            <Card className="bg-red-50 border-red-200 text-red-700 px-4 py-2 text-sm">
              {error}
            </Card>
          )}

          {/* tabela */}
          <Card className="flex-1 overflow-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold text-slate-800">Results</h2>
              <span className="text-xs text-slate-400">
                {searchResult.count} found
              </span>
            </div>
            <div className="overflow-auto max-h-[540px]">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    {(searchResult.results[0]
                      ? Object.keys(searchResult.results[0])
                      : selectedFields
                    ).map((col) => (
                      <th
                        key={col}
                        className="text-left px-4 py-2 text-xs font-semibold text-slate-500"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {searchResult.results.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-slate-400 text-sm"
                        colSpan={selectedFields.length || 1}
                      >
                        Nenhum resultado ainda. Marque campos e preencha acima.
                      </td>
                    </tr>
                  ) : (
                    searchResult.results.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-t border-slate-100 hover:bg-slate-50 transition"
                      >
                        {(searchResult.results[0]
                          ? Object.keys(searchResult.results[0])
                          : selectedFields
                        ).map((col) => (
                          <td
                            key={col}
                            className={`px-4 py-2 ${
                              selectedFields.includes(col)
                                ? "font-semibold text-slate-800"
                                : "text-slate-400"
                            }`}
                          >
                            {row[col] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* direita */}
        <div className="w-56">
          <Card className="p-4 space-y-3">
            <h2 className="font-semibold text-slate-800 mb-2">Export</h2>
            <Button
              variant="secondary"
              onClick={exportCsv}
              disabled={!searchResult.results.length}
            >
              Export CSV
            </Button>
            <Button
              variant="ghost"
              onClick={exportXlsx}
              disabled={!searchResult.results.length}
            >
              Export XLSX
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
