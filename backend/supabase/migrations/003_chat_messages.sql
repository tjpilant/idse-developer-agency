-- Chat Messages Table Migration
-- Version: 003
-- Date: 2026-01-10
-- Run this in: https://spxovndsgpzvcztbkjel.supabase.co/project/spxovndsgpzvcztbkjel/sql/new
-- Purpose: Enable persistent chat history across session changes
--
-- IDEMPOTENCY: This migration is safe to run multiple times.
-- All CREATE statements use IF NOT EXISTS guards.
--
-- ROLLBACK: To rollback, run:
--   DROP TABLE IF EXISTS chat_messages CASCADE;

-- Ensure UUID/digest functions are available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Check if table already exists (notice only; creation still uses IF NOT EXISTS)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_messages') THEN
    RAISE NOTICE 'Table chat_messages already exists, skipping creation';
  ELSE
    RAISE NOTICE 'Creating chat_messages table';
  END IF;
END $$;

-- Create chat_messages table
-- NOTE: Using TEXT for project_id/session_id to match .idse_active_session.json format
-- These are project NAMES (e.g., "IDSE_Core") and session NAMES (e.g., "milkdown-crepe"),
-- NOT UUIDs from the projects table. This allows chat to work independently of MCP sync.
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,  -- Project name, not UUID
  session_id TEXT NOT NULL,  -- Session name, not UUID
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  content_hash BYTEA GENERATED ALWAYS AS (digest(content, 'sha256')) STORED,
  created_at_trunc TIMESTAMPTZ,
  CONSTRAINT chk_project_session_nonempty CHECK (char_length(project_id) > 0 AND char_length(session_id) > 0)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat_messages(project_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
  ON chat_messages(created_at DESC);

-- Unique constraint for deduplication (prevents exact duplicates within same second)
-- Note: This allows same content from different roles or at different times
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_dedupe
  ON chat_messages(session_id, role, content_hash, created_at_trunc);

-- Trigger to populate created_at_trunc (immutable alternative to expression indexes)
CREATE OR REPLACE FUNCTION trg_set_created_at_trunc()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at_trunc := DATE_TRUNC('second', NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_created_at_trunc ON chat_messages;
CREATE TRIGGER set_created_at_trunc
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION trg_set_created_at_trunc();

-- Add comment for documentation
COMMENT ON TABLE chat_messages IS 'Stores chat message history for IDSE projects, enabling persistent conversations across session changes';

-- Verify table created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'chat_messages'
ORDER BY ordinal_position;
