import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MilkdownEditor } from "./MilkdownEditor";

// Mock crepe to avoid DOM-heavy behavior
vi.mock("@milkdown/crepe", () => {
  return {
    Crepe: class {
      constructor() {}
      create() {
        return Promise.resolve();
      }
      destroy() {}
      setReadonly() {}
      on() {}
    },
  };
});

// Mock hook to control state
vi.mock("../hooks/useMilkdownDocument", () => {
  return {
    useMilkdownDocument: () => ({
      content: "# hello",
      setContent: vi.fn(),
      loading: false,
      saving: false,
      error: null,
      save: vi.fn(),
      isDirty: true,
      readOnly: false,
    }),
  };
});

describe("MilkdownEditor", () => {
  it("renders toolbar and save button", () => {
    render(
      <MilkdownEditor
        project="IDSE_Core"
        session="milkdown-crepe"
        path="intents/intent.md"
        role="collaborator"
      />
    );
    expect(screen.getByText("intents/intent.md")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Save"));
  });
});
