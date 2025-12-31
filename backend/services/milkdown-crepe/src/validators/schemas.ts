import { z } from 'zod';

const pathPattern = /^(intents|contexts|specs|plans|tasks|docs|projects|feedback|implementation)\/.*\.md$/;

export const DocumentPathSchema = z.object({
  path: z.string().min(1).regex(pathPattern),
});

export const PutDocumentSchema = z.object({
  path: z.string().min(1).regex(pathPattern),
  content: z.string().min(1),
  commitMessage: z.string().optional(),
  branch: z.string().optional(),
});

export const RenderRequestSchema = z.object({
  markdown: z.string().min(1),
});

export const DocumentResponseSchema = z.object({
  path: z.string(),
  content: z.string(),
});

export const LocalWriteResponseSchema = z.object({
  path: z.string(),
  saved: z.literal(true),
  mode: z.literal('local'),
});

export const PrWriteResponseSchema = z.object({
  prUrl: z.string().url(),
  commitSha: z.string(),
  path: z.string(),
  mode: z.literal('pr'),
});

export const RenderResponseSchema = z.object({
  html: z.string(),
});

export type PutDocument = z.infer<typeof PutDocumentSchema>;
export type DocumentPath = z.infer<typeof DocumentPathSchema>;
