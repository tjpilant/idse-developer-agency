-- Create projects table for IDSE Agency Core
-- Run this in: https://spxovndsgpzvcztbkjel.supabase.co/project/spxovndsgpzvcztbkjel/sql/new

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  stack TEXT,
  framework TEXT,
  constraints TEXT,

  -- Pipeline stage artifacts
  intent_md TEXT,
  context_md TEXT,
  spec_md TEXT,
  plan_md TEXT,
  tasks_md TEXT,
  implementation_md TEXT,
  feedback_md TEXT,

  -- State tracking
  state_json JSONB DEFAULT '{
    "stages": {
      "intent": "pending",
      "context": "pending",
      "spec": "pending",
      "plan": "pending",
      "tasks": "pending",
      "implementation": "pending",
      "feedback": "pending"
    },
    "last_agent": null
  }'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_name ON projects(name);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a test project
INSERT INTO projects (name, stack, framework, intent_md)
VALUES (
  'test-project',
  'python',
  'agency-swarm',
  '# Test Intent\n\nThis is a test project created during setup.'
)
ON CONFLICT (name) DO NOTHING;

-- Verify
SELECT id, name, stack, framework, created_at
FROM projects;
