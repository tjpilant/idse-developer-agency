import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import documentsRoutes from './routes/documents';
import renderRoutes from './routes/render';
import { config } from './config';

export function buildServer() {
  const server = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    },
    bodyLimit: config.MAX_BODY_SIZE,
  }).withTypeProvider<ZodTypeProvider>();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  server.register(cors, {
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      config.FRONTEND_URL,
    ].filter(Boolean) as string[],
    credentials: true,
  });

  server.register(documentsRoutes, { prefix: '/api' });
  server.register(renderRoutes, { prefix: '/api' });

  server.get(
    '/healthz',
    {
      schema: {
        response: {
          200: z.object({ status: z.literal('ok') }),
        },
      },
    },
    async () => ({ status: 'ok' as const }),
  );

  server.get(
    '/readyz',
    {
      schema: {
        response: {
          200: z.object({ status: z.literal('ready') }),
        },
      },
    },
    async () => ({ status: 'ready' as const }),
  );

  server.setErrorHandler((error, request, reply) => {
    server.log.error(
      {
        err: error,
        url: request.url,
        method: request.method,
      },
      'request failed',
    );

    const statusCode = (error as any).statusCode || 500;
    const code = (error as any).code || 'INTERNAL_ERROR';

    reply.code(statusCode).send({
      error: error.message,
      code,
      statusCode,
    });
  });

  return server;
}
