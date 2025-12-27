"""
Git service for automated artifact commits to GitHub repositories.

Integrates with SessionManager to commit session-scoped artifacts and trigger
repository_dispatch webhooks for CI/CD integration.
"""

import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from github import Github, GithubException, Auth
from SessionManager import SessionManager


class GitService:
    """GitHub API wrapper for IDSE artifact management."""

    def __init__(self):
        """Initialize GitHub client from environment variables."""
        self.auth_mode = os.getenv("GITHUB_AUTH_MODE", "pat")

        if self.auth_mode == "pat":
            token = os.getenv("GITHUB_PAT")
            if not token:
                raise ValueError("GITHUB_PAT environment variable not set")
            # Use newer Auth.Token API
            auth = Auth.Token(token)
            self.github = Github(auth=auth)
        else:
            # GitHub App authentication (future enhancement)
            raise NotImplementedError("GitHub App authentication not yet implemented")

        self.owner = os.getenv("GITHUB_OWNER", "tjpilant")
        self.repo_name = os.getenv("GITHUB_REPO", "idse-developer-agency")
        self.repo = self.github.get_repo(f"{self.owner}/{self.repo_name}")

    def commit_artifacts(
        self,
        session_id: str,
        project: str,
        files: List[Dict[str, str]],
        message: Optional[str] = None,
        branch: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Commit session artifacts to repository.

        Args:
            session_id: Session identifier
            project: Project name
            files: List of {'path': str, 'content': str} dicts
            message: Commit message (auto-generated if None)
            branch: Target branch (defaults to current branch)

        Returns:
            Dict with commit_sha, commit_url, files_committed
        """
        if not branch:
            branch = self.repo.default_branch

        # Auto-generate commit message if not provided
        if not message:
            message = self._generate_commit_message(session_id, project, files)

        try:
            # Get the current commit SHA for the branch
            ref = self.repo.get_git_ref(f"heads/{branch}")
            base_sha = ref.object.sha
            base_tree = self.repo.get_git_tree(base_sha)

            # Create blobs for each file
            tree_elements = []
            for file_info in files:
                file_path = file_info['path']
                file_content = file_info['content']

                blob = self.repo.create_git_blob(file_content, "utf-8")
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
            new_tree = self.repo.create_git_tree(tree_elements, base_tree)

            # Create commit
            commit = self.repo.create_git_commit(
                message=message,
                tree=new_tree,
                parents=[self.repo.get_git_commit(base_sha)]
            )

            # Update branch reference
            ref.edit(commit.sha)

            return {
                "success": True,
                "commit_sha": commit.sha,
                "commit_url": f"https://github.com/{self.owner}/{self.repo_name}/commit/{commit.sha}",
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
            return {
                "success": True,
                "repo": f"{self.owner}/{self.repo_name}",
                "default_branch": self.repo.default_branch,
                "has_write_access": self.repo.permissions.push,
                "authenticated_user": self.github.get_user().login
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
        additional_payload: Optional[Dict[str, Any]] = None
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
