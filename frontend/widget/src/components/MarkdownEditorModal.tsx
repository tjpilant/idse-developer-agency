import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crepe } from "@milkdown/crepe";
import { getDocument, putDocument } from "../services/milkdownApi";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface MarkdownEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: string;
  session: string;
  initialPath?: string;
  token?: string;
  role?: "owner" | "collaborator" | "reader";
}

export function MarkdownEditorModal({
  isOpen,
  onClose,
  project,
  session,
  initialPath,
  token,
  role = "collaborator",
}: MarkdownEditorModalProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(initialPath || null);
  const [content, setContent] = useState<string>("");
  const [initialContent, setInitialContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(!initialPath);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [snapshots, setSnapshots] = useState<{ ts: number; content: string }[]>([]);
  const readOnly = role === "reader";

  const isDirty = content !== initialContent;

  const loadSnapshots = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  };

  const saveSnapshots = (key: string, data: { ts: number; content: string }[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(data.slice(0, 5))); // cap at 5
      console.log("Saved snapshots", { key, count: data.length });
    } catch {
      // ignore storage errors
    }
  };

  const snapshotKey = currentPath
    ? `mdsnap:${project}:${session}:${currentPath}`
    : null;

  // Load document when path changes
  useEffect(() => {
    if (!currentPath || !isOpen) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Loading document:', { project, session, currentPath, hasToken: !!token });
        const res = await getDocument(project, session, currentPath, token);
        if (cancelled) return;
        setContent(res.content);
        setInitialContent(res.content);
        setShowOpenDialog(false);
      } catch (err: any) {
        if (cancelled) return;
        console.error('Failed to load document:', err);
        if (err?.status === 404) {
          // New file
          setContent("");
          setInitialContent("");
          setShowOpenDialog(false);
        } else if (err?.status === 401) {
          setError("Unauthorized - Please provide a valid authentication token");
        } else {
          setError(err?.message || "Failed to load document");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentPath, project, session, token, isOpen]);

  // Load snapshots when document changes
  useEffect(() => {
    if (snapshotKey) {
      const loaded = loadSnapshots(snapshotKey);
      console.log('[Snapshot] Loading for key:', snapshotKey);
      console.log('[Snapshot] Found snapshots:', loaded.length);
      setSnapshots(loaded);
    } else {
      setSnapshots([]);
    }
  }, [snapshotKey]);

  // Create Crepe editor when modal opens and document loads
  useLayoutEffect(() => {
    if (!isOpen || !editorRef.current || loading || showOpenDialog) return;

    // Destroy existing editor if any
    if (crepeRef.current) {
      crepeRef.current.destroy();
      crepeRef.current = null;
    }

    console.log('Creating Crepe editor with content:', content.substring(0, 50));

    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: content,
    });

    crepeRef.current = crepe;

    crepe
      .create()
      .then(() => {
        console.log('Crepe editor created successfully');
        crepe.setReadonly(readOnly);
        crepe.on((listener) => {
          listener.markdownUpdated((_, markdown) => {
            console.log('Content updated by user');
            setContent(markdown);
          });
        });
      })
      .catch((err) => {
        console.error("Failed to create editor", err);
      });

    return () => {
      console.log('Destroying Crepe editor');
      crepeRef.current?.destroy();
      crepeRef.current = null;
    };
  }, [isOpen, loading, showOpenDialog, readOnly, currentPath]); // Only recreate when document changes, not content!

  const handleSave = async () => {
    if (!currentPath || readOnly) return;
    const ok = window.confirm(
      `Apply changes to ${currentPath}? A snapshot of the previous version will be saved locally.`
    );
    if (!ok) return;
    setSaving(true);
    setError(null);
    try {
      // snapshot previous content before overwrite (even if empty)
      if (snapshotKey) {
        const prev = initialContent ?? "";
        const next = [{ ts: Date.now(), content: prev }, ...snapshots];
        console.log('[Snapshot] Saving snapshot:', { key: snapshotKey, count: next.length });
        setSnapshots(next.slice(0, 5));
        saveSnapshots(snapshotKey, next);
      }
      await putDocument(project, session, currentPath, content, token);
      setInitialContent(content);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAs = async (newPath: string) => {
    if (readOnly) return;
    setSaving(true);
    setError(null);
    try {
      if (snapshotKey) {
        const prev = initialContent ?? "";
        const next = [{ ts: Date.now(), content: prev }, ...snapshots];
        saveSnapshots(snapshotKey, next);
      }
      await putDocument(project, session, newPath, content, token);
      setCurrentPath(newPath);
      setInitialContent(content);
      setShowSaveAsDialog(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const restoreSnapshot = (ts: number) => {
    const snap = snapshots.find((s) => s.ts === ts);
    if (!snap) return;
    if (
      isDirty &&
      !window.confirm("Restore snapshot? Unsaved changes will be replaced in the editor.")
    ) {
      return;
    }
    setContent(snap.content);
    setInitialContent(snap.content);
    try {
      // Best-effort to push content into the editor without full reinit
      // @ts-ignore - setMarkdown may exist on Crepe instance
      crepeRef.current?.setMarkdown?.(snap.content);
    } catch {
      // ignore if not supported
    }
  };

  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        return;
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onMouseDown={(e) => {
          // Only close if clicking directly on backdrop, not children
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }
        }}
      />

      {/* Modal content */}
      <div className="fixed inset-4 z-50 bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="text-sm font-semibold text-slate-800 truncate flex-1">
            {currentPath || "Untitled"}
          </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOpenDialog(true)}
            className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Open…
          </button>
          <button
            onClick={() => setShowSaveAsDialog(true)}
            className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
            disabled={readOnly}
          >
            Save As…
          </button>
          {snapshots.length > 0 ? (
            <div className="flex items-center gap-1">
              <label className="text-xs text-slate-600">Snapshots ({snapshots.length}):</label>
              <select
                className="text-xs border border-slate-300 rounded px-2 py-1"
                onChange={(e) => restoreSnapshot(Number(e.target.value))}
                value=""
              >
                <option value="" disabled>
                  Restore…
                </option>
                {snapshots.map((s) => (
                  <option key={s.ts} value={s.ts}>
                    {new Date(s.ts).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-xs text-slate-400">No snapshots yet</span>
          )}
          {isDirty && <span className="text-xs text-amber-600">● Unsaved</span>}
          <button
            onClick={handleSave}
            className={`px-3 py-1 rounded text-sm font-semibold ${
              readOnly || !currentPath
                  ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              disabled={readOnly || saving || !currentPath || !isDirty}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-1 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Close
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 bg-red-50 text-sm text-red-600 border-b border-red-200">
            {error}
          </div>
        )}

        {/* Editor or dialogs */}
        {showOpenDialog ? (
          <FileOpenDialog
            onSelect={(path) => setCurrentPath(path)}
            onCancel={() => setShowOpenDialog(false)}
            project={project}
            session={session}
          />
        ) : showSaveAsDialog ? (
          <FileSaveAsDialog
            currentPath={currentPath}
            onSave={handleSaveAs}
            onCancel={() => setShowSaveAsDialog(false)}
          />
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            Loading document…
          </div>
        ) : (
          <div ref={editorRef} className="flex-1 overflow-auto" />
        )}
      </div>
    </>
  );
}

// Simple file open dialog with browser file picker
function FileOpenDialog({
  onSelect,
  onCancel,
  project,
  session,
}: {
  onSelect: (path: string) => void;
  onCancel: () => void;
  project: string;
  session: string;
}) {
  const [shortPath, setShortPath] = useState("");

  const buildFullPath = (short: string): string => {
    console.log('buildFullPath input:', short);

    // If it already looks like a full path, use it as-is
    if (short.includes('/projects/')) {
      console.log('Already full path, returning as-is');
      return short;
    }

    // Normalize to: projects/<project>/sessions/<session>/<shortpath>
    // where shortpath is like "intents/intent.md" or "specs/spec.md"
    const fullPath = `projects/${project}/sessions/${session}/${short}`;
    console.log('buildFullPath output:', fullPath);
    return fullPath;
  };

  const commonShortPaths = [
    "intents/intent.md",
    "specs/spec.md",
    "plans/plan.md",
    "tasks/tasks.md",
    "contexts/context.md",
  ];

  const handleOpen = () => {
    const fullPath = buildFullPath(shortPath);
    console.log('handleOpen called, fullPath:', fullPath);
    onSelect(fullPath);
  };

  const handleQuickPick = (e: React.MouseEvent, shortPath: string) => {
    console.log('handleQuickPick - START');
    e.preventDefault();
    e.stopPropagation();

    const fullPath = buildFullPath(shortPath);
    console.log('handleQuickPick called, shortPath:', shortPath, 'fullPath:', fullPath);
    onSelect(fullPath);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <h2 className="text-lg font-semibold text-slate-800">Open Document</h2>
      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
          <strong>Tip:</strong> Use short path format like <code className="bg-blue-100 px-1 rounded">intents/intent.md</code>
          <br />
          Full path is auto-generated: <code className="bg-blue-100 px-1 rounded text-xs">{shortPath ? buildFullPath(shortPath) : `${project}/${session}/...`}</code>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Path (short format)</label>
          <input
            type="text"
            value={shortPath}
            onChange={(e) => setShortPath(e.target.value)}
            placeholder="e.g., plans/plan.md"
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-700 mb-2">Quick Open:</div>
          <div className="flex flex-col gap-1">
            {commonShortPaths.map((p) => (
              <button
                key={p}
                onClick={(e) => handleQuickPick(e, p)}
                className="text-left px-3 py-2 text-sm rounded hover:bg-slate-100 text-slate-700"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleOpen}
            disabled={!shortPath}
            className="flex-1 px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Open
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Simple save-as dialog
function FileSaveAsDialog({
  currentPath,
  onSave,
  onCancel,
}: {
  currentPath: string | null;
  onSave: (path: string) => void;
  onCancel: () => void;
}) {
  const [path, setPath] = useState(currentPath || "");

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <h2 className="text-lg font-semibold text-slate-800">Save Document As</h2>
      <div className="w-full max-w-md flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="e.g., intents/my-document.md"
            className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSave(path)}
            disabled={!path}
            className="flex-1 px-4 py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
