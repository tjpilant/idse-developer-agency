import { defaultSchema } from 'hast-util-sanitize';

// Start from the vetted default schema and extend it for our markdown needs.
const schema = structuredClone(defaultSchema);

schema.tagNames = Array.from(
  new Set([
    ...(schema.tagNames || []),
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ]),
);

schema.attributes = {
  ...(schema.attributes || {}),
  a: Array.from(
    new Set([...(schema.attributes?.a || []), 'href', 'title', 'target', 'rel']),
  ),
  code: Array.from(new Set([...(schema.attributes?.code || []), 'className'])),
};

schema.protocols = {
  ...(schema.protocols || {}),
  href: ['http', 'https', 'mailto'],
};

export const sanitizeSchema = schema;
