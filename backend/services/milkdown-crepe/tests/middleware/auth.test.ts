import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../src/middleware/auth';

const reply = () => {
  const res: any = {};
  res.code = (status: number) => {
    res.statusCode = status;
    return res;
  };
  res.send = (payload: any) => {
    res.payload = payload;
    return res;
  };
  return res;
};

describe('authMiddleware', () => {
  it('accepts a valid Bearer token and sets user', async () => {
    const token = jwt.sign({ userId: 'ok', roles: ['reader'] }, 'dev-secret');
    const request: any = { headers: { authorization: `Bearer ${token}` } };
    const rep = reply();

    await authMiddleware(request as any, rep as any);

    expect(request.user?.userId).toBe('ok');
  });

  it('rejects missing Authorization header', async () => {
    const request: any = { headers: {} };
    await expect(authMiddleware(request as any, reply() as any)).rejects.toThrow(
      /Unauthorized/,
    );
  });

  it('rejects malformed token', async () => {
    const request: any = { headers: { authorization: 'Bearer badtoken' } };
    await expect(authMiddleware(request as any, reply() as any)).rejects.toThrow(
      /Invalid token/,
    );
  });
});
