import { FormEvent, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function RightPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! I'm your IDSE Assistant. Ask me about publishing or workflows." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    // Stub response for now; wire to AG-UI backend when available.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Got it. I’ll help route this to the agency backend (AG-UI coming soon)." },
      ]);
      setSending(false);
    }, 400);
  };

  return (
    <aside className="col-span-12 lg:col-span-3 bg-white border-l border-slate-200">
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">AI Assistant</h3>
          <p className="text-xs text-slate-500">AG-UI chat placeholder (no CopilotKit launcher).</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-xl border px-3 py-2 text-sm ${
                msg.role === "assistant"
                  ? "bg-slate-50 border-slate-200 text-slate-800"
                  : "bg-indigo-50 border-indigo-100 text-indigo-900"
              }`}
            >
              <strong className="block text-xs mb-1 uppercase tracking-wide text-slate-500">
                {msg.role === "assistant" ? "Assistant" : "You"}
              </strong>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              rows={2}
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
}
