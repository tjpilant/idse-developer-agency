#!/usr/bin/env python3
"""
IDSE Governance Layer Automation
Handles LLM handoffs and role changes for Claude ↔ Codex collaboration
"""

import json
import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Literal

# Ensure repository root is on sys.path for helper imports when invoked via VS Code tasks
ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Paths
STATE_FILE = Path("idse-governance/state/state.json")
FEEDBACK_DIR = Path("idse-governance/feedback")
TEMPLATE_DIR = Path("idse-governance/templates/handoff_templates")

# Valid values
VALID_LLMS = ["claude_code", "codex_gpt"]
VALID_ROLES = ["builder", "reviewer", "planner", "implementer"]
VALID_STAGES = ["Intent", "Context", "Specification", "Plan", "Tasks", "Implementation", "Feedback"]

# IDSE Constitutional references for role changes
ROLE_CHANGE_ARTICLES = {
    "builder": "Article VII – Plan Before Build",
    "reviewer": "Article IX – Feedback Incorporation",
    "planner": "Article IV – Specification Integrity",
    "implementer": "Article VIII – Implementation Discipline"
}


def default_state() -> dict:
    """Create a default state when none exists."""
    return {
        "active_llm": "codex_gpt",
        "awaiting_handoff": False,
        "handoff_cycle_id": generate_cycle_id(),
        "layer_scope": "implementation",
        "active_stage": "Implementation",
        "role_change_event": None,
        "last_handoff": None,
        "last_checked": generate_timestamp(),
    }


def load_state() -> dict:
    """Load current state from state.json"""
    if not STATE_FILE.exists():
        # Bootstrap a default state to avoid first-run failures
        STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        state = default_state()
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)
        print(f"ℹ️ Created default governance state at {STATE_FILE}")
        return state

    with open(STATE_FILE, 'r') as f:
        return json.load(f)


def save_state(state: dict) -> None:
    """Save state to state.json with validation"""
    # Validate required fields
    required = ["active_llm", "awaiting_handoff", "handoff_cycle_id", "layer_scope"]
    for field in required:
        if field not in state:
            print(f"❌ Missing required field: {field}")
            sys.exit(1)

    # Validate values
    if state["active_llm"] not in VALID_LLMS:
        print(f"❌ Invalid active_llm: {state['active_llm']}")
        sys.exit(1)

    # Write atomically
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    temp_file = STATE_FILE.with_suffix('.tmp')
    with open(temp_file, 'w') as f:
        json.dump(state, f, indent=2)
    temp_file.replace(STATE_FILE)
    print(f"✅ State updated: {STATE_FILE}")


def generate_timestamp() -> str:
    """Generate ISO timestamp"""
    return datetime.now(timezone.utc).isoformat()


def generate_cycle_id() -> str:
    """Generate handoff cycle ID"""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H-%M-%S") + "Z"


def verify_active_llm(calling_llm: str, state: dict, command: str) -> None:
    """
    Verify that the calling LLM is the active LLM.
    Exits with error if not.
    """
    if calling_llm not in VALID_LLMS:
        print(f"❌ Invalid LLM identifier: {calling_llm}")
        print(f"   Valid: {VALID_LLMS}")
        sys.exit(1)

    if state["active_llm"] != calling_llm:
        print(f"❌ Permission denied for command '{command}'")
        print(f"   Active LLM: {state['active_llm']}")
        print(f"   Calling LLM: {calling_llm}")
        print(f"\n   Only the active LLM can execute governance commands.")
        print(f"   Wait for handoff or ask the active LLM to hand off control.")
        sys.exit(1)


def parse_iso(ts: str | None) -> datetime | None:
    if not ts:
        return None
    try:
        return datetime.fromisoformat(ts.replace("Z", "+00:00"))
    except Exception:
        return None


def check_active(calling_llm: str | None = None, warn_only: bool = False, quiet: bool = False) -> bool:
    """Check whether the current environment LLM matches the active LLM."""
    state = load_state()
    env_llm = os.getenv("LLM_ID")
    if calling_llm is None:
        calling_llm = env_llm

    messages = []
    ok = True

    if env_llm and env_llm not in VALID_LLMS:
        messages.append(f"❌ LLM_ID '{env_llm}' is invalid. Valid: {VALID_LLMS}")
        ok = False

    if calling_llm and calling_llm not in VALID_LLMS:
        messages.append(f"❌ Caller '{calling_llm}' is invalid. Valid: {VALID_LLMS}")
        ok = False

    active = state.get("active_llm")
    if calling_llm and calling_llm != active:
        messages.append(f"❌ Active LLM is '{active}', but caller/env is '{calling_llm}'")
        ok = False
    elif not calling_llm and env_llm and env_llm != active:
        messages.append(f"❌ Active LLM is '{active}', but LLM_ID is '{env_llm}'")
        ok = False

    last_checked = parse_iso(state.get("last_checked"))
    if last_checked and datetime.now(timezone.utc) - last_checked > timedelta(minutes=5):
        messages.append("⚠ State may be stale (last_checked >5 minutes ago)")

    if not quiet:
        for m in messages:
            print(m)
        if ok:
            print(f"✅ Active LLM verified: {active}")

    if not ok and not warn_only:
        sys.exit(1)
    return ok


def create_handoff_document(from_llm: str, to_llm: str, state: dict, reason: str) -> Path:
    """Create handoff document from template"""

    # Determine template
    if from_llm == "claude_code" and to_llm == "codex_gpt":
        template_file = TEMPLATE_DIR / "claude_to_codex_template.md"
        direction = "claude_to_codex"
    elif from_llm == "codex_gpt" and to_llm == "claude_code":
        template_file = TEMPLATE_DIR / "codex_to_claude_template.md"
        direction = "codex_to_claude"
    else:
        print(f"❌ Invalid handoff direction: {from_llm} → {to_llm}")
        sys.exit(1)

    if not template_file.exists():
        print(f"❌ Template not found: {template_file}")
        sys.exit(1)

    # Read template
    with open(template_file, 'r') as f:
        template = f.read()

    # Fill in template variables
    cycle_id = state["handoff_cycle_id"]
    timestamp = generate_timestamp()
    active_stage = state.get("active_stage", "Unknown")

    handoff_content = template.replace("{{handoff_cycle_id}}", cycle_id)
    handoff_content = handoff_content.replace("{{timestamp}}", timestamp)
    handoff_content = handoff_content.replace("{{active_stage}}", active_stage)

    # Add handoff reason/notes
    handoff_content = handoff_content.replace(
        "- (What was reviewed; issues found)",
        f"- {reason}"
    )

    # Create handoff document
    FEEDBACK_DIR.mkdir(parents=True, exist_ok=True)
    handoff_file = FEEDBACK_DIR / f"handoff_{direction}_{cycle_id}.md"

    with open(handoff_file, 'w') as f:
        f.write(handoff_content)

    print(f"✅ Handoff document created: {handoff_file}")
    return handoff_file


def handoff(from_llm: str, to_llm: str, reason: str) -> None:
    """Execute LLM handoff"""

    # Validate
    if from_llm not in VALID_LLMS or to_llm not in VALID_LLMS:
        print(f"❌ Invalid LLM names. Valid: {VALID_LLMS}")
        sys.exit(1)

    if from_llm == to_llm:
        print("❌ Cannot handoff to same LLM. Use role-change instead.")
        sys.exit(1)

    # Load current state
    state = load_state()

    # Verify current LLM
    if state["active_llm"] != from_llm:
        print(f"❌ Current active_llm is {state['active_llm']}, not {from_llm}")
        print("   Only the active LLM can initiate handoff.")
        sys.exit(1)

    if state["awaiting_handoff"]:
        print("⚠️  Warning: awaiting_handoff is already true")

    # Generate new cycle ID
    new_cycle_id = generate_cycle_id()
    timestamp = generate_timestamp()

    # Create handoff document
    handoff_doc = create_handoff_document(from_llm, to_llm, state, reason)

    # Update state
    state["active_llm"] = to_llm
    state["awaiting_handoff"] = True
    state["handoff_cycle_id"] = new_cycle_id
    state["last_handoff"] = {
        "from": from_llm,
        "to": to_llm,
        "timestamp": timestamp,
        "notes": reason
    }
    state["last_checked"] = timestamp

    save_state(state)

    print("\n" + "="*70)
    print(f"🔄 Handoff initiated: {from_llm} → {to_llm}")
    print("="*70)
    print(f"Cycle ID: {new_cycle_id}")
    print(f"Reason: {reason}")
    print(f"Handoff doc: {handoff_doc}")
    print("\n⚠️  Next steps:")
    print(f"   1. User switches IDE to {to_llm}")
    print(f"   2. {to_llm} runs: acknowledge-handoff")
    print("="*70)


def acknowledge_handoff(calling_llm: str) -> None:
    """Acknowledge receipt of handoff"""

    state = load_state()

    # Verify caller is the active LLM
    verify_active_llm(calling_llm, state, "acknowledge")

    if not state["awaiting_handoff"]:
        print("ℹ️  No handoff awaiting acknowledgment")
        return

    # Set awaiting_handoff to false
    state["awaiting_handoff"] = False
    state["last_checked"] = generate_timestamp()

    save_state(state)

    print("\n" + "="*70)
    print(f"✅ Handoff acknowledged by {state['active_llm']}")
    print("="*70)
    print(f"Cycle ID: {state['handoff_cycle_id']}")
    print(f"Active stage: {state.get('active_stage', 'Unknown')}")
    print("\nYou may now proceed with work.")
    print("="*70)


def change_role(calling_llm: str, new_role: str, reason: str = None) -> None:
    """Change role within same LLM"""

    if new_role not in VALID_ROLES:
        print(f"❌ Invalid role. Valid: {VALID_ROLES}")
        sys.exit(1)

    state = load_state()

    # Verify caller is the active LLM
    verify_active_llm(calling_llm, state, "role change")

    # Get current role
    current_role = None
    if state.get("role_change_event"):
        current_role = state["role_change_event"].get("to")

    if current_role == new_role:
        print(f"ℹ️  Already in role: {new_role}")
        return

    # Generate reason if not provided
    if not reason:
        article = ROLE_CHANGE_ARTICLES.get(new_role, "Role change")
        reason = f"Switching to {new_role} ({article})"

    timestamp = generate_timestamp()

    # Update role_change_event
    state["role_change_event"] = {
        "from": current_role or "unspecified",
        "to": new_role,
        "reason": reason,
        "timestamp": timestamp
    }
    state["last_checked"] = timestamp

    save_state(state)

    print("\n" + "="*70)
    print(f"🔄 Role changed: {current_role or 'unspecified'} → {new_role}")
    print("="*70)
    print(f"LLM: {state['active_llm']}")
    print(f"Reason: {reason}")
    print(f"Stage: {state.get('active_stage', 'Unknown')}")
    print("="*70)


def change_stage(calling_llm: str, new_stage: str) -> None:
    """Change IDSE pipeline stage"""

    if new_stage not in VALID_STAGES:
        print(f"❌ Invalid stage. Valid: {VALID_STAGES}")
        sys.exit(1)

    state = load_state()

    # Verify caller is the active LLM
    verify_active_llm(calling_llm, state, "stage change")

    current_stage = state.get("active_stage", "Unknown")

    if current_stage == new_stage:
        print(f"ℹ️  Already in stage: {new_stage}")
        return

    state["active_stage"] = new_stage
    state["last_checked"] = generate_timestamp()

    save_state(state)

    print(f"✅ Stage changed: {current_stage} → {new_stage}")


def view_state() -> None:
    """Display current state"""

    state = load_state()
    env_llm = os.getenv("LLM_ID")
    env_note = f" (LLM_ID={env_llm})" if env_llm else ""
    stale = ""
    last_checked = parse_iso(state.get("last_checked"))
    if last_checked and datetime.now(timezone.utc) - last_checked > timedelta(minutes=5):
        stale = "⚠ stale (>5m)"

    print("\n" + "="*70)
    print("📊 IDSE Governance State")
    print("="*70)
    print(f"Active LLM:       {state['active_llm']}{env_note}")
    print(f"Awaiting Handoff: {state['awaiting_handoff']}")
    print(f"Cycle ID:         {state.get('handoff_cycle_id', 'N/A')}")
    print(f"Active Stage:     {state.get('active_stage', 'Unknown')}")
    print(f"Layer Scope:      {state.get('layer_scope', 'N/A')}")

    if state.get("role_change_event"):
        role_event = state["role_change_event"]
        print(f"\nCurrent Role:     {role_event.get('to', 'Unknown')}")
        print(f"  Changed from:   {role_event.get('from', 'Unknown')}")
        print(f"  Reason:         {role_event.get('reason', 'N/A')}")

    if state.get("last_handoff"):
        last = state["last_handoff"]
        print(f"\nLast Handoff:     {last.get('from')} → {last.get('to')}")
        print(f"  Timestamp:      {last.get('timestamp', 'N/A')}")
        print(f"  Notes:          {last.get('notes', 'N/A')}")

    print(f"\nLast Checked:     {state.get('last_checked', 'N/A')} {stale}")
    print("="*70)


def main():
    """Main CLI interface"""

    if len(sys.argv) < 2:
        print("Usage:")
        print("  Handoff:     governance.py handoff <from_llm> <to_llm> <reason>")
        print("  Acknowledge: governance.py acknowledge --as <llm_name>")
        print("  Role Change: governance.py role --as <llm_name> <new_role> [reason]")
        print("  Stage Change: governance.py stage --as <llm_name> <new_stage>")
        print("  Check Active: governance.py check-active [--as <llm_name>] [--warn-only] [--quiet]")
        print("  View State:  governance.py view")
        print()
        print(f"Valid LLMs: {VALID_LLMS}")
        print(f"Valid Roles: {VALID_ROLES}")
        print(f"Valid Stages: {VALID_STAGES}")
        print()
        print("Note: --as parameter identifies which LLM is running the command")
        sys.exit(1)

    command = sys.argv[1]

    try:
        if command == "handoff":
            if len(sys.argv) < 5:
                print("❌ Usage: governance.py handoff <from_llm> <to_llm> <reason>")
                sys.exit(1)
            from_llm = sys.argv[2]
            to_llm = sys.argv[3]
            reason = " ".join(sys.argv[4:])
            handoff(from_llm, to_llm, reason)

        elif command == "acknowledge":
            # Parse --as parameter
            if len(sys.argv) < 4 or sys.argv[2] != "--as":
                print("❌ Usage: governance.py acknowledge --as <llm_name>")
                sys.exit(1)
            calling_llm = sys.argv[3]
            acknowledge_handoff(calling_llm)

        elif command == "role":
            # Parse --as parameter
            if len(sys.argv) < 5 or sys.argv[2] != "--as":
                print("❌ Usage: governance.py role --as <llm_name> <new_role> [reason]")
                sys.exit(1)
            calling_llm = sys.argv[3]
            new_role = sys.argv[4]
            reason = " ".join(sys.argv[5:]) if len(sys.argv) > 5 else None
            change_role(calling_llm, new_role, reason)

        elif command == "stage":
            # Parse --as parameter
            if len(sys.argv) < 5 or sys.argv[2] != "--as":
                print("❌ Usage: governance.py stage --as <llm_name> <new_stage>")
                sys.exit(1)
            calling_llm = sys.argv[3]
            new_stage = sys.argv[4]
            change_stage(calling_llm, new_stage)

        elif command == "check-active":
            warn_only = "--warn-only" in sys.argv
            quiet = "--quiet" in sys.argv
            as_llm = None
            if "--as" in sys.argv:
                idx = sys.argv.index("--as")
                if idx + 1 >= len(sys.argv):
                    print("❌ Usage: governance.py check-active [--as <llm_name>] [--warn-only] [--quiet]")
                    sys.exit(1)
                as_llm = sys.argv[idx + 1]
            check_active(as_llm, warn_only=warn_only, quiet=quiet)

        elif command == "view":
            view_state()

        else:
            print(f"❌ Unknown command: {command}")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
