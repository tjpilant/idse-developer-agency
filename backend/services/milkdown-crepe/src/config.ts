import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().default(8001),
  WRITE_MODE: z.enum(['local', 'pr']).default('local'),
  GITHUB_TOKEN: z.string().optional(),
  AUTH_SECRET: z.string().min(1).default('dev-secret'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  WORKSPACE_ROOT: z.string().default(process.cwd()),
  MAX_BODY_SIZE: z.coerce.number().default(5 * 1024 * 1024),
  FRONTEND_URL: z.string().url().optional(),
  ROLE_PROVIDER: z.enum(['memory', 'static', 'file']).default('file'),
  ROLE_MAP: z.string().optional(), // JSON map for static provider, e.g. {"user:session": "owner"}
});

export const config = configSchema.parse(process.env);

export type AppConfig = typeof config;
