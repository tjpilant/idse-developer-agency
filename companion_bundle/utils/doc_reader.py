from __future__ import annotations

from pathlib import Path
from typing import Optional

from session_reader import SessionReader


class IDSEDocReader:
    """Session-aware document resolver with sensible fallbacks."""

    def __init__(self, base_dir: Path | str = Path(".")):
        self.base_dir = Path(base_dir)

    def _candidate_paths(self, stage_dir: str, filename: str) -> list[Path]:
        """Return ordered candidate paths for an artifact."""
        candidates: list[Path] = []

        # Session-aware path (Agency-managed sessions)
        session_path = SessionReader.build_session_path(
            stage_dir,
            filename,
            base_dir=self.base_dir,
        )
        candidates.append(self.base_dir / session_path)

        # Current symlink (maintained by Agency)
        candidates.append(self.base_dir / stage_dir / "current" / filename)

        # Stage directory fallback (simple mode)
        candidates.append(self.base_dir / stage_dir / filename)

        # Flat file fallback (offline/simple setups)
        candidates.append(self.base_dir / filename)

        return candidates

    def resolve(self, stage_dir: str, filename: str) -> Optional[Path]:
        """Return the first existing path for the artifact, or None."""
        for candidate in self._candidate_paths(stage_dir, filename):
            if candidate.exists():
                return candidate
        return None

    def read(self, stage_dir: str, filename: str) -> str:
        """Read the artifact text or raise FileNotFoundError."""
        path = self.resolve(stage_dir, filename)
        if not path:
            raise FileNotFoundError(f"No artifact found for {filename}")
        return path.read_text()
