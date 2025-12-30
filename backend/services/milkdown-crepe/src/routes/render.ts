import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import authMiddleware from '../middleware/auth';
import { requireRole } from '../middleware/acl';
import { RenderRequestSchema, RenderResponseSchema } from '../validators/schemas';
import { renderMarkdown } from '../render/pipeline';

const routes: FastifyPluginAsync = async (fastify) => {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/sessions/:project/:session/render',
    {
      preHandler: [authMiddleware, requireRole('reader')],
      schema: {
        body: RenderRequestSchema,
        response: {
          200: RenderResponseSchema,
        },
      },
    },
    async (request) => {
      const { markdown } = request.body;
      request.log.info(
        { userId: request.user?.userId },
        'render requested',
      );
      const html = await renderMarkdown(markdown);
      return { html };
    },
  );
};

export default routes;
