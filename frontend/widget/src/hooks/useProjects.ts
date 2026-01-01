import { useState, useEffect } from 'react';

const apiBase = (import.meta as any).env?.VITE_API_BASE ?? 'http://localhost:8000';

export interface StageStatus {
  exists: boolean;
  requires_input_count: number;
  path: string | null;
}

export interface SessionStatus {
  session_id: string;
  name: string;
  created_at: number | null;
  owner: string | null;
  stages: Record<string, StageStatus>;
}

export interface ProjectData {
  project_id: string;
  sessions: SessionStatus[];
}

export function useProjects() {
  const [projects, setProjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch(`${apiBase}/api/projects/`);
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const data = await response.json();
        setProjects(data.projects || []);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return { projects, loading, error };
}

export function useProjectSessions(projectId: string | null) {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setProjectData(null);
      return;
    }

    async function fetchSessions() {
      setLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/projects/${projectId}/sessions`);
        if (!response.ok) {
          throw new Error(`Failed to fetch sessions: ${response.statusText}`);
        }
        const data = await response.json();
        setProjectData(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [projectId]);

  return { projectData, loading, error };
}
