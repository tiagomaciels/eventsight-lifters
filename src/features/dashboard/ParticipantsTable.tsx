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
import { typeBadge } from "@/lib/tokens";
import { ParticipantRow, StatusPill } from "./ParticipantRow";
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

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex min-w-0 flex-col gap-1.5">
        <span className="truncate font-medium">{participant.name}</span>
        <div className="flex items-center gap-2">
          <Badge className={typeToken.className}>{typeToken.label}</Badge>
          <StatusPill status={participant.status} />
        </div>
      </div>
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
      <div className="hidden overflow-hidden rounded-xl border bg-card shadow-xs sm:block">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Participante
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Tipo
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Ação
              </TableHead>
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
