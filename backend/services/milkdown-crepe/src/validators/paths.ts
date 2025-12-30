import path from 'path';
import { ValidationError } from '../errors/types';

const allowedPattern = /^(intents|contexts|specs|plans|tasks)\/.*\.md$/;

export function validatePath(inputPath: string, workspaceRoot: string): string {
  const resolved = path.resolve(workspaceRoot, inputPath);
  const normalizedRoot = path.resolve(workspaceRoot);

  if (!resolved.startsWith(normalizedRoot)) {
    throw new ValidationError('Path traversal detected');
  }

  const relative = path.relative(normalizedRoot, resolved);
  if (!allowedPattern.test(relative)) {
    throw new ValidationError('Invalid IDSE path structure');
  }

  return resolved;
}

export function toRelative(resolvedPath: string, workspaceRoot: string): string {
  const normalizedRoot = path.resolve(workspaceRoot);
  return path.relative(normalizedRoot, resolvedPath);
}
