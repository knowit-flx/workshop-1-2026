import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, "apps/api/.env"), override: true });

const PORT = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : process.env.PORT
    ? Number(process.env.PORT)
    : 8787;

const app = createApp();

const server = app.listen(PORT, () => {
  // Intentionally do not log secrets.
  console.log(`[api] listening on http://localhost:${PORT}`);
});

server.on("error", (err: unknown) => {
  const e = err as { code?: unknown; message?: unknown };
  if (e?.code === "EADDRINUSE") {
    console.error(`[api] port ${PORT} is already in use`);
    console.error(`[api] set API_PORT (or PORT) in apps/api/.env to a free port`);
    process.exit(1);
  }
  console.error("[api] server error", e?.message ?? err);
  process.exit(1);
});
