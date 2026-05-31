import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { participantStatusToken, typeBadge } from "@/lib/tokens";
import type { Checkin, Participant } from "@/types/domain";
import { CheckinButton } from "./CheckinButton";
import type { EventSummary } from "@/types/domain";

interface ParticipantRowProps {
  participant: Participant;
  event: EventSummary;
  history: Checkin[];
  onCheckin: (participantId: string) => void;
}

export function ParticipantRow({
  participant,
  event,
  history,
  onCheckin,
}: ParticipantRowProps) {
  const typeToken = typeBadge[participant.type];
  const statusToken = participantStatusToken[participant.status];

  return (
    <TableRow>
      <TableCell className="font-medium">{participant.name}</TableCell>
      <TableCell>
        <Badge className={typeToken.className}>{typeToken.label}</Badge>
      </TableCell>
      <TableCell>
        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${statusToken.className} rounded-full px-2.5 py-0.5`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              participant.status === "inside" ? "bg-emerald-600" : "bg-zinc-400"
            }`}
            aria-hidden="true"
          />
          {statusToken.label}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <CheckinButton
          participant={participant}
          event={event}
          history={history}
          onCheckin={onCheckin}
        />
      </TableCell>
    </TableRow>
  );
}
