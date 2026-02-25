## 1. Workspace And Tooling

- [x] 1.1 Create pnpm workspace layout (`apps/`, `packages/`) and add `pnpm-workspace.yaml`
- [x] 1.2 Add Turborepo config so root `pnpm dev` runs `apps/web` + `apps/api`
- [x] 1.3 Add root scripts (`dev`, `build`, `typecheck`) wired through turbo
- [x] 1.4 Add baseline TypeScript config (shared base + per-package `tsconfig.json`)

## 2. Shared Contracts (`packages/shared`)

- [x] 2.1 Scaffold `packages/shared` as a TS-only package with build/typecheck scripts
- [x] 2.2 Implement and export `Message` type (including `reasoning_details?: unknown`)
- [x] 2.3 Define and export API contract types for `POST /api/chat` request/response
- [x] 2.4 Ensure both `apps/web` and `apps/api` import these types during typecheck

## 3. API App (`apps/api`)

- [x] 3.1 Scaffold Express + TypeScript server with a dev runner (watch mode)
- [x] 3.2 Load environment variables (API-only) and ensure missing `API_KEY` fails safely
- [x] 3.3 Implement runtime validation for `POST /api/chat` payload (400 on invalid)
- [x] 3.4 Implement OpenRouter call using `@openrouter/sdk` (or a documented fallback) with:
      - request `model` override
      - default model from `MODEL` or a documented default
      - optional reasoning enablement when `reasoningEnabled: true`
- [x] 3.5 Implement response mapping to `{ message: { role: 'assistant', content, reasoning_details? } }`
- [x] 3.6 Preserve `reasoning_details` exactly as returned; forward any incoming assistant `reasoning_details` upstream unmodified
- [x] 3.7 Implement error mapping: 502 for upstream/provider errors with a safe message (no stack traces/secrets)

## 4. Web App (`apps/web`)

- [x] 4.1 Scaffold Vite + React + TypeScript app with a dev server
- [x] 4.2 Build single-page chat UI: transcript, textarea + send, loading indicator, error display
- [x] 4.3 Implement client call to `POST /api/chat` using same-origin relative URL (`/api/chat`)
- [x] 4.4 Disable duplicate sends while loading; append assistant reply on success
- [x] 4.5 Ensure no persistence (no local storage); conversation exists only in memory
- [x] 4.6 Configure Vite dev proxy for `/api` to the API dev server (avoid CORS)

## 5. Verification

- [x] 5.1 Run `pnpm typecheck` at repo root and fix any TS issues
- [x] 5.2 Run `pnpm build` at repo root and fix build issues
- [ ] 5.3 Manual smoke test: `pnpm dev`, send a message from the web UI, confirm assistant reply renders
- [x] 5.4 Confirm `API_KEY` remains server-only (no `VITE_` secret usage; no secret output in logs)
