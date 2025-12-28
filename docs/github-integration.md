# GitHub Integration (Phase 0)

## Overview
The GitHub Integration layer enables the IDSE Agency to automatically commit generated artifacts (specs, plans, tasks) to your repository and trigger CI/CD validation workflows.

## Architecture

```
┌──────────────────────────────────┐
│ IDSE Agency (idse_developer_agent│
│ ──────────────────────────────── │
│                                  │
│ Agent generates artifacts        │
│ ├─ spec.md                       │
│ ├─ plan.md                       │
│ └─ tasks.md                      │
│                                  │
│ Agent calls CommitArtifactsTool  │
└────────────┬─────────────────────┘
             │
             │ HTTP POST /api/git/commit
             ▼
┌──────────────────────────────────┐
│ FastAPI Backend (backend/main.py)│
│ ──────────────────────────────── │
│                                  │
│ git_routes.py → git_service.py   │
│ ↓                                │
│ PyGithub → GitHub API            │
└────────────┬─────────────────────┘
             │
             │ Git commit + push
             │ repository_dispatch webhook
             ▼
┌──────────────────────────────────┐
│ GitHub Repository                │
│ ──────────────────────────────── │
│                                  │
│ Artifacts committed to branch    │
│                                  │
│ GitHub Action triggered:         │
│ ├─ Validate artifacts            │
│ ├─ Run compliance checks         │
│ └─ Report status back to Agency  │
└──────────────────────────────────┘
```

## Setup

Pick an auth mode:

- **On-demand PAT (default)** — set `GITHUB_AUTH_MODE=pat`. Provide a one-time token via `Authorization: Bearer <token>` when calling the API/tools, or store a local dev token in `.env` as `GITHUB_PAT=...`. Scopes: `repo` (classic) or fine-grained `Contents: Read & write` (+ `workflow` if you edit workflows).
- **GitHub App** — set `GITHUB_AUTH_MODE=app` and configure `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_PATH`, and `GITHUB_APP_INSTALLATION_ID`. The backend will mint a short-lived installation token per request. You can also pass a pre-generated installation token via `Authorization: Bearer <token>` without storing secrets on disk.

See `docs/github-app-setup.md` for detailed App creation steps.

### Environment defaults

Edit `.env` (values can be omitted if you always pass tokens on-demand):

```bash
# GitHub Integration
GITHUB_AUTH_MODE=pat                  # or 'app'
GITHUB_PAT=ghp_your_token_here        # optional if providing token per request
GITHUB_APP_ID=your_app_id             # app mode
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-key.pem
GITHUB_APP_INSTALLATION_ID=your_installation_id
GITHUB_OWNER=tjpilant                 # default owner
GITHUB_REPO=idse-developer-agency     # default repo

# Agency API URL (for tools)
AGENCY_API_URL=http://localhost:8000
```

### 3. Verify Installation

```bash
# Activate virtual environment
source .venv/bin/activate

# Verify PyGithub installed
python -c "import github; print('PyGithub installed:', github.__version__)"

# Start backend
python backend/main.py
```

### 4. Test Authentication

```bash
curl http://localhost:8000/api/git/status \
  -H "Authorization: Bearer $GITHUB_TOKEN"   # optional if backend has env token
```

Expected response:
```json
{
  "success": true,
  "repo": "tjpilant/idse-developer-agency",
  "default_branch": "main",
  "has_write_access": true,
  "authenticated_user": "tjpilant"
}
```

## Usage

### From Agency Agents

Agents use `CommitArtifactsTool` to commit their generated artifacts:

```python
from idse_developer_agent.tools import CommitArtifactsTool

tool = CommitArtifactsTool(
    session_id="Puck_Components",
    project="IDSE_Core",
    file_paths=[
        "specs/projects/IDSE_Core/sessions/Puck_Components/spec.md",
        "plans/projects/IDSE_Core/sessions/Puck_Components/plan.md"
    ],
    commit_message="feat(idse): add Puck Components spec and plan",  # Optional
    branch="main",  # Optional, defaults to default branch
    trigger_dispatch=True,  # Triggers CI validation
    auth_token=None,  # Optional one-time token (recommended: ask user when needed)
    auth_mode=None,   # Optional override ('pat' or 'app')
)

result = tool.run()
print(result)  # ✅ Successfully committed 2 file(s) to main...
```

### Via HTTP API

```bash
# Commit artifacts
curl -X POST http://localhost:8000/api/git/commit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \  # optional if backend has env token
  -d '{
    "session_id": "Puck_Components",
    "project": "IDSE_Core",
    "files": [
      {
        "path": "specs/projects/IDSE_Core/sessions/Puck_Components/spec.md",
        "content": "# Specification\n\n..."
      }
    ],
    "trigger_dispatch": true
  }'
```

### Create Pull Request

```bash
curl -X POST http://localhost:8000/api/git/pr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -d '{
    "head_branch": "feature/new-spec",
    "base_branch": "main",
    "title": "feat(idse): Add new specification",
    "body": "Generated by IDSE Agency\n\nSession: session-123"
  }'
```

## API Endpoints

All endpoints accept `Authorization: Bearer <token>` for one-time PATs or installation tokens. If headers are hard to set, you can also pass `token`/`auth_mode` in the request body.

### POST `/api/git/commit`
Commit artifacts to repository

**Request Body:**
```json
{
  "session_id": "string",
  "project": "string",
  "files": [
    {"path": "string", "content": "string"}
  ],
  "message": "string (optional)",
  "branch": "string (optional)",
  "trigger_dispatch": "boolean (default: true)",
  "token": "string (optional, prefer Authorization header)",
  "auth_mode": "pat | app (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "commit_sha": "abc1234",
  "commit_url": "https://github.com/...",
  "files_committed": 2,
  "branch": "main",
  "session_id": "Puck_Components",
  "project": "IDSE_Core",
  "dispatch": {
    "success": true,
    "event_type": "agency-update",
    "payload": {
      "session_id": "Puck_Components",
      "project": "IDSE_Core",
      "commit_sha": "abc1234"
    }
  }
}
```

### POST `/api/git/pr`
Create pull request

### GET `/api/git/status`
Check repository status and authentication

### POST `/api/git/dispatch`
Manually trigger repository_dispatch event

### POST `/api/git/branch`
Create a new branch

## repository_dispatch Event

When `trigger_dispatch=true`, the following webhook is sent to GitHub:

**Event Type:** `agency-update`

**Payload:**
```json
{
  "session_id": "Puck_Components",
  "project": "IDSE_Core",
  "commit_sha": "abc1234567"
}
```

### GitHub Action Integration

Create `.github/workflows/agency-sync.yml`:

```yaml
name: Agency Artifact Sync

on:
  repository_dispatch:
    types: [agency-update]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate artifacts
        run: |
          echo "Session: ${{ github.event.client_payload.session_id }}"
          echo "Project: ${{ github.event.client_payload.project }}"
          python idse-governance/validate-artifacts.py --session-aware

      - name: Report status to Agency
        if: always()
        run: |
          curl -X POST ${{ secrets.AGENCY_WEBHOOK_URL }}/api/ci/status \
            -d '{"session_id": "${{ github.event.client_payload.session_id }}", "status": "${{ job.status }}"}'
```

## Troubleshooting

### Authentication Errors
```
ValueError: GITHUB_PAT environment variable not set
```
**Solution:** Provide a one-time token via `Authorization: Bearer <token>` or set `GITHUB_PAT`/GitHub App credentials in `.env`. Ensure `GITHUB_AUTH_MODE` matches the token type (`pat` or `app`).

### Permission Errors
```
GithubException: 403 Resource not accessible by integration
```
**Solution:** Ensure PAT has `repo` and `workflow` scopes

### Connection Errors
```
❌ Cannot connect to Agency backend API
```
**Solution:** Start backend with `python backend/main.py`

## Security Best Practices

1. **Never commit `.env` file** - It contains sensitive tokens
2. **Use `.env.example`** for documentation
3. **Rotate tokens regularly** - Generate new PAT every 90 days
4. **Prefer GitHub App** for automation - Scoped access, short-lived tokens
5. **Limit token scope** - Only grant necessary permissions

## Next Steps

- [ ] Wire CommitArtifactsTool into post-generation workflows
- [ ] Add pre-commit validation hooks
- [ ] Add conflict detection before commits
- [ ] Implement feedback loop (CI → Agency webhook)

## Files Created

Phase 0 implementation includes:

- `backend/services/git_service.py` - Core GitHub API wrapper
- `backend/routes/git_routes.py` - FastAPI endpoints
- `idse_developer_agent/tools/CommitArtifactsTool.py` - Agency Swarm tool
- `.env.example` - Environment configuration template
- `docs/github-integration.md` - This documentation
