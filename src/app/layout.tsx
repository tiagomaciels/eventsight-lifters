import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
