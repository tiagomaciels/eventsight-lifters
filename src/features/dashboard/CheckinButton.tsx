"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canEnter,
  canExit,
  checkinDisabledReason,
  type CheckinResult,
} from "@/domain/checkin";
import type { Checkin, EventSummary, Participant } from "@/types/domain";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

interface CheckinButtonProps {
  participant: Participant;
  event: EventSummary;
  history: Checkin[];
  /** Aplica o check-in no store e devolve o resultado da decisão de domínio. */
  onCheckin: (participant: Participant) => CheckinResult;
}

export function CheckinButton({
  participant,
  event,
  history,
  onCheckin,
}: CheckinButtonProps) {
  const canDoEntry = canEnter(participant, event, history);
  const canDoExit = canExit(participant, event);
  const isDisabled = !canDoEntry && !canDoExit;
  const disabledReason = checkinDisabledReason(participant, event, history);

  function handleClick() {
    const result = onCheckin(participant);

    if (result.ok) {
      toast.success(
        result.action === "entry"
          ? `Entrada registrada para ${participant.name}`
          : `Saída registrada para ${participant.name}`,
      );
    } else {
      toast.error(
        result.reason === "already_checked_in"
          ? `${participant.name} já realizou check-in`
          : "Evento encerrado — interações bloqueadas",
      );
    }
  }

  const isInside = participant.status === "inside";
  const label = isInside ? "Registrar Saída" : "Registrar Entrada";
  const Icon = isInside ? LogOut : LogIn;

  const button = (
    <Button
      size="sm"
      variant={isInside ? "outline" : "default"}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={`${label} — ${participant.name}`}
      className="min-h-11 gap-1.5 px-4 cursor-pointer"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </Button>
  );

  // Botão desabilitado mostra o motivo (acessível por teclado via span focável).
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
