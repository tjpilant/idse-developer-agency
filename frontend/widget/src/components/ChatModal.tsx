import { useEffect, useRef } from "react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ChatModal({ isOpen, onClose, children }: ChatModalProps) {
  const backdropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="relative h-full w-full max-w-[520px] bg-white shadow-2xl border-l border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="Close chat"
        >
          ×
        </button>
        <div className="h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
