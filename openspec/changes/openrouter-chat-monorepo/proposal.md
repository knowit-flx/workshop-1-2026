## Why

We need a minimal, end-to-end reference for a React chat UI backed by a tiny TypeScript API that proxies OpenRouter, with secrets guaranteed to stay on the server. This provides a clean baseline for workshop exercises and future extensions (streaming, auth) without premature complexity.

## What Changes

- Introduce a Turbo + pnpm monorepo with `apps/web`, `apps/api`, and `packages/shared` (TypeScript everywhere).
- Add a single-page web chat UI (transcript + composer) with loading and error states.
- Add an Express/TS API endpoint `POST /api/chat` that validates input, calls OpenRouter via the OpenRouter SDK, and returns the assistant message.
- Add shared TypeScript types for messages and API contracts.
- Provide one-command dev (`pnpm dev`) and repo-wide `build`/`typecheck` scripts.

## Non-goals

- Authentication or multi-user sessions.
- Token streaming in v0/v1.
- Production-grade concurrency/file-locking or persistence (no DB).
- Containerization (no Docker).

## Capabilities

### New Capabilities

- `chat-api-proxy`: Single `POST /api/chat` endpoint that proxies OpenRouter via SDK, returns `{ message }`, and never exposes `API_KEY` to the client.
- `chat-web-ui`: Minimal React UI that can send a message, render the assistant reply, and surface errors without crashing.
- `monorepo-tooling`: Turbo + pnpm workspace wiring (dev/build/typecheck) and `packages/shared` for typed contracts.

### Modified Capabilities

<!-- None -->

## Impact

- New workspace layout under `apps/` and `packages/` with new build/dev scripts.
- New runtime dependency on OpenRouter SDK (and Express on the API).
- New API-only environment variables (`API_KEY` required; `MODEL`/`PORT` optional) with explicit server-only handling.
