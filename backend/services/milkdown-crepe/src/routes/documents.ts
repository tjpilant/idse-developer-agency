import { FastifyPluginAsync } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { config } from '../config';
import authMiddleware from '../middleware/auth';
import { requireRole } from '../middleware/acl';
import {
  DocumentPathSchema,
  DocumentResponseSchema,
  LocalWriteResponseSchema,
  PutDocumentSchema,
} from '../validators/schemas';
import { validatePath, toRelative } from '../validators/paths';
import { NotFoundError } from '../errors/types';

const routes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/sessions/:project/:session/documents',
    {
      preHandler: [authMiddleware, requireRole('reader')],
      schema: {
        querystring: DocumentPathSchema,
        response: {
          200: DocumentResponseSchema,
        },
      },
    },
    async (request) => {
      const { path: filePath } = request.query;
      const resolvedPath = validatePath(filePath, config.WORKSPACE_ROOT);
      request.log.info(
        { userId: request.user?.userId, path: filePath },
        'document read requested',
      );

      try {
        const content = await fs.readFile(resolvedPath, 'utf-8');
        return {
          path: toRelative(resolvedPath, config.WORKSPACE_ROOT),
          content,
        };
      } catch (err: any) {
        if (err?.code === 'ENOENT') {
          throw new NotFoundError('File not found');
        }
        throw err;
      }
    },
  );

  app.put(
    '/sessions/:project/:session/documents',
    {
      preHandler: [authMiddleware, requireRole('collaborator')],
      schema: {
        body: PutDocumentSchema,
        response: {
          200: LocalWriteResponseSchema,
        },
      },
    },
    async (request) => {
      const { path: filePath, content } = request.body;
      const resolvedPath = validatePath(filePath, config.WORKSPACE_ROOT);
      request.log.info(
        { userId: request.user?.userId, path: filePath },
        'document write requested',
      );

      await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
      await fs.writeFile(resolvedPath, content, 'utf-8');

      return {
        path: toRelative(resolvedPath, config.WORKSPACE_ROOT),
        saved: true as const,
        mode: config.WRITE_MODE,
      };
    },
  );
};

export default routes;
