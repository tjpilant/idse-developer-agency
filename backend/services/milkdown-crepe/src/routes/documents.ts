import { FastifyPluginAsync } from 'fastify';
import { promises as fs } from 'fs';
import path from 'path';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
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

// Schema for file tree response
const FileNodeSchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'folder']),
  children: z.array(z.any()).optional(),
});

const FileTreeResponseSchema = z.array(FileNodeSchema);

// Exclusion patterns for file tree listing
const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.vscode',
  '.cursor',
  'dist',
  'build',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv',
]);

const EXCLUDED_FILES = new Set([
  '.DS_Store',
  'Thumbs.db',
  '.gitignore',
  '.env',
  '.env.local',
]);

// Recursively build file tree
async function buildFileTree(
  dirPath: string,
  relativePath: string = '',
  maxDepth: number = 10,
  currentDepth: number = 0,
): Promise<any[]> {
  if (currentDepth >= maxDepth) return [];

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const nodes: any[] = [];

    for (const entry of entries) {
      const name = entry.name;

      // Skip excluded files/dirs
      if (EXCLUDED_DIRS.has(name) || EXCLUDED_FILES.has(name)) {
        continue;
      }

      const fullPath = path.join(dirPath, name);
      const relPath = relativePath ? path.join(relativePath, name) : name;

      if (entry.isDirectory()) {
        const children = await buildFileTree(
          fullPath,
          relPath,
          maxDepth,
          currentDepth + 1,
        );

        // Only include folders that have children or are markdown-related
        if (children.length > 0) {
          nodes.push({
            name,
            path: relPath,
            type: 'folder',
            children,
          });
        }
      } else if (entry.isFile() && name.endsWith('.md')) {
        // Only include markdown files
        nodes.push({
          name,
          path: relPath,
          type: 'file',
        });
      }
    }

    // Sort: folders first, then files, both alphabetically
    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  } catch (err) {
    return [];
  }
}

const routes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // GET /api/files/tree - List all markdown files in the workspace
  app.get(
    '/files/tree',
    {
      preHandler: config.DISABLE_AUTH ? [] : [authMiddleware, requireRole('reader')],
      schema: {
        response: {
          200: FileTreeResponseSchema,
        },
      },
    },
    async (request) => {
      request.log.info(
        { userId: request.user?.userId },
        'file tree requested',
      );

      const tree = await buildFileTree(config.WORKSPACE_ROOT);
      return tree;
    },
  );

  app.get(
    '/sessions/:project/:session/documents',
    {
      preHandler: config.DISABLE_AUTH ? [] : [authMiddleware, requireRole('reader')],
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
      preHandler: config.DISABLE_AUTH ? [] : [authMiddleware, requireRole('collaborator')],
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
        mode: 'local' as const,
      };
    },
  );
};

export default routes;
