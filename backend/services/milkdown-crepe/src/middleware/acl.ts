import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationError } from '../errors/types';
import { AuthUser } from './auth';
import { getSessionRole, Role } from '../services/roles';

const roleRank: Record<Role, number> = {
  reader: 1,
  collaborator: 2,
  owner: 3,
};

function highestRole(roles: Role[] = []): Role | undefined {
  return roles.sort((a, b) => roleRank[b] - roleRank[a])[0];
}

async function resolveRole(user: AuthUser | undefined, sessionId?: string): Promise<Role | undefined> {
  if (!user?.userId) return undefined;
  if (sessionId) {
    const providerRole = await getSessionRole(user.userId, sessionId);
    if (providerRole) return providerRole;
  }
  if (user.roles && user.roles.length > 0) {
    return highestRole(user.roles as Role[]);
  }
  return undefined;
}

function hasPermission(role: Role | undefined, minRole: Role): boolean {
  if (!role) return false;
  return roleRank[role] >= roleRank[minRole];
}

export function requireRole(minRole: Role) {
  return async function aclGuard(request: FastifyRequest, _reply: FastifyReply) {
    const params = request.params as any;
    const sessionId = params?.project && params?.session
      ? `${params.project}:${params.session}`
      : params?.session;
    const role = await resolveRole(request.user, sessionId);
    if (!hasPermission(role, minRole)) {
      throw new AuthorizationError('Forbidden');
    }
  };
}

export default requireRole;
