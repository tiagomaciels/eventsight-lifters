import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "@/components/layout/AppHeader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Eventsight — Painel de Gestão de Eventos",
  description:
    "Acompanhe eventos, controle o acesso de participantes e visualize métricas em tempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        {/* Skip link: permite usuários de teclado/leitores de tela pular o header */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Ir para o conteúdo principal
        </a>
        <Providers>
          <AppHeader />
          <div id="main-content">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
