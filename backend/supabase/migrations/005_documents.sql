-- Migration: 005 - Documents table
-- Date: 2026-01-11
-- Purpose: Store pipeline documents (markdown) per project/session in Supabase
-- Run location: Supabase SQL editor
-- Rollback: DROP TABLE IF EXISTS documents CASCADE;

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper to keep updated_at current
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_slug TEXT NOT NULL DEFAULT 'default',
  path TEXT NOT NULL,          -- logical path or stage identifier (e.g., intents/intent.md)
  stage TEXT,                  -- optional stage label (intent, context, spec, plan, tasks, feedback, etc.)
  content TEXT NOT NULL DEFAULT '',  -- markdown body
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, session_slug, path)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_project_session ON documents(project_id, session_slug);
CREATE INDEX IF NOT EXISTS idx_documents_project_path ON documents(project_id, path);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_documents_updated_at ON documents;
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documents'
ORDER BY ordinal_position;
