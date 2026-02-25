<!--
Sync Impact Report

- Version change: none -> 1.0.0
- Modified principles: none (new constitution)
- Added sections: Core Principles; Constraints & Security; Workflow & Quality Gates; Governance
- Removed sections: none
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - N/A: .specify/templates/commands/*.md (directory not present)
- Follow-up TODOs: none
-->

# PromptLab Constitution

## Core Principles

### I. Keep It Minimal (Boring Defaults)
Prefer the smallest set of understandable parts that ships value.

- Changes MUST avoid introducing new frameworks, services, or tooling unless the benefit is clear and documented.
- Dependencies MUST be justified; avoid “nice to have” libraries.
- Prefer the existing monorepo shape (pnpm workspaces + Turborepo) and TypeScript everywhere.

Rationale: This repo is a workshop baseline; complexity hides learning and slows iteration.

### II. Secrets Stay Server-Side
All secrets (especially the OpenRouter API key) live only on the server.

- `API_KEY` MUST NOT reach browser code, build output, or client logs.
- Secrets MUST be loaded from `.env`.
- Logs MUST NOT contain secrets or full credential-bearing headers.

Rationale: Prevent accidental leakage in a teaching repo and keep the client safe-by-default.

### III. Spec-Driven, Testable Behavior
Every feature is driven by a spec that is concrete and testable.

- Specs MUST include prioritized user stories with acceptance scenarios.
- Specs MUST include edge/error cases; for HTTP-facing work, cover at least `400`, `404`, and `502`.
- Requirements MUST be phrased as verifiable statements (MUST/SHOULD with rationale).
- Shared contracts/types MUST live in `packages/shared` (types/contracts only).

Rationale: Clear acceptance criteria reduces rework and keeps implementation review objective.

### IV. Small, Verifiable Tasks
Implementation work is broken into small steps that can be verified quickly.

- Tasks MUST be sized to ~1-2 hours each and include exact file paths.
- Tasks MUST include verification steps where relevant (e.g., `pnpm dev`, `pnpm typecheck`, `pnpm build`).
- Keep the baseline app working after each logical chunk; avoid long-lived broken states.

Rationale: Small steps improve parallelism, review quality, and workshop momentum.

### V. Respect Runtime Boundaries
Keep boundaries between web, API, and shared packages crisp.

- Web (`apps/web`) MUST call the API via the `/api` dev proxy; avoid ad-hoc CORS setups.
- API (`apps/api`) owns external integrations (OpenRouter) and network secrets.
- OpenRouter integration MUST use the OpenAI SDK with `baseURL https://openrouter.ai/api/v1`.

Rationale: Clear separation prevents accidental secret exposure and simplifies debugging.

## Constraints & Security

- **Node.js**: Target Node.js 20+.
- **Language**: TypeScript everywhere.
- **OpenRouter**: API calls proxy through `apps/api`; browser MUST NOT call OpenRouter directly.
- **Error handling**: For API work, define behavior for invalid input (`400`), missing resources (`404`), and upstream failures (`502`).
- **Environment**: Use `.env` for secrets; commit `.env.example`, never commit `.env`.

## Workflow & Quality Gates

- **Proposals**: Keep proposals under 500 words and include a “Non-goals” section.
- **Specs**: Include testable acceptance scenarios and explicit edge/error cases.
- **Plans**: Include a “Constitution Check” gate before design/implementation.
- **Tasks**: Break work into small, verifiable steps; include typecheck/build verification where relevant.

## Governance

- The constitution is the source of truth for project rules; when templates or docs conflict, the constitution wins.
- Amendments MUST be made via PR that updates this file and describes why the change is needed.
- Versioning policy:
  - MAJOR: Backward-incompatible governance changes (principle removal/redefinition).
  - MINOR: New principle/section or material expansion of guidance.
  - PATCH: Clarifications, wording fixes, and non-semantic refinements.
- Compliance review expectations:
  - Feature plans MUST include an explicit Constitution Check.
  - Exceptions MUST be documented in the feature plan (e.g., Complexity Tracking) with a rationale.

**Version**: 1.0.0 | **Ratified**: 2026-02-25 | **Last Amended**: 2026-02-25
