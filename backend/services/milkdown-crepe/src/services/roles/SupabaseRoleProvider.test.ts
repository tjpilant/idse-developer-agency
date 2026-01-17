import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SupabaseRoleProvider } from './SupabaseRoleProvider';

const SUPABASE_URL = 'https://example.supabase.co';
const KEY = 'service-role-key';

describe('SupabaseRoleProvider', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('returns owner role when user matches owner', async () => {
    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'proj-1', name: 'MyProject' }],
    });

    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ owner: 'alice', collaborators: ['bob'] }),
    });

    const provider = new SupabaseRoleProvider({ supabaseUrl: SUPABASE_URL, supabaseKey: KEY });
    const role = await provider.getRole('alice', 'MyProject:session-1');
    expect(role).toBe('owner');
  });

  it('returns collaborator when user in collaborators array', async () => {
    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'proj-1', name: 'MyProject' }],
    });

    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ owner: 'carol', collaborators: ['dave'] }),
    });

    const provider = new SupabaseRoleProvider({ supabaseUrl: SUPABASE_URL, supabaseKey: KEY });
    const role = await provider.getRole('dave', 'MyProject:session-1');
    expect(role).toBe('collaborator');
  });

  it('returns collaborator when user in metadata.collaborators', async () => {
    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'proj-1', name: 'MyProject' }],
    });

    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ owner: 'carol', collaborators: [], metadata: { collaborators: ['emma'] } }),
    });

    const provider = new SupabaseRoleProvider({ supabaseUrl: SUPABASE_URL, supabaseKey: KEY });
    const role = await provider.getRole('emma', 'MyProject:session-1');
    expect(role).toBe('collaborator');
  });

  it('returns reader when session exists but no ownership/collab match', async () => {
    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'proj-1', name: 'MyProject' }],
    });

    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ owner: 'carol', collaborators: [] }),
    });

    const provider = new SupabaseRoleProvider({ supabaseUrl: SUPABASE_URL, supabaseKey: KEY });
    const role = await provider.getRole('frank', 'MyProject:session-1');
    expect(role).toBe('reader');
  });

  it('returns undefined when project lookup fails', async () => {
    (global.fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const provider = new SupabaseRoleProvider({ supabaseUrl: SUPABASE_URL, supabaseKey: KEY });
    const role = await provider.getRole('user', 'MissingProject:session-1');
    expect(role).toBeUndefined();
  });
});
