"use client";

import { ArrowDownUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventStatus } from "@/types/domain";

export type StatusFilter = EventStatus | "all";
export type SortOrder = "asc" | "desc";

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
}

export function EventFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortOrder,
  onSortOrderChange,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Buscar eventos por nome"
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}
      >
        <SelectTrigger className="sm:w-44" aria-label="Filtrar por status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="closed">Encerrado</SelectItem>
          <SelectItem value="cancelled">Cancelado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortOrder}
        onValueChange={(v) => onSortOrderChange(v as SortOrder)}
      >
        <SelectTrigger className="sm:w-52" aria-label="Ordenar por data">
          <ArrowDownUp className="mr-2 h-4 w-4" aria-hidden="true" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">Data: mais antigo</SelectItem>
          <SelectItem value="desc">Data: mais recente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
