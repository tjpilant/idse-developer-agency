-- Seed All Filesystem Projects to Supabase
-- Generated: 2026-01-11
-- Purpose: Seed all 8 projects from filesystem into Supabase

-- ============================================================================
-- STEP 1: Seed Projects
-- ============================================================================

INSERT INTO projects (name, stack, framework, state_json)
VALUES
  ('Puck_Docs', 'typescript', 'puck', '{}'::jsonb),
  ('Puck_Editor_Research', 'typescript', 'puck', '{}'::jsonb),
  ('RemapTest', 'unknown', 'unknown', '{}'::jsonb),
  ('TestBootstrap', 'unknown', 'unknown', '{}'::jsonb),
  ('default', 'unknown', 'unknown', '{}'::jsonb),
  ('project-research-tools', 'unknown', 'unknown', '{}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STEP 2: Get UUIDs for Session Seeding
-- ============================================================================

-- Run this query to see all project UUIDs:
-- SELECT id, name FROM projects ORDER BY name;

-- ============================================================================
-- STEP 3: Seed Sessions for Each Project
-- ============================================================================

-- IDSE_Core missing sessions (we already have 4, need 5 more)
-- Using known UUID: 30763636-d88a-48f0-b91b-77dcaf3dc0bc
INSERT INTO sessions (project_id, session_id, name, owner)
VALUES
  ('30763636-d88a-48f0-b91b-77dcaf3dc0bc', 'milkdown-crepe-v2', 'Milkdown Crepe V2', 'claude'),
  ('30763636-d88a-48f0-b91b-77dcaf3dc0bc', 'project-path', 'Project Path', 'claude'),
  ('30763636-d88a-48f0-b91b-77dcaf3dc0bc', 'puck-components', 'Puck Components', 'claude'),
  ('30763636-d88a-48f0-b91b-77dcaf3dc0bc', 'session-1765806980', 'Session 1765806980', 'claude'),
  ('30763636-d88a-48f0-b91b-77dcaf3dc0bc', 'status-browser-integration', 'Status Browser Integration', 'claude')
ON CONFLICT (project_id, session_id) DO NOTHING;

-- Puck_Docs sessions
-- Get UUID first: SELECT id FROM projects WHERE name = 'Puck_Docs';
DO $$
DECLARE
  puck_docs_uuid UUID;
BEGIN
  SELECT id INTO puck_docs_uuid FROM projects WHERE name = 'Puck_Docs';

  INSERT INTO sessions (project_id, session_id, name, owner)
  VALUES
    (puck_docs_uuid, 'session-01', 'Session 01', 'claude'),
    (puck_docs_uuid, 'session-1767235212', 'Session 1767235212', 'claude')
  ON CONFLICT (project_id, session_id) DO NOTHING;
END $$;

-- Puck_Editor_Research sessions
DO $$
DECLARE
  puck_research_uuid UUID;
BEGIN
  SELECT id INTO puck_research_uuid FROM projects WHERE name = 'Puck_Editor_Research';

  INSERT INTO sessions (project_id, session_id, name, owner)
  VALUES
    (puck_research_uuid, 'session-1767221303', 'Session 1767221303', 'claude'),
    (puck_research_uuid, 'session-puck-001', 'Session Puck 001', 'claude')
  ON CONFLICT (project_id, session_id) DO NOTHING;
END $$;

-- RemapTest sessions
DO $$
DECLARE
  remap_uuid UUID;
BEGIN
  SELECT id INTO remap_uuid FROM projects WHERE name = 'RemapTest';

  INSERT INTO sessions (project_id, session_id, name, owner)
  VALUES
    (remap_uuid, 'remap-session', 'Remap Session', 'claude')
  ON CONFLICT (project_id, session_id) DO NOTHING;
END $$;

-- TestBootstrap sessions
DO $$
DECLARE
  test_uuid UUID;
BEGIN
  SELECT id INTO test_uuid FROM projects WHERE name = 'TestBootstrap';

  INSERT INTO sessions (project_id, session_id, name, owner)
  VALUES
    (test_uuid, 'canary-test-1', 'Canary Test 1', 'claude')
  ON CONFLICT (project_id, session_id) DO NOTHING;
END $$;

-- default sessions
DO $$
DECLARE
  default_uuid UUID;
BEGIN
  SELECT id INTO default_uuid FROM projects WHERE name = 'default';

  INSERT INTO sessions (project_id, session_id, name, owner)
  VALUES
    (default_uuid, 'cli-1766987138', 'CLI 1766987138', 'claude')
  ON CONFLICT (project_id, session_id) DO NOTHING;
END $$;

-- ============================================================================
-- STEP 4: Verification Queries
-- ============================================================================

-- Check all projects:
-- SELECT name, stack, framework FROM projects ORDER BY name;

-- Check total session count:
-- SELECT COUNT(*) FROM sessions;

-- Check sessions per project:
-- SELECT p.name, COUNT(s.id) as session_count
-- FROM projects p
-- LEFT JOIN sessions s ON p.id = s.project_id
-- GROUP BY p.name
-- ORDER BY p.name;

-- ============================================================================
-- Expected Results After Running This Migration:
-- ============================================================================
-- Total Projects: 8 (IDSE_Core + 7 new)
-- Total Sessions: 18
--   - IDSE_Core: 9 sessions
--   - Puck_Docs: 2 sessions
--   - Puck_Editor_Research: 2 sessions
--   - RemapTest: 1 session
--   - TestBootstrap: 1 session
--   - default: 1 session
--   - project-research-tools: 0 sessions (no sessions directory in filesystem)
-- ============================================================================
