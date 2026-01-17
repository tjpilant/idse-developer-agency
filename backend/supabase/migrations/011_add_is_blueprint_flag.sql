-- Migration: Add is_blueprint flag to sessions table
-- Purpose: Distinguish blueprint sessions from feature sessions
-- Date: 2026-01-16

-- Add is_blueprint column to sessions table
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS is_blueprint BOOLEAN DEFAULT FALSE;

-- Update existing __blueprint__ sessions to mark them as blueprint sessions
UPDATE sessions
SET is_blueprint = TRUE
WHERE session_id = '__blueprint__';

-- Create index for faster blueprint session queries
CREATE INDEX IF NOT EXISTS idx_sessions_is_blueprint ON sessions(is_blueprint);

-- Add comment to column for documentation
COMMENT ON COLUMN sessions.is_blueprint IS 'Indicates whether this is a blueprint session (project-level governance) or a feature session (atomic implementation)';
