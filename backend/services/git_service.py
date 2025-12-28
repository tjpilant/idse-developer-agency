"""
Git service for automated artifact commits to GitHub repositories.

Integrates with SessionManager to commit session-scoped artifacts and trigger
repository_dispatch webhooks for CI/CD integration.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from github import Github, GithubException, Auth, GithubIntegration
from SessionManager import SessionManager


class GitService:
    """GitHub API wrapper for IDSE artifact management."""

    def __init__(
        self,
        token: Optional[str] = None,
        auth_mode: Optional[str] = None,
        owner: Optional[str] = None,
        repo_name: Optional[str] = None,
        app_id: Optional[str] = None,
        app_private_key_path: Optional[str] = None,
        app_installation_id: Optional[str] = None,
    ):
        """Initialize GitHub client from environment variables or per-request token."""
        self.auth_mode = auth_mode or os.getenv("GITHUB_AUTH_MODE", "pat")
        self.owner = owner or os.getenv("GITHUB_OWNER", "tjpilant")
        self.repo_name = repo_name or os.getenv("GITHUB_REPO", "idse-developer-agency")

        if self.auth_mode == "pat":
            resolved_token = token or os.getenv("GITHUB_PAT")
            if not resolved_token:
                raise ValueError(
                    "GitHub token not provided. Supply one-time token in request or set GITHUB_PAT."
                )
            # Use newer Auth.Token API
            auth = Auth.Token(resolved_token)
            self.github = Github(auth=auth)
        elif self.auth_mode == "app":
            self.github = self._init_app_client(
                token=token,
                app_id=app_id or os.getenv("GITHUB_APP_ID"),
                private_key_path=app_private_key_path or os.getenv("GITHUB_APP_PRIVATE_KEY_PATH"),
                installation_id=app_installation_id or os.getenv("GITHUB_APP_INSTALLATION_ID"),
            )
        else:
            raise ValueError(f"Unsupported GITHUB_AUTH_MODE: {self.auth_mode}")

        self.repo = self.github.get_repo(f"{self.owner}/{self.repo_name}")

    def _init_app_client(
        self,
        token: Optional[str],
        app_id: Optional[str],
        private_key_path: Optional[str],
        installation_id: Optional[str],
    ) -> Github:
        """
        Initialize a GitHub client using App authentication.

        If a one-time installation token is provided, use it directly; otherwise,
        derive an installation token from the App credentials on disk.
        """
        if token:
            return Github(auth=Auth.Token(token))

        missing = []
        if not app_id:
            missing.append("GITHUB_APP_ID")
        if not private_key_path:
            missing.append("GITHUB_APP_PRIVATE_KEY_PATH")
        if not installation_id:
            missing.append("GITHUB_APP_INSTALLATION_ID")

        if missing:
            raise ValueError(f"Missing GitHub App config: {', '.join(missing)}")

        key_path = Path(private_key_path)
        if not key_path.exists():
            raise ValueError(f"GitHub App private key not found: {private_key_path}")

        private_key = key_path.read_text()
        # Newer PyGithub supports Auth.AppAuth; fall back to GithubIntegration for older versions.
        try:
            app_auth = Auth.AppAuth(int(app_id), private_key)
            app_client = Github(auth=app_auth)
            try:
                installation = app_client.get_app_installation(int(installation_id))
            except AttributeError:
                installation = app_client.get_installation(int(installation_id))
            access_token = installation.get_access_token()
            return Github(auth=Auth.Token(access_token.token))
        except Exception:
            # Fallback for environments lacking AppAuth APIs
            integration = GithubIntegration(int(app_id), private_key)
            access_token = integration.get_access_token(int(installation_id)).token
            return Github(auth=Auth.Token(access_token))

    def commit_artifacts(
        self,
        session_id: str,
        project: str,
        files: List[Dict[str, str]],
        message: Optional[str] = None,
        branch: Optional[str] = None,
        owner: Optional[str] = None,
        repo_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Commit session artifacts to repository.

        Args:
            session_id: Session identifier
            project: Project name
            files: List of {'path': str, 'content': str} dicts
            message: Commit message (auto-generated if None)
            branch: Target branch (defaults to current branch)
            owner: Optional GitHub owner override
            repo_name: Optional repository name override

        Returns:
            Dict with commit_sha, commit_url, files_committed
        """
        target_repo = self.repo
        target_owner = self.owner
        target_repo_name = self.repo_name

        if owner and repo_name:
            target_repo = self.github.get_repo(f"{owner}/{repo_name}")
            target_owner = owner
            target_repo_name = repo_name
        elif owner or repo_name:
            return {
                "success": False,
                "error": "Both owner and repo must be provided to override target repository",
                "session_id": session_id,
                "project": project,
            }

        if not branch:
            branch = target_repo.default_branch

        # Auto-generate commit message if not provided
        if not message:
            message = self._generate_commit_message(session_id, project, files)

        try:
            # Get the current commit SHA for the branch, creating it from the default branch if missing
            try:
                ref = target_repo.get_git_ref(f"heads/{branch}")
            except GithubException as e:
                if getattr(e, "status", None) == 404:
                    source_ref = target_repo.get_git_ref(f"heads/{target_repo.default_branch}")
                    ref = target_repo.create_git_ref(ref=f"refs/heads/{branch}", sha=source_ref.object.sha)
                else:
                    raise

            base_sha = ref.object.sha
            base_tree = target_repo.get_git_tree(base_sha)

            # Create blobs for each file
            tree_elements = []
            for file_info in files:
                file_path = file_info['path']
                file_content = file_info['content']

                blob = target_repo.create_git_blob(file_content, "utf-8")
                # PyGithub expects InputGitTreeElement objects
                from github import InputGitTreeElement
                tree_elements.append(
                    InputGitTreeElement(
                        path=file_path,
                        mode="100644",  # Regular file
                        type="blob",
                        sha=blob.sha
                    )
                )

            # Create new tree
            new_tree = target_repo.create_git_tree(tree_elements, base_tree)

            # Create commit
            commit = target_repo.create_git_commit(
                message=message,
                tree=new_tree,
                parents=[target_repo.get_git_commit(base_sha)]
            )

            # Update branch reference
            ref.edit(commit.sha)

            return {
                "success": True,
                "commit_sha": commit.sha,
                "commit_url": f"https://github.com/{target_owner}/{target_repo_name}/commit/{commit.sha}",
                "files_committed": len(files),
                "branch": branch,
                "session_id": session_id,
                "project": project
            }

        except GithubException as e:
            return {
                "success": False,
                "error": f"{e.status}: {e.data}",
                "session_id": session_id,
                "project": project
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Unexpected error: {type(e).__name__}: {str(e)}",
                "session_id": session_id,
                "project": project
            }

    def create_pr(
        self,
        head_branch: str,
        base_branch: str,
        title: str,
        body: str
    ) -> Dict[str, Any]:
        """
        Create a pull request.

        Args:
            head_branch: Source branch
            base_branch: Target branch
            title: PR title
            body: PR description

        Returns:
            Dict with pr_number, pr_url, success status
        """
        try:
            pr = self.repo.create_pull(
                title=title,
                body=body,
                head=head_branch,
                base=base_branch
            )

            return {
                "success": True,
                "pr_number": pr.number,
                "pr_url": pr.html_url
            }

        except GithubException as e:
            return {
                "success": False,
                "error": str(e)
            }

    def check_repo_status(self) -> Dict[str, Any]:
        """
        Check repository status and permissions.

        Returns:
            Dict with repo info and user permissions
        """
        try:
            authenticated_as = None
            has_write = False

            try:
                authenticated_as = self.github.get_user().login
                has_write = self.repo.permissions.push
            except GithubException:
                # App installation tokens cannot fetch /user
                authenticated_as = "app-installation (user not exposed)"
                if self.auth_mode == "app":
                    # If we can read repo details, assume installation has the configured write scope
                    try:
                        _ = self.repo.default_branch
                        has_write = True
                    except GithubException:
                        has_write = False

            return {
                "success": True,
                "repo": f"{self.owner}/{self.repo_name}",
                "default_branch": self.repo.default_branch,
                "has_write_access": has_write,
                "authenticated_user": authenticated_as,
            }

        except GithubException as e:
            return {
                "success": False,
                "error": str(e)
            }

    def trigger_repository_dispatch(
        self,
        event_type: str,
        session_id: str,
        project: str,
        commit_sha: Optional[str] = None,
        additional_payload: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Trigger repository_dispatch event for GitHub Actions.

        Args:
            event_type: Event type (e.g., "agency-update")
            session_id: Session identifier
            project: Project name
            commit_sha: Commit SHA (optional)
            additional_payload: Additional payload data

        Returns:
            Dict with success status
        """
        payload = {
            "session_id": session_id,
            "project": project
        }

        if commit_sha:
            payload["commit_sha"] = commit_sha

        if additional_payload:
            payload.update(additional_payload)

        try:
            self.repo.create_repository_dispatch(
                event_type=event_type,
                client_payload=payload
            )

            return {
                "success": True,
                "event_type": event_type,
                "payload": payload
            }

        except GithubException as e:
            return {
                "success": False,
                "error": str(e)
            }

    def create_branch(self, branch_name: str, from_branch: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a new branch.

        Args:
            branch_name: Name for new branch
            from_branch: Source branch (defaults to default branch)

        Returns:
            Dict with success status and branch info
        """
        if not from_branch:
            from_branch = self.repo.default_branch

        try:
            source_ref = self.repo.get_git_ref(f"heads/{from_branch}")
            self.repo.create_git_ref(
                ref=f"refs/heads/{branch_name}",
                sha=source_ref.object.sha
            )

            return {
                "success": True,
                "branch": branch_name,
                "created_from": from_branch
            }

        except GithubException as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _generate_commit_message(
        self,
        session_id: str,
        project: str,
        files: List[Dict[str, str]]
    ) -> str:
        """Generate descriptive commit message."""
        file_count = len(files)
        file_types = set()

        for file_info in files:
            path = file_info['path']
            if 'spec' in path:
                file_types.add('specs')
            elif 'plan' in path:
                file_types.add('plans')
            elif 'task' in path:
                file_types.add('tasks')
            elif 'context' in path:
                file_types.add('contexts')
            elif 'intent' in path:
                file_types.add('intents')
            elif 'feedback' in path:
                file_types.add('feedback')

        artifact_types = ', '.join(sorted(file_types)) if file_types else 'artifacts'

        message = f"feat(idse): update {artifact_types} for {project}\n\n"
        message += f"Session: {session_id}\n"
        message += f"Files updated: {file_count}\n\n"
        message += "🤖 Generated by IDSE Agency\n\n"
        message += "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

        return message
