-- Migration 009: Seed __blueprint__ sessions for all projects
-- Run AFTER: 008_add_session_state.sql
-- Idempotent: Safe to re-run (ON CONFLICT DO NOTHING)

-- Create __blueprint__ session for each existing project
INSERT INTO sessions (
  id,
  project_id,
  session_id,
  name,
  owner,
  is_blueprint,
  state_json,
  created_at
)
SELECT
  gen_random_uuid() AS id,
  p.id AS project_id,
  '__blueprint__' AS session_id,
  'Project Blueprint (IDD)' AS name,
  'agency' AS owner,
  TRUE AS is_blueprint,
  '{
    "stages": {
      "intent": "pending",
      "context": "pending",
      "spec": "pending",
      "plan": "pending",
      "tasks": "pending",
      "implementation": "pending",
      "feedback": "pending"
    },
    "last_agent": "system",
    "progress_percent": 0
  }'::jsonb AS state_json,
  NOW() AS created_at
FROM projects p
WHERE NOT EXISTS (
  SELECT 1 FROM sessions s
  WHERE s.project_id = p.id
  AND s.session_id = '__blueprint__'
)
ON CONFLICT (project_id, session_id) DO NOTHING;

-- Verify blueprint sessions created
SELECT
  p.name AS project_name,
  s.session_id,
  s.is_blueprint,
  s.state_json->'stages' AS stages
FROM projects p
JOIN sessions s ON s.project_id = p.id
WHERE s.is_blueprint = TRUE
ORDER BY p.name;

-- Migration complete
SELECT 'Migration 009: Blueprint sessions seeded successfully' AS status;
