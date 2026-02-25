# PromptLab (Clean Start)

This branch is a working baseline of PromptLab without any spec-driven tooling scaffolding (no OpenSpec / Spec-Kit setup).

## What's Included

- Web UI: single-page React chat
- API: Express `POST /api/chat` that proxies OpenRouter
- Shared types/contracts: `packages/shared`
- Monorepo tooling: pnpm workspaces + Turborepo; `pnpm dev` runs web + api

## Prereqs

- Node.js 20+
- pnpm
- An OpenRouter API key

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

## Notes

- The web dev server proxies `/api/*` to the API server.
- See `main` for the spec-driven workshop setup.

## Troubleshooting

- 401/403 from OpenRouter: check `API_KEY` is set for the API process.
- CORS issues: prefer a Vite dev proxy from `apps/web` to `apps/api` under `/api`.

## Docs

- OpenRouter TypeScript SDK: https://openrouter.ai/docs/sdks/typescript/overview
- Model docs (example): https://openrouter.ai/openai/gpt-5.2/api
