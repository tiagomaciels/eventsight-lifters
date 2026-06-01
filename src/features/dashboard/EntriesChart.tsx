"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity } from "lucide-react";
import { entriesOverTime } from "@/domain/metrics";
import type { Checkin } from "@/types/domain";

interface EntriesChartProps {
  checkins: Checkin[];
}

// Chrome monocromático: o gráfico usa slate, não cor de marca.
const STROKE = "#475569"; // slate-600

function formatTime(epochMs: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(epochMs));
}

export function EntriesChart({ checkins }: EntriesChartProps) {
  const series = entriesOverTime(checkins);

  if (series.length === 0) {
    return (
      <div
        role="status"
        className="flex h-[260px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Activity className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
        Nenhuma entrada registrada ainda.
      </div>
    );
  }

  const data = series.map((point) => ({
    time: formatTime(point.time),
    total: point.cumulative,
  }));

  return (
    <div aria-label="Gráfico de entradas ao longo do tempo">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={STROKE} stopOpacity={0.18} />
              <stop offset="95%" stopColor={STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-border"
          />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={28}
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: "1px solid var(--border)",
            }}
            formatter={(value) => [value ?? 0, "Entradas acumuladas"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={STROKE}
            strokeWidth={2}
            fill="url(#entryGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
