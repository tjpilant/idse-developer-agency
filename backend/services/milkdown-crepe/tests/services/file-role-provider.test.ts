import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { FileRoleProvider } from '../../src/services/roles/FileRoleProvider';

describe('FileRoleProvider', () => {
  let tempDir: string;
  let provider: FileRoleProvider;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'file-role-provider-test-'));
    provider = new FileRoleProvider(tempDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe('owner role resolution', () => {
    it('returns owner when userId matches .owner file', async () => {
      // Setup: Create session directory with .owner file
      const sessionPath = path.join(tempDir, 'projects', 'IDSE_Core', 'milkdown-crepe');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'user1', 'utf-8');

      const role = await provider.getRole('user1', 'IDSE_Core:milkdown-crepe');
      expect(role).toBe('owner');
    });

    it('returns owner when userId matches .owner file with whitespace', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'TestProject', 'test-session');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), '  user2  \n', 'utf-8');

      const role = await provider.getRole('user2', 'TestProject:test-session');
      expect(role).toBe('owner');
    });
  });

  describe('collaborator role resolution', () => {
    it('returns collaborator when userId is in .collaborators file', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'IDSE_Core', 'milkdown-crepe');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'owner-user', 'utf-8');
      await fs.writeFile(
        path.join(sessionPath, '.collaborators'),
        'collab1\ncollab2\ncollab3',
        'utf-8'
      );

      const role = await provider.getRole('collab2', 'IDSE_Core:milkdown-crepe');
      expect(role).toBe('collaborator');
    });

    it('handles .collaborators file with blank lines', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'IDSE_Core', 'test-session');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'owner1', 'utf-8');
      await fs.writeFile(
        path.join(sessionPath, '.collaborators'),
        'collab1\n\ncollab2\n  \ncollab3',
        'utf-8'
      );

      const role1 = await provider.getRole('collab1', 'IDSE_Core:test-session');
      const role2 = await provider.getRole('collab2', 'IDSE_Core:test-session');
      const role3 = await provider.getRole('collab3', 'IDSE_Core:test-session');

      expect(role1).toBe('collaborator');
      expect(role2).toBe('collaborator');
      expect(role3).toBe('collaborator');
    });

    it('returns reader when .collaborators file does not exist', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'IDSE_Core', 'session1');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'owner-user', 'utf-8');

      const role = await provider.getRole('other-user', 'IDSE_Core:session1');
      expect(role).toBe('reader');
    });
  });

  describe('reader role resolution', () => {
    it('returns reader when userId is not owner or collaborator', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'IDSE_Core', 'session2');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'owner-user', 'utf-8');
      await fs.writeFile(
        path.join(sessionPath, '.collaborators'),
        'collab1\ncollab2',
        'utf-8'
      );

      const role = await provider.getRole('random-user', 'IDSE_Core:session2');
      expect(role).toBe('reader');
    });
  });

  describe('error handling', () => {
    it('throws error when .owner file is missing', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'IDSE_Core', 'no-owner-session');
      await fs.mkdir(sessionPath, { recursive: true });

      await expect(
        provider.getRole('user1', 'IDSE_Core:no-owner-session')
      ).rejects.toThrow(/Missing .owner file for session/);
    });

    it('throws error when session directory does not exist', async () => {
      await expect(
        provider.getRole('user1', 'IDSE_Core:nonexistent-session')
      ).rejects.toThrow(/Missing .owner file/);
    });

    it('throws error for invalid sessionId format (no colon)', async () => {
      await expect(
        provider.getRole('user1', 'invalid-session-id')
      ).rejects.toThrow(/Invalid sessionId format/);
    });

    it('throws error for invalid sessionId format (empty parts)', async () => {
      await expect(
        provider.getRole('user1', ':empty-project')
      ).rejects.toThrow(/Invalid sessionId format/);

      await expect(
        provider.getRole('user1', 'empty-session:')
      ).rejects.toThrow(/Invalid sessionId format/);
    });
  });

  describe('path resolution', () => {
    it('correctly maps sessionId to filesystem path', async () => {
      const sessionPath = path.join(tempDir, 'projects', 'MyProject', 'my-session');
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'test-owner', 'utf-8');

      const role = await provider.getRole('test-owner', 'MyProject:my-session');
      expect(role).toBe('owner');
    });

    it('handles complex project and session names', async () => {
      const sessionPath = path.join(
        tempDir,
        'projects',
        'IDSE_Core_V2',
        'feature-auth-2025'
      );
      await fs.mkdir(sessionPath, { recursive: true });
      await fs.writeFile(path.join(sessionPath, '.owner'), 'dev-user', 'utf-8');

      const role = await provider.getRole('dev-user', 'IDSE_Core_V2:feature-auth-2025');
      expect(role).toBe('owner');
    });
  });
});
