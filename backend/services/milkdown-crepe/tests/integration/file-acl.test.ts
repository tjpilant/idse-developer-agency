import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import jwt from 'jsonwebtoken';
import {
  buildTempWorkspace,
  cleanupWorkspace,
  buildTestServer,
  writeWorkspaceFile,
} from '../helper';

let server: any;
let workspaceRoot: string;

// Test user tokens
const ownerToken = jwt.sign(
  { userId: 'owner-user', roles: ['reader'] },
  'test-secret',
);

const collaboratorToken = jwt.sign(
  { userId: 'collab-user', roles: ['reader'] },
  'test-secret',
);

const readerToken = jwt.sign(
  { userId: 'reader-user', roles: ['reader'] },
  'test-secret',
);

const unknownUserToken = jwt.sign(
  { userId: 'unknown-user', roles: ['reader'] },
  'test-secret',
);

beforeAll(async () => {
  workspaceRoot = await buildTempWorkspace();

  // Setup session directory with .owner and .collaborators files
  const sessionPath = 'projects/IDSE_Core/test-session';
  await writeWorkspaceFile(workspaceRoot, `${sessionPath}/.owner`, 'owner-user');
  await writeWorkspaceFile(
    workspaceRoot,
    `${sessionPath}/.collaborators`,
    'collab-user\nother-collab',
  );

  // Create a test document (workspace-relative path)
  await writeWorkspaceFile(
    workspaceRoot,
    'intents/test-doc.md',
    '# Test Session\n\nThis is a test document.',
  );

  // Set ROLE_PROVIDER to 'file' mode
  process.env.ROLE_PROVIDER = 'file';

  server = await buildTestServer(workspaceRoot);
});

afterAll(async () => {
  await server.close();
  await cleanupWorkspace(workspaceRoot);
});

describe('File-based ACL Integration', () => {
  describe('GET /api/sessions/:project/:session/documents', () => {
    it('allows owner to read documents', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${ownerToken}` },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().content).toContain('# Test Session');
    });

    it('allows collaborator to read documents', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${collaboratorToken}` },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().content).toContain('# Test Session');
    });

    it('allows reader to read documents', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${readerToken}` },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().content).toContain('# Test Session');
    });

    it('allows unknown user to read documents (defaults to reader)', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${unknownUserToken}` },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().content).toContain('# Test Session');
    });
  });

  describe('PUT /api/sessions/:project/:session/documents', () => {
    it('allows owner to write documents', async () => {
      const res = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${ownerToken}` },
        payload: {
          path: 'intents/owner-intent.md',
          content: '# Owner Intent\n\nWritten by owner',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().saved).toBe(true);
    });

    it('allows collaborator to write documents', async () => {
      const res = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${collaboratorToken}` },
        payload: {
          path: 'intents/collab-intent.md',
          content: '# Collaborator Intent\n\nWritten by collaborator',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().saved).toBe(true);
    });

    it('denies reader from writing documents', async () => {
      const res = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${readerToken}` },
        payload: {
          path: 'intents/reader-intent.md',
          content: '# Reader Intent\n\nAttempted by reader',
        },
      });

      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('Forbidden');
    });

    it('denies unknown user from writing documents', async () => {
      const res = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${unknownUserToken}` },
        payload: {
          path: 'intents/unknown-intent.md',
          content: '# Unknown Intent\n\nAttempted by unknown user',
        },
      });

      expect(res.statusCode).toBe(403);
      expect(res.json().error).toContain('Forbidden');
    });
  });

  describe('POST /api/sessions/:project/:session/render', () => {
    it('allows owner to render documents', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/sessions/IDSE_Core/test-session/render',
        headers: { authorization: `Bearer ${ownerToken}` },
        payload: {
          markdown: '# Test Render\n\nOwner rendering',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().html).toContain('Test Render');
    });

    it('allows collaborator to render documents', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/sessions/IDSE_Core/test-session/render',
        headers: { authorization: `Bearer ${collaboratorToken}` },
        payload: {
          markdown: '# Test Render\n\nCollaborator rendering',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().html).toContain('Test Render');
    });

    it('allows reader to render documents', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/sessions/IDSE_Core/test-session/render',
        headers: { authorization: `Bearer ${readerToken}` },
        payload: {
          markdown: '# Test Render\n\nReader rendering',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json().html).toContain('Test Render');
    });
  });

  describe('Missing .owner file handling', () => {
    it('returns 404 when session has no .owner file', async () => {
      // Create a session directory without .owner file
      await writeWorkspaceFile(
        workspaceRoot,
        'intents/no-owner-doc.md',
        '# No Owner Session',
      );

      const res = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/no-owner-session/documents?path=intents/no-owner-doc.md',
        headers: { authorization: `Bearer ${ownerToken}` },
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Role hierarchy verification', () => {
    it('owner can perform all actions', async () => {
      // Read
      const readRes = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${ownerToken}` },
      });
      expect(readRes.statusCode).toBe(200);

      // Write
      const writeRes = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${ownerToken}` },
        payload: {
          path: 'intents/owner-write.md',
          content: '# Owner Write Test',
        },
      });
      expect(writeRes.statusCode).toBe(200);

      // Render
      const renderRes = await server.inject({
        method: 'POST',
        url: '/api/sessions/IDSE_Core/test-session/render',
        headers: { authorization: `Bearer ${ownerToken}` },
        payload: { markdown: '# Test' },
      });
      expect(renderRes.statusCode).toBe(200);
    });

    it('collaborator can read, write, and render', async () => {
      // Read
      const readRes = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${collaboratorToken}` },
      });
      expect(readRes.statusCode).toBe(200);

      // Write
      const writeRes = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${collaboratorToken}` },
        payload: {
          path: 'intents/collab-write.md',
          content: '# Collaborator Write Test',
        },
      });
      expect(writeRes.statusCode).toBe(200);

      // Render
      const renderRes = await server.inject({
        method: 'POST',
        url: '/api/sessions/IDSE_Core/test-session/render',
        headers: { authorization: `Bearer ${collaboratorToken}` },
        payload: { markdown: '# Test' },
      });
      expect(renderRes.statusCode).toBe(200);
    });

    it('reader can only read and render, not write', async () => {
      // Read
      const readRes = await server.inject({
        method: 'GET',
        url: '/api/sessions/IDSE_Core/test-session/documents?path=intents/test-doc.md',
        headers: { authorization: `Bearer ${readerToken}` },
      });
      expect(readRes.statusCode).toBe(200);

      // Write - should fail
      const writeRes = await server.inject({
        method: 'PUT',
        url: '/api/sessions/IDSE_Core/test-session/documents',
        headers: { authorization: `Bearer ${readerToken}` },
        payload: {
          path: 'intents/reader-write.md',
          content: '# Reader Write Test',
        },
      });
      expect(writeRes.statusCode).toBe(403);

      // Render
      const renderRes = await server.inject({
        method: 'POST',
        url: '/api/sessions/IDSE_Core/test-session/render',
        headers: { authorization: `Bearer ${readerToken}` },
        payload: { markdown: '# Test' },
      });
      expect(renderRes.statusCode).toBe(200);
    });
  });
});
