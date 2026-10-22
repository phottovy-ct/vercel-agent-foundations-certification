# Ship It Shop — Vercel Agent Foundations Certification

A Next.js storefront for the Vercel Swag Store with two separate AI agents, built for the Vercel Agent Foundations Certification:

- **Shopping agent** (storefront chat, robot icon in the header): helps customers find products, inspect individual items, and return past orders.
- **Store admin agent** (`/admin`): helps employees investigate support, returns, inventory, and sales. It computes results in Vercel Sandbox and keeps persistent memory between conversations.

Both agents use the **AI SDK** with **AI Elements** chat UIs, route model calls through **Vercel AI Gateway** (`anthropic/claude-sonnet-5`), and run as durable **Vercel Workflows**.

## Tech stack

- **Next.js 16** (App Router) with **React 19**
- **TypeScript** (`strict`), `@/*` path alias → project root
- **Tailwind CSS v4** + **shadcn/ui**; `lucide-react` icons
- **AI SDK 7** (`ai`, `@ai-sdk/react`, `@ai-sdk/workflow`) and **AI Elements**
- **Vercel Workflows** (`workflow`) for durable agent runs and the return process
- **Vercel Sandbox** (`@vercel/sandbox`) for the admin agent's bash tool
- **pnpm**, Node.js 24

## Setup

Prerequisites: Node.js 24, [pnpm](https://pnpm.io), the [Vercel CLI](https://vercel.com/docs/cli), and a Vercel project created from this repository.

```bash
pnpm install
vercel link                      # pick the team and existing project
vercel env pull .env.local       # writes API_BASE_URL, BYPASS_SECRET, VERCEL_OIDC_TOKEN
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and confirm products load.

- **Shopping agent:** click the robot icon in the header.
- **Admin agent:** go to `/admin` and sign in with the demo password `letmeinadminagent`.

The local `VERCEL_OIDC_TOKEN` expires after 12 hours. Rerun `vercel env pull .env.local` to refresh it. If you use `AI_GATEWAY_API_KEY` instead, add it to `.env.local` by hand after pulling, because the pull overwrites the file.

## Environment variables

`.env.local` is gitignored. Never commit it, and never give a secret a `NEXT_PUBLIC_` prefix.

| Variable | Required | Purpose |
| --- | --- | --- |
| `BYPASS_SECRET` | Yes | Vercel deployment-protection bypass secret for the store API. Sent as the `x-vercel-protection-bypass` header on every API call. Server-only. Prepopulated by the Deploy button. |
| `API_BASE_URL` | Yes | Store API base URL. Prepopulated by the Deploy button. Defaults to `https://vercel-agentic-swag-store-api.vercel.app/api`. |
| `VERCEL_OIDC_TOKEN` | Locally | Authenticates AI Gateway and Vercel Sandbox calls during local development. Written by `vercel env pull`. On Vercel, OIDC is provided automatically. |
| `AI_GATEWAY_API_KEY` | Optional | AI Gateway API key. When set, the AI SDK uses it instead of OIDC for model calls. Set it in `.env.local` and in the Vercel project's environment variables. |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL used for metadata. Defaults to `http://localhost:3000`. Not a secret. |

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the dev server on http://localhost:3000 |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm exec tsc --noEmit` | Type check (`next.config.mjs` sets `typescript.ignoreBuildErrors`, so builds don't) |

There is no test framework configured.

## Project structure

```
app/
  (store)/                     # storefront: home, /search, /products/[param]
  admin/                       # /admin dashboard + /admin/login (demo auth)
  api/
    chat/route.ts              # shopping agent: starts chatFlow, streams the run
    chat/[id]/stream/route.ts  # reconnects to an existing run after a refresh
    admin/chat/route.ts        # admin agent: starts adminChatFlow, streams the run
lib/
  api.ts                       # typed fetch wrapper for the Swag Store API (server-only)
  agent.ts                     # ToolLoopAgent and UI message/tool types
  instructions.ts              # shopping agent instructions
  tools.ts                     # all agent tools (shopping, back-office, bash)
  sandbox.ts                   # named persistent sandbox (createOrGetSandbox)
  workflows/
    chat-flow.ts               # shopping agent as a WorkflowAgent
    return-flow.ts             # durable return: get order → notify → pre-authorize → file
    admin-chat-flow.ts         # admin agent, memory loading, and its instructions
components/
  agent-chat.tsx               # shopping chat (AI Elements)
  agent-product-list.tsx       # searchProducts results as product rows
  agent-product-card.tsx       # getProductDetails result as a product card
  admin-agent-chat.tsx         # admin chat with starting prompts and terminal output
  ai-elements/                 # AI Elements components
```

## How it works

### Shopping agent

- **Tools** (`lib/tools.ts`): `searchProducts`, `getAllCategories`, `getProductDetails`, and `returnOrder`. Inputs are validated with Zod, and API failures come back as an `error` field instead of an invented result.
- **Generative UI:** `searchProducts` results render as product rows with image, name, formatted price, and a link to the product page. `getProductDetails` renders a product card. Both show a loading state while the tool runs.
- **Durability:** `/api/chat` starts `chatFlow` with `start()`. Model calls and each tool's `execute` (`"use step"`) are durable steps that retry on failure. The run ID goes to the client in `x-workflow-run-id`, and `/api/chat/[id]/stream` resumes the stream after a refresh without starting the work again.
- **Returns:** `returnOrder` starts `returnFlow` in the background, so the chat isn't blocked. Each side effect is its own step, so a retry doesn't repeat a notification or refund pre-authorization that already succeeded.

### Store admin agent

- **Separate agent:** `/api/admin/chat` runs `adminChatFlow`, a separate `WorkflowAgent` with its own instructions and tools. None of the admin tools are registered on the shopping agent.
- **Back-office tools:** `getSupportTickets`, `getReturnsHistory`, `getInventoryStock`, and `getSalesAnalytics` support the filters and metadata in `lib/api.ts`. `searchProducts` and `getAllCategories` give it catalog context. All data access is read-only.
- **Sandbox:** the `bash` tool runs commands in one named, persistent Vercel Sandbox (`admin-agent-sandbox`). The agent writes fetched data to files and computes aggregates and joins with `python3` instead of estimating. Commands and their output render as a terminal block in the chat.
- **Persistent memory:** at the start of each run, `readMemories()` loads `/vercel/sandbox/memories.md` into the instructions. The agent appends preferences, corrections, and business context with `bash`. It saves reusable report scripts to `/vercel/sandbox/scripts/` and logs them in the memory file, so recurring reports rerun against current data. The sandbox snapshots when it stops and resumes on the next request, so memory and scripts persist.

### Storefront and data layer

`lib/api.ts` is a typed `fetch` wrapper that talks to the live Swag Store API and injects `BYPASS_SECRET`. It's server-only. Read endpoints use ISR. Stock checks and cart endpoints use `cache: 'no-store'`. Cart mutations run as Server Actions.

`/admin` is gated behind `/admin/login` with a simple demo cookie set by `lib/admin-actions.ts`.

## Deployment

Deploys to [Vercel](https://vercel.com) on every push to `main`. In the project's environment variables, keep the prepopulated `BYPASS_SECRET` and `API_BASE_URL`. AI Gateway and Sandbox authenticate with OIDC automatically on Vercel. If you use `AI_GATEWAY_API_KEY`, add it for each environment and redeploy after changing it.
