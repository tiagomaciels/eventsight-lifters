import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CheckinResult } from "@/domain/checkin";
import type { Checkin, EventSummary, Participant } from "@/types/domain";
import { participantStatusToken, typeBadge } from "@/lib/tokens";
import { ParticipantRow } from "./ParticipantRow";
import { CheckinButton } from "./CheckinButton";

interface ParticipantsTableProps {
  participants: Participant[];
  event: EventSummary;
  history: Checkin[];
  onCheckin: (participant: Participant) => CheckinResult;
}

function EmptyState() {
  return (
    <p role="status" className="py-8 text-center text-sm text-muted-foreground">
      Nenhum participante cadastrado.
    </p>
  );
}

// Card compacto para cada participante — exibido apenas no mobile (sm:hidden).
function ParticipantCard({
  participant,
  event,
  history,
  onCheckin,
}: {
  participant: Participant;
  event: EventSummary;
  history: Checkin[];
  onCheckin: (participant: Participant) => CheckinResult;
}) {
  const typeToken = typeBadge[participant.type];
  const statusToken = participantStatusToken[participant.status];

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate font-medium">{participant.name}</span>
        <div className="flex items-center gap-2">
          <Badge className={typeToken.className}>{typeToken.label}</Badge>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusToken.className}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${participant.status === "inside" ? "bg-emerald-600" : "bg-zinc-400"}`}
              aria-hidden="true"
            />
            {statusToken.label}
          </span>
        </div>
      </div>
      {/* min-h-11 garante área de toque ≥ 44px no mobile */}
      <div className="shrink-0">
        <CheckinButton
          participant={participant}
          event={event}
          history={history}
          onCheckin={onCheckin}
        />
      </div>
    </div>
  );
}

export function ParticipantsTable({
  participants,
  event,
  history,
  onCheckin,
}: ParticipantsTableProps) {
  if (participants.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Mobile: lista de cards — tabela horizontal é inacessível em telas estreitas */}
      <ul className="flex flex-col gap-3 sm:hidden" aria-label="Participantes">
        {participants.map((p) => (
          <li key={p.id}>
            <ParticipantCard
              participant={p}
              event={event}
              history={history}
              onCheckin={onCheckin}
            />
          </li>
        ))}
      </ul>

      {/* Desktop: tabela completa */}
      <div className="hidden overflow-x-auto rounded-lg border sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Participante</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((participant) => (
              <ParticipantRow
                key={participant.id}
                participant={participant}
                event={event}
                history={history}
                onCheckin={onCheckin}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
