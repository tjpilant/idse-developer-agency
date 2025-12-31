# Handoff Clarification: Phase 1 (File-First Only)

**Date:** 2025-12-30  
**From:** codex_gpt  
**Session:** milkdown-crepe  
**Scope:** Phase 1 security + file read/write + render — **no git/PR/GitHub** integration

## What the backend DOES (Phase 1)
- ✅ Read markdown files from the workspace (`GET /documents`)
- ✅ Write/save markdown files to the workspace (`PUT /documents`, local filesystem write only)
- ✅ Render markdown to sanitized HTML for preview (`POST /render`)

## What the backend DOES NOT DO (Phase 1)
- ❌ No git operations (no commits, branches, PRs)
- ❌ No GitHub API integration (Octokit present only for deferred future work)
- ❌ No external sync; IDE/agency workflows handle git/PR outside this service

## Security & Validation (Phase 1)
- Path validation with traversal guard and IDSE path whitelist
- JWT auth + ACL middleware (roles enforced; session role map stub present)
- Zod request/response schemas; 5MB body limit; CORS whitelist; rate limiting
- Sanitized render pipeline (remark → rehype → rehype-raw → rehype-sanitize)

## Tests (current)
- 8 files / 22 tests passing (vitest): contract (GET/PUT/render), middleware (auth/ACL), integration (filesystem), sanitizer/unit.

## Current Config
- WRITE_MODE currently used only as `local` (file writes to workspace).
- Health endpoints: `/healthz`, `/readyz` (no auth).

## Deferred (Future Phase)
- Optional WRITE_MODE=pr branch/commit/PR flow (not implemented; remove from scope until explicitly requested).
  - If ever enabled, treat as a separate phase with design, mocks, and contract tests.

## Next Recommended Steps
1) Wire ACL to the real role source (replace in-memory map).
2) Keep PR mode disabled; if ever enabled, add a separate design/PR with mocked Octokit tests.
3) Confirm production CORS origins/rate limits; add metrics if desired.
