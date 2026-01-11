/**
 * useChatHistory Hook
 *
 * Manages persistent chat message storage across session changes.
 * Automatically loads messages when project/session changes.
 * Provides methods for saving and clearing messages.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

const apiBaseRaw =
  (import.meta as any)?.env?.VITE_API_BASE ??
  (typeof window !== "undefined" ? window.location.origin : "");
const API_BASE = apiBaseRaw ? apiBaseRaw.replace(/\/$/, "") : "";

export function useChatHistory(project: string, session: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages when project/session changes
  useEffect(() => {
    if (project && session) {
      loadHistory();
    }
  }, [project, session]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE || ""}/api/chat/history/${project}/${session}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to load chat history: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data.messages || []);

      console.log(
        `[useChatHistory] Loaded ${data.messages?.length || 0} messages for ${project}/${session}`
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to load chat history';
      setError(msg);
      console.error('[useChatHistory] Load error:', err);
      // Don't throw - allow chat to continue with empty history
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [project, session]);

  const saveMessage = useCallback(
    async (role: 'user' | 'assistant' | 'system', content: string) => {
      try {
        const url = `${API_BASE || ""}/api/chat/messages`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project,
            session,
            role,
            content,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save message: ${response.status}`);
        }

        const savedMessage = await response.json();

        // Optimistically update local state
        setMessages((prev) => [
          ...prev,
          {
            id: savedMessage.id,
            role,
            content,
            created_at: savedMessage.created_at,
          },
        ]);

        console.log(
          `[useChatHistory] Saved ${role} message for ${project}/${session}`
        );
      } catch (err) {
        console.error('[useChatHistory] Save error:', err);
        // Don't throw - allow chat to continue even if persistence fails
        // The message will still be in local state from optimistic update
      }
    },
    [project, session]
  );

  const clearHistory = useCallback(async () => {
    try {
      const url = `${API_BASE || ""}/api/chat/history/${project}/${session}`;
      const response = await fetch(url, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error(`Failed to clear history: ${response.status}`);
      }

      setMessages([]);
      console.log(`[useChatHistory] Cleared history for ${project}/${session}`);
    } catch (err) {
      console.error('[useChatHistory] Clear error:', err);
      // Still clear local state even if server delete fails
      setMessages([]);
    }
  }, [project, session]);

  return {
    messages,
    loading,
    error,
    saveMessage,
    clearHistory,
    refreshHistory: loadHistory,
  };
}
