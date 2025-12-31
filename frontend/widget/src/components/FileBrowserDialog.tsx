import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Folder, FolderOpen, X } from "lucide-react";
import { FileNode } from "../types/fileTree";

interface FileBrowserDialogProps {
  onSelect: (path: string) => void;
  onCancel: () => void;
  project: string;
  session: string;
}

export function FileBrowserDialog({
  onSelect,
  onCancel,
  project,
  session,
}: FileBrowserDialogProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["projects", "docs"])
  );
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter tree to only show .md files and folders containing .md files
  const filterMarkdownOnly = (nodes: FileNode[]): FileNode[] => {
    return nodes
      .map((node) => {
        if (node.type === "file") {
          // Only keep .md files
          return node.name.endsWith(".md") ? node : null;
        } else if (node.type === "folder" && node.children) {
          // Recursively filter children
          const filteredChildren = filterMarkdownOnly(node.children);
          // Only keep folder if it has .md files in it (or subfolders with .md files)
          return filteredChildren.length > 0
            ? { ...node, children: filteredChildren }
            : null;
        }
        return null;
      })
      .filter((node): node is FileNode => node !== null);
  };

  // Fetch file tree from backend API
  useEffect(() => {
    const fetchFileTree = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5004/api/files/tree");
        if (!response.ok) {
          throw new Error(`Failed to fetch file tree: ${response.statusText}`);
        }
        const data = await response.json();
        // Filter to only show markdown files and relevant folders
        const filteredData = filterMarkdownOnly(data);
        setFileTree(filteredData);
        setError(null);
      } catch (err) {
        console.error("Error fetching file tree:", err);
        setError(err instanceof Error ? err.message : "Failed to load file tree");
      } finally {
        setLoading(false);
      }
    };

    fetchFileTree();
  }, []);


  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, depth: number = 0): JSX.Element => {
    const isExpanded = expandedFolders.has(node.path);
    const indent = depth * 16;

    if (node.type === "folder") {
      return (
        <div key={node.path}>
          <button
            onClick={() => toggleFolder(node.path)}
            className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left transition-colors"
            style={{ paddingLeft: `${indent + 12}px` }}
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{node.name}</span>
          </button>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // File node
    return (
      <button
        key={node.path}
        onClick={() => onSelect(node.path)}
        className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-left transition-colors"
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm">{node.name}</span>
      </button>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Open Document</CardTitle>
              <CardDescription>
                Browse markdown files from the entire repository
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border p-2">
            {loading && (
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading file tree...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center h-full text-red-500">
                Error: {error}
              </div>
            )}
            {!loading && !error && fileTree.map((node) => renderNode(node, 0))}
          </ScrollArea>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
