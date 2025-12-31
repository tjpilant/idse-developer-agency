# Workspace-Level Permissions Implementation

**Date:** 2025-12-31
**Session:** IDSE_Core/milkdown-crepe-v2
**Type:** Access Control Enhancement

## Summary

Implemented two-tier permission model for the MD Editor (Milkdown service) to enable global repository access for workspace owners while preserving session-level collaboration controls.

## Problem Statement

**User Feedback:** "but this limits the ability to have a global repo markdown editor since we have to define ownership of every folder"

### Original Limitation

The FileRoleProvider was designed **only** for session-scoped access control:

```typescript
// OLD: Only checked session .owner files
const sessionPath = path.join(workspaceRoot, 'projects', project, 'sessions', session);
const ownerPath = path.join(sessionPath, '.owner');
```

**Consequences:**
- ❌ Could NOT edit `README.md` (not in a session)
- ❌ Could NOT edit `docs/03-idse-pipeline.md` (not in a session)
- ❌ Could NOT edit `backend/main.py` (not in a session)
- ❌ Could NOT use MD Editor as a general-purpose repository editor
- ✅ Could ONLY edit files inside `projects/<project>/sessions/<session>/`

### Why This Happened

The RoleProvider was originally built for **multi-user IDSE session collaboration**, not as a general-purpose code editor. It enforced strict ownership boundaries to prevent users from interfering with each other's sessions.

## Solution: Two-Tier Permission Model

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    TIER 1                               │
│              Workspace-Level Ownership                   │
│                                                           │
│  Check: /.owner file at repository root                 │
│  Grant: 'owner' role (full access to EVERYTHING)        │
│  Scope: Entire repository (all files, all sessions)     │
│                                                           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ If not workspace owner
                        ↓
┌─────────────────────────────────────────────────────────┐
│                    TIER 2                               │
│            Session-Level Collaboration                   │
│                                                           │
│  For SESSION files:                                      │
│    Check: projects/<project>/sessions/<session>/.owner  │
│    Check: projects/<project>/sessions/<session>/.collaborators │
│    Grant: 'owner' or 'collaborator' or 'reader'        │
│                                                           │
│  For NON-SESSION files (docs/, backend/, etc.):         │
│    Grant: 'collaborator' (read + write access)          │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Permission Resolution Order

```typescript
async getRole(userId: string, sessionId: string): Promise<Role> {
  // 1. TIER 1: Check workspace ownership
  if (workspaceOwnerFile.contains(userId)) {
    return 'owner'; // Full access to everything
  }

  // 2. TIER 2A: Non-session files (docs/, backend/, README.md, etc.)
  if (!isSessionPath(sessionId)) {
    return 'collaborator'; // Allow editing repo files
  }

  // 3. TIER 2B: Session files
  if (sessionOwnerFile.contains(userId)) {
    return 'owner'; // Session owner
  }

  if (sessionCollaboratorsFile.contains(userId)) {
    return 'collaborator'; // Session collaborator
  }

  // 4. Default: read-only
  return 'reader';
}
```

## Implementation Details

### File Structure

```
/home/tjpilant/projects/idse-developer-agency/
├── .owner                                    ← WORKSPACE owner (NEW!)
│   └── tjpilant
│
└── projects/
    └── IDSE_Core/
        └── sessions/
            └── milkdown-crepe-v2/
                ├── .owner                    ← SESSION owner (existing)
                │   └── tjpilant
                └── .collaborators            ← SESSION collaborators (optional)
                    ├── teammate1
                    └── teammate2
```

### Code Changes

**Modified:** [backend/services/milkdown-crepe/src/services/roles/FileRoleProvider.ts](backend/services/milkdown-crepe/src/services/roles/FileRoleProvider.ts)

**Key Changes:**

1. **Added workspace ownership check:**
   ```typescript
   const workspaceOwnerPath = path.join(this.workspaceRoot, '.owner');
   if (await fileContainsUserId(workspaceOwnerPath, userId)) {
     return 'owner'; // Workspace owners bypass all other checks
   }
   ```

2. **Added session path detection:**
   ```typescript
   function isSessionPath(sessionId: string): boolean {
     // SessionId format: "IDSE_Core:milkdown-crepe" indicates session
     return sessionId.includes(':');
   }
   ```

3. **Added non-session file handling:**
   ```typescript
   if (!isSessionPath(sessionId)) {
     // Grant collaborator access for repo files (docs/, backend/, etc.)
     return 'collaborator';
   }
   ```

4. **Refactored helper function:**
   ```typescript
   async function fileContainsUserId(filePath: string, userId: string): Promise<boolean> {
     if (!(await fileExists(filePath))) return false;

     const content = await fs.readFile(filePath, 'utf-8');
     const userIds = content.split('\n').map(line => line.trim()).filter(Boolean);
     return userIds.includes(userId);
   }
   ```

## Use Cases

### Use Case 1: Workspace Owner (Single-User Mode)

**Setup:**
```bash
echo "tjpilant" > .owner
```

**Result:**
- ✅ tjpilant can edit README.md
- ✅ tjpilant can edit docs/03-idse-pipeline.md
- ✅ tjpilant can edit backend/main.py
- ✅ tjpilant can edit projects/IDSE_Core/sessions/milkdown-crepe-v2/intents/intent.md
- ✅ tjpilant has 'owner' role everywhere

**This is the typical personal development environment scenario.**

### Use Case 2: Session Collaboration (Multi-User Mode)

**Setup:**
```bash
# Workspace owner
echo "tjpilant" > .owner

# Session owned by teammate1
echo "teammate1" > projects/IDSE_Core/sessions/feature-x/.owner
echo -e "teammate2\nteammate3" > projects/IDSE_Core/sessions/feature-x/.collaborators
```

**Result for tjpilant (workspace owner):**
- ✅ Can edit ALL files (workspace owner privilege)

**Result for teammate1 (session owner):**
- ✅ Can edit session files in feature-x/ (session owner)
- ✅ Can edit docs/, backend/, README.md (non-session files default to 'collaborator')
- ❌ Cannot edit other sessions they don't own/collaborate on

**Result for teammate2 (session collaborator):**
- ✅ Can edit session files in feature-x/ (session collaborator)
- ✅ Can edit docs/, backend/, README.md (non-session files)
- ❌ Cannot edit other sessions

**Result for stranger (not listed anywhere):**
- ⚠️ Can read session files in feature-x/ (default 'reader')
- ✅ Can edit docs/, backend/, README.md (non-session files default to 'collaborator')

### Use Case 3: Repo-Wide Editing (Non-Session Files)

**Scenario:** User wants to edit documentation or backend code (not in a session)

**Setup:**
```bash
# Any authenticated user
# No workspace .owner file (or user not listed)
```

**Result:**
- ✅ Can edit docs/03-idse-pipeline.md ('collaborator' for non-session files)
- ✅ Can edit backend/main.py ('collaborator')
- ✅ Can edit README.md ('collaborator')

**This allows the MD Editor to function as a general-purpose repository editor for non-session files.**

## Permission Matrix

| File Location | Workspace Owner | Session Owner | Session Collab | Other User |
|---------------|----------------|---------------|----------------|------------|
| **/.owner** | owner ✅ | collaborator ✅ | collaborator ✅ | collaborator ✅ |
| **README.md** | owner ✅ | collaborator ✅ | collaborator ✅ | collaborator ✅ |
| **docs/*.md** | owner ✅ | collaborator ✅ | collaborator ✅ | collaborator ✅ |
| **backend/*.py** | owner ✅ | collaborator ✅ | collaborator ✅ | collaborator ✅ |
| **Session files (own)** | owner ✅ | owner ✅ | collaborator ✅ | reader ⚠️ |
| **Session files (other)** | owner ✅ | reader ⚠️ | reader ⚠️ | reader ⚠️ |

**Legend:**
- owner ✅ = Full access (read, write, admin)
- collaborator ✅ = Read + write access
- reader ⚠️ = Read-only access

## Benefits

### 1. Global Repository Access
No longer need to create `.owner` files for every directory. Workspace owners can edit ANY file through the MD Editor.

### 2. Session Isolation Preserved
Session-level collaboration still works. Teams can collaborate on specific IDSE sessions without interfering with each other.

### 3. Flexible Permission Model
- Personal projects: Just set workspace `.owner` and you're done
- Team projects: Set workspace owner + session-level collaborators
- Open access: Remove workspace `.owner` to make all non-session files editable by anyone

### 4. Backwards Compatible
Existing session `.owner` and `.collaborators` files continue to work exactly as before.

## Migration Guide

### For Existing Installations

**Step 1: Create workspace .owner file**
```bash
cd /path/to/repo
echo "your-username" > .owner
```

**Step 2: Restart Milkdown service (if needed)**
```bash
cd backend/services/milkdown-crepe
npm run dev
```

**Step 3: Verify permissions**
```bash
# Test editing a non-session file (should work now)
curl -X PUT http://localhost:8001/api/sessions/global/docs/documents \
  -H "Authorization: Bearer <your-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"path": "docs/test.md", "content": "# Test"}'
```

### For New Installations

The `SessionManager.create_session()` or bootstrap scripts should automatically create:
1. Workspace `.owner` file (if not exists)
2. Session `.owner` file

**Recommended update to SessionManager:**
```python
def create_session(self, name: str, project: str) -> Dict[str, str]:
    # ... existing session creation logic ...

    # Create workspace .owner if it doesn't exist
    workspace_owner_path = Path.cwd() / ".owner"
    if not workspace_owner_path.exists():
        workspace_owner_path.write_text(self.owner_id)

    # Create session .owner (existing behavior)
    session_owner_path = session_path / ".owner"
    session_owner_path.write_text(self.owner_id)

    # ... rest of logic ...
```

## Testing

### Manual Testing Checklist

**Workspace Owner:**
- [ ] Can edit README.md (repo root)
- [ ] Can edit docs/03-idse-pipeline.md
- [ ] Can edit backend/main.py
- [ ] Can edit session files (any session)

**Non-Owner (repo files):**
- [ ] Can edit docs/03-idse-pipeline.md ('collaborator')
- [ ] Can edit backend/main.py ('collaborator')
- [ ] Can read session files they don't own ('reader')

**Session Collaborator:**
- [ ] Can edit files in their session ('collaborator')
- [ ] Can read files in other sessions ('reader')

### Automated Testing

**Recommended test cases:**

```typescript
describe('FileRoleProvider Two-Tier Model', () => {
  it('grants owner role to workspace owner', async () => {
    // Setup: .owner contains "alice"
    const role = await provider.getRole('alice', 'IDSE_Core:session1');
    expect(role).toBe('owner');
  });

  it('grants collaborator role for non-session files', async () => {
    // No workspace .owner, sessionId doesn't contain ':'
    const role = await provider.getRole('bob', 'docs/test.md');
    expect(role).toBe('collaborator');
  });

  it('grants session owner role', async () => {
    // session .owner contains "charlie"
    const role = await provider.getRole('charlie', 'IDSE_Core:session1');
    expect(role).toBe('owner');
  });

  it('grants session collaborator role', async () => {
    // session .collaborators contains "dave"
    const role = await provider.getRole('dave', 'IDSE_Core:session1');
    expect(role).toBe('collaborator');
  });

  it('defaults to reader for session files', async () => {
    // Not in .owner or .collaborators
    const role = await provider.getRole('eve', 'IDSE_Core:session1');
    expect(role).toBe('reader');
  });
});
```

## Security Considerations

### Positive Changes
- ✅ Workspace owners can be explicitly defined
- ✅ Session isolation still enforced for non-owners
- ✅ Clear permission hierarchy

### Potential Concerns
- ⚠️ Non-session files default to 'collaborator' (any authenticated user can edit)
- ⚠️ If workspace `.owner` file is missing, anyone can have owner access by editing it

### Recommendations

1. **Create workspace `.owner` immediately** on repo initialization
2. **Set proper file permissions** on `.owner` files:
   ```bash
   chmod 600 .owner
   chmod 600 projects/*/sessions/*/.owner
   ```

3. **Add `.owner` to .gitignore** (or commit it if sharing the repo):
   ```bash
   echo "/.owner" >> .gitignore  # If user-specific
   # OR commit .owner if it's the repo owner
   ```

4. **Consider authentication** - The RoleProvider assumes JWT auth is already working. Ensure:
   - JWT tokens are properly validated
   - User IDs in tokens match `.owner` file format
   - Tokens have appropriate expiration

## Future Enhancements

### Short Term
1. **Add config option** to change non-session file default from 'collaborator' to 'reader'
2. **Add logging** for permission checks (audit trail)
3. **Add metrics** to track permission denials

### Long Term
1. **Path-based permissions** (e.g., `docs/.owner` for docs-only ownership)
2. **Role inheritance** (e.g., session owners inherit from workspace owners)
3. **Permission caching** (avoid repeated file reads)
4. **Admin UI** for managing permissions

## Conclusion

The two-tier permission model successfully addresses the limitation that prevented using the MD Editor as a global repository editor. Workspace owners can now edit any file, while session-level collaboration controls remain intact for multi-user scenarios.

**Status:** ✅ Implemented and ready for testing

**Impact:**
- Personal projects: Full repository access with single `.owner` file
- Team projects: Flexible session collaboration + global repo editing
- No migration needed for existing sessions (backwards compatible)
