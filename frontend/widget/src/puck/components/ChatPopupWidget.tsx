import { useEffect, useState } from "react";
import { ComponentConfig } from "@measured/puck";
import { ChatWidget, type ChatWidgetProps } from "./ChatWidget";

type ChatPopupProps = ChatWidgetProps & {
  buttonLabel: string;
};

export const ChatPopupWidget: ComponentConfig<{ props: ChatPopupProps }> = {
  label: "Chat Popup (Modal)",
  fields: {
    title: { type: "text", label: "Title" },
    intro: { type: "textarea", label: "Intro message" },
    placeholder: { type: "text", label: "Input placeholder" },
    buttonLabel: { type: "text", label: "Button label" },
  },
  defaultProps: {
    title: "Chat with IDSE Assistant",
    intro: "Ask about intent, specs, tasks, or publishing.",
    placeholder: "Type a message...",
    buttonLabel: "Chat",
  },
  render: (props) => {
    const [open, setOpen] = useState(false);
    const ChatInner = ChatWidget.render as unknown as React.ComponentType<ChatWidgetProps>;

    // Close on ESC
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-20px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          💬 {props.buttonLabel || "Chat"}
        </button>

        {open && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
            <div
              className="relative h-full w-full max-w-[520px] bg-white/95 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] border-l border-slate-200/70"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200/70 text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label="Close chat"
              >
                ×
              </button>
              <div className="h-full overflow-hidden">
                {ChatInner ? (
                  <ChatInner {...props} />
                ) : (
                  <div className="p-4 text-sm text-slate-600">
                    Chat widget unavailable. Please refresh or contact support.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  },
};
