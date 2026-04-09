import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ChatRequest } from "@workshop/shared";
import { createApp } from "./app.js";

const closeServer = (server: { close: (cb: (err?: Error) => void) => void }) =>
  new Promise<void>((resolve, reject) => {
    server.close((err?: Error) => {
      if (err) reject(err);
      else resolve();
    });
  });

async function postJson(baseUrl: string, body: unknown) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  return response;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createApp", () => {
  it("returns 400 for invalid request body", async () => {
    const app = createApp({
      apiKey: "test-key",
      createOpenRouter: () => ({ chat: { send: vi.fn() } })
    });
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    try {
      const response = await postJson(`http://127.0.0.1:${port}`, { invalid: true });
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ error: "Invalid request body" });
    } finally {
      await closeServer(server);
    }
  });

  it("returns 500 when API key is missing", async () => {
    const app = createApp({ apiKey: "" });
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    try {
      const response = await postJson(`http://127.0.0.1:${port}`, {
        messages: [{ role: "user", content: "hi" }]
      });
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: "Server misconfigured" });
    } finally {
      await closeServer(server);
    }
  });

  it("returns 200 with assistant message and reasoning details", async () => {
    const send = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: "Hello back",
            reasoning_details: { trace: "ok" }
          }
        }
      ]
    });
    const createOpenRouter = vi.fn(() => ({ chat: { send } }));
    const app = createApp({ apiKey: "test-key", createOpenRouter });
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    const body: ChatRequest = {
      messages: [{ role: "user", content: "hello" }],
      reasoningEnabled: true
    };

    try {
      const response = await postJson(`http://127.0.0.1:${port}`, body);
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        message: {
          role: "assistant",
          content: "Hello back",
          reasoning_details: { trace: "ok" }
        }
      });
      expect(createOpenRouter).toHaveBeenCalledWith("test-key");
      expect(send).toHaveBeenCalledWith({
        model: "openai/gpt-5.2",
        messages: body.messages,
        reasoning: { effort: "low" }
      });
    } finally {
      await closeServer(server);
    }
  });

  it("returns 502 when upstream response content is not a string", async () => {
    const app = createApp({
      apiKey: "test-key",
      createOpenRouter: () => ({
        chat: {
          send: vi.fn().mockResolvedValue({ choices: [{ message: { content: 123 } }] })
        }
      })
    });
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    try {
      const response = await postJson(`http://127.0.0.1:${port}`, {
        messages: [{ role: "user", content: "hello" }]
      });
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ error: "Upstream error" });
    } finally {
      await closeServer(server);
    }
  });

  it("returns 502 when upstream throws", async () => {
    const app = createApp({
      apiKey: "test-key",
      createOpenRouter: () => ({
        chat: {
          send: vi.fn().mockRejectedValue(new Error("network failed"))
        }
      })
    });
    const server = app.listen(0);
    const { port } = server.address() as AddressInfo;

    try {
      const response = await postJson(`http://127.0.0.1:${port}`, {
        messages: [{ role: "user", content: "hello" }]
      });
      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({ error: "Upstream error" });
    } finally {
      await closeServer(server);
    }
  });
});
