export interface StageStatus {
  exists: boolean;
  requires_input_count: number;
  path?: string | null;
}

export interface ValidationSummary {
  ran: boolean;
  passed: boolean;
  errors: number;
  warnings: number;
  timestamp?: string | null;
}

export interface SessionStatus {
  session_id: string;
  name: string;
  created_at?: number | null;
  owner?: string | null;
  stages: Record<string, StageStatus>;
  validation?: ValidationSummary | null;
}

export interface ProjectSessionsResponse {
  project_id: string;
  sessions: SessionStatus[];
}
