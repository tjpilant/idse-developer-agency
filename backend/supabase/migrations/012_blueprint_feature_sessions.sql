-- Migration: 012 - Blueprint and Feature Session Support
-- Date: 2026-01-16
-- Purpose: Add full session metadata support for blueprint/feature session architecture
-- Dependencies: 011_add_is_blueprint_flag.sql
-- Rollback: See rollback section at end of file

-- Add session metadata columns
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'feature' CHECK (session_type IN ('blueprint', 'feature', 'exploratory')),
ADD COLUMN IF NOT EXISTS parent_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'review', 'complete', 'archived')),
ADD COLUMN IF NOT EXISTS collaborators JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS related_sessions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_parent ON sessions(parent_session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_tags ON sessions USING GIN(tags);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then recreate
DROP TRIGGER IF EXISTS sessions_updated_at_trigger ON sessions;

CREATE TRIGGER sessions_updated_at_trigger
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_sessions_updated_at();

-- Backfill existing sessions
-- Set blueprint sessions (session_id = '__blueprint__')
UPDATE sessions
SET
  session_type = 'blueprint',
  is_blueprint = TRUE,
  parent_session_id = NULL
WHERE session_id = '__blueprint__' AND session_type IS NULL;

-- Set feature sessions (all non-blueprint sessions)
UPDATE sessions
SET
  session_type = 'feature',
  is_blueprint = FALSE
WHERE session_id != '__blueprint__' AND session_type IS NULL;

-- Link feature sessions to their blueprint parent (if exists)
UPDATE sessions AS feature
SET parent_session_id = blueprint.id
FROM sessions AS blueprint
WHERE
  feature.session_id != '__blueprint__'
  AND blueprint.session_id = '__blueprint__'
  AND feature.project_id = blueprint.project_id
  AND feature.parent_session_id IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN sessions.session_type IS 'Type of session: blueprint (governance), feature (atomic implementation), or exploratory (research)';
COMMENT ON COLUMN sessions.parent_session_id IS 'UUID of parent session (usually the blueprint session)';
COMMENT ON COLUMN sessions.description IS 'Human-readable description of the session purpose';
COMMENT ON COLUMN sessions.tags IS 'Array of tags for filtering/categorization';
COMMENT ON COLUMN sessions.status IS 'Current status of the session work';
COMMENT ON COLUMN sessions.collaborators IS 'JSONB array of collaborator objects with name, role, joined_at fields';
COMMENT ON COLUMN sessions.related_sessions IS 'JSONB array of related session IDs for cross-referencing';

-- Verification query
SELECT
  COUNT(*) as total_sessions,
  COUNT(*) FILTER (WHERE is_blueprint = TRUE) as blueprint_count,
  COUNT(*) FILTER (WHERE session_type = 'feature') as feature_count,
  COUNT(*) FILTER (WHERE parent_session_id IS NOT NULL) as sessions_with_parent
FROM sessions;

-- Rollback commands (run these to undo this migration)
/*
DROP TRIGGER IF EXISTS sessions_updated_at_trigger ON sessions;
DROP FUNCTION IF EXISTS update_sessions_updated_at();
DROP INDEX IF EXISTS idx_sessions_tags;
DROP INDEX IF EXISTS idx_sessions_status;
DROP INDEX IF EXISTS idx_sessions_type;
DROP INDEX IF EXISTS idx_sessions_parent;
ALTER TABLE sessions
  DROP COLUMN IF EXISTS updated_at,
  DROP COLUMN IF EXISTS related_sessions,
  DROP COLUMN IF EXISTS collaborators,
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS tags,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS parent_session_id,
  DROP COLUMN IF EXISTS session_type;
*/
