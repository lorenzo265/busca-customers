"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Download,
  Filter,
  History,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Trash2
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { useExport, downloadBlob } from "@/hooks/use-export";
import { useSavedFilters } from "@/hooks/use-saved-filters";
import { useSchema } from "@/hooks/use-schema";
import { useSearch } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import type { ExportFormat, SearchField, SearchRequest, SearchResultRecord } from "@/types/search";

const DEFAULT_LIMIT = 50;

export function DashboardShell() {
  const { data: schema, isLoading: loadingSchema } = useSchema();
  const { filters: savedFilters, create: createSavedFilter, remove: removeSavedFilter } = useSavedFilters();
  const { search, clear, data, isFetching, error } = useSearch();
  const exportMutation = useExport();

  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("Arquivo exportado com sucesso");

  const totalResults = data?.total ?? 0;

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, value]) => value !== "" && value !== null && value !== undefined)
        .map(([key, value]) => ({ key, value })),
    [filters]
  );

  const handleFilterChange = (field: SearchField, value: string | number | boolean) => {
    setFilters((current) => ({
      ...current,
      [field.name]: value
    }));
  };

  const handleSearch = () => {
    const payload: SearchRequest = {
      query,
      filters: Object.fromEntries(activeFilters.map(({ key, value }) => [key, value])),
      limit
    };
    search(payload);
  };

  const handleClear = () => {
    setQuery("");
    setLimit(DEFAULT_LIMIT);
    setFilters({});
    clear();
  };

  const handleSavedFilterApply = (request: SearchRequest) => {
    setQuery(request.query);
    setFilters(request.filters);
    setLimit(request.limit ?? DEFAULT_LIMIT);
    search(request);
  };

  const handleExport = (format: ExportFormat) => {
    const payload: SearchRequest = {
      query,
      filters: Object.fromEntries(activeFilters.map(({ key, value }) => [key, value])),
      limit
    };

    exportMutation.mutate(
      { format, query: payload.query, filters: payload.filters },
      {
        onSuccess: async ({ blob }) => {
          await downloadBlob(blob, format);
          setToastMessage(`Arquivo ${format.toUpperCase()} exportado com sucesso`);
          setToastOpen(true);
        },
        onError: () => {
          setToastMessage("Não foi possível exportar os dados. Tente novamente.");
          setToastOpen(true);
        }
      }
    );
  };

  const handleSaveCurrentFilters = () => {
    if (!query && activeFilters.length === 0) return;
    const name = prompt("Nomeie esta combinação de filtros");
    if (!name) return;
    createSavedFilter(name, {
      query,
      filters: Object.fromEntries(activeFilters.map(({ key, value }) => [key, value])),
      limit
    });
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-[320px_1fr_280px] gap-6 px-6 py-8 max-xl:grid-cols-[280px_1fr] max-xl:grid-rows-[auto_auto] max-xl:gap-y-4 max-lg:grid-cols-1">
        <aside className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-subtle backdrop-blur-sm max-xl:row-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-codex-slate">Workspace</p>
              <h2 className="text-xl font-semibold">B-CSV Filters</h2>
            </div>
            <Filter className="h-5 w-5 text-codex-blue" />
          </div>
          <div className="mt-6 space-y-5">
            <section>
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Filtros ativos</h3>
                <Button variant="ghost" size="sm" onClick={handleSaveCurrentFilters}>
                  <Sparkles className="h-4 w-4" /> Salvar
                </Button>
              </header>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.length ? (
                  activeFilters.map(({ key, value }) => (
                    <Badge key={key} className="flex items-center gap-1">
                      <span>{key}</span>
                      <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] text-codex-navy">{String(value)}</span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-codex-slate">Nenhum filtro aplicado.</p>
                )}
              </div>
            </section>

            <section>
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Biblioteca</h3>
                <History className="h-4 w-4 text-codex-slate" />
              </header>
              <div className="mt-3 space-y-2">
                {savedFilters.length ? (
                  savedFilters.map((item) => (
                    <div
                      key={item.id}
                      className="flex w-full items-center justify-between gap-2 rounded-2xl border border-transparent bg-white/60 px-4 py-3 text-sm transition hover:border-codex-blue/40 hover:bg-white"
                    >
                      <button
                        type="button"
                        className="flex-1 text-left transition hover:text-codex-blue"
                        onClick={() => handleSavedFilterApply(item.payload)}
                      >
                        <p className="font-medium text-codex-navy">{item.name}</p>
                        <p className="text-xs text-codex-slate">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-transparent p-1 text-codex-slate transition hover:border-red-200 hover:text-red-500"
                        onClick={() => removeSavedFilter(item.id)}
                        aria-label={`Remover filtro ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-codex-slate">Salve combinações frequentes para acessá-las rapidamente.</p>
                )}
              </div>
            </section>

            <section>
              <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Limite de resultados</h3>
                <span className="text-xs text-codex-slate">até 500</span>
              </header>
              <input
                type="range"
                min={10}
                max={500}
                step={10}
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="mt-3 w-full accent-codex-blue"
              />
              <p className="text-sm font-medium text-codex-navy">Exibindo até {limit} registros</p>
            </section>
          </div>
        </aside>

        <section className="flex flex-col gap-6">
          <Card className="p-0">
            <CardHeader className="items-start gap-6 p-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-codex-slate">Consulta inteligente</p>
                  <h1 className="text-2xl font-semibold text-codex-navy">Busque por UF, CNPJ, atividade ou status fiscal</h1>
                </div>
                <div className="flex flex-col gap-4">
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Digite uma variável para buscar (ex: UF: SP, Contribuinte: Sim)"
                    startAdornment={<Search className="h-5 w-5" />}
                  />
                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={handleSearch} isLoading={isFetching}>
                      <Search className="h-4 w-4" /> Buscar
                    </Button>
                    <Button variant="secondary" onClick={handleClear}>
                      <RefreshCw className="h-4 w-4" /> Limpar
                    </Button>
                    {error ? <p className="text-sm text-red-500">{(error as Error).message}</p> : null}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="p-0">
            <CardHeader className="border-b border-codex-blue/10 px-6 py-4">
              <div className="flex w-full items-center justify-between">
                <div>
                  <CardTitle>Campos disponíveis</CardTitle>
                  <CardDescription>Configure filtros dinâmicos conforme o schema da API</CardDescription>
                </div>
                {loadingSchema ? <Loader2 className="h-5 w-5 animate-spin text-codex-blue" /> : null}
              </div>
            </CardHeader>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {(schema?.fields ?? []).map((field) => (
                <FilterFieldCard
                  key={field.name}
                  field={field}
                  value={filters[field.name] ?? ""}
                  onChange={handleFilterChange}
                />
              ))}
            </div>
          </Card>

          <ResultsPanel isLoading={isFetching} records={data?.data ?? []} total={totalResults} />
        </section>

        <aside className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/80 p-6 shadow-subtle backdrop-blur-sm max-xl:col-span-2 max-xl:flex-row max-xl:overflow-x-auto max-xl:p-4 max-xl:pl-6">
          <Card className="min-w-[240px] flex-1">
            <CardHeader>
              <CardTitle>Ações rápidas</CardTitle>
              <CardDescription>Exporte os dados nos formatos padrão corporativo</CardDescription>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                className="justify-between"
                onClick={() => handleExport("xlsx")}
                isLoading={exportMutation.isPending && exportMutation.variables?.format === "xlsx"}
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Exportar XLSX
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                className="justify-between"
                onClick={() => handleExport("csv")}
                isLoading={exportMutation.isPending && exportMutation.variables?.format === "csv"}
              >
                <span className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Exportar CSV
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card className="min-w-[240px] flex-1">
            <CardHeader>
              <CardTitle>Estatísticas rápidas</CardTitle>
              <CardDescription>Insights instantâneos sobre sua busca</CardDescription>
            </CardHeader>
            <div className="grid gap-4">
              <StatHighlight label="Resultados" value={totalResults.toLocaleString("pt-BR")} icon={<Sparkles className="h-5 w-5" />} />
              <StatHighlight label="Filtros ativos" value={activeFilters.length} icon={<Filter className="h-5 w-5" />} />
              <StatHighlight label="Limite" value={limit} icon={<RefreshCw className="h-5 w-5" />} />
            </div>
          </Card>
        </aside>
      </div>

      <Toast open={toastOpen} onClose={() => setToastOpen(false)} title={toastMessage} />
    </main>
  );
}

interface FilterFieldCardProps {
  field: SearchField;
  value: string | number | boolean;
  onChange: (field: SearchField, value: string | number | boolean) => void;
}

function FilterFieldCard({ field, value, onChange }: FilterFieldCardProps) {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    if (!inputValue) {
      onChange(field, "");
      return;
    }

    const nextValue = field.type === "number" ? Number(inputValue) : inputValue;
    onChange(field, nextValue);
  };

  const booleanValue = typeof value === "boolean" ? value : value === "true";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 rounded-2xl border border-codex-blue/10 bg-white/70 p-4 shadow-subtle"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-codex-navy">{field.label}</p>
          {field.description ? <p className="text-xs text-codex-slate">{field.description}</p> : null}
        </div>
        <Badge className="bg-codex-blue/10 text-[10px] uppercase">{field.type}</Badge>
      </div>

      {field.type === "boolean" ? (
        <button
          type="button"
          onClick={() => onChange(field, !booleanValue)}
          className={cn(
            "flex items-center justify-between rounded-full border px-3 py-2 text-sm transition",
            booleanValue
              ? "border-codex-blue bg-codex-blue/10 text-codex-blue"
              : "border-codex-blue/30 text-codex-slate hover:border-codex-blue/50"
          )}
        >
          <span>{booleanValue ? "Ativo" : "Inativo"}</span>
          <span
            className={cn(
              "inline-flex h-5 w-10 items-center rounded-full bg-codex-blue/20 transition",
              booleanValue ? "bg-codex-blue" : "bg-codex-blue/20"
            )}
          >
            <span
              className={cn(
                "h-4 w-4 rounded-full bg-white shadow-sm transition",
                booleanValue ? "translate-x-5" : "translate-x-1"
              )}
            />
          </span>
        </button>
      ) : (
          <input
            type={field.type === "number" ? "number" : "text"}
            value={typeof value === "boolean" ? Number(value) : value}
            onChange={handleInputChange}
            placeholder={`Defina ${field.label}`}
            className="rounded-2xl border border-codex-blue/20 bg-white px-3 py-2 text-sm shadow-inner focus:border-codex-blue focus:outline-none"
          />
      )}

      {field.suggestions && field.suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {field.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-full border border-codex-blue/20 px-3 py-1 text-xs text-codex-blue transition hover:border-codex-blue/40 hover:bg-codex-blue/10"
              onClick={() => onChange(field, suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

interface ResultsPanelProps {
  records: SearchResultRecord[];
  total: number;
  isLoading: boolean;
}

function ResultsPanel({ records, total, isLoading }: ResultsPanelProps) {
  const columns = useMemo(() => {
    if (!records.length) return [];
    const [first] = records;
    return Object.keys(first).filter((key) => key !== "id");
  }, [records]);

  return (
    <Card className="p-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-4 border-b border-codex-blue/10 px-6 py-4">
        <div>
          <CardTitle>Resultados ({total.toLocaleString("pt-BR")})</CardTitle>
          <CardDescription>Visualize, ordene e exporte os registros retornados</CardDescription>
        </div>
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-codex-blue" /> : null}
      </CardHeader>
      <div className="relative max-h-[480px] overflow-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="sticky top-0 z-10 bg-gradient-to-br from-white via-codex-cloud to-white text-left text-xs uppercase tracking-wide text-codex-slate">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-codex-slate">#</th>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left text-xs font-semibold text-codex-slate">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {records.length ? (
                records.map((record, index) => (
                  <motion.tr
                    key={record.id ?? index}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className={cn(index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]", "text-sm text-codex-navy")}
                  >
                    <td className="px-4 py-3 text-xs text-codex-slate">{index + 1}</td>
                    {columns.map((column) => (
                      <td key={column} className="px-4 py-3 align-middle">
                        {formatValue(record[column])}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Math.max(columns.length + 1, 1)} className="px-6 py-16 text-center text-sm text-codex-slate">
                    {isLoading ? "Carregando resultados..." : "Inicie uma busca para visualizar os dados."}
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface StatHighlightProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatHighlight({ label, value, icon }: StatHighlightProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-codex-blue/10 bg-white/80 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-codex-blue/10 text-codex-blue">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-codex-slate">{label}</p>
        <p className="text-lg font-semibold text-codex-navy">{value}</p>
      </div>
    </div>
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp) && value.includes("T")) {
      return new Date(timestamp).toLocaleDateString("pt-BR");
    }
    return value;
  }
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  if (typeof value === "number") return value.toLocaleString("pt-BR");
  return String(value);
}