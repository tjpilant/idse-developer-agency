import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileTree } from "./FileTree";
import { FileNode } from "../types/fileTree";

const nodes: FileNode[] = [
  {
    name: "intents (rooted at workspace)",
    path: "intents/projects/IDSE_Core/sessions/milkdown-crepe",
    type: "folder",
    children: [
      {
        name: "intent.md",
        path: "intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md",
        type: "file",
      },
    ],
  },
];

describe("FileTree", () => {
  it("renders and selects file", () => {
    const onSelect = vi.fn();
    render(
      <FileTree
        nodes={nodes}
        selectedPath="intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("intents (rooted at workspace)")).toBeInTheDocument();
    const file = screen.getByText("intent.md");
    fireEvent.click(file);
    expect(onSelect).toHaveBeenCalledWith(
      "intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md",
    );
  });
});
