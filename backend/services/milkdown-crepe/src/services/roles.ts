export type Role = 'reader' | 'collaborator' | 'owner';

export interface RoleProvider {
  getRole(userId: string, sessionId: string): Promise<Role | undefined>;
}

const keyFor = (userId: string, sessionId: string) => `${userId}:${sessionId}`;

export class InMemoryRoleProvider implements RoleProvider {
  private roles = new Map<string, Role>();

  async getRole(userId: string, sessionId: string): Promise<Role | undefined> {
    return this.roles.get(keyFor(userId, sessionId));
  }

  set(userId: string, sessionId: string, role: Role) {
    this.roles.set(keyFor(userId, sessionId), role);
  }

  clear() {
    this.roles.clear();
  }
}

let provider: RoleProvider = new InMemoryRoleProvider();

export function setRoleProvider(next: RoleProvider) {
  provider = next;
}

export function getRoleProvider(): RoleProvider {
  return provider;
}

export async function getSessionRole(
  userId: string,
  sessionId: string,
): Promise<Role | undefined> {
  return provider.getRole(userId, sessionId);
}

export class StaticRoleProvider implements RoleProvider {
  constructor(private roleMap: Record<string, Role>) {}
  async getRole(userId: string, sessionId: string): Promise<Role | undefined> {
    return this.roleMap[keyFor(userId, sessionId)];
  }
}

export { FileRoleProvider } from './roles/FileRoleProvider';
export { SupabaseRoleProvider } from './roles/SupabaseRoleProvider';

export async function configureRoleProvider(opts: {
  mode: 'memory' | 'static' | 'file' | 'supabase';
  staticMap?: Record<string, Role>;
  workspaceRoot?: string;
  supabaseUrl?: string;
  supabaseKey?: string;
}) {
  if (opts.mode === 'file') {
    const { FileRoleProvider: FRP } = await import('./roles/FileRoleProvider');
    setRoleProvider(new FRP(opts.workspaceRoot || process.cwd()));
  } else if (opts.mode === 'supabase' && opts.supabaseUrl && opts.supabaseKey) {
    const { SupabaseRoleProvider: SRP } = await import('./roles/SupabaseRoleProvider');
    setRoleProvider(new SRP({ supabaseUrl: opts.supabaseUrl, supabaseKey: opts.supabaseKey }));
  } else if (opts.mode === 'static' && opts.staticMap) {
    setRoleProvider(new StaticRoleProvider(opts.staticMap));
  } else {
    setRoleProvider(new InMemoryRoleProvider());
  }
}
