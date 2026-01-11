import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatHistory, ChatMessage as PersistedChatMessage } from "../../hooks/useChatHistory";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

// AG-UI event names we care about; keep loose to avoid runtime coupling.
type AguiEvent =
  | { type: "TEXT_MESSAGE_CONTENT"; content?: string }
  | { type: "SYSTEM_MESSAGE"; content?: string }
  | { type: "TOOL_CALL_START"; tool_name?: string }
  | { type: "TOOL_CALL_END"; tool_name?: string }
  | { type: string; [key: string]: unknown };

// Use chat API base (falls back to API base or current origin)
const chatApiBase =
  ((import.meta as any).env?.VITE_CHAT_API_BASE ??
    (import.meta as any).env?.VITE_API_BASE ??
    (typeof window !== "undefined" ? window.location.origin : ""))?.replace(/\/$/, "") || "";

interface RightPanelProps {
  project?: string;
  session?: string;
  contextInfo?: string; // Additional context like current page slug or document path
  onJumpToDashboard?: () => void;
}

export function RightPanel({
  project,
  session,
  contextInfo,
  onJumpToDashboard
}: RightPanelProps = {}) {
  // Use chat history hook for persistence (defaults to "default"/"default" if not provided)
  const effectiveProject = project || "default";
  const effectiveSession = session || "default";
  const {
    messages: persistedMessages,
    loading: historyLoading,
    saveMessage
  } = useChatHistory(effectiveProject, effectiveSession);

  // Local messages state (combines persisted + in-flight messages)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const streamUrl = useMemo(() => `${chatApiBase}/stream`, []);
  const inboundUrl = useMemo(() => `${chatApiBase}/inbound`, []);
  const eventSourceRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Sync persisted messages to local state when they load
  useEffect(() => {
    if (persistedMessages.length > 0) {
      setLocalMessages(persistedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    } else if (!historyLoading) {
      // First time, show welcome message
      setLocalMessages([
        { role: "assistant", content: "Hi! I'm your IDSE Assistant. Ask me about IDSE, page building, or workflows." }
      ]);
    }
  }, [persistedMessages, historyLoading]);

  // Helper to append messages and keep scroll pinned to bottom.
  const pushMessage = useCallback(
    async (msg: ChatMessage) => {
      setLocalMessages((prev) => [...prev, msg]);

      // Persist assistant messages (user messages already persisted in handleSend)
      if (msg.role === "assistant") {
        await saveMessage("assistant", msg.content);
      }

      // Scroll after the state flushes.
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    },
    [saveMessage]
  );

  // Connect to AG-UI event stream (SSE).
  useEffect(() => {
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnected(true);
      setStatus(null);
    };

    es.onerror = () => {
      setConnected(false);
      setStatus("Connection lost. Retrying...");
    };

    es.onmessage = (event) => {
      try {
        const parsed: AguiEvent = JSON.parse(event.data);
        switch (parsed.type) {
          case "TEXT_MESSAGE_CONTENT":
            pushMessage({ role: "assistant", content: parsed.content ?? "" });
            break;
          case "SYSTEM_MESSAGE":
            pushMessage({ role: "system", content: parsed.content ?? "" });
            break;
          case "TOOL_CALL_START":
            pushMessage({
              role: "system",
              content: `🛠 Starting tool${parsed.tool_name ? `: ${parsed.tool_name}` : ""}...`,
            });
            break;
          case "TOOL_CALL_END":
            pushMessage({
              role: "system",
              content: `✅ Finished tool${parsed.tool_name ? `: ${parsed.tool_name}` : ""}.`,
            });
            break;
          default:
            // Ignore unknown event types; they may include state deltas we don't render yet.
            break;
        }
      } catch (err) {
        pushMessage({ role: "system", content: `⚠️ Stream parse error: ${(err as Error).message}` });
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [streamUrl, effectiveProject, effectiveSession, pushMessage]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setSending(true);

    // Add user message to local state
    setLocalMessages((prev) => [...prev, { role: "user", content: text }]);

    // Persist user message (note: /inbound also persists, but this ensures immediate save)
    await saveMessage("user", text);

    try {
      const res = await fetch(inboundUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "USER_MESSAGE",
          content: text,
          project: effectiveProject,
          session: effectiveSession,
        }),
      });
      if (!res.ok) {
        throw new Error(`Inbound failed (${res.status})`);
      }
      setStatus(null);
    } catch (err) {
      pushMessage({
        role: "system",
        content: `❌ Send failed: ${(err as Error).message}`,
      });
      setStatus("Send failed. Check backend.");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="h-full bg-white/90 border-l border-slate-200/70">
      <div className="h-full flex flex-col">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">AI Assistant</h3>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
              aria-hidden
            />
          </div>
          {project && session && (
            <div className="text-xs text-slate-600 mb-1">
              <span className="font-medium">Session:</span> {project}/{session}
            </div>
          )}
          {contextInfo && (
            <div className="text-xs text-slate-500 truncate">
              <span className="font-medium">Context:</span> {contextInfo}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 mt-1">
              AG-UI stream {connected ? "connected" : "connecting…"}
            </p>
            {onJumpToDashboard && (
              <button
                onClick={onJumpToDashboard}
                className="text-[11px] text-cyan-700 hover:underline"
                type="button"
              >
                Jump to dashboard →
              </button>
            )}
          </div>
        </div>

        {/* Messages - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {historyLoading && (
            <div className="text-center text-xs text-slate-500 py-2">
              Loading chat history...
            </div>
          )}
          {localMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border px-3 py-2 text-sm shadow-sm ${
                msg.role === "assistant"
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : msg.role === "user"
                  ? "bg-indigo-50 border-indigo-100 text-indigo-900"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              <strong className="block text-xs mb-1 uppercase tracking-wide text-slate-500">
                {msg.role === "assistant" ? "Assistant" : msg.role === "user" ? "You" : "System"}
              </strong>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Status bar - Fixed above input */}
        {status && <div className="flex-shrink-0 px-4 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-100">{status}</div>}

        {/* Input form - Fixed at bottom */}
        <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t border-slate-200/70 bg-white/80">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // Submit on Ctrl+Enter or Cmd+Enter
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleSend(e as any);
                }
              }}
              placeholder="Type a message... (Ctrl+Enter to send)"
              className="flex-1 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              rows={2}
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
