import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticationError } from '../errors/types';
import { Role } from '../services/roles';

export type AuthUser = {
  userId: string;
  sessionId?: string;
  roles?: Array<Role>;
};

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Unauthorized');
  }

  const token = authHeader.substring('Bearer '.length);
  try {
    const decoded = jwt.verify(token, config.AUTH_SECRET) as AuthUser;
    request.user = decoded;
  } catch (err) {
    throw new AuthenticationError('Invalid token');
  }
}

export default authMiddleware;
