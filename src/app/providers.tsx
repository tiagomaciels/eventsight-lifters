"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { makeQueryClient } from "@/lib/queryClient";

export function Providers({ children }: { children: React.ReactNode }) {
  // Instância estável por sessão do browser — evita recriar a cada render.
  const [queryClient] = useState(makeQueryClient);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {/* theme="system" faz os toasts acompanharem o tema ativo */}
        <Toaster richColors position="bottom-right" theme="system" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
