export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};

export async function apiFetch<T>(input: string, init?: RequestInit & { method?: HttpMethod }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}${input}`, {
    ...init,
    headers: {
      ...DEFAULT_HEADERS,
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Erro na requisição: ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}