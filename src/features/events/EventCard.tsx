import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { statusAccent, statusBadge } from "@/lib/tokens";
import type { EventSummary } from "@/types/domain";

interface EventCardProps {
  event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
  const token = statusBadge[event.status];

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Ver detalhes de ${event.name}`}
    >
      <Card className="relative h-full overflow-hidden shadow-xs transition-all duration-200 group-hover:-translate-y-1 group-hover:border-foreground/15 group-hover:shadow-md">
        {/* Acento de status à esquerda (cor + texto do badge garantem o sinal) */}
        <span
          className={`absolute inset-y-0 left-0 w-1 ${statusAccent[event.status]}`}
          aria-hidden="true"
        />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold leading-snug tracking-tight">
              {event.name}
            </h2>
            <Badge className={`shrink-0 ${token.className}`}>{token.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-foreground/40" aria-hidden="true" />
            <time dateTime={event.date}>{formatDate(event.date)}</time>
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-foreground/40" aria-hidden="true" />
            <span className="truncate">{event.location}</span>
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-foreground/40" aria-hidden="true" />
            {event.expected_count} participantes esperados
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
