import Link from "next/link";
import { CalendarRange } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          aria-label="Eventsight — página inicial"
        >
          <CalendarRange className="h-5 w-5 text-primary" aria-hidden="true" />
          <span>Eventsight</span>
        </Link>
      </div>
    </header>
  );
}
