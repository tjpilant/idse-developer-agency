-- Fix project-research-tools Session
-- This project has an old structure with session directly under project root
-- instead of under sessions/ subdirectory

-- Add the missing session to Supabase
DO $$
DECLARE
  project_uuid UUID;
BEGIN
  -- Get project UUID
  SELECT id INTO project_uuid FROM projects WHERE name = 'project-research-tools';

  IF project_uuid IS NULL THEN
    RAISE EXCEPTION 'project-research-tools not found in projects table';
  END IF;

  -- Insert the actual session that exists in filesystem
  INSERT INTO sessions (project_id, session_id, name, owner)
  VALUES
    (project_uuid, 'session-1765977053', 'Session 1765977053', 'claude')
  ON CONFLICT (project_id, session_id) DO NOTHING;

  RAISE NOTICE 'Added session-1765977053 to project-research-tools';
END $$;

-- Verify
SELECT
  p.name as project,
  s.session_id,
  s.name as session_name
FROM projects p
JOIN sessions s ON p.id = s.project_id
WHERE p.name = 'project-research-tools';
