-- Migration 010: Add collaborators column to sessions
-- Purpose: Support Supabase-backed role provider for milkdown-crepe

ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS collaborators TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_sessions_collaborators
ON sessions USING GIN (collaborators);

-- Verification
SELECT 'Migration 010: collaborators column added to sessions' AS status;
