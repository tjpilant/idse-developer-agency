-- Migration 010: Backfill new columns for existing sessions
-- Run AFTER: 009_seed_blueprint_sessions.sql
-- Purpose: Add state_json, is_blueprint, and updated_at to sessions created before migration 008

-- Update all existing sessions that don't have state_json
UPDATE sessions
SET
  updated_at = COALESCE(updated_at, created_at),
  is_blueprint = COALESCE(is_blueprint, FALSE),
  state_json = COALESCE(state_json, '{
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
  }'::jsonb)
WHERE
  session_id != '__blueprint__'  -- Don't touch blueprint sessions
  AND (
    state_json IS NULL
    OR updated_at IS NULL
    OR is_blueprint IS NULL
  );

-- Verify backfill
SELECT
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE state_json IS NOT NULL) as with_state_json,
  COUNT(*) FILTER (WHERE is_blueprint IS NOT NULL) as with_is_blueprint,
  COUNT(*) FILTER (WHERE updated_at IS NOT NULL) as with_updated_at
FROM sessions;

-- Migration complete
SELECT 'Migration 010: Existing sessions backfilled successfully' AS status;
