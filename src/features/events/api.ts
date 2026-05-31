import type { EventDetail, EventSummary } from "@/types/domain";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://ThiagoLifters.github.io/api_test";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(url: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new ApiError("Falha de rede. Verifique sua conexão e tente novamente.");
  }

  if (response.status === 404) {
    throw new ApiError("Recurso não encontrado.", 404);
  }

  if (!response.ok) {
    throw new ApiError(
      `Erro ao carregar dados (${response.status}). Tente novamente.`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchEvents(): Promise<EventSummary[]> {
  const envelope = await apiFetch<{ data: EventSummary[]; total: number }>(
    `${BASE_URL}/api/events.json`,
  );
  return envelope.data;
}

export async function fetchEventById(id: string): Promise<EventDetail> {
  return apiFetch<EventDetail>(`${BASE_URL}/api/events/${id}.json`);
}
