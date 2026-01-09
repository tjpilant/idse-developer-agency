import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ComponentConfig } from "@measured/puck";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:8000";

export interface ChatWidgetProps {
  title: string;
  intro: string;
  placeholder: string;
}

export const ChatWidget: ComponentConfig<{ props: ChatWidgetProps }> = {
  label: "Chat Widget",
  fields: {
    title: { type: "text", label: "Title" },
    intro: { type: "textarea", label: "Intro message" },
    placeholder: { type: "text", label: "Input placeholder" },
  },
  defaultProps: {
    title: "Chat with IDSE Assistant",
    intro: "Ask about intent, specs, tasks, or publishing.",
    placeholder: "Type a message...",
  },
  render: ({ title, intro, placeholder }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
      { role: "assistant", content: intro || "Ask about intent, specs, tasks, or publishing." },
    ]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const streamUrl = useMemo(() => `${apiBase.replace(/\/$/, "")}/stream`, []);
    const inboundUrl = useMemo(() => `${apiBase.replace(/\/$/, "")}/inbound`, []);
    const eventSourceRef = useRef<EventSource | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const pushMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
    };

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
          const parsed = JSON.parse(event.data);
          switch (parsed.type) {
            case "TEXT_MESSAGE_CONTENT":
              pushMessage({
                role: parsed.from === "user" ? "user" : "assistant",
                content: parsed.content ?? "",
              });
              break;
            case "SYSTEM_MESSAGE":
              pushMessage({ role: "system", content: parsed.content ?? "" });
              break;
            default:
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
    }, [streamUrl]);

    const handleSend = async (e: FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;
      setInput("");
      setSending(true);
      pushMessage({ role: "user", content: text });
      try {
        const res = await fetch(inboundUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "USER_MESSAGE", content: text }),
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
      <div className="w-full h-full flex flex-col rounded-3xl border border-slate-200/70 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)] bg-white/90 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/70 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">{title || "Chat"}</h3>
            <p className="text-xs text-slate-500">{connected ? "Connected" : "Connecting..."}</p>
          </div>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
            }`}
            aria-hidden
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
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

        {status && (
          <div className="px-4 py-2 text-xs text-amber-700 bg-amber-50 border-t border-amber-100">{status}</div>
        )}

        <form onSubmit={handleSend} className="p-4 border-t border-slate-200/70 bg-white/80">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder || "Type a message..."}
              className="flex-1 rounded-2xl border border-slate-200/70 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
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
    );
  },
};
