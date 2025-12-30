import { describe, it, expect, beforeEach } from 'vitest';
import { requireRole } from '../../src/middleware/acl';
import { authMiddleware } from '../../src/middleware/auth';
import { InMemoryRoleProvider, setRoleProvider } from '../../src/services/roles';
import jwt from 'jsonwebtoken';

const callGuard = async (guard: any, request: any) => {
  await guard(request as any, {} as any);
};

describe('ACL middleware', () => {
  let provider: InMemoryRoleProvider;

  beforeEach(() => {
    provider = new InMemoryRoleProvider();
    setRoleProvider(provider);
  });

  it('allows collaborator via session role provider', async () => {
    const token = jwt.sign({ userId: 'u1', roles: ['reader'] }, 'dev-secret');
    const request: any = {
      params: { session: 's1' },
      headers: { authorization: `Bearer ${token}` },
    };
    await authMiddleware(request as any, {} as any);
    provider.set('u1', 's1', 'collaborator');

    await expect(callGuard(requireRole('reader'), request)).resolves.not.toThrow();
    await expect(callGuard(requireRole('collaborator'), request)).resolves.not.toThrow();
  });

  it('denies when role below required', async () => {
    const token = jwt.sign({ userId: 'u2', roles: ['reader'] }, 'dev-secret');
    const request: any = {
      params: { session: 's2' },
      headers: { authorization: `Bearer ${token}` },
    };
    await authMiddleware(request as any, {} as any);
    provider.set('u2', 's2', 'reader');

    await expect(callGuard(requireRole('collaborator'), request)).rejects.toThrow(/Forbidden/);
  });

  it('falls back to token roles when provider has no session mapping', async () => {
    const token = jwt.sign({ userId: 'u3', roles: ['owner'] }, 'dev-secret');
    const request: any = {
      params: { session: 's3' },
      headers: { authorization: `Bearer ${token}` },
    };
    await authMiddleware(request as any, {} as any);

    await expect(callGuard(requireRole('collaborator'), request)).resolves.not.toThrow();
    await expect(callGuard(requireRole('owner'), request)).resolves.not.toThrow();
  });
});
