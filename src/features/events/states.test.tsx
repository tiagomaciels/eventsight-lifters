import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import * as api from "./api";
import type { EventSummary } from "@/types/domain";

// ---------------------------------------------------------------------------
// Mock da camada de API — testes de UI não acessam rede
// ---------------------------------------------------------------------------
vi.mock("./api");
const mockedApi = vi.mocked(api);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const activeEvent: EventSummary = {
  id: "EVT-001",
  name: "Tech Summit 2026",
  date: "2026-06-01T20:00:00-03:00",
  location: "São Paulo",
  status: "active",
  description: "",
  expected_count: 100,
  checkin_count: 45,
  error_count: 2,
  entry_rate: 0.45,
};

const closedEvent: EventSummary = {
  ...activeEvent,
  id: "EVT-002",
  name: "Workshop React",
  status: "closed",
};

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listagem de eventos — estados", () => {
  it("exibe skeletons enquanto carrega", () => {
    // fetchEvents nunca resolve — simula loading infinito
    mockedApi.fetchEvents.mockReturnValue(new Promise(() => {}));
    renderWithQuery(<Home />);
    // Durante o loading, o skeleton renderiza uma lista com aria-busy=true
    // (a lista de eventos com aria-label só aparece no estado de sucesso)
    expect(screen.getByRole("list", { busy: true })).toBeTruthy();
  });

  it("exibe mensagem de erro com botão de retry quando a requisição falha", async () => {
    mockedApi.fetchEvents.mockRejectedValue(new Error("rede"));
    renderWithQuery(<Home />);
    const alert = await screen.findByRole("alert");
    expect(alert).toBeTruthy();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeTruthy();
  });

  it("exibe os eventos quando a requisição tem sucesso", async () => {
    mockedApi.fetchEvents.mockResolvedValue([activeEvent, closedEvent]);
    renderWithQuery(<Home />);
    expect(await screen.findByText("Tech Summit 2026")).toBeTruthy();
    expect(screen.getByText("Workshop React")).toBeTruthy();
  });

  it("exibe mensagem vazia quando filtro não retorna resultados", async () => {
    mockedApi.fetchEvents.mockResolvedValue([activeEvent]);
    const user = userEvent.setup();
    renderWithQuery(<Home />);
    await screen.findByText("Tech Summit 2026");

    const input = screen.getByRole("searchbox", { name: /buscar/i });
    await user.type(input, "evento que nao existe");

    expect(
      await screen.findByText(/nenhum evento encontrado/i),
    ).toBeTruthy();
  });
});
