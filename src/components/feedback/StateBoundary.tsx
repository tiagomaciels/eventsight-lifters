import { ReactNode } from "react";

interface StateBoundaryProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  skeleton: ReactNode;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function StateBoundary({
  isLoading,
  isError,
  isEmpty,
  skeleton,
  errorMessage = "Falha ao carregar os dados.",
  emptyMessage = "Nenhum item encontrado.",
  onRetry,
  children,
}: StateBoundaryProps) {
  if (isLoading) {
    return <>{skeleton}</>;
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 py-16 text-center text-sm text-muted-foreground"
      >
        <p>{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-2 py-16 text-center text-sm text-muted-foreground"
      >
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
