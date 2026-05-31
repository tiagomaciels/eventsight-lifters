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
import { entriesOverTime } from "@/domain/metrics";
import type { Checkin } from "@/types/domain";

interface EntriesChartProps {
  checkins: Checkin[];
}

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
        className="flex h-48 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground"
      >
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
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="entryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            className="text-muted-foreground"
          />
          <Tooltip
            contentStyle={{ fontSize: 12 }}
            formatter={(value) => [value ?? 0, "Entradas acumuladas"]}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#10b981"
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
