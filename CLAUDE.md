# Eventsight — CLAUDE.md

Painel de gestão de eventos (front-end). Acompanha eventos, controla acesso de participantes (check-in) e mostra um dashboard de métricas. Teste técnico front-end nível sênior.

> Este arquivo carrega em toda sessão — mantenha enxuto. Documentos de apoio (leia sob demanda, NÃO carregue por padrão):
> - `docs/PLANEJAMENTO.md` — plano completo: telas, componentes, cronograma, edge cases detalhados.
> - `docs/GUIA-SENIOR.md` — racional das práticas sênior (comentários, git, anti-padrões).
> Consulte-os quando a tarefa exigir profundidade; não há necessidade de relê-los a cada turno.

## Comandos
```
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção
npm run lint     # eslint (deve ficar sem warnings)
npm test         # vitest
npx tsc --noEmit # checagem de tipos (deve ficar limpo)
```

## Stack
- Next.js (App Router) + TypeScript **strict**
- Tailwind CSS + **shadcn/ui** (componentes copiados para o repo: Table, Badge, Button, Input, Select, Card, Tooltip, Sonner). Acessibilidade via Radix de graça.
- TanStack Query (React Query) v5 — **estado de servidor** (read-only nesta Opção A)
- **Zustand** — APENAS o estado da simulação de check-in da sessão (status dos participantes + log de entradas/saídas). NÃO usar para estado de UI nem como substituto do React Query.
- Recharts — gráficos
- sonner — toasts de feedback
- Vitest + React Testing Library — testes

## Arquitetura (direção da dependência: UI → domínio, nunca o contrário)
- `domain/` — regras de negócio em **funções puras** (sem React, sem fetch, sem window). Coração do projeto e dos testes.
- `features/<feature>/api.ts` — única camada que faz fetch; normaliza erros. Nenhum componente chama `fetch` direto.
- `features/<feature>/hooks.ts` — encapsula React Query (`useEvents`, `useEvent`). Componentes consomem dados, não conhecem o cache.
- `components/ui` — primitivos reutilizáveis. `components/feedback` — StateBoundary (loading/vazio/erro).
- Modele os 4 estados (loading, vazio, erro, sucesso) desde o início, não no fim.

## Decision Records (NÃO reverter sem reavaliar os dados reais)
1. **Elegibilidade de check-in deriva do histórico de entradas, NÃO do campo `checkin_count`.** Motivo: o campo é inconsistente nos dados reais (VIP=4, normal=0/1). "Normal já fez check-in" = teve uma `entry` bem-sucedida.
2. **API: Opção A (GitHub Pages, somente GET).** Base `https://ThiagoLifters.github.io/api_test`. O React Query carrega os dados (read-only). O estado mutável da simulação de check-in vive num **store Zustand**, semeado UMA vez a partir do detail e dono dele a partir daí. **Fonte única de verdade:** o store é quem manda nos status/log da sessão; não duplicar esse dado no cache do RQ nem sincronizar os dois. A camada `api.ts` é isolada para que trocar para a Opção B (json-server/CRUD) seja mudar só o adapter (aí as mutações virariam POST/PATCH reais + `invalidateQueries`, aposentando o store).
3. **`entry_rate` vem como decimal (0..1)** → exibir `Math.round(entry_rate * 100)`. Tratar `expected_count = 0` (EVT-004) sem dividir por zero.
4. **Timestamps:** `checkin.timestamp` é UTC (`...Z`); `event.date` usa offset `-03:00`. Normalizar antes de plotar. Os `checkins` vêm fora de ordem → ordenar por timestamp.
5. **`cancelled` bloqueia todas as interações** (o enunciado só detalha `closed`; estendemos por consistência).

## Regras de negócio (resumo)
- **VIP:** entra/sai N vezes; cada ação vai ao histórico. `outside`→entry, `inside`→exit.
- **Normal:** uma única entrada na vida; segunda tentativa → erro `already_checked_in` (mesmo após sair).
- **Evento `closed`/`cancelled`:** nenhuma entrada → bloqueio, botão desabilitado com motivo visível.
- Decisão central em `domain/checkin.ts::attemptCheckin`, retornando discriminated union `{ ok: true, ... } | { ok: false, reason }`.

## Convenções de código
- **Sem `any`.** Use `unknown` e estreite. Unions para `status`/`type`/`error_reason`.
- **`switch` exaustivo** com `never` no default.
- **Nunca buscar dados em `useEffect`** — use React Query.
- **Três estados, três ferramentas:** servidor → React Query; UI (busca/filtro/ordenação) → `useState` local; simulação de check-in da sessão → Zustand. Não misturar.
- **Design tokens centralizados** (cores de status/tipo num único mapa) — sem valores mágicos espalhados.
- **Acessibilidade por padrão:** HTML semântico, foco visível, navegação por teclado, cor nunca como único sinal, contraste AA.
- Não memoizar por reflexo — só onde há custo/re-render real.

## Comentários
Código autodocumentado; comentários explicam o **porquê**, nunca o **o quê**. Comente regra de negócio não óbvia e workaround (ex.: normalização de fuso). Não deixe código comentado/morto, `console.log` nem TODO solto na entrega.

## Testes — TDD seletivo
- **Domínio (`domain/`): TDD pleno.** Funções puras → red-green-refactor. Escreva o teste falhando, implemente. Isso já produz os testes de regra de negócio exigidos.
- **UI: construir e então testar comportamento** (estados renderizam; clique no check-in atualiza). NÃO fazer TDD test-first em componente visual — lento e frágil.
- Testar comportamento, não implementação. RTL por papel/texto (`getByRole`/`getByText`), mock na fronteira (`api.ts`).
- O store Zustand e as funções de domínio são testáveis isolados — aproveite.

## Git
- Trunk-based com branches de feature curtas: `feat/`, `fix/`, `test/`, `chore/`, `docs/`.
- **Conventional Commits**, imperativo: `feat(events): adiciona busca com debounce`.
- No domínio, **commit test-first**: `test(domain): especifica bloqueio de 2º check-in normal` (falhando) → `feat(domain): implementa attemptCheckin`. O histórico evidencia o TDD.
- Commits **atômicos** (uma mudança coerente cada). Nunca um único commit gigante no fim.
- `main` sempre verde (build + testes passando).
- `.gitignore` correto; nunca comitar `node_modules`, `.next`, `.env*`, segredos.

## Definition of Done
Antes de considerar pronto: `tsc --noEmit` limpo, `lint` sem warnings, `test` verde, 4 estados em cada tela, todos os edge cases tratados, responsivo no mobile, navegável por teclado, README roda do zero. Detalhes em `docs/GUIA-SENIOR.md` (checklist final).
