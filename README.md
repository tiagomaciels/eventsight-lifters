# Eventsight — Painel de Gestão de Eventos

Painel para acompanhar eventos e controlar o acesso de participantes, com dashboard de métricas e simulação de check-in em tempo real.

---

## Como rodar

**Pré-requisitos:** Node.js 18+ e npm.

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd eventsight-lifters

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Outros comandos

```bash
npm run build      # build de produção
npm run lint       # ESLint (deve ficar sem warnings)
npm test           # Vitest em modo watch
npm run test:run   # Vitest em modo CI (uma rodada)
npx tsc --noEmit   # checagem de tipos
```

---

## Stack e justificativas

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js 16 (App Router) | Diferencial solicitado; file-based routing, RSC/Client boundary |
| Linguagem | TypeScript 5 (strict) | Unions tipadas para `status`/`type`/`error_reason`; `switch` exaustivo com `never` |
| Estado de servidor | TanStack Query v5 | Loading/erro/vazio de graça; cache com `staleTime` consciente |
| Estado de simulação | Zustand v5 | Dono único do estado mutável de check-in; não sincroniza com o cache do RQ |
| Estilo | Tailwind CSS v4 + shadcn/ui | Velocidade + Radix Primitives com ARIA embutido |
| Gráfico | Recharts | Leve, declarativa, integração React nativa |
| Toasts | Sonner | Feedback de ação com `aria-live` integrado |
| Testes | Vitest + React Testing Library | Rápido, integra com Next/TS; RTL por papel/texto |
| Datas | `Intl.DateTimeFormat` nativo | `date-fns` não estava na stack; `Intl` cobre formatação e normalização de fuso sem custo de bundle |

---

## Arquitetura

Dependência unidirecional: **UI → features → domínio → tipos**. O domínio nunca conhece React, fetch ou window.

```
src/
  app/                        # Rotas Next.js (App Router)
  components/
    feedback/StateBoundary    # Loading / vazio / erro — reutilizável
    layout/AppHeader          # Header fixo
    ui/                       # Primitivos shadcn
  domain/
    checkin.ts                # Regras puras de check-in (coração do projeto)
    metrics.ts                # Cálculos derivados (taxa, série temporal)
  features/
    events/api.ts             # Único ponto de fetch — normaliza erros
    events/hooks.ts           # useEvents / useEvent (React Query)
    checkin/store.ts          # Store Zustand — estado mutável da sessão
    dashboard/                # Componentes do dashboard
  lib/
    tokens.ts                 # Design tokens centralizados (cores, rótulos)
    format.ts                 # Formatação de data e percentual
  types/domain.ts             # Unions e interfaces do contrato da API
```

---

## Decisões e suposições

### 1. API — Opção A (GitHub Pages, somente leitura)

Dados buscados via `GET` em `https://ThiagoLifters.github.io/api_test`. A URL fica em `.env.local` (ver `.env.example`). Nenhum `POST`/`PATCH` é feito — as mutações de check-in são simuladas no store Zustand. A camada `features/events/api.ts` está isolada: trocar para a Opção B (json-server com CRUD real) exigiria mudar apenas esse arquivo.

### 2. Estado mutável do check-in → Zustand

O store é semeado **uma vez** a partir do detalhe do evento e passa a ser a **fonte única de verdade** dos status dos participantes e do log de entradas/saídas da sessão. Cards de métrica e gráfico derivam do `store.log` — o dashboard é totalmente reativo às simulações. O cache do React Query não é modificado e não sincroniza com o store.

### 3. Elegibilidade do participante Normal

O campo `checkin_count` é inconsistente nos dados reais (VIPs acumulam entrada+saída no contador; normais que saíram têm `checkin_count=1` mas `status="outside"`). Por isso, "já fez check-in" é definido como **ter qualquer entrada bem-sucedida no histórico** — não pelo valor de `checkin_count`. Um Normal que entrou e saiu continua bloqueado para reentrar.

### 4. Evento `cancelled` tratado como bloqueio total

O enunciado só detalha o status `closed` explicitamente. Por consistência, `cancelled` recebe o mesmo tratamento: nenhuma interação de check-in é permitida. O motivo exibido diferencia os dois casos ("Evento encerrado" vs "Evento cancelado").

### 5. Taxa de entrada calculada ao vivo

`entryRatePercent` conta participantes **distintos** que entraram (não ações totais — um VIP que entra 4× conta como 1). O denominador é `expected_count`; quando este é 0 (EVT-004), a taxa retorna 0 sem divisão por zero.

### 6. Fuso horário

`checkin.timestamp` vem em UTC (`…Z`); `event.date` usa offset `-03:00`. Ambos são normalizados para `America/Sao_Paulo` antes de formatar ou plotar no gráfico.

---

## O que faria com mais tempo

- **Opção B (json-server):** mutações reais com `POST /checkins` e `PATCH /participants/:id`, substituindo o store Zustand por `invalidateQueries`. A interface de `api.ts` já está preparada para essa troca.
- **Persistência de sessão:** salvar o estado do store em `sessionStorage` para sobreviver a recargas da página.
- **Filtros no dashboard:** busca e filtro de tipo/status na tabela de participantes.
- **SSR progressivo:** buscar os metadados básicos do evento no servidor para melhorar o FCP.

---

## Uso de IA

Claude Code (Anthropic) foi utilizado como pair programmer ao longo de todo o desenvolvimento. O fluxo de trabalho foi inteiramente guiado pelo desenvolvedor:

1. **Planejamento e análise:** o desenvolvedor leu o enunciado, definiu a stack, identificou ambiguidades nos dados reais da API e tomou as decisões de arquitetura. A IA apoiou na geração do plano de execução por sessões e na identificação de divergências entre o planejamento e a stack configurada — tudo revisado e ajustado antes de qualquer implementação.
2. **Execução em etapas:** o projeto foi quebrado em sessões pelo desenvolvedor. A cada sessão a IA implementava o código; o desenvolvedor revisava a lógica, os tipos, a aderência às regras de negócio e a qualidade geral antes de aprovar.
3. **TDD:** a decisão de aplicar TDD pleno no domínio puro foi do desenvolvedor. A IA escreveu os testes falhando primeiro (`domain/checkin`, `domain/metrics`), depois as implementações — evidenciando o ciclo red→green no histórico de commits.
4. **Commit manual:** a IA nunca commitou código de forma autônoma. Ao final de cada passo, ela sugeria a mensagem de commit; o desenvolvedor inspecionava o diff, testava localmente e commitava (ou ajustava) manualmente. O histórico reflete esse processo.
5. **Testes E2E automatizados:** o fluxo visual foi verificado manualmente com o Playwright MCP durante o desenvolvimento; testes E2E automatizados (Playwright) cobrindo o fluxo completo de check-in com dados reais seriam o próximo passo.

As decisões que definem o projeto — separação domínio/features/UI, Zustand como fonte única de verdade do check-in, `Intl` no lugar de `date-fns`, interpretação da elegibilidade do Normal pelo histórico de entradas, `cancelled` bloqueando tudo como `closed` — foram todas tomadas pelo desenvolvedor. A IA atuou como acelerador de implementação sob direção contínua.
