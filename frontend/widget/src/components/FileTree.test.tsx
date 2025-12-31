import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileTree } from "./FileTree";
import { FileNode } from "../types/fileTree";

const nodes: FileNode[] = [
  {
    name: "intents",
    path: "projects/IDSE_Core/sessions/milkdown-crepe/intents",
    type: "folder",
    children: [
      {
        name: "intent.md",
        path: "projects/IDSE_Core/sessions/milkdown-crepe/intents/intent.md",
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
        selectedPath="projects/IDSE_Core/sessions/milkdown-crepe/intents/intent.md"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText("intents")).toBeInTheDocument();
    const file = screen.getByText("intent.md");
    fireEvent.click(file);
    expect(onSelect).toHaveBeenCalledWith(
      "projects/IDSE_Core/sessions/milkdown-crepe/intents/intent.md",
    );
  });
});
