"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEventById, fetchEvents } from "./api";

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEventById(id),
    // Dados do detalhe ficam "sempre frescos" na sessão: impede refetch que
    // sobrescreveria o status dos participantes lido via store Zustand.
    staleTime: Infinity,
  });
}
