"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  attemptCheckin,
  canEnter,
  canExit,
  checkinDisabledReason,
} from "@/domain/checkin";
import type { Checkin, EventSummary, Participant } from "@/types/domain";

interface CheckinButtonProps {
  participant: Participant;
  event: EventSummary;
  history: Checkin[];
  onCheckin: (participantId: string) => void;
}

export function CheckinButton({
  participant,
  event,
  history,
  onCheckin,
}: CheckinButtonProps) {
  const canDoEntry = canEnter(participant, event, history);
  const canDoExit = canExit(participant, event);
  const disabledReason = checkinDisabledReason(participant, event, history);
  const isDisabled = !canDoEntry && !canDoExit;

  function handleClick() {
    const result = attemptCheckin(participant, event, history);

    if (result.ok) {
      const message =
        result.action === "entry"
          ? `Entrada registrada para ${participant.name}`
          : `Saída registrada para ${participant.name}`;
      toast.success(message);
      onCheckin(participant.id);
    } else {
      const message =
        result.reason === "already_checked_in"
          ? `${participant.name} já realizou check-in`
          : "Evento encerrado — interações bloqueadas";
      toast.error(message);
    }
  }

  const label =
    participant.status === "inside" ? "Registrar Saída" : "Registrar Entrada";

  const button = (
    <Button
      size="sm"
      variant={participant.status === "inside" ? "outline" : "default"}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={`${label} — ${participant.name}`}
    >
      {label}
    </Button>
  );

  if (isDisabled && disabledReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0}>{button}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{disabledReason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
