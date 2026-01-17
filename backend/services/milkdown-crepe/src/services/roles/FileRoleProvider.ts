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
 * Helper to check if userId is in a file (either single line or newline-separated list)
 */
async function fileContainsUserId(filePath: string, userId: string): Promise<boolean> {
  if (!(await fileExists(filePath))) {
    return false;
  }

  const content = await fs.readFile(filePath, 'utf-8');
  const userIds = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return userIds.includes(userId);
}

/**
 * Check if a path is within a session directory
 */
function isSessionPath(sessionId: string): boolean {
  // SessionId format: "IDSE_Core:milkdown-crepe" indicates session-scoped access
  // If sessionId contains ':', it's a session; otherwise it might be a global path request
  return sessionId.includes(':');
}

/**
 * FileRoleProvider with two-tier permission model:
 *
 * TIER 1: Workspace-level ownership (global access)
 * - Check workspace root .owner file
 * - If userId matches → return 'owner' (can edit ANYTHING in repo)
 *
 * TIER 2: Session-level collaboration (scoped access)
 * - For session files: check session .owner and .collaborators
 * - For non-session files: default to 'collaborator' (allows editing)
 *
 * File structure:
 * - .owner (workspace root) - Workspace owner (global access)
 * - projects/{project}/sessions/{session}/.owner - Session owner
 * - projects/{project}/sessions/{session}/.collaborators - Session collaborators
 *
 * Role resolution order:
 * 1. Check workspace .owner → 'owner' (global)
 * 2. If session path, check session .owner → 'owner' (session)
 * 3. If session path, check session .collaborators → 'collaborator'
 * 4. If non-session path → 'collaborator' (allows editing repo files)
 * 5. Otherwise → 'reader' (default)
 */
export class FileRoleProvider implements RoleProvider {
  constructor(private workspaceRoot: string) {}

  async getRole(userId: string, sessionId: string): Promise<Role | undefined> {
    // TIER 1: Check workspace-level ownership
    const workspaceOwnerPath = path.join(this.workspaceRoot, '.owner');
    if (await fileContainsUserId(workspaceOwnerPath, userId)) {
      return 'owner'; // Workspace owners have full access to everything
    }

    // TIER 2: Session-level or non-session access
    if (!isSessionPath(sessionId)) {
      // Non-session files (e.g., docs/, backend/, README.md)
      // Grant collaborator access (read + write) by default
      throw new ConfigurationError(`Invalid sessionId format: ${sessionId}`);
    }

    // Session-scoped access - check session ownership
    const sessionPath = this.resolveSessionPath(sessionId);

    // Validate session path exists
    if (!(await fileExists(sessionPath))) {
      throw new ConfigurationError(`Missing .owner file for session: ${sessionId}`);
    }

    // Check session .owner file
    const sessionOwnerPath = path.join(sessionPath, '.owner');
    if (!(await fileExists(sessionOwnerPath))) {
      throw new ConfigurationError(`Missing .owner file for session: ${sessionId}`);
    }
    if (await fileContainsUserId(sessionOwnerPath, userId)) {
      return 'owner'; // Session owner
    }

    // Check session .collaborators file
    const sessionCollabPath = path.join(sessionPath, '.collaborators');
    if (await fileContainsUserId(sessionCollabPath, userId)) {
      return 'collaborator'; // Session collaborator
    }

    // Default to reader for session files if not owner/collaborator
    return 'reader';
  }

  /**
   * Resolve sessionId to filesystem path.
   * SessionId format: "IDSE_Core:milkdown-crepe"
   * Maps to: projects/IDSE_Core/sessions/milkdown-crepe/
   */
  private resolveSessionPath(sessionId: string): string {
    const [project, session] = sessionId.split(':');
    if (!project || !session) {
      throw new Error(
        `Invalid sessionId format: ${sessionId}. Expected "project:session"`,
      );
    }
    // Note: test fixtures and existing workspace layout are projects/{project}/{session}/
    return path.join(this.workspaceRoot, 'projects', project, session);
  }
}
