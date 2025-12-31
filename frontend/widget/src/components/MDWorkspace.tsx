import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Crepe } from "@milkdown/crepe";
import { getDocument, putDocument } from "../services/milkdownApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Save, FolderOpen, FilePlus, Loader2 } from "lucide-react";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

interface MDWorkspaceProps {
  activeSubView: "open" | "intent" | "spec" | "plan" | "tasks" | "context" | null;
  project: string;
  session: string;
  token?: string;
  role?: "owner" | "collaborator" | "reader";
}

export function MDWorkspace({
  activeSubView,
  project,
  session,
  token,
  role = "collaborator",
}: MDWorkspaceProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [initialContent, setInitialContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const readOnly = role === "reader";

  const isDirty = content !== initialContent;

  // Quick-load document based on activeSubView
  useEffect(() => {
    if (!activeSubView || activeSubView === "open") return;

    const pathMap: Record<string, string> = {
      intent: `intents/projects/${project}/sessions/${session}/intent.md`,
      spec: `specs/projects/${project}/sessions/${session}/spec.md`,
      plan: `plans/projects/${project}/sessions/${session}/plan.md`,
      tasks: `tasks/projects/${project}/sessions/${session}/tasks.md`,
      context: `contexts/projects/${project}/sessions/${session}/context.md`,
    };

    const path = pathMap[activeSubView];
    if (path) {
      setCurrentPath(path);
    }
  }, [activeSubView, project, session]);

  // Show open dialog when "Open Document" is selected
  useEffect(() => {
    if (activeSubView === "open") {
      setShowOpenDialog(true);
    }
  }, [activeSubView]);

  // Load document when path changes
  useEffect(() => {
    if (!currentPath) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDocument(project, session, currentPath, token);
        if (cancelled) return;
        setContent(res.content);
        setInitialContent(res.content);
        setShowOpenDialog(false);
      } catch (err: any) {
        if (cancelled) return;
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
  }, [currentPath, project, session, token]);

  // Create Crepe editor when document loads
  useLayoutEffect(() => {
    if (!editorRef.current || loading || showOpenDialog || showSaveAsDialog) return;

    // Destroy existing editor if any
    if (crepeRef.current) {
      crepeRef.current.destroy();
      crepeRef.current = null;
    }

    const crepe = new Crepe({
      root: editorRef.current,
      defaultValue: content,
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
      })
      .catch((err) => {
        console.error("Failed to create editor", err);
      });

    return () => {
      crepeRef.current?.destroy();
      crepeRef.current = null;
    };
  }, [loading, showOpenDialog, showSaveAsDialog, readOnly, currentPath]);

  const handleSave = async () => {
    if (!currentPath || readOnly) return;
    setSaving(true);
    setError(null);
    try {
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

  const buildFullPath = (short: string): string => {
    // If already a full path with /projects/, use as-is
    if (short.includes("/projects/")) {
      return short;
    }

    // List of IDSE pipeline folders that use session structure
    const sessionFolders = ["intents", "specs", "plans", "tasks", "contexts"];

    const parts = short.split("/");

    // If path has multiple parts, check if first part is a session folder
    if (parts.length >= 2) {
      const folder = parts[0];
      const filename = parts.slice(1).join("/");

      // If it's a session folder (intents, specs, plans, tasks, contexts), add session path
      if (sessionFolders.includes(folder)) {
        return `${folder}/projects/${project}/sessions/${session}/${filename}`;
      }

      // Otherwise, use the path as-is (repository-root file like docs/03-idse-pipeline.md)
      return short;
    }

    // Single filename defaults to intents folder
    return `intents/projects/${project}/sessions/${session}/${short}`;
  };

  // Show "Open Document" dialog
  if (showOpenDialog) {
    return (
      <FileOpenDialog
        onSelect={(path) => {
          setCurrentPath(path);
          setShowOpenDialog(false);
        }}
        onCancel={() => setShowOpenDialog(false)}
        project={project}
        session={session}
        buildFullPath={buildFullPath}
      />
    );
  }

  // Show "Save As" dialog
  if (showSaveAsDialog) {
    return (
      <FileSaveAsDialog
        currentPath={currentPath}
        onSave={handleSaveAs}
        onCancel={() => setShowSaveAsDialog(false)}
      />
    );
  }

  // Welcome screen when no document selected
  if (!currentPath && !activeSubView) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>MD Editor</CardTitle>
            <CardDescription>
              Select a document from the left menu or open a custom document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowOpenDialog(true)} className="w-full">
              <FolderOpen className="h-4 w-4 mr-2" />
              Open Document
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-indigo-600" />
          <div>
            <div className="font-semibold text-slate-900 truncate max-w-md">
              {currentPath || "Untitled"}
            </div>
            <div className="text-xs text-slate-500">
              {project} / {session}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setShowOpenDialog(true)} variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Open
          </Button>
          <Button
            onClick={() => setShowSaveAsDialog(true)}
            variant="outline"
            size="sm"
            disabled={readOnly}
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Save As
          </Button>
          {isDirty && <span className="text-xs text-amber-600 font-semibold">● Unsaved</span>}
          <Button
            onClick={handleSave}
            size="sm"
            disabled={readOnly || saving || !currentPath || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-sm text-red-600 border-b border-red-200">
          {error}
        </div>
      )}

      {/* Editor */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-slate-600">Loading document...</p>
          </div>
        </div>
      ) : (
        <div ref={editorRef} className="flex-1 overflow-auto bg-white" />
      )}
    </div>
  );
}

// File Open Dialog
function FileOpenDialog({
  onSelect,
  onCancel,
  project,
  session,
  buildFullPath,
}: {
  onSelect: (path: string) => void;
  onCancel: () => void;
  project: string;
  session: string;
  buildFullPath: (short: string) => string;
}) {
  const [shortPath, setShortPath] = useState("");
  const [error, setError] = useState<string | null>(null);

  const commonShortPaths = [
    "intents/intent.md",
    "specs/spec.md",
    "plans/plan.md",
    "tasks/tasks.md",
    "contexts/context.md",
  ];

  // Validate path against backend restrictions
  const validateShortPath = (path: string): boolean => {
    const pathPattern = /^(intents|contexts|specs|plans|tasks)\//;
    return pathPattern.test(path);
  };

  const handleOpen = () => {
    if (!validateShortPath(shortPath)) {
      setError("Path must start with: intents/, specs/, plans/, tasks/, or contexts/");
      return;
    }
    setError(null);
    const fullPath = buildFullPath(shortPath);
    onSelect(fullPath);
  };

  const handleQuickPick = (shortPath: string) => {
    // Quick picks are always valid (pre-defined paths)
    setError(null);
    const fullPath = buildFullPath(shortPath);
    onSelect(fullPath);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Open Document</CardTitle>
          <CardDescription>
            Use short path format like <code className="bg-slate-100 px-1 rounded">plans/plan.md</code>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <strong>Full path preview:</strong>{" "}
            <code className="bg-blue-100 px-1 rounded text-xs">
              {shortPath ? buildFullPath(shortPath) : `${project}/${session}/...`}
            </code>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Document Path (short format)
            </label>
            <input
              type="text"
              value={shortPath}
              onChange={(e) => {
                setShortPath(e.target.value);
                setError(null); // Clear error on input change
              }}
              placeholder="e.g., plans/plan.md or tasks/task-list.md"
              className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-500">
              Must start with: intents/, specs/, plans/, tasks/, or contexts/
            </p>
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Quick Open:</div>
            <div className="flex flex-col gap-1">
              {commonShortPaths.map((p) => (
                <button
                  key={p}
                  onClick={() => handleQuickPick(p)}
                  className="text-left px-3 py-2 text-sm rounded hover:bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleOpen} disabled={!shortPath} className="flex-1">
              Open
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Save As Dialog
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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Save Document As</CardTitle>
          <CardDescription>Enter the new document path</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Button onClick={() => onSave(path)} disabled={!path} className="flex-1">
              Save
            </Button>
            <Button onClick={onCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
