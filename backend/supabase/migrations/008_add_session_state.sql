-- Migration 008: Add state tracking to sessions table
-- Run AFTER: 007_fix_project_research_tools.sql
-- Idempotent: Safe to re-run

-- Add state_json column for per-session pipeline tracking
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS state_json JSONB DEFAULT '{
  "stages": {
    "intent": "pending",
    "context": "pending",
    "spec": "pending",
    "plan": "pending",
    "tasks": "pending",
    "implementation": "pending",
    "feedback": "pending"
  },
  "last_agent": null,
  "progress_percent": 0
}'::jsonb;

-- Add is_blueprint flag for identifying project-level blueprint sessions
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS is_blueprint BOOLEAN DEFAULT FALSE;

-- Index for efficient state queries
CREATE INDEX IF NOT EXISTS idx_sessions_state
ON sessions USING GIN (state_json);

-- Index for blueprint filtering
CREATE INDEX IF NOT EXISTS idx_sessions_blueprint
ON sessions (project_id, is_blueprint)
WHERE is_blueprint = TRUE;

-- Add updated_at trigger to track state changes
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sessions_updated_at_trigger ON sessions;
CREATE TRIGGER sessions_updated_at_trigger
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_sessions_updated_at();

-- Migration complete
SELECT 'Migration 008: Session state tracking added successfully' AS status;
