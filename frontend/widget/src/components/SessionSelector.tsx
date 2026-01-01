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
}

export function SessionSelector({
  currentProject,
  currentSession,
  onSessionChange,
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
    // The project change will trigger a fetch of sessions, and we'll auto-select
    // the first session when they load (handled in useEffect below)
  };

  // When projectData changes AND the user switched projects, auto-select first session
  useEffect(() => {
    if (projectData && projectData.sessions.length > 0) {
      const firstSession = projectData.sessions[0].session_id;
      // Only auto-select if the current session doesn't exist in the new project's sessions
      const sessionExists = projectData.sessions.some(s => s.session_id === selectedSession);
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
          <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-100">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Select project..." />
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
          <SelectTrigger className="w-full bg-slate-800 border-slate-600 text-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Select session..." />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600 max-h-[300px]">
            <SelectGroup>
              <SelectLabel className="text-slate-400">Available Sessions</SelectLabel>
              {projectData?.sessions.map((session) => (
                <SelectItem
                  key={session.session_id}
                  value={session.session_id}
                  className="text-slate-100 focus:bg-slate-700 focus:text-white"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{session.name}</span>
                    <span className="text-xs text-slate-400">
                      {formatTimestamp(session.created_at)}
                      {session.owner && ` • ${session.owner}`}
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
      </div>
    </div>
  );
}
