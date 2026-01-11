-- Migration: 004 - Sessions table
-- Date: 2026-01-11
-- Purpose: Track project sessions in Supabase (one row per IDSE pipeline run)
-- Run location: Supabase SQL editor
-- Rollback: DROP TABLE IF EXISTS sessions CASCADE;

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,         -- IDSE session slug (e.g., chat-persistence)
  name TEXT NOT NULL,               -- Display name (can mirror session_id)
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (project_id, session_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project_created_at ON sessions(project_id, created_at DESC);

-- Verification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'sessions'
ORDER BY ordinal_position;
