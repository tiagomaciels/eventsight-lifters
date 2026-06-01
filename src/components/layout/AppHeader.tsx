import Link from "next/link";
import { CalendarRange } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Eventsight — página inicial"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <CalendarRange className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">Eventsight</span>
        </Link>
      </div>
    </header>
  );
}
