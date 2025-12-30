import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { buildTempWorkspace, cleanupWorkspace, buildTestServer } from '../helper';

let server: any;
let workspaceRoot: string;
const readerToken = jwt.sign(
  { userId: 'reader', roles: ['reader'] },
  'test-secret',
);

beforeAll(async () => {
  workspaceRoot = await buildTempWorkspace();
  server = await buildTestServer(workspaceRoot);
});

afterAll(async () => {
  await server.close();
  await cleanupWorkspace(workspaceRoot);
});

describe('POST /render', () => {
  it('returns sanitized HTML', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/sessions/IDSE_Core/test/render',
      headers: { authorization: `Bearer ${readerToken}` },
      payload: { markdown: '<script>alert(1)</script><p>ok</p>' },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.html).toContain('ok');
    expect(body.html).not.toContain('<script>');
  });

  it('returns 401 without auth', async () => {
    const res = await server.inject({
      method: 'POST',
      url: '/api/sessions/IDSE_Core/test/render',
      payload: { markdown: '# hi' },
    });
    expect(res.statusCode).toBe(401);
  });
});
