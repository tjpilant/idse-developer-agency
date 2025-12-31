import { useCallback, useEffect, useMemo, useState } from "react";
import { getDocument, putDocument } from "../services/milkdownApi";

interface UseMilkdownDocumentArgs {
  project: string;
  session: string;
  path: string;
  token?: string;
  readOnly?: boolean;
}

export function useMilkdownDocument({
  project,
  session,
  path,
  token,
  readOnly = false,
}: UseMilkdownDocumentArgs) {
  const [content, setContent] = useState<string>("");
  const [initial, setInitial] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDocument(project, session, path, token);
        if (cancelled) return;
        setContent(res.content);
        setInitial(res.content);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.status === 404) {
          // New file: treat as empty doc
          setContent("");
          setInitial("");
          setError(null);
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
  }, [project, session, path, token]);

  const isDirty = useMemo(() => content !== initial, [content, initial]);

  const save = useCallback(async () => {
    if (readOnly) return;
    setSaving(true);
    setError(null);
    try {
      await putDocument(project, session, path, content, token);
      setInitial(content);
    } catch (err: any) {
      setError(err?.message || "Failed to save document");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [content, path, project, readOnly, session, token]);

  return {
    content,
    setContent,
    loading,
    saving,
    error,
    save,
    isDirty,
    readOnly,
  };
}
