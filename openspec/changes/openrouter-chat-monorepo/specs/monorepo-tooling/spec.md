## ADDED Requirements

### Requirement: Workspace layout
The repo MUST be structured as a pnpm workspace with:
- `apps/web` (Vite + React + TypeScript)
- `apps/api` (Express + TypeScript)
- `packages/shared` (shared TypeScript types only)

#### Scenario: Workspace directories exist
- **WHEN** the repo is checked out
- **THEN** the workspace contains `apps/web`, `apps/api`, and `packages/shared`

### Requirement: One-command dev
The repo MUST provide a root `pnpm dev` command that runs both the web app and the API concurrently.

#### Scenario: Dev command starts both apps
- **WHEN** the developer runs `pnpm dev` at the repo root
- **THEN** both the web dev server and the API dev server start

### Requirement: Build and typecheck scripts
The repo MUST provide root scripts:
- `pnpm build` to build all packages/apps
- `pnpm typecheck` to typecheck all packages/apps

#### Scenario: Typecheck runs across the workspace
- **WHEN** the developer runs `pnpm typecheck`
- **THEN** type errors are reported for any workspace package

### Requirement: Shared types package
`packages/shared` MUST define and export shared domain models and API contracts, including a `Message` type with:
- `id: string`
- `role: 'system' | 'user' | 'assistant'`
- `content: string`
- `createdAt: string` (ISO)
- `reasoning_details?: unknown`

#### Scenario: Web and API can import shared types
- **WHEN** `apps/web` and `apps/api` are built or typechecked
- **THEN** both can import types from `packages/shared` without duplication

### Requirement: Server-only secrets
Only `apps/api` MAY read `API_KEY` from the environment.
The web app MUST NOT depend on `API_KEY` at runtime or build time.

#### Scenario: Client bundle has no API key dependency
- **WHEN** the web app is built
- **THEN** the client bundle does not require or reference `API_KEY`
