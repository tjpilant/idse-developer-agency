-- IDSE Agency Core - Add Missing Tables to Existing Schema
-- Works with existing projects table structure
--
-- Run this in Supabase SQL Editor: https://spxovndsgpzvcztbkjel.supabase.co
--
-- Assumes you already have:
--   - projects table with: id, name, stack, constraints, intent_md, context_md, spec_md, plan_md, tasks_md, feedback_md, state_json

-- ============================================================================
-- TABLE: clients (NEW)
-- Multi-tenant client accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  api_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_clients_api_key ON clients(api_key);

-- ============================================================================
-- TABLE: sessions (NEW)
-- Sessions for projects (multi-session support per project)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,

  -- Pipeline artifacts (mirroring your existing projects structure)
  intent_md TEXT,
  context_md TEXT,
  spec_md TEXT,
  plan_md TEXT,
  tasks_md TEXT,
  implementation_md TEXT,
  feedback_md TEXT,

  -- State tracking
  state_json JSONB,
  validation_status TEXT DEFAULT 'unknown',
  last_validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, session_name)
);

CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);

-- ============================================================================
-- TABLE: sync_events (NEW)
-- MCP sync audit log
-- ============================================================================

CREATE TABLE IF NOT EXISTS sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('push', 'pull')),
  artifacts_synced TEXT[],
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_events_session_id ON sync_events(session_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_project_id ON sync_events(project_id);

-- ============================================================================
-- ALTER existing projects table to add missing columns (if needed)
-- ============================================================================

-- Add client_id to projects table for multi-tenancy
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS framework TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS implementation_md TEXT;

-- Add index for client queries
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);

-- ============================================================================
-- Auto-update triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Create test client
-- ============================================================================

INSERT INTO clients (name, email, api_key, active)
VALUES (
  'IDSE Developer Agency',
  'admin@idse.dev',
  'test_api_key_' || gen_random_uuid()::text,
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING id, name, api_key;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Show projects table structure
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'projects' ORDER BY ordinal_position;

-- Count records
SELECT
  (SELECT COUNT(*) FROM clients) as clients,
  (SELECT COUNT(*) FROM projects) as projects,
  (SELECT COUNT(*) FROM sessions) as sessions,
  (SELECT COUNT(*) FROM sync_events) as sync_events;
