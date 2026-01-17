import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import { sanitizeSchema } from './sanitize';

export async function renderMarkdown(markdown: string){
  const result = await unified()
    .use(remarkParse as any)
    .use(remarkRehype as any, { allowDangerousHtml: true })
    .use(rehypeRaw as any)
    .use(rehypeSanitize as any, sanitizeSchema as any)
    .use(rehypeStringify as any)
    .process(markdown);
  return String(result);
}

export default renderMarkdown;
