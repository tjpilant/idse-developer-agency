import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDocument, putDocument, renderMarkdown } from "./milkdownApi";

const project = "IDSE_Core";
const session = "milkdown-crepe";
const path = "intents/intent.md";
const token = "test-token";

describe("milkdownApi", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("calls GET document with auth header", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ path, content: "# hi" }),
    });
    const res = await getDocument(project, session, path, token);
    expect(res.content).toBe("# hi");
    const url = (global.fetch as any).mock.calls[0][0] as string;
    const opts = (global.fetch as any).mock.calls[0][1];
    expect(url).toContain(`/api/sessions/${project}/${session}/documents`);
    expect(opts.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it("calls PUT document with body", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ saved: true }),
    });
    await putDocument(project, session, path, "content", token);
    const opts = (global.fetch as any).mock.calls[0][1];
    expect(opts.method).toBe("PUT");
    expect(opts.body).toContain("content");
  });

  it("calls render markdown", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ html: "<p>ok</p>" }),
    });
    const res = await renderMarkdown(project, session, "md", token);
    expect(res.html).toContain("ok");
  });
});
