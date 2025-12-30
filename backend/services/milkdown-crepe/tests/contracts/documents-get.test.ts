import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import path from 'path';
import {
  buildTempWorkspace,
  cleanupWorkspace,
  buildTestServer,
  writeWorkspaceFile,
} from '../helper';

let server: any;
let workspaceRoot: string;

const readerToken = jwt.sign(
  { userId: 'reader', roles: ['reader'] },
  'test-secret',
);
const noAccessToken = jwt.sign(
  { userId: 'blocked', roles: [] },
  'test-secret',
);

beforeAll(async () => {
  workspaceRoot = await buildTempWorkspace();
  await writeWorkspaceFile(
    workspaceRoot,
    path.join('intents', 'intent.md'),
    '# Intent',
  );
  server = await buildTestServer(workspaceRoot);
});

afterAll(async () => {
  await server.close();
  await cleanupWorkspace(workspaceRoot);
});

describe('GET /documents', () => {
  it('returns 200 with valid path', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/intent.md',
      headers: { authorization: `Bearer ${readerToken}` },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.path).toBe('intents/intent.md');
    expect(body.content).toContain('# Intent');
  });

  it('returns 400 for path traversal', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=../../etc/passwd',
      headers: { authorization: `Bearer ${readerToken}` },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 401 without auth header', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/intent.md',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when lacking reader role', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/intent.md',
      headers: { authorization: `Bearer ${noAccessToken}` },
    });
    expect(res.statusCode).toBe(403);
  });

  it('returns 404 for missing file', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/missing.md',
      headers: { authorization: `Bearer ${readerToken}` },
    });
    expect(res.statusCode).toBe(404);
  });
});
