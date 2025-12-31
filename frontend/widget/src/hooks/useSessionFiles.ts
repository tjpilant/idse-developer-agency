import { useEffect, useMemo, useState } from "react";
import { FileNode } from "../types/fileTree";

interface UseSessionFilesArgs {
  project: string;
  session: string;
  customTree?: FileNode[];
}

export function useSessionFiles({ project, session, customTree }: UseSessionFilesArgs) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultTree = useMemo<FileNode[]>(() => {
    // Files live under the IDSE collections at workspace root: e.g.
    // intents/projects/<project>/sessions/<session>/intent.md
    const filePath = (collection: string, file: string): string =>
      `${collection}/projects/${project}/sessions/${session}/${file}`.replace(/\/+$/, "");
    return [
      {
        name: "intents (rooted at workspace)",
        path: `intents/projects/${project}/sessions/${session}`,
        type: "folder",
        children: [{ name: "intent.md", path: filePath("intents", "intent.md"), type: "file" }],
      },
      {
        name: "specs",
        path: `specs/projects/${project}/sessions/${session}`,
        type: "folder",
        children: [{ name: "spec.md", path: filePath("specs", "spec.md"), type: "file" }],
      },
      {
        name: "plans",
        path: `plans/projects/${project}/sessions/${session}`,
        type: "folder",
        children: [
          { name: "plan.md", path: filePath("plans", "plan.md"), type: "file" },
          { name: "test-plan.md", path: filePath("plans", "test-plan.md"), type: "file" },
        ],
      },
      {
        name: "tasks",
        path: `tasks/projects/${project}/sessions/${session}`,
        type: "folder",
        children: [{ name: "tasks.md", path: filePath("tasks", "tasks.md"), type: "file" }],
      },
    ];
  }, [project, session]);

  useEffect(() => {
    // For now, we expose a static tree that matches IDSE pipeline docs layout.
    // Backend does not expose a list endpoint yet; this can be swapped
    // when such an endpoint is available.
    setFiles(customTree && customTree.length ? customTree : defaultTree);
    setLoading(false);
  }, [customTree, defaultTree]);

  return { files, loading };
}
