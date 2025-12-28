from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable

from guardrails.instruction_protection import idse_boundary_guardrail
from session_reader import SessionReader
from utils.doc_reader import IDSEDocReader
from utils.template_writer import TemplateWriter


class PreCommitValidator:
    """Lightweight pre-commit checks for spec compliance and basic safety."""

    def __init__(self, base_dir: Path | str = Path(".")):
        self.base_dir = Path(base_dir)
        self.session = SessionReader.get_active_session(base_dir=self.base_dir)
        self.reader = IDSEDocReader(base_dir=self.base_dir)

    def run_all(self) -> dict:
        return {
            "spec_compliance": self.check_spec_compliance(),
            "security": self.check_security(),
            "boundary": self.check_boundary(),
        }

    def check_spec_compliance(self) -> dict:
        """Verify implementation aligns with spec markers (draft-safe)."""
        try:
            spec_text = self.reader.read("specs", "spec.md")
        except FileNotFoundError:
            return {"status": "warn", "reason": "spec not found"}

        is_draft = TemplateWriter.is_draft(spec_text)
        unresolved = "[REQUIRES INPUT]" in spec_text
        status = "pass"
        if unresolved and not is_draft:
            status = "fail"
        elif unresolved and is_draft:
            status = "warn"
        return {
            "status": status,
            "draft": is_draft,
            "unresolved_markers": unresolved,
        }

    def check_security(self) -> dict:
        """Simple hardcoded secret scan in changed files."""
        files = self._changed_files()
        pattern = re.compile(r"(api[_-]?key|password|secret|token)\s*=\s*[\"'][^\"']+[\"']", re.I)
        findings = []
        for f in files:
            path = self.base_dir / f
            if not path.exists() or path.is_dir():
                continue
            text = path.read_text(errors="ignore")
            if pattern.search(text):
                findings.append(str(f))
        return {
            "status": "pass" if not findings else "fail",
            "findings": findings,
        }

    def check_boundary(self) -> dict:
        """Ensure changed files do not violate governance boundaries."""
        files = self._changed_files()
        violations = []
        for f in files:
            ok, msg = idse_boundary_guardrail(str(f), "write")
            if not ok:
                violations.append(msg)
        return {
            "status": "pass" if not violations else "fail",
            "violations": violations,
        }

    def _changed_files(self) -> Iterable[str]:
        result = subprocess.run(
            ["git", "diff", "--name-only", "--cached"],
            cwd=self.base_dir,
            check=False,
            capture_output=True,
            text=True,
        )
        files = [line.strip() for line in result.stdout.splitlines() if line.strip()]
        return files


def main():
    validator = PreCommitValidator()
    results = validator.run_all()

    print("Pre-commit check results:")
    for key, value in results.items():
        print(f"- {key}: {value}")

    status = 0
    for entry in results.values():
        if entry.get("status") == "fail":
            status = 1

    if status != 0:
        print("\n❌ Pre-commit checks failed. Review findings above.")
    sys.exit(status)


if __name__ == "__main__":
    main()
