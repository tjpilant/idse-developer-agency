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

-- Check if table already exists
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

  -- Message hash for deduplication (computed from role + content + timestamp)
  message_hash TEXT GENERATED ALWAYS AS (
    md5(role || '||' || content || '||' || EXTRACT(EPOCH FROM created_at)::TEXT)
  ) STORED
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat_messages(project_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
  ON chat_messages(created_at DESC);

-- Unique constraint for deduplication (prevents exact duplicates within same second)
-- Note: This allows same content from different roles or at different times
CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_dedupe
  ON chat_messages(session_id, role, md5(content), DATE_TRUNC('second', created_at));

-- Add comment for documentation
COMMENT ON TABLE chat_messages IS 'Stores chat message history for IDSE projects, enabling persistent conversations across session changes';

-- Verify table created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;
