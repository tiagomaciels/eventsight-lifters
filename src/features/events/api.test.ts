import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchEventById, fetchEvents, ApiError } from "./api";
import type { EventDetail, EventSummary } from "@/types/domain";

const mockEvent: EventSummary = {
  id: "EVT-001",
  name: "Evento Teste",
  date: "2026-01-01T20:00:00-03:00",
  location: "Local Teste",
  status: "active",
  description: "Descrição",
  expected_count: 100,
  checkin_count: 45,
  error_count: 3,
  entry_rate: 0.45,
};

function mockFetch(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }),
  );
}

function mockFetchNetworkError(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchEvents", () => {
  it("desempacota o envelope { data, total } e retorna o array", async () => {
    mockFetch({ data: [mockEvent], total: 1 });
    const result = await fetchEvents();
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("EVT-001");
  });

  it("lança ApiError em falha de rede", async () => {
    mockFetchNetworkError();
    await expect(fetchEvents()).rejects.toBeInstanceOf(ApiError);
    await expect(fetchEvents()).rejects.toThrow(/rede/i);
  });

  it("lança ApiError em status 500", async () => {
    mockFetch({}, 500);
    await expect(fetchEvents()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("fetchEventById", () => {
  it("retorna o detalhe completo do evento", async () => {
    const detail: EventDetail = {
      ...mockEvent,
      participants: [],
      checkins: [],
    };
    mockFetch(detail);
    const result = await fetchEventById("EVT-001");
    expect(result.id).toBe("EVT-001");
    expect(result.participants).toEqual([]);
  });

  it("lança ApiError com status 404 para id inexistente", async () => {
    mockFetch({}, 404);
    const error = await fetchEventById("EVT-INVALIDO").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(404);
  });
});
