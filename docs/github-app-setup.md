# GitHub App Setup

Use a GitHub App when you want short-lived tokens, no usernames in URLs, and scoped repo access (all repos or a selected set).

## Create the app
1. Go to https://github.com/settings/apps/new (or your org → Settings → Developer settings → GitHub Apps).
2. Name: anything (e.g., `IDSE Agency Bot`); Homepage URL can be your repo URL.
3. Webhooks: leave disabled unless you need them.
4. Permissions (minimum for commits/branches/PRs):
   - Repository → **Contents: Read & write**
   - Repository → **Issues: Read & write** (if you open issues)
   - Repository → **Pull requests: Read & write** (if you open PRs)
5. Save, then **Generate a private key**. Save it as `github-app-key.pem` and keep it out of version control.
6. Install the app on your account/org and choose **All repositories** or specific repos. Note the installation ID from the URL (`/settings/installations/{ID}`).

## Configure `.env`

```bash
GITHUB_AUTH_MODE=app
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY_PATH=./github-app-key.pem
GITHUB_APP_INSTALLATION_ID=your_installation_id
GITHUB_OWNER=default-owner          # e.g., your username or org
GITHUB_REPO=default-repo            # default repo used by the backend
```

You can also supply a pre-generated installation token at call time via `Authorization: Bearer <token>` to avoid reading the key from disk.

## Validate

```bash
# Start the backend, then hit status with an installation token
curl http://localhost:8000/api/git/status \
  -H "Authorization: Bearer <installation_token>"
```

If the app is installed on the repo, you should see `has_write_access: true` and the bot identity in `authenticated_user`.

## Keep secrets out of git
- Do not commit `.env` or `*.pem` files (ignored in `.gitignore`).
- Installation tokens expire automatically; regenerate as needed instead of storing them long term.
