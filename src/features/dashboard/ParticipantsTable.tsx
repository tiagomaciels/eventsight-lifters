import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CheckinResult } from "@/domain/checkin";
import type { Checkin, EventSummary, Participant } from "@/types/domain";
import { ParticipantRow } from "./ParticipantRow";

interface ParticipantsTableProps {
  participants: Participant[];
  event: EventSummary;
  history: Checkin[];
  onCheckin: (participant: Participant) => CheckinResult;
}

export function ParticipantsTable({
  participants,
  event,
  history,
  onCheckin,
}: ParticipantsTableProps) {
  if (participants.length === 0) {
    return (
      <p role="status" className="py-8 text-center text-sm text-muted-foreground">
        Nenhum participante cadastrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
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
  );
}
