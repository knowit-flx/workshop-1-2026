export type MessageRole = "system" | "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  reasoning_details?: unknown;
};

export type ChatInputMessage = {
  role: MessageRole;
  content: string;
  reasoning_details?: unknown;
};

export type ChatRequest = {
  messages: ChatInputMessage[];
  model?: string;
  reasoningEnabled?: boolean;
};

export type ChatResponseMessage = {
  role: "assistant";
  content: string;
  reasoning_details?: unknown;
};

export type ChatResponse = {
  message: ChatResponseMessage;
};
