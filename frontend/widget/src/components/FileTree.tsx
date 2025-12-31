import { FileNode } from "../types/fileTree";

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath?: string;
  onSelect: (path: string) => void;
}

function Node({ node, selectedPath, onSelect }: FileTreeProps & { node: FileNode }) {
  const isSelected = selectedPath === node.path;
  if (node.type === "file") {
    return (
      <button
        className={`w-full text-left px-3 py-1 rounded ${
          isSelected ? "bg-indigo-100 text-indigo-700 font-semibold" : "hover:bg-slate-100"
        }`}
        onClick={() => onSelect(node.path)}
      >
        {node.name}
      </button>
    );
  }

  return (
    <div className="mb-2">
      <div className="px-2 text-slate-700 font-semibold">{node.name}</div>
      <div className="pl-3 border-l border-slate-200">
        {node.children?.map((child) => (
          <Node
            key={child.path}
            node={child}
            nodes={[]}
            selectedPath={selectedPath}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function FileTree({ nodes, selectedPath, onSelect }: FileTreeProps) {
  return (
    <div className="space-y-2">
      {nodes.map((node) => (
        <Node
          key={node.path}
          node={node}
          nodes={[]}
          selectedPath={selectedPath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
