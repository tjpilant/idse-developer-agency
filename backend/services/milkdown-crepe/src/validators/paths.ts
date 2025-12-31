import path from 'path';
import { ValidationError } from '../errors/types';

// Allow any markdown file under the workspace root (still guarded against traversal).
const allowedPattern = /^.*\.md$/;

export function validatePath(inputPath: string, workspaceRoot: string): string {
  const resolved = path.resolve(workspaceRoot, inputPath);
  const normalizedRoot = path.resolve(workspaceRoot);

  if (!resolved.startsWith(normalizedRoot)) {
    throw new ValidationError('Path traversal detected');
  }

  const relative = path.relative(normalizedRoot, resolved);
  if (!allowedPattern.test(relative)) {
    throw new ValidationError('Invalid path (must be a .md file)');
  }

  return resolved;
}

export function toRelative(resolvedPath: string, workspaceRoot: string): string {
  const normalizedRoot = path.resolve(workspaceRoot);
  return path.relative(normalizedRoot, resolvedPath);
}
