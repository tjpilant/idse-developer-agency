import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FolderOpen, Clock } from 'lucide-react';
import { useProjects, useProjectSessions } from '@/hooks/useProjects';

interface SessionSelectorProps {
  currentProject: string;
  currentSession: string;
  onSessionChange: (project: string, session: string) => void;
  onViewProjects?: () => void;
  projectCount?: number;
}

export function SessionSelector({
  currentProject,
  currentSession,
  onSessionChange,
  onViewProjects,
  projectCount = 0,
}: SessionSelectorProps) {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState(currentProject);
  const [selectedSession, setSelectedSession] = useState(currentSession);

  // Fetch sessions for the selected project (not currentProject from props)
  const { projectData, loading: sessionsLoading } = useProjectSessions(selectedProject);

  // Sync with props when they change externally
  useEffect(() => {
    setSelectedProject(currentProject);
    setSelectedSession(currentSession);
  }, [currentProject, currentSession]);

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    // Default to blueprint on project switch so dashboards update immediately
    setSelectedSession('__blueprint__');
    onSessionChange(project, '__blueprint__');
  };

  // When projectData changes AND the user switched projects, auto-select first session
  useEffect(() => {
    if (projectData && projectData.sessions.length > 0) {
      const sessionExists = projectData.sessions.some(s => s.session_id === selectedSession);
      const blueprintExists = projectData.sessions.some(s => s.session_id === '__blueprint__');

      // If we already set blueprint and it exists, keep it.
      if (selectedSession === '__blueprint__' && blueprintExists) {
        return;
      }

      // Otherwise pick first available session
      const firstSession = projectData.sessions[0].session_id;
      if (!sessionExists) {
        setSelectedSession(firstSession);
        onSessionChange(selectedProject, firstSession);
      }
    }
  }, [projectData, selectedProject]); // Add selectedProject to dependencies

  const handleSessionChange = (session: string) => {
    setSelectedSession(session);
    onSessionChange(selectedProject, session);
  };

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-3 p-4 border-b border-slate-700">
      {/* Project Selector */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 uppercase tracking-wide">Project</label>
        <Select
          value={selectedProject}
          onValueChange={handleProjectChange}
          disabled={projectsLoading}
        >
          <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-100 text-sm py-2">
            <div className="flex items-center gap-2 truncate">
              <FolderOpen className="h-4 w-4 text-slate-400 shrink-0" />
              <SelectValue placeholder="Select project..." className="text-sm truncate" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectGroup>
              <SelectLabel className="text-slate-400">Available Projects</SelectLabel>
              {projects.map((project) => (
                <SelectItem
                  key={project}
                  value={project}
                  className="text-slate-100 focus:bg-slate-700 focus:text-white"
                >
                  {project}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Session Selector */}
      <div className="space-y-2">
        <label className="text-xs text-slate-400 uppercase tracking-wide">Session</label>
        <Select
          value={selectedSession}
          onValueChange={handleSessionChange}
          disabled={sessionsLoading || !projectData}
        >
          <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-100 text-sm py-2">
            <div className="flex items-center gap-2 truncate">
              <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              <SelectValue placeholder="Select session..." className="text-sm truncate" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 max-h-[300px]">
            <SelectGroup>
              <SelectLabel className="text-slate-400">Feature Sessions</SelectLabel>
              {projectData?.sessions
                .filter(s => s.session_id !== '__blueprint__')
                .map((session) => (
                  <SelectItem
                    key={session.session_id}
                  value={session.session_id}
                  className="text-slate-100 focus:bg-slate-700 focus:text-white"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{session.name}</span>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(session.created_at)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Current Selection Display */}
      <div className="text-xs text-slate-400 pt-2">
        <div className="flex items-center justify-between">
          <span>Current:</span>
          <span className="text-slate-300 font-mono truncate ml-2">
            {selectedProject}/{selectedSession}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Blueprint progress is always shown in the Project Status card.
        </p>
        {projectData?.sessions.some((s) => s.session_id === '__blueprint__') && (
          <button
            type="button"
            onClick={() => handleSessionChange('__blueprint__')}
            className="mt-2 inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-slate-700"
          >
            📘 View Project Blueprint
          </button>
        )}
        {onViewProjects && (
          <button
            type="button"
            onClick={onViewProjects}
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-slate-800 px-3 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-slate-700"
          >
            View projects dashboard
            {projectCount > 0 && (
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-800">
                {projectCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
