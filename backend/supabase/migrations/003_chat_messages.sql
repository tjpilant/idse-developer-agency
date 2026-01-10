-- Chat Messages Table Migration
-- Run this in: https://spxovndsgpzvcztbkjel.supabase.co/project/spxovndsgpzvcztbkjel/sql/new
-- Purpose: Enable persistent chat history across session changes

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_chat_messages_session
  ON chat_messages(project_id, session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
  ON chat_messages(created_at DESC);

-- Composite index to handle deduplication
CREATE INDEX IF NOT EXISTS idx_chat_messages_composite
  ON chat_messages(session_id, role, content, created_at);

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
