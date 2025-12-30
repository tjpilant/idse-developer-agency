import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import { buildTempWorkspace, buildTestServer } from './helper';

let server: any;
let workspaceRoot: string;
const token = jwt.sign(
  { userId: 'tester', roles: ['reader', 'collaborator'] },
  'test-secret',
);

beforeAll(async () => {
  workspaceRoot = await buildTempWorkspace();
  server = await buildTestServer(workspaceRoot);
});

afterAll(async () => {
  await server.close();
});

describe('API smoke tests', () => {
  it('renders markdown fixture', async () => {
    const fixture = await import('./fixtures/markdown/intent.md?raw')
      .then((m) => m.default)
      .catch(async () => {
        const fs = await import('fs/promises');
        return fs.readFile(
          'backend/services/milkdown-crepe/tests/fixtures/markdown/intent.md',
          'utf-8',
        );
      });
    const res = await server.inject({
      method: 'POST',
      url: '/api/sessions/IDSE_Core/milkdown-crepe/render',
      payload: { markdown: fixture },
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.statusCode).toBe(200);
    const body =
      typeof res.payload === 'string'
        ? JSON.parse(res.payload)
        : res.payload;
    expect(body.html).toBeDefined();
    expect(body.html.length).toBeGreaterThan(10);
  });
});
