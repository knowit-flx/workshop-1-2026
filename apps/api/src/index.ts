import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatRequest, ChatResponseMessage, MessageRole } from "@workshop/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(repoRoot, "apps/api/.env"), override: true });

const DEFAULT_MODEL = "openai/gpt-5.2";

const PORT = process.env.API_PORT
  ? Number(process.env.API_PORT)
  : process.env.PORT
    ? Number(process.env.PORT)
    : 8787;

const app = express();
app.use(express.json({ limit: "1mb" }));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRole(value: unknown): value is MessageRole {
  return value === "system" || value === "user" || value === "assistant";
}

function isChatRequest(value: unknown): value is ChatRequest {
  if (!isRecord(value)) return false;

  const messages = value.messages;
  if (!Array.isArray(messages)) return false;

  for (const msg of messages) {
    if (!isRecord(msg)) return false;
    if (!isRole(msg.role)) return false;
    if (typeof msg.content !== "string") return false;
    // reasoning_details is opaque; any JSON-ish value is acceptable.
  }

  if (value.model !== undefined && typeof value.model !== "string") return false;
  if (value.reasoningEnabled !== undefined && typeof value.reasoningEnabled !== "boolean") return false;

  return true;
}

app.post("/api/chat", async (req, res) => {
  if (!isChatRequest(req.body)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfigured" });
  }

  const openrouter = new OpenRouter({ apiKey });

  const model = req.body.model ?? process.env.MODEL ?? DEFAULT_MODEL;

  try {
    const completion: any = await openrouter.chat.send({
      model,
      messages: req.body.messages,
      ...(req.body.reasoningEnabled ? { reasoning: { effort: "low" as const } } : {})
    });

    const message = completion?.choices?.[0]?.message;
    const content = message?.content;

    if (typeof content !== "string") {
      return res.status(502).json({ error: "Upstream error" });
    }

    const out: ChatResponseMessage = {
      role: "assistant",
      content,
      ...(message?.reasoning_details !== undefined ? { reasoning_details: message.reasoning_details } : {})
    };

    return res.json({ message: out });
  } catch {
    return res.status(502).json({ error: "Upstream error" });
  }
});

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
