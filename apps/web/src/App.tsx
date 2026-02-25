import { useRef, useState } from "react";
import type { ChatRequest, ChatResponse, ChatInputMessage, MessageRole } from "@workshop/shared";
import "./App.css";

type UiMessage = ChatInputMessage & { id: string };

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function roleLabel(role: MessageRole) {
  if (role === "user") return "You";
  if (role === "assistant") return "Assistant";
  return "System";
}

export default function App() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reasoningEnabled, setReasoningEnabled] = useState(false);

  const transcriptRef = useRef<HTMLDivElement | null>(null);

  async function send() {
    const content = text.trim();
    if (!content || loading) return;

    setError(null);
    setLoading(true);
    setText("");

    const nextMessages: UiMessage[] = [
      ...messages,
      {
        id: newId(),
        role: "user",
        content
      }
    ];

    setMessages(nextMessages);

    try {
      const body: ChatRequest = {
        messages: nextMessages.map(({ id: _id, ...rest }) => rest),
        reasoningEnabled
      };

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        let detail = "Request failed";
        try {
          const data = (await resp.json()) as { error?: unknown };
          if (typeof data?.error === "string") detail = data.error;
        } catch {
          // ignore
        }
        throw new Error(`${resp.status}: ${detail}`);
      }

      const data = (await resp.json()) as ChatResponse;
      const assistant = data?.message;
      if (!assistant || assistant.role !== "assistant" || typeof assistant.content !== "string") {
        throw new Error("Bad response from server");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: assistant.content,
          ...(assistant.reasoning_details !== undefined
            ? { reasoning_details: assistant.reasoning_details }
            : {})
        }
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight });
      });
    }
  }

  return (
    <div className="page">
      <header className="top">
        <div className="brand">
          <div className="brandMark" aria-hidden="true" />
          <div>
            <div className="brandName">PromptLab</div>
            <div className="brandTag">Minimal chat UI + OpenRouter proxy</div>
          </div>
        </div>
      </header>

      <main className="card">
        <div className="transcript" ref={transcriptRef} role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty">
              <div className="emptyTitle">Start a conversation</div>
              <div className="emptyBody">Your messages stay in-memory only (no history).</div>
            </div>
          ) : null}

          {messages.map((m) => (
            <div key={m.id} className={`msg msg--${m.role}`}>
              <div className="msgMeta">{roleLabel(m.role)}</div>
              <div className="msgBubble">{m.content}</div>
            </div>
          ))}

          {loading ? <div className="loading">Thinking…</div> : null}
        </div>

        {error ? (
          <div className="error" role="status">
            <div className="errorTitle">Error</div>
            <div className="errorBody">{error}</div>
          </div>
        ) : null}

        <div className="composer">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            rows={3}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <div className="composerRow">
            <label className="toggle toggle--inComposer">
              <input
                type="checkbox"
                checked={reasoningEnabled}
                onChange={(e) => setReasoningEnabled(e.target.checked)}
                disabled={loading}
              />
              <span>Reasoning</span>
            </label>

            <button onClick={() => void send()} disabled={loading || text.trim().length === 0}>
              {loading ? "Sending…" : "Send"}
            </button>
          </div>
        </div>

        <div className="hint">Tip: Shift + Enter to send.</div>
      </main>
    </div>
  );
}
