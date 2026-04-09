import type { ChatRequest, MessageRole } from "@workshop/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRole(value: unknown): value is MessageRole {
  return value === "system" || value === "user" || value === "assistant";
}

export function isChatRequest(value: unknown): value is ChatRequest {
  if (!isRecord(value)) return false;

  const messages = value.messages;
  if (!Array.isArray(messages)) return false;

  for (const msg of messages) {
    if (!isRecord(msg)) return false;
    if (!isRole(msg.role)) return false;
    if (typeof msg.content !== "string") return false;
  }

  if (value.model !== undefined && typeof value.model !== "string") return false;
  if (value.reasoningEnabled !== undefined && typeof value.reasoningEnabled !== "boolean") return false;

  return true;
}
