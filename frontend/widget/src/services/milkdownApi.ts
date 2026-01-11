import { DocumentResponse, RenderResponse, SaveResponse } from "../types/milkdown";

const API_BASE =
  (import.meta as any).env?.VITE_MILKDOWN_API_URL ||
  (import.meta as any).env?.VITE_API_BASE ||
  (typeof window !== "undefined" ? window.location.origin : "");

const NORMALIZED_API_BASE = API_BASE ? API_BASE.replace(/\/$/, "") : "";

function withAuth(token?: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getDocument(
  project: string,
  session: string,
  path: string,
  token?: string
): Promise<DocumentResponse> {
  const res = await fetch(
    `${NORMALIZED_API_BASE}/api/sessions/${project}/${session}/documents?path=${encodeURIComponent(
      path
    )}`,
    {
      headers: {
        ...withAuth(token),
      },
    }
  );
  if (!res.ok) {
    const err: any = new Error(`Failed to load document (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function putDocument(
  project: string,
  session: string,
  path: string,
  content: string,
  token?: string
): Promise<SaveResponse> {
  const res = await fetch(`${NORMALIZED_API_BASE}/api/sessions/${project}/${session}/documents`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ path, content }),
  });

  if (!res.ok) {
    const err: any = new Error(`Failed to save document (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function renderMarkdown(
  project: string,
  session: string,
  content: string,
  token?: string
): Promise<RenderResponse> {
  const res = await fetch(`${NORMALIZED_API_BASE}/api/sessions/${project}/${session}/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...withAuth(token),
    },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    throw new Error(`Failed to render markdown (${res.status})`);
  }
  return res.json();
}

export interface FileItem {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileItem[];
}

export async function listFiles(
  project: string,
  session: string,
  path: string = "",
  token?: string
): Promise<FileItem[]> {
  const res = await fetch(
    `${NORMALIZED_API_BASE}/api/sessions/${project}/${session}/files?path=${encodeURIComponent(path)}`,
    {
      headers: {
        ...withAuth(token),
      },
    }
  );
  if (!res.ok) {
    const err: any = new Error(`Failed to list files (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
