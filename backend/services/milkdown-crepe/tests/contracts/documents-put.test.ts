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

const collaboratorToken = jwt.sign(
  { userId: 'collab', roles: ['collaborator'] },
  'test-secret',
);
const readerOnlyToken = jwt.sign(
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

describe('PUT /documents', () => {
  it('writes a document to workspace', async () => {
    const res = await server.inject({
      method: 'PUT',
      url: '/api/sessions/IDSE_Core/test/documents',
      headers: { authorization: `Bearer ${collaboratorToken}` },
      payload: {
        path: 'intents/new.md',
        content: '# New',
      },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.saved).toBe(true);
    expect(body.mode).toBe('local');

    const saved = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/new.md',
      headers: { authorization: `Bearer ${collaboratorToken}` },
    });
    expect(saved.statusCode).toBe(200);
    expect(saved.json().content).toContain('# New');
  });

  it('returns 400 for invalid path', async () => {
    const res = await server.inject({
      method: 'PUT',
      url: '/api/sessions/IDSE_Core/test/documents',
      headers: { authorization: `Bearer ${collaboratorToken}` },
      payload: {
        path: '../outside.md',
        content: 'bad',
      },
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 401 without auth header', async () => {
    const res = await server.inject({
      method: 'PUT',
      url: '/api/sessions/IDSE_Core/test/documents',
      payload: {
        path: 'intents/noauth.md',
        content: 'content',
      },
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for insufficient role', async () => {
    const res = await server.inject({
      method: 'PUT',
      url: '/api/sessions/IDSE_Core/test/documents',
      headers: { authorization: `Bearer ${readerOnlyToken}` },
      payload: {
        path: 'intents/forbidden.md',
        content: 'content',
      },
    });
    expect(res.statusCode).toBe(403);
  });
});
