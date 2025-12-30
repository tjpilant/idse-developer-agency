import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  buildTempWorkspace,
  cleanupWorkspace,
  buildTestServer,
} from '../helper';

let server: any;
let workspaceRoot: string;
const collaboratorToken = jwt.sign(
  { userId: 'collab', roles: ['collaborator', 'reader'] },
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

describe('Filesystem roundtrip', () => {
  it('writes then reads the same document', async () => {
    const putRes = await server.inject({
      method: 'PUT',
      url: '/api/sessions/IDSE_Core/test/documents',
      headers: { authorization: `Bearer ${collaboratorToken}` },
      payload: {
        path: 'intents/test.md',
        content: '# Test Intent\n\nContent',
      },
    });
    expect(putRes.statusCode).toBe(200);

    const getRes = await server.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/test.md',
      headers: { authorization: `Bearer ${collaboratorToken}` },
    });
    expect(getRes.statusCode).toBe(200);
    expect(getRes.json().content).toContain('# Test Intent');
  });
});
