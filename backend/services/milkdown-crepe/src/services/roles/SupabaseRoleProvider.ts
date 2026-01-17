import type { Role, RoleProvider } from '../roles';

type SupabaseSessionRow = {
  owner?: string | null;
  collaborators?: string[] | null;
  metadata?: Record<string, any> | null;
};

type SupabaseProjectRow = {
  id: string;
  name: string;
};

export interface SupabaseRoleProviderOptions {
  supabaseUrl: string;
  supabaseKey: string;
}

export class SupabaseRoleProvider implements RoleProvider {
  private projectCache = new Map<string, string>();

  constructor(private opts: SupabaseRoleProviderOptions) {}

  async getRole(userId: string, sessionId: string): Promise<Role | undefined> {
    const [projectName, sessionSlug] = sessionId.split(':');
    if (!projectName || !sessionSlug) {
      return undefined;
    }

    try {
      const projectId = await this.getProjectId(projectName);
      if (!projectId) return undefined;

      const session = await this.getSession(projectId, sessionSlug);
      if (!session) return undefined;

      if (session.owner && session.owner === userId) {
        return 'owner';
      }

      const collaborators = this.normalizeCollaborators(session);
      if (collaborators.includes(userId)) {
        return 'collaborator';
      }

      return 'reader';
    } catch {
      // On any fetch/parse errors, fall back to undefined so upstream can rely on JWT roles
      return undefined;
    }
  }

  private async getProjectId(projectName: string): Promise<string | undefined> {
    if (this.projectCache.has(projectName)) {
      return this.projectCache.get(projectName);
    }

    const url = `${this.opts.supabaseUrl}/rest/v1/projects?select=id,name&name=eq.${encodeURIComponent(
      projectName,
    )}`;
    const res = await fetch(url, {
      headers: this.headers(),
    });
    if (!res.ok) {
      return undefined;
    }
    const data = (await res.json()) as SupabaseProjectRow[];
    const project = data?.[0];
    if (!project?.id) return undefined;
    this.projectCache.set(projectName, project.id);
    return project.id;
  }

  private async getSession(
    projectId: string,
    sessionSlug: string,
  ): Promise<SupabaseSessionRow | undefined> {
    const url = `${this.opts.supabaseUrl}/rest/v1/sessions?select=session_id,owner,collaborators,metadata&project_id=eq.${projectId}&session_id=eq.${encodeURIComponent(
      sessionSlug,
    )}&limit=1`;
    const res = await fetch(url, {
      headers: this.headers({ single: true }),
    });
    if (res.status === 404) return undefined;
    if (!res.ok) {
      return undefined;
    }
    const body = await res.json();
    // Prefer single-object behavior; if array is returned, take first element
    const session = Array.isArray(body) ? body[0] : body;
    if (!session) return undefined;
    return session as SupabaseSessionRow;
  }

  private normalizeCollaborators(session: SupabaseSessionRow): string[] {
    const collabs: string[] = [];
    if (Array.isArray(session.collaborators)) {
      collabs.push(...session.collaborators.filter(Boolean));
    }
    const meta = session.metadata;
    if (meta && Array.isArray(meta.collaborators)) {
      collabs.push(...meta.collaborators.filter(Boolean));
    }
    return Array.from(new Set(collabs));
  }

  private headers(opts?: { single?: boolean }) {
    const headers: Record<string, string> = {
      apikey: this.opts.supabaseKey,
      Authorization: `Bearer ${this.opts.supabaseKey}`,
    };
    if (opts?.single) {
      headers['Prefer'] = 'single-object';
    }
    return headers;
  }
}
