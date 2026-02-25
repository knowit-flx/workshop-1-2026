## Context

This change introduces a minimal workshop-ready monorepo that demonstrates an end-to-end chat flow: a React client sends messages to a local Express API, which proxies requests to OpenRouter using a server-side API key. The repo must stay intentionally small (no DB, no Docker) while still feeling like a realistic baseline for future exercises.

Constraints:
- TypeScript everywhere (`apps/web`, `apps/api`, `packages/shared`).
- One-command dev (`pnpm dev`) runs web + api.
- Secrets are API-only; the browser bundle must never contain `API_KEY`.

## Goals / Non-Goals

**Goals:**
- Provide a working minimal chat UI with transcript, composer, loading, and error states.
- Provide `POST /api/chat` that validates input, calls OpenRouter, and returns a typed assistant message.
- Share API contracts and message types via `packages/shared`.
- Standardize scripts via Turborepo: `dev`, `build`, `typecheck`.

**Non-Goals:**
- Auth, multi-user, persistence, chat sessions.
- Token streaming (can be added later).
- Production hardening (rate limiting, advanced observability, lock/concurrency concerns).

## Decisions

1) Monorepo: pnpm workspaces + Turborepo
- Why: aligns with goals (one-command dev, shared types) and keeps orchestration simple.
- Alternatives: plain pnpm recursive scripts (less structure), Nx (heavier).

2) API framework: Express + minimal middleware
- Why: smallest mental model for workshop; easy to type and test.
- Alternatives: Fastify (nice typing, but slightly more opinionated), Hono (different runtime story).

3) OpenRouter integration: use `@openrouter/sdk` from the server
- Why: matches the desired “OpenRouter SDK” integration and keeps provider concerns server-only.
- Alternative: OpenAI SDK with `baseURL: https://openrouter.ai/api/v1` (fallback if SDK gaps appear).

4) Client-to-API wiring: same-origin `/api/*` via Vite dev proxy
- Why: avoids CORS and avoids leaking server config to the client; client can `fetch('/api/chat')`.
- Alternatives: CORS + explicit API URL env var (more moving parts), separate reverse proxy.

5) Shared contracts: `packages/shared` exports request/response types and domain models
- Why: ensures web and api stay aligned; avoids duplicating validation shapes.
- Trade-off: requires TS project references or path aliasing to keep builds clean.

6) Input validation: minimal runtime checks at the API boundary
- Why: acceptance requires rejecting invalid payloads (400) without adding heavy infra.
- Alternatives: zod (better error messages and schema reuse), express-validator (more verbose).

## Risks / Trade-offs

- Dependency mismatch risk (`@openrouter/sdk` vs OpenAI SDK semantics) -> Mitigation: keep an adapter layer in `apps/api` and isolate provider call behind a small function.
- Accidental secret leakage in web build -> Mitigation: only read `process.env.API_KEY` in `apps/api`; never define `VITE_` vars for secrets; ensure web never imports server modules.
- Type drift between client and server -> Mitigation: define API request/response types in `packages/shared` and use them on both sides.
- Dev ergonomics (ports, proxy) -> Mitigation: default API port, and Vite proxy config to that port; document in README or tasks.

## Migration Plan

- Local-only change (no deployment target assumed). Introduce workspace structure and scripts first, then implement shared types, then API endpoint, then web UI.
- Rollback: revert to single-package structure by removing new workspace config and apps/packages directories (no data migration).

## Open Questions

- Should we standardize the provider library to `@openrouter/sdk` (preferred) or the OpenAI SDK baseURL approach if reasoning details and response shape are easier there?
- Do we want a tiny “smoke” script/test that hits `POST /api/chat` for workshop verification, or is manual verification sufficient for v0?
