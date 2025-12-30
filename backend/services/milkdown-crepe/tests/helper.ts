import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

export async function buildTempWorkspace() {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'milkdown-crepe-'));
  return dir;
}

export async function cleanupWorkspace(dir: string) {
  await rm(dir, { recursive: true, force: true });
}

export async function buildTestServer(workspaceRoot: string) {
  process.env.WORKSPACE_ROOT = workspaceRoot;
  process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-secret';
  process.env.NODE_ENV = 'test';

  await vi.resetModules();

  // Configure role provider if ROLE_PROVIDER env var is set
  if (process.env.ROLE_PROVIDER) {
    const { configureRoleProvider } = await import('../src/services/roles');
    configureRoleProvider({
      mode: process.env.ROLE_PROVIDER as any,
      workspaceRoot,
      staticMap: process.env.ROLE_MAP ? JSON.parse(process.env.ROLE_MAP) : undefined,
    });
  }

  const { buildServer } = await import('../src/server');
  return buildServer();
}

export async function writeWorkspaceFile(root: string, relativePath: string, content: string) {
  const full = path.join(root, relativePath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, content, 'utf-8');
}
