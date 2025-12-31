import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crepe } from "@milkdown/crepe";
import { useMilkdownDocument } from "../hooks/useMilkdownDocument";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface MilkdownEditorProps {
  project: string;
  session: string;
  path: string;
  token?: string;
  role?: "owner" | "collaborator" | "reader";
}

export function MilkdownEditor({
  project,
  session,
  path,
  token,
  role = "collaborator",
}: MilkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const readOnly = role === "reader";

  const authToken = token || (import.meta as any).env?.VITE_MILKDOWN_AUTH_TOKEN;

  const { content, setContent, loading, saving, error, save, isDirty } =
    useMilkdownDocument({
      project,
      session,
      path,
      token: authToken,
      readOnly,
    });
  const [initContent, setInitContent] = useState<string>("");

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Create/destroy Crepe when load finishes or path changes
  // NOTE: Don't include 'content' in deps - it would recreate editor on every keystroke
  useLayoutEffect(() => {
    if (loading || !editorRef.current) return;

    if (crepeRef.current) {
      crepeRef.current.destroy();
      crepeRef.current = null;
    }

    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: content || "",
    });
    crepeRef.current = crepe;

    crepe
      .create()
      .then(() => {
        crepe.setReadonly(readOnly);
        crepe.on((listener) => {
          listener.markdownUpdated((_, markdown) => {
            setContent(markdown);
          });
        });
        setInitContent(content || "");
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to create editor", err);
      });

    return () => {
      crepeRef.current?.destroy();
      crepeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, path, readOnly]);

  const handleSave = async () => {
    try {
      await save();
    } catch {
      // errors surfaced via state
    }
  };

  const dirty = isDirty || content !== initContent;

  return (
    <div className="h-full flex flex-col border border-slate-200 rounded-xl shadow-sm bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="text-sm font-semibold text-slate-800 truncate">{path}</div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`px-2 py-1 text-xs rounded ${
              role === "reader" ? "bg-slate-200 text-slate-700" : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {role}
          </span>
          {dirty && <span className="text-xs text-amber-600">● Unsaved</span>}
          <button
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              readOnly
                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } ${saving ? "opacity-70" : ""}`}
            onClick={handleSave}
            disabled={readOnly || saving || loading || !dirty}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && <div className="px-4 py-2 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
          Loading document…
        </div>
      ) : (
        <div ref={editorRef} className="flex-1 overflow-auto" />
      )}
    </div>
  );
}
