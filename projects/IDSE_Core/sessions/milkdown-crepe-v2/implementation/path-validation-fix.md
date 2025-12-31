# Path Validation Fix for Repository-Wide File Access

**Date:** 2025-12-31
**Session:** IDSE_Core/milkdown-crepe-v2
**Type:** Bug Fix

## Problem

After implementing workspace-level permissions and dynamic file tree, users could SEE files like `backend/README.md` in the file browser but got **400 Bad Request** errors when trying to open them.

### Error Message
```
GET /api/sessions/IDSE_Core/milkdown-crepe/documents?path=backend%2FREADME.md
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### Root Cause

The Milkdown service had a **restrictive path validation regex** in the Zod schema:

**Before (broken):**
```typescript
// backend/services/milkdown-crepe/src/validators/schemas.ts
const pathPattern = /^(intents|contexts|specs|plans|tasks|docs|projects|feedback|implementation)\/.*\.md$/;
```

This regex **only** allowed paths starting with:
- `intents/`
- `contexts/`
- `specs/`
- `plans/`
- `tasks/`
- `docs/`
- `projects/`
- `feedback/`
- `implementation/`

**Consequence:**
- ✅ `docs/03-idse-pipeline.md` - ALLOWED (starts with `docs/`)
- ✅ `projects/IDSE_Core/sessions/...` - ALLOWED (starts with `projects/`)
- ❌ `backend/README.md` - REJECTED (doesn't start with allowed prefix)
- ❌ `frontend/README.md` - REJECTED
- ❌ `README.md` - REJECTED
- ❌ `scripts/bootstrap.sh` - REJECTED

### Why This Existed

The original regex was designed for **IDSE session-scoped paths only**. It assumed all file access would be within the IDSE pipeline directory structure.

When we added:
1. Dynamic file tree (showing ALL repo files)
2. Workspace-level permissions (allowing access to ALL files)

We created a mismatch: **permissions allowed it, but validation rejected it**.

## Solution

Updated the regex to allow **ANY** `.md` file path:

**After (fixed):**
```typescript
// Allow any .md file path (path traversal protection is in validatePath())
const pathPattern = /^.*\.md$/;
```

**Security Note:** This is safe because:
1. The pattern still enforces `.md` extension
2. Path traversal protection happens in `validatePath()` function
3. `validatePath()` checks that resolved path is within `WORKSPACE_ROOT`
4. RoleProvider still enforces access control based on user permissions

## Files Changed

**Modified:** [backend/services/milkdown-crepe/src/validators/schemas.ts](backend/services/milkdown-crepe/src/validators/schemas.ts#L3-L7)

```diff
  import { z } from 'zod';

- const pathPattern = /^(intents|contexts|specs|plans|tasks|docs|projects|feedback|implementation)\/.*\.md$/;
+ // Allow any .md file path (path traversal protection is in validatePath())
+ const pathPattern = /^.*\.md$/;

  export const DocumentPathSchema = z.object({
    path: z.string().min(1).regex(pathPattern),
  });
```

## Validation Layers

The system now has **three layers** of protection:

### Layer 1: Schema Validation (Zod)
```typescript
// schemas.ts
const pathPattern = /^.*\.md$/;
```
- **Purpose:** Basic format check
- **Allows:** Any path ending in `.md`
- **Rejects:** Non-markdown files

### Layer 2: Path Traversal Protection
```typescript
// paths.ts
export function validatePath(inputPath: string, workspaceRoot: string): string {
  const resolved = path.resolve(workspaceRoot, inputPath);
  const normalizedRoot = path.resolve(workspaceRoot);

  if (!resolved.startsWith(normalizedRoot)) {
    throw new ValidationError('Path traversal detected');
  }

  return resolved;
}
```
- **Purpose:** Prevent directory traversal attacks
- **Allows:** Paths within workspace
- **Rejects:** `../../etc/passwd`, `/etc/passwd`, etc.

### Layer 3: Permission Check (RoleProvider)
```typescript
// FileRoleProvider.ts
async getRole(userId: string, sessionId: string): Promise<Role> {
  // Check workspace .owner
  if (workspaceOwnerFile.contains(userId)) return 'owner';

  // Check session ownership
  if (sessionOwnerFile.contains(userId)) return 'owner';

  // Default permissions
  return isSessionPath ? 'reader' : 'collaborator';
}
```
- **Purpose:** Enforce user access control
- **Allows:** Based on ownership and collaboration
- **Rejects:** Unauthorized write attempts

## Testing

### Test Case 1: Session Files (Still Work)
```bash
GET /api/sessions/IDSE_Core/milkdown-crepe-v2/documents?path=projects/IDSE_Core/sessions/milkdown-crepe-v2/intents/intent.md
```
**Expected:** ✅ 200 OK (path starts with `projects/`, .md extension)

### Test Case 2: Documentation Files (Still Work)
```bash
GET /api/sessions/IDSE_Core/milkdown-crepe-v2/documents?path=docs/03-idse-pipeline.md
```
**Expected:** ✅ 200 OK (path starts with `docs/`, .md extension)

### Test Case 3: Backend Files (NOW WORKS!)
```bash
GET /api/sessions/IDSE_Core/milkdown-crepe-v2/documents?path=backend/README.md
```
**Expected:** ✅ 200 OK (any .md file allowed)

### Test Case 4: Root-Level Files (NOW WORKS!)
```bash
GET /api/sessions/IDSE_Core/milkdown-crepe-v2/documents?path=README.md
```
**Expected:** ✅ 200 OK (any .md file allowed)

### Test Case 5: Path Traversal (Still Blocked)
```bash
GET /api/sessions/IDSE_Core/milkdown-crepe-v2/documents?path=../../etc/passwd.md
```
**Expected:** ❌ 400 Bad Request (validatePath() blocks traversal)

### Test Case 6: Non-Markdown Files (Still Blocked)
```bash
GET /api/sessions/IDSE_Core/milkdown-crepe-v2/documents?path=backend/main.py
```
**Expected:** ❌ 400 Bad Request (schema requires `.md` extension)

## Impact

### Before
- ❌ Could only access 9 specific directory prefixes
- ❌ Backend, frontend, scripts, root files inaccessible
- ❌ 400 errors when trying to open non-IDSE files

### After
- ✅ Can access ANY `.md` file in repository
- ✅ Backend, frontend, scripts, root files accessible
- ✅ File browser and permissions fully functional
- ✅ Security layers still intact

## Related Issues

### Issue: Milkdown "editorView" Error
```
Uncaught MilkdownError: Context "editorView" not found, do you forget to inject it?
```

This is a **separate frontend issue** with the Milkdown editor initialization. It's not related to the path validation fix.

**Likely Cause:** The Milkdown editor component is trying to render before it's fully initialized.

**Not addressed in this fix** - requires separate investigation of the Milkdown component lifecycle.

## Deployment

**Auto-deployment:** The Milkdown service runs with `--respawn` flag, so it automatically reloaded when the file changed.

**Verification:**
```bash
# Check service is running
ps aux | grep milkdown

# Test endpoint
curl "http://localhost:8001/api/sessions/IDSE_Core/milkdown-crepe/documents?path=backend/README.md" \
  -H "Authorization: Bearer <token>"
```

## Conclusion

The path validation fix completes the repository-wide file access implementation:
1. ✅ Dynamic file tree shows all repo files
2. ✅ Workspace permissions allow editing all files
3. ✅ Path validation accepts all .md files
4. ✅ Security protections remain in place

**Status:** ✅ Complete - Users can now browse and edit ANY markdown file in the repository through the MD Editor
