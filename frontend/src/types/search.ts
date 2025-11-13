export type SearchFieldPrimitive = "string" | "number" | "boolean" | "date";

export interface SearchField {
  name: string;
  label: string;
  type: SearchFieldPrimitive;
  description?: string;
  suggestions?: string[];
}

export interface SchemaResponse {
  fields: SearchField[];
}

export type ExportFormat = "csv" | "xlsx";

export interface SearchRequest {
  query: string;
  filters: Record<string, string | number | boolean>;
  limit?: number;
}

export interface SearchResultRecord {
  id: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface SearchResponse {
  data: SearchResultRecord[];
  total: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export interface ExportRequest {
  format: ExportFormat;
  query: string;
  filters: SearchRequest["filters"];
}