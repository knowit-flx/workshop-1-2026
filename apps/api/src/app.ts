import express from "express";
import type { Express } from "express";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatInputMessage, ChatResponseMessage } from "@workshop/shared";
import { isChatRequest } from "./chat-request.js";

export const DEFAULT_MODEL = "openai/gpt-5.2";

type OpenRouterCompletion = {
  choices?: Array<{
    message?: {
      content?: unknown;
      reasoning_details?: unknown;
    };
  }>;
};

type OpenRouterClient = {
  chat: {
    send: (input: {
      model: string;
      messages: ChatInputMessage[];
      reasoning?: { effort: "low" };
    }) => Promise<unknown>;
  };
};

type CreateOpenRouter = (apiKey: string) => OpenRouterClient;

type CreateAppOptions = {
  apiKey?: string;
  model?: string;
  createOpenRouter?: CreateOpenRouter;
};

function defaultCreateOpenRouter(apiKey: string): OpenRouterClient {
  return new OpenRouter({ apiKey }) as OpenRouterClient;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/chat", async (req, res) => {
    if (!isChatRequest(req.body)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const apiKey = options.apiKey ?? process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const openrouter = (options.createOpenRouter ?? defaultCreateOpenRouter)(apiKey);
    const model = req.body.model ?? options.model ?? process.env.MODEL ?? DEFAULT_MODEL;

    try {
      const completion = (await openrouter.chat.send({
        model,
        messages: req.body.messages,
        ...(req.body.reasoningEnabled ? { reasoning: { effort: "low" as const } } : {})
      })) as OpenRouterCompletion;

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

  return app;
}
