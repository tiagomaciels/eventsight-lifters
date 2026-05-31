import { DashboardClient } from "./DashboardClient";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://ThiagoLifters.github.io/api_test";

// Informa ao Next.js quais IDs pré-renderizar no build (required para output: 'export').
export async function generateStaticParams() {
  const res = await fetch(`${BASE_URL}/api/events.json`);
  const { data } = (await res.json()) as { data: Array<{ id: string }> };
  return data.map((e) => ({ id: e.id }));
}

// Server Component: recebe params (Promise no Next.js 16) e repassa o id
// ao Client Component sem expor lógica de servidor.
export default async function EventDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DashboardClient id={id} />;
}
