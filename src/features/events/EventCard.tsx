import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { statusBadge } from "@/lib/tokens";
import type { EventSummary } from "@/types/domain";

interface EventCardProps {
  event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
  const token = statusBadge[event.status];

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Ver detalhes de ${event.name}`}
    >
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-base font-semibold leading-tight">{event.name}</h2>
            <Badge className={token.className}>{token.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
            <time dateTime={event.date}>{formatDate(event.date)}</time>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
            {event.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
            {event.expected_count} participantes esperados
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
