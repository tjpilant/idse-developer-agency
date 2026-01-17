import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { IDSEProjectsDashboard } from "../IDSEProjectsDashboard";

describe("IDSEProjectsDashboard - Blueprint Support", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it("loads and displays session status", async () => {
    const mockSessionStatus = {
      project_id: "123",
      project_name: "Test Project",
      session_id: "__blueprint__",
      session_name: "Project Blueprint (IDD)",
      is_blueprint: true,
      state: {
        intent: "complete",
        context: "in_progress",
        spec: "pending",
      },
      progress_percent: 29,
    };

    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSessionStatus,
    });

    render(<IDSEProjectsDashboard currentProject="Test Project" currentSession="__blueprint__" />);

    await waitFor(() => {
      expect(screen.getByText("Blueprint Status")).toBeInTheDocument();
      expect(screen.getByText("29% complete")).toBeInTheDocument();
    });
  });

  it("handles session status 404 gracefully", async () => {
    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<IDSEProjectsDashboard currentProject="Test Project" currentSession="legacy-session" />);

    await waitFor(() => {
      expect(screen.getByText("0% complete")).toBeInTheDocument();
    });
  });
});
