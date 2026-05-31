import { EventCard } from "./EventCard";
import type { EventSummary } from "@/types/domain";

interface EventListProps {
  events: EventSummary[];
}

export function EventList({ events }: EventListProps) {
  return (
    <ul
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Lista de eventos"
    >
      {events.map((event) => (
        <li key={event.id}>
          <EventCard event={event} />
        </li>
      ))}
    </ul>
  );
}
