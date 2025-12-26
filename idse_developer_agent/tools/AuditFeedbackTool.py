import subprocess
from pathlib import Path
from agency_swarm.tools import BaseTool
from pydantic import Field


class AuditFeedbackTool(BaseTool):
    """
    Run idse-governance/audit-feedback.py for a project/session.
    Writes report to reports/projects/<project>/sessions/<session>/audit-feedback-report.txt.
    """

    project: str = Field(default="IDSE_Core", description="Project name")
    session: str = Field(default="session-1765806980", description="Session name")
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

        cmd = [
            "python3",
            "idse-governance/audit-feedback.py",
            "--project",
            proj,
            "--session",
            sess,
            "--report-dir",
            str(report_dir),
        ]

        try:
            completed = subprocess.run(cmd, capture_output=True, text=True, check=False)
            status = "OK" if completed.returncode == 0 else f"FAIL({completed.returncode})"
            parts = [f"audit-feedback: {status}"]
            if completed.stdout:
                parts.append(f"stdout:\n{completed.stdout.strip()}")
            if completed.stderr:
                parts.append(f"stderr:\n{completed.stderr.strip()}")
            return "\n\n".join(parts)
        except Exception as exc:  # pragma: no cover - best effort
            return f"audit-feedback: ERROR {exc}"
