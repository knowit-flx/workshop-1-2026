# Workshop 1 (2026): Spec-Driven Development (PromptLab)

PromptLab is a minimal AI chat app used as the base for a spec-driven workshop. Your assignment is to use OpenSpec and/or Spec-Kit to plan and implement new features on top of the working baseline.

## Baseline App (Already Implemented)

- Web UI: single-page React chat
- API: Express `POST /api/chat` that proxies OpenRouter
- Shared types/contracts: `packages/shared`
- Monorepo tooling: pnpm workspaces + Turborepo; `pnpm dev` runs web + api

## Workshop Assignment

Pick 1-2 features, drive the work with artifacts (OpenSpec and/or Spec-Kit), then implement.

Feature suggestions:
- Chat session history (create/list/open/continue; optional file persistence)
- Streaming replies (SSE / token-by-token UI)
- Model switcher (pick model per chat/session)

## Prereqs

- Node.js 20+
- pnpm
- A coding agent/tooling in your editor (Copilot, Codex, KiloCode, etc.)
- An OpenRouter API key _(will be shared during the workshop)_
- Spec-Kit (Specify CLI): https://github.com/github/spec-kit
- OpenSpec CLI: https://github.com/Fission-AI/OpenSpec

## Setup

1) Install dependencies

```bash
pnpm install
```

2) Configure the API key

Copy .env.example and add API_KEY:
```bash
cp .env.example .env
```

3) Start dev

```bash
pnpm dev
```

If you have port conflicts, set a different API port in `apps/api/.env`:

```bash
API_PORT=8799
```

Then point the web dev proxy at it by creating `apps/web/.env`:

```bash
VITE_API_PORT=8799
````

## Repo Layout

- `apps/web` - Vite + React + TypeScript
- `apps/api` - Express + TypeScript
- `packages/shared` - shared TypeScript types (contracts + domain models)

## Workshop Flow (Suggested)

1) Choose a feature (sessions, streaming, model switcher)
2) Produce artifacts (proposal/specs/tasks) using OpenSpec and/or Spec-Kit
3) Implement in small steps; keep the app working
4) Verify with `pnpm typecheck`, `pnpm build`, and a manual test

## Spec Driven Develpment Tools

- [Get started with OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md)
- [Get stated with Spec-Kit](https://github.com/github/spec-kit?tab=readme-ov-file#-get-started)

> ℹ️ The init process is already done, if you want to test and set it up yourself, use branch `clean-start`

## Troubleshooting

- 401/403 from OpenRouter: check `API_KEY` is set for the API process.
- CORS issues: prefer a Vite dev proxy from `apps/web` to `apps/api` under `/api`.

## Docs

- OpenRouter TypeScript SDK: https://openrouter.ai/docs/sdks/typescript/overview
- Model docs (example): https://openrouter.ai/openai/gpt-5.2/api
