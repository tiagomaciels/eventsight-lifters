import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { participantStatusToken, typeBadge } from "@/lib/tokens";
import type { CheckinResult } from "@/domain/checkin";
import type {
  Checkin,
  EventSummary,
  Participant,
  ParticipantStatus,
} from "@/types/domain";
import { CheckinButton } from "./CheckinButton";

/** Pílula de status (cor + ponto + texto) — compartilhada entre tabela e cards. */
export function StatusPill({ status }: { status: ParticipantStatus }) {
  const token = participantStatusToken[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${token.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "inside" ? "bg-emerald-500" : "bg-zinc-400"}`}
        aria-hidden="true"
      />
      {token.label}
    </span>
  );
}

interface ParticipantRowProps {
  participant: Participant;
  event: EventSummary;
  history: Checkin[];
  onCheckin: (participant: Participant) => CheckinResult;
}

export function ParticipantRow({
  participant,
  event,
  history,
  onCheckin,
}: ParticipantRowProps) {
  const typeToken = typeBadge[participant.type];

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="font-medium">{participant.name}</TableCell>
      <TableCell>
        <Badge className={typeToken.className}>{typeToken.label}</Badge>
      </TableCell>
      <TableCell>
        <StatusPill status={participant.status} />
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
