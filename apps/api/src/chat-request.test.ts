import { describe, expect, it } from "vitest";
import { isChatRequest } from "./chat-request.js";

describe("isChatRequest", () => {
  it("accepts a valid request body", () => {
    expect(
      isChatRequest({
        messages: [{ role: "user", content: "hello" }],
        model: "openai/gpt-5.2",
        reasoningEnabled: true
      })
    ).toBe(true);
  });

  it("rejects invalid message role", () => {
    expect(
      isChatRequest({
        messages: [{ role: "bot", content: "hello" }]
      })
    ).toBe(false);
  });

  it("rejects non-string message content", () => {
    expect(
      isChatRequest({
        messages: [{ role: "user", content: 123 }]
      })
    ).toBe(false);
  });
});
