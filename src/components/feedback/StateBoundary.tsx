import { ReactNode } from "react";
import { AlertTriangle, SearchX } from "lucide-react";

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
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="max-w-xs">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
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
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
}
