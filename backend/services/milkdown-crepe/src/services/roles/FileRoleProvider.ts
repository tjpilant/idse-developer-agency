import { promises as fs } from 'fs';
import path from 'path';
import type { Role, RoleProvider } from '../roles';
import { ConfigurationError } from '../../errors/types';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * FileRoleProvider reads session roles from `.owner` and `.collaborators` files.
 *
 * File structure:
 * - projects/{project}/{session}/.owner - Single userId (required)
 * - projects/{project}/{session}/.collaborators - Newline-separated userIds (optional)
 *
 * Role resolution:
 * 1. If userId matches .owner file → return 'owner'
 * 2. If userId is in .collaborators file → return 'collaborator'
 * 3. Otherwise → return 'reader'
 *
 * Missing .owner file: Throws error (strict ownership enforcement)
 */
export class FileRoleProvider implements RoleProvider {
  constructor(private workspaceRoot: string) {}

  async getRole(userId: string, sessionId: string): Promise<Role | undefined> {
    const sessionPath = this.resolveSessionPath(sessionId);

    // Check .owner file (required - throw error if missing)
    const ownerFile = path.join(sessionPath, '.owner');
    if (!(await fileExists(ownerFile))) {
      throw new ConfigurationError(
        `Missing .owner file for session ${sessionId}`,
      );
    }

    // Read owner
    const owner = (await fs.readFile(ownerFile, 'utf-8')).trim();
    if (userId === owner) {
      return 'owner';
    }

    // Check .collaborators file (optional, newline-separated userIds)
    const collabFile = path.join(sessionPath, '.collaborators');
    if (await fileExists(collabFile)) {
      const content = await fs.readFile(collabFile, 'utf-8');
      const collaborators = content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      if (collaborators.includes(userId)) {
        return 'collaborator';
      }
    }

    // Default to reader
    return 'reader';
  }

  /**
   * Resolve sessionId to filesystem path.
   * SessionId format: "IDSE_Core:milkdown-crepe"
   * Maps to: projects/IDSE_Core/milkdown-crepe/
   */
  private resolveSessionPath(sessionId: string): string {
    const [project, session] = sessionId.split(':');
    if (!project || !session) {
      throw new Error(
        `Invalid sessionId format: ${sessionId}. Expected "project:session"`,
      );
    }
    return path.join(this.workspaceRoot, 'projects', project, session);
  }
}
