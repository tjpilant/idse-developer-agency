import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../src/render/pipeline';

describe('Sanitizer and renderer', () => {
  it('removes script tags and preserves safe content', async () => {
    const md = '<script>alert(1)</script>\n\n<p>safe</p>';
    const out = await renderMarkdown(md);
    expect(out).toContain('safe');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('alert(1)');
  });

  it('allows http/https links and removes javascript: links', async () => {
    const md = '<a href="javascript:alert(1)">bad</a> <a href="https://example.com">good</a>';
    const out = await renderMarkdown(md);
    expect(out).toContain('https://example.com');
    expect(out).not.toContain('javascript:alert(1)');
  });

  it('renders fenced code blocks to pre/code', async () => {
    const md = '```js\nconsole.log(1)\n```';
    const out = await renderMarkdown(md);
    expect(out).toContain('<pre');
    expect(out).toContain('<code');
    expect(out).toContain('console.log(1)');
  });
});
