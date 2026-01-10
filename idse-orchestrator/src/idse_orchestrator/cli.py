"""
IDSE Orchestrator CLI

Command-line interface for managing IDSE projects in client workspaces.

Commands:
- init: Initialize a new IDSE project with pipeline structure
- validate: Check artifacts for constitutional compliance
- sync push: Upload pipeline docs to Agency Core
- sync pull: Download latest artifacts from Agency Core
- status: Display current project and session status
"""

import click
from pathlib import Path
from typing import Optional
import sys

from . import __version__


@click.group()
@click.version_option(version=__version__, prog_name="idse")
@click.pass_context
def main(ctx):
    """
    IDSE Developer Orchestrator

    Manage Intent-Driven Systems Engineering projects in your workspace.
    This CLI coordinates IDE agents and syncs with the Agency Core backend.
    """
    # Ensure context object exists
    ctx.ensure_object(dict)


@main.command()
@click.argument("project_name")
@click.option("--stack", default="python", help="Technology stack (python, node, go, etc.)")
@click.option("--client-id", help="Client ID from Agency Core")
@click.pass_context
def init(ctx, project_name: str, stack: str, client_id: Optional[str]):
    """
    Initialize a new IDSE project with pipeline structure.

    Creates the following structure:

        .idse/
        └── projects/
            └── <project_name>/
                ├── sessions/
                │   └── session-<timestamp>/
                │       ├── intents/intent.md
                │       ├── contexts/context.md
                │       ├── specs/spec.md
                │       ├── plans/plan.md
                │       ├── tasks/tasks.md
                │       ├── implementation/README.md
                │       ├── feedback/feedback.md
                │       └── metadata/.owner
                ├── CURRENT_SESSION
                └── session_state.json

    Example:
        idse init customer-portal --stack python
    """
    from .project_manager import ProjectManager

    click.echo(f"🚀 Initializing IDSE project: {project_name}")
    click.echo(f"   Stack: {stack}")

    try:
        manager = ProjectManager()
        project_path = manager.init_project(project_name, stack, client_id)

        click.echo(f"✅ Project initialized at: {project_path}")
        click.echo(f"📝 Pipeline artifacts created from templates")
        click.echo(f"📊 Session state initialized")
        click.echo("")
        click.echo(f"Next steps:")
        click.echo(f"  1. Edit pipeline documents in .idse/projects/{project_name}/sessions/")
        click.echo(f"  2. Run 'idse validate' to check compliance")
        click.echo(f"  3. Run 'idse sync push' to upload to Agency Core")

    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@main.command()
@click.option("--project", help="Project name (uses current if not specified)")
@click.pass_context
def validate(ctx, project: Optional[str]):
    """
    Validate pipeline artifacts for constitutional compliance.

    Checks:
    - All required sections present in artifacts
    - No [REQUIRES INPUT] markers remaining
    - Stage sequencing (Article III compliance)
    - Template compliance (Article IV)

    Example:
        idse validate
        idse validate --project customer-portal
    """
    from .validator import Validator

    click.echo("🔍 Validating IDSE pipeline artifacts...")

    try:
        validator = Validator()
        results = validator.validate_project(project)

        if results["valid"]:
            click.echo("✅ Validation passed!")
            for check in results["checks"]:
                click.echo(f"   ✓ {check}")
        else:
            click.echo("❌ Validation failed:", err=True)
            for error in results["errors"]:
                click.echo(f"   ✗ {error}", err=True)
            sys.exit(1)

    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@main.group()
def sync():
    """Sync pipeline artifacts with Agency Core."""
    pass


@sync.command()
@click.option("--project", help="Project name (uses current if not specified)")
@click.option("--agency-url", envvar="IDSE_AGENCY_URL", help="Agency Core URL")
@click.pass_context
def push(ctx, project: Optional[str], agency_url: Optional[str]):
    """
    Upload local pipeline artifacts to Agency Core.

    Validates artifacts locally first, then uploads via MCP protocol.
    Updates sync timestamp and logs event locally.

    Example:
        idse sync push
        idse sync push --project customer-portal
    """
    from .mcp_client import MCPClient
    from .validator import Validator

    click.echo("📤 Syncing to Agency Core...")

    # Validate first
    click.echo("   Validating artifacts...")
    validator = Validator()
    results = validator.validate_project(project)

    if not results["valid"]:
        click.echo("❌ Validation failed. Fix errors before syncing:", err=True)
        for error in results["errors"]:
            click.echo(f"   ✗ {error}", err=True)
        sys.exit(1)

    try:
        client = MCPClient(agency_url)
        response = client.push_project(project)

        click.echo(f"✅ Synced successfully!")
        click.echo(f"   Project ID: {response.get('project_id')}")
        if response.get("synced_stages"):
            click.echo(f"   Stages: {', '.join(response['synced_stages'])}")
        if response.get("message"):
            click.echo(f"   Message: {response['message']}")
        click.echo(f"   Timestamp: {response.get('timestamp')}")

    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@sync.command()
@click.option("--project", help="Project name (uses current if not specified)")
@click.option("--agency-url", envvar="IDSE_AGENCY_URL", help="Agency Core URL")
@click.option("--force", is_flag=True, help="Overwrite local changes without prompting")
@click.pass_context
def pull(ctx, project: Optional[str], agency_url: Optional[str], force: bool):
    """
    Download latest pipeline artifacts from Agency Core.

    Compares remote timestamps with local, warns if local changes
    will be overwritten. Prompts for confirmation unless --force is used.

    Example:
        idse sync pull
        idse sync pull --force
    """
    from .mcp_client import MCPClient

    click.echo("📥 Pulling from Agency Core...")

    try:
        client = MCPClient(agency_url)
        response = client.pull_project(project, force=force)

        if response.get("conflicts") and not force:
            click.echo("⚠️  Warning: Local changes detected:")
            for conflict in response["conflicts"]:
                click.echo(f"   - {conflict}")

            if not click.confirm("Overwrite local changes?"):
                click.echo("Sync cancelled.")
                return

        # Proceed with pull
        client.apply_pull(response)

        click.echo("✅ Pull completed successfully!")
        click.echo(f"   Updated {len(response['artifacts'])} artifacts")

    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@main.command()
@click.option("--project", help="Project name (uses current if not specified)")
@click.pass_context
def status(ctx, project: Optional[str]):
    """
    Display current project and session status.

    Shows:
    - Current project and session
    - Stage completion status (pending/in_progress/complete)
    - Last sync timestamp
    - Validation status

    Example:
        idse status
    """
    from .state_tracker import StateTracker

    try:
        tracker = StateTracker()
        state = tracker.get_status(project)

        click.echo("📊 IDSE Project Status")
        click.echo("")
        click.echo(f"Project: {state['project_name']}")
        click.echo(f"Session: {state['session_id']}")
        click.echo(f"Last Sync: {state.get('last_sync', 'Never')}")
        click.echo("")
        click.echo("Pipeline Stages:")

        for stage, status in state["stages"].items():
            icon = "✅" if status == "complete" else "🔄" if status == "in_progress" else "⏳"
            click.echo(f"  {icon} {stage.ljust(15)}: {status}")

        click.echo("")
        validation_status = state.get("validation_status", "unknown")
        if validation_status == "passing":
            click.echo("✅ Validation: Passing")
        else:
            click.echo(f"⚠️  Validation: {validation_status}")

    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
