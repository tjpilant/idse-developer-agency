import subprocess
from pathlib import Path
from agency_swarm.tools import BaseTool
from pydantic import Field


class ValidateArtifactsTool(BaseTool):
    """
    Run governance validators for a project/session:
    - validate-artifacts
    - check-compliance
    - audit-feedback

    Writes reports under reports/projects/<project>/sessions/<session>/.
    Returns a short status summary.
    """

    project: str = Field(default="Project_Status_Browser", description="Project name")
    session: str = Field(default="session-XXXX", description="Session name")
    report_dir: str | None = Field(
        default=None,
        description="Optional report directory. Defaults to reports/projects/<project>/sessions/<session>/",
    )

    def run(self) -> str:
        proj = self.project
        sess = self.session
        report_dir = (
            Path(self.report_dir)
            if self.report_dir
            else Path("reports") / "projects" / proj / "sessions" / sess
        )
        report_dir.mkdir(parents=True, exist_ok=True)

        cmds = [
            (
                ["python3", "idse-governance/validate-artifacts.py", "--project", proj, "--session", sess, "--report-dir", str(report_dir)],
                "validate-artifacts",
            ),
            (
                ["python3", "idse-governance/check-compliance.py", "--project", proj, "--session", sess, "--report-dir", str(report_dir)],
                "check-compliance",
            ),
            (
                ["python3", "idse-governance/audit-feedback.py", "--project", proj, "--session", sess, "--report-dir", str(report_dir)],
                "audit-feedback",
            ),
        ]

        results: list[str] = []
        for cmd, label in cmds:
            try:
                completed = subprocess.run(cmd, capture_output=True, text=True, check=False)
                status = "OK" if completed.returncode == 0 else f"FAIL({completed.returncode})"
                results.append(f"{label}: {status}")
                if completed.stdout:
                    results.append(f"{label} stdout:\n{completed.stdout.strip()}")
                if completed.stderr:
                    results.append(f"{label} stderr:\n{completed.stderr.strip()}")
            except Exception as exc:  # pragma: no cover - best effort
                results.append(f"{label}: ERROR {exc}")

        return "\n\n".join(results)
