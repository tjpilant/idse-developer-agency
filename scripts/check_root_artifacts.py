"""
Guardrail: ensure only allowed root-level artifacts exist.
Run: python3 scripts/check_root_artifacts.py
"""

from pathlib import Path
import sys

ALLOWED = {
    ".git",
    ".github",
    ".venv",
    ".gitignore",
    ".dockerignore",
    ".cursor",
    ".claude",
    ".agency_swarm_chats",
    ".idse-layer",
    ".vscode",
    ".pytest_cache",
    "backend",
    "frontend",
    "data",
    "docs",
    "idse-governance",
    "idse_developer_agent",
    "implementation",
    "intents",
    "contexts",
    "specs",
    "plans",
    "tasks",
    "feedback",
    "tests",
    "scripts",
    "README.md",
    "AGENTS.md",
    "CLAUDE.md",
    "HOW_TO_RUN.md",
    "INTEGRATION_GUIDE.md",
    "PUCK_INTEGRATION.md",
    "TROUBLESHOOTING.md",
    "shared_instructions.md",
    "pyproject.toml",
    "requirements.txt",
    "Dockerfile",
    "run.sh",
    "agency.py",
    "main.py",
    ".env",
    ".env.template",
    "test_hang.py",
    "SessionManager.py",
}


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    unexpected = []
    for item in root.iterdir():
        if item.name in {"__pycache__"}:
            continue
        if item.name not in ALLOWED:
            unexpected.append(item.name)

    if unexpected:
        print("Unexpected root artifacts detected:", ", ".join(sorted(unexpected)))
        return 1

    print("Root artifacts check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
