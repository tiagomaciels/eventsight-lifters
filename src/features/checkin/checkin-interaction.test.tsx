import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardClient } from "@/app/events/[id]/DashboardClient";
import { useCheckinStore } from "@/features/checkin/store";
import * as api from "@/features/events/api";
import type { EventDetail, Participant } from "@/types/domain";

// Mock na fronteira da rede
vi.mock("@/features/events/api");
// Recharts não rende bem em jsdom — irrelevante para a interação
vi.mock("@/features/dashboard/EntriesChart", () => ({ EntriesChart: () => null }));
// Toasts silenciados (sem Toaster montado no teste)
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockedApi = vi.mocked(api);

function participant(
  id: string,
  type: Participant["type"],
  status: Participant["status"],
  name: string,
): Participant {
  return { id, event_id: "EVT-001", name, type, status, checkin_count: 0 };
}

function makeDetail(overrides: Partial<EventDetail> = {}): EventDetail {
  return {
    id: "EVT-001",
    name: "Evento",
    date: "2026-01-01T20:00:00-03:00",
    location: "Local",
    status: "active",
    description: "",
    expected_count: 10,
    checkin_count: 0,
    error_count: 0,
    entry_rate: 0,
    participants: [],
    checkins: [],
    ...overrides,
  };
}

function renderDashboard(id = "EVT-001") {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <DashboardClient id={id} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useCheckinStore.getState().reset();
});

describe("interação de check-in", () => {
  it("registra a entrada de um VIP e atualiza status e botão", async () => {
    mockedApi.fetchEventById.mockResolvedValue(
      makeDetail({ participants: [participant("P1", "vip", "outside", "Ana VIP")] }),
    );
    const user = userEvent.setup();
    renderDashboard();

    const entryButtons = await screen.findAllByRole("button", {
      name: /registrar entrada/i,
    });
    expect(entryButtons.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ausente").length).toBeGreaterThan(0);

    await user.click(entryButtons[0]!);

    // Mobile card + desktop row ambos atualizam para "Presente"
    expect(await screen.findAllByText("Presente")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /registrar sa/i }).length).toBeGreaterThan(0);
  });

  it("desabilita o botão para um normal que já fez check-in", async () => {
    mockedApi.fetchEventById.mockResolvedValue(
      makeDetail({
        participants: [participant("P2", "normal", "outside", "Bruno Normal")],
        checkins: [
          {
            id: "c1",
            event_id: "EVT-001",
            participant_id: "P2",
            timestamp: "2026-01-01T23:00:00Z",
            success: true,
            action: "entry",
            error_reason: null,
          },
        ],
      }),
    );
    renderDashboard();

    const buttons = await screen.findAllByRole("button", {
      name: /registrar entrada/i,
    });
    buttons.forEach((b) => expect(b).toBeDisabled());
  });

  it("desabilita o botão de entrada em evento encerrado", async () => {
    mockedApi.fetchEventById.mockResolvedValue(
      makeDetail({
        status: "closed",
        participants: [participant("P3", "vip", "outside", "Carla VIP")],
      }),
    );
    renderDashboard();

    const buttons = await screen.findAllByRole("button", {
      name: /registrar entrada/i,
    });
    buttons.forEach((b) => expect(b).toBeDisabled());
  });
});
