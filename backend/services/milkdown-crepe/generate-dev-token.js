#!/usr/bin/env node
/**
 * Generate a development JWT token for testing the milkdown-crepe service.
 * Usage: node generate-dev-token.js [userId] [role1,role2,...]
 * 
 * Example:
 *   node generate-dev-token.js developer "owner,collaborator"
 */

const jwt = require('jsonwebtoken');

const userId = process.argv[2] || 'developer';
const rolesArg = process.argv[3] || 'owner,collaborator,reader';
const roles = rolesArg.split(',').map(r => r.trim());
const secret = 'dev-secret';

const token = jwt.sign(
  {
    userId,
    roles,
    sessionId: 'IDSE_Core/milkdown-crepe',
  },
  secret,
  { expiresIn: '30d' } // 30 day expiration for dev
);

console.log('\n=== Development JWT Token ===');
console.log(`User ID: ${userId}`);
console.log(`Roles: ${roles.join(', ')}`);
console.log(`\nToken:\n${token}`);
console.log('\n=== Add to frontend .env ===');
console.log(`VITE_MILKDOWN_AUTH_TOKEN=${token}`);
console.log('\n');
