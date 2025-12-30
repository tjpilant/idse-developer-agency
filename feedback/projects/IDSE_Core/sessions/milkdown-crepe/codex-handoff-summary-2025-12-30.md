# Codex Handoff Summary: milkdown-crepe Phase 1

**Date**: 2025-12-30
**From**: claude_code
**To**: codex_gpt
**Session**: milkdown-crepe
**Current Phase**: Phase 0 Complete → Phase 1 Ready
**Handoff Document**: `idse-governance/feedback/handoff_claude_to_codex_2025-12-29T19-31-52Z.md`

---

## Handoff Context

### What Was Accomplished (Phase 0)

The agency has successfully completed **Phase 0 (Foundations)** for the milkdown-crepe project with excellent results:

✅ **IDSE Pipeline Documentation**: A- grade (92% compliance)
- All 5 stages complete: Intent, Context, Spec, Plan, Tasks
- 9 architectural decisions resolved and documented
- Framework chosen: Fastify (TypeScript + Zod integration)

✅ **Backend Microservice Scaffolding**: 20+ files created
- Working Node.js + Fastify + TypeScript skeleton
- 3 API endpoints scaffolded (GET, PUT, POST render)
- Sanitization pipeline (remark → rehype → XSS prevention)
- Docker support with multi-stage build
- Comprehensive documentation (API, Security, Development, Contributing)

✅ **Smart Architectural Decisions**:
- WRITE_MODE=local as default (~70% complexity reduction)
- External sync handles git/PR (governance preserved)
- Fastify for performance + TypeScript ergonomics

### Phase 0 Status Summary

**Grade**: A- (92% IDSE Compliance)

**Deliverables**:
- ✅ T0.1: Service scaffold and configuration
- ✅ T0.2: Zod validators and path utilities
- ✅ T0.3: CI workflow configuration and test fixtures

**Quality**:
- ✅ Clean architecture (routes → validators → middleware)
- ✅ TypeScript strict mode
- ✅ Initial test coverage (sanitizer, API smoke test)
- 🔧 Security stubs need implementation (auth, ACL)
- 🔧 Test coverage gaps (contract, integration, error paths)

---

## What Needs to Happen Next (Phase 1)

### Priority: CRITICAL SECURITY FIXES 🚨

Before any deployment or integration, these **must** be implemented:

#### 1. Implement Bearer Token Validation (CRITICAL)
**File**: `backend/services/milkdown-crepe/src/middleware/auth.ts`
**Current State**: Only checks if Authorization header exists
**Required**:
```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config';

export const authenticate = async (request, reply) => {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, config.AUTH_SECRET);
    request.user = decoded; // { userId, sessionId, roles }
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
};
```

**Why**: Current implementation allows anyone with any Authorization header to access all endpoints.

#### 2. Add Path Traversal Protection (CRITICAL)
**File**: `backend/services/milkdown-crepe/src/validators/paths.ts` (new file)
**Current Risk**: `../../etc/passwd` could pass regex validation
**Required**:
```typescript
import path from 'path';

export const validatePath = (inputPath: string, workspaceRoot: string): string => {
  // Resolve to absolute path
  const resolved = path.resolve(workspaceRoot, inputPath);

  // Ensure path is within workspace
  if (!resolved.startsWith(workspaceRoot)) {
    throw new ValidationError('Path traversal detected');
  }

  // Ensure path matches IDSE structure
  const relative = path.relative(workspaceRoot, resolved);
  if (!/^(intents|contexts|specs|plans|tasks)\/.*\.md$/.test(relative)) {
    throw new ValidationError('Invalid IDSE path structure');
  }

  return resolved;
};
```

**Where to Use**: In both GET and PUT endpoints in `src/routes/documents.ts`

#### 3. Add Rate Limiting (CRITICAL)
**File**: `backend/services/milkdown-crepe/src/server.ts`
**Current Risk**: DoS attacks, resource exhaustion
**Required**:
```bash
npm install @fastify/rate-limit
```

```typescript
import rateLimit from '@fastify/rate-limit';

app.register(rateLimit, {
  max: 100,              // 100 requests
  timeWindow: '1 minute' // per minute per IP
});
```

#### 4. Enforce Input Size Limits (HIGH)
**File**: `backend/services/milkdown-crepe/src/server.ts`
**Spec Requirement**: 5MB max document size
**Required**:
```typescript
const app = fastify({
  logger: true,
  bodyLimit: 5 * 1024 * 1024, // 5MB
});
```

#### 5. Configure CORS (HIGH)
**File**: `backend/services/milkdown-crepe/src/server.ts`
**Current Risk**: Frontend can't communicate with backend
**Required**:
```bash
npm install @fastify/cors
```

```typescript
import cors from '@fastify/cors';

app.register(cors, {
  origin: [
    'http://localhost:3000',      // Local development
    'http://localhost:5173',      // Vite dev server
    process.env.FRONTEND_URL      // Production
  ],
  credentials: true,
});
```

---

### Priority: RESPONSE SCHEMA ENFORCEMENT 🔧

**Files**:
- `backend/services/milkdown-crepe/src/validators/schemas.ts`
- `backend/services/milkdown-crepe/src/routes/documents.ts`
- `backend/services/milkdown-crepe/src/routes/render.ts`

**Issue**: Spec defines exact response shapes, but current implementation returns generic objects

**Required**:
```typescript
// src/validators/schemas.ts
export const LocalWriteResponseSchema = z.object({
  path: z.string(),
  saved: z.literal(true),
  mode: z.literal('local'),
});

export const PrWriteResponseSchema = z.object({
  prUrl: z.string().url(),
  commitSha: z.string(),
  path: z.string(),
  mode: z.literal('pr'),
});

export const RenderResponseSchema = z.object({
  html: z.string(),
});
```

**Use fastify-type-provider-zod** for automatic validation:
```typescript
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.withTypeProvider<ZodTypeProvider>().put('/api/sessions/:project/:session/documents', {
  schema: {
    body: PutDocumentRequestSchema,
    response: {
      200: LocalWriteResponseSchema
    }
  }
}, putDocumentHandler);
```

---

### Priority: CONFIGURATION MANAGEMENT ⚙️

**File**: `backend/services/milkdown-crepe/src/config.ts` (new file)

**Issue**: Hardcoded values scattered throughout code

**Required**:
```typescript
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.coerce.number().default(8001),
  WRITE_MODE: z.enum(['local', 'pr']).default('local'),
  GITHUB_TOKEN: z.string().optional(),
  AUTH_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  WORKSPACE_ROOT: z.string().default(process.cwd()),
  MAX_BODY_SIZE: z.coerce.number().default(5 * 1024 * 1024), // 5MB
  FRONTEND_URL: z.string().url().optional(),
});

export const config = configSchema.parse(process.env);
```

**Benefits**:
- Centralized configuration
- Validation on startup (fail-fast)
- Type-safe access throughout codebase
- Clear documentation of required env vars

---

### Priority: TEST COVERAGE EXPANSION 📝

#### Contract Tests (Required for Phase 1 Completion)

**File**: `backend/services/milkdown-crepe/tests/contracts/documents-get.test.ts` (new)

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../helper';

describe('GET /api/sessions/:project/:session/documents', () => {
  let app;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with valid path', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/intent.md',
      headers: { authorization: 'Bearer valid-token' }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('content');
    expect(response.json()).toHaveProperty('path');
  });

  it('returns 400 with invalid path (path traversal)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=../../etc/passwd',
      headers: { authorization: 'Bearer valid-token' }
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toHaveProperty('error');
  });

  it('returns 401 without auth header', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/intent.md',
    });
    expect(response.statusCode).toBe(401);
  });

  it('returns 403 without read permission', async () => {
    // Test with token for user without read access to session
    const response = await app.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/intent.md',
      headers: { authorization: 'Bearer no-read-access-token' }
    });
    expect(response.statusCode).toBe(403);
  });

  it('returns 404 for non-existent file', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/sessions/IDSE_Core/test/documents?path=intents/nonexistent.md',
      headers: { authorization: 'Bearer valid-token' }
    });
    expect(response.statusCode).toBe(404);
  });
});
```

**Similar contract tests needed for**:
- `tests/contracts/documents-put.test.ts` (PUT endpoint)
- `tests/contracts/render-post.test.ts` (POST render endpoint)

#### Integration Tests

**File**: `backend/services/milkdown-crepe/tests/integration/filesystem.test.ts` (new)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { build } from '../helper';

describe('Filesystem Operations', () => {
  let app;
  let tempDir: string;

  beforeEach(async () => {
    app = await build();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'idse-test-'));
    process.env.WORKSPACE_ROOT = tempDir;
  });

  afterEach(async () => {
    await app.close();
    await fs.rm(tempDir, { recursive: true });
  });

  it('writes file to workspace and reads it back', async () => {
    // PUT request to write file
    const putResponse = await app.inject({
      method: 'PUT',
      url: '/api/sessions/test/session/documents',
      payload: {
        path: 'intents/test.md',
        content: '# Test Intent\n\nThis is a test.'
      },
      headers: { authorization: 'Bearer valid-token' }
    });
    expect(putResponse.statusCode).toBe(200);
    expect(putResponse.json()).toMatchObject({
      path: 'intents/test.md',
      saved: true,
      mode: 'local'
    });

    // GET request to read file back
    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/sessions/test/session/documents?path=intents/test.md',
      headers: { authorization: 'Bearer valid-token' }
    });
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.json().content).toBe('# Test Intent\n\nThis is a test.');
  });
});
```

#### Middleware Tests

**File**: `backend/services/milkdown-crepe/tests/middleware/auth.test.ts` (new)

```typescript
import { describe, it, expect } from 'vitest';
import { authenticate } from '../../src/middleware/auth';

describe('Authentication Middleware', () => {
  it('accepts valid Bearer token', async () => {
    const request = {
      headers: { authorization: 'Bearer valid-jwt-token' }
    };
    const reply = mockReply();

    await authenticate(request, reply);

    expect(request.user).toBeDefined();
    expect(request.user.userId).toBeDefined();
  });

  it('rejects missing Authorization header', async () => {
    const request = { headers: {} };
    const reply = mockReply();

    await authenticate(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
  });

  it('rejects malformed Bearer token', async () => {
    const request = {
      headers: { authorization: 'NotBearer token' }
    };
    const reply = mockReply();

    await authenticate(request, reply);

    expect(reply.code).toHaveBeenCalledWith(401);
  });
});
```

---

### Priority: ERROR HANDLING ❌

**Files**:
- `backend/services/milkdown-crepe/src/errors/types.ts` (new)
- `backend/services/milkdown-crepe/src/server.ts`
- All route handlers

**Create Custom Error Types**:
```typescript
// src/errors/types.ts
export class ValidationError extends Error {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  statusCode = 401;
  code = 'AUTH_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  code = 'NOT_FOUND';
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

**Add Error Handler to Server**:
```typescript
// src/server.ts
app.setErrorHandler((error, request, reply) => {
  app.log.error({
    err: error,
    url: request.url,
    method: request.method,
  });

  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';

  reply.code(statusCode).send({
    error: error.message,
    code,
    statusCode
  });
});
```

**Add Try/Catch to Route Handlers**:
```typescript
// src/routes/documents.ts
app.get('/api/sessions/:project/:session/documents', async (request, reply) => {
  try {
    const { project, session } = request.params;
    const { path: filePath } = request.query;

    // Validate path (throws ValidationError if invalid)
    const resolvedPath = validatePath(filePath, config.WORKSPACE_ROOT);

    // Check ACL (throws AuthorizationError if denied)
    await checkReadPermission(request.user, session);

    // Read file (throws NotFoundError if doesn't exist)
    const content = await fs.readFile(resolvedPath, 'utf-8');

    return { path: filePath, content };
  } catch (error) {
    // Fastify error handler will catch and format
    throw error;
  }
});
```

---

### Priority: LOGGING 📊

**Files**:
- `backend/services/milkdown-crepe/src/server.ts`
- All route handlers
- Middleware

**Use Fastify's Built-in Pino Logger**:
```typescript
// src/server.ts
const app = fastify({
  logger: {
    level: config.NODE_ENV === 'production' ? 'info' : 'debug',
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        remoteAddress: req.ip,
        userId: req.user?.userId
      }),
      res: (res) => ({
        statusCode: res.statusCode
      })
    }
  }
});

// In route handlers
app.get('/api/sessions/:project/:session/documents', async (request, reply) => {
  request.log.info({
    userId: request.user.userId,
    sessionId: request.params.session,
    path: request.query.path
  }, 'Document read requested');

  try {
    // ... handler logic
    request.log.info({ path }, 'Document read successful');
  } catch (error) {
    request.log.error({ error, path }, 'Document read failed');
    throw error;
  }
});
```

**Log Security Events**:
```typescript
// In auth middleware
app.log.warn({
  ip: request.ip,
  path: request.url
}, 'Authentication failed');

// In ACL middleware
app.log.warn({
  userId: request.user.userId,
  sessionId,
  attemptedAction: 'write',
  userRole: 'reader'
}, 'ACL denied');
```

---

## Phase 1 Task Breakdown

### T1.1: Implement GET /documents endpoint
**Status**: Scaffolded, needs hardening
**Actions**:
- ✅ Add path traversal protection
- ✅ Add error handling (try/catch, custom errors)
- ✅ Add logging (request, success, error)
- ✅ Enforce response schema
- ✅ Add contract tests (5 test cases)
- ✅ Add integration test (read actual file)

### T1.2: Implement POST /render endpoint
**Status**: Scaffolded, needs hardening
**Actions**:
- ✅ Add error handling (try/catch, custom errors)
- ✅ Add logging (request, success, error)
- ✅ Enforce response schema
- ✅ Add contract tests (positive, negative, edge cases)
- ✅ Expand sanitizer tests (more edge cases)

### T1.3: Add contract tests for GET and POST
**Status**: Not started
**Actions**:
- ✅ Create `tests/contracts/documents-get.test.ts`
- ✅ Create `tests/contracts/render-post.test.ts`
- ✅ Create `tests/integration/filesystem.test.ts`
- ✅ Create `tests/middleware/auth.test.ts`
- ✅ Create `tests/middleware/acl.test.ts`

---

## File Checklist for Codex

### Files to Create (Priority Order)

1. **`src/config.ts`** - Configuration management with Zod validation
2. **`src/validators/paths.ts`** - Path traversal protection
3. **`src/errors/types.ts`** - Custom error classes
4. **`tests/contracts/documents-get.test.ts`** - GET endpoint contract tests
5. **`tests/contracts/documents-put.test.ts`** - PUT endpoint contract tests
6. **`tests/contracts/render-post.test.ts`** - POST render contract tests
7. **`tests/integration/filesystem.test.ts`** - Integration tests
8. **`tests/middleware/auth.test.ts`** - Auth middleware tests
9. **`tests/middleware/acl.test.ts`** - ACL middleware tests

### Files to Modify (Priority Order)

1. **`package.json`** - Add dependencies (@fastify/rate-limit, @fastify/cors, pino)
2. **`src/middleware/auth.ts`** - Implement JWT validation
3. **`src/server.ts`** - Add rate limiting, CORS, error handler, logging config
4. **`src/routes/documents.ts`** - Add path validation, error handling, logging, response schemas
5. **`src/routes/render.ts`** - Add error handling, logging, response schema
6. **`src/validators/schemas.ts`** - Add response schemas
7. **`.env.example`** - Add WORKSPACE_ROOT, MAX_BODY_SIZE, FRONTEND_URL

### Files to Review (Understanding)

1. **`src/render/sanitize.ts`** - Verify XSS prevention whitelist completeness
2. **`tests/render.test.ts`** - Review existing sanitizer tests, add edge cases
3. **`docs/SECURITY.md`** - Update with path traversal, rate limiting mentions
4. **`docs/API.md`** - Verify accuracy, add error response examples

---

## Success Criteria for Phase 1 Completion

### Security ✅
- [x] Bearer token validation implemented and tested
- [x] Path traversal protection implemented and tested
- [x] Rate limiting configured (100 req/min)
- [x] Input size limits enforced (5MB)
- [x] CORS configured with origin whitelist

### Code Quality ✅
- [x] Response schemas enforced for all endpoints
- [x] Configuration management centralized (config.ts)
- [x] Error handling comprehensive (custom errors, handler)
- [x] Logging structured (pino, security events)

### Testing ✅
- [x] Contract tests for all 3 endpoints (GET, PUT, POST)
- [x] Integration tests (filesystem roundtrip)
- [x] Middleware tests (auth, ACL)
- [x] Error path tests (400, 401, 403, 404, 500)
- [x] Test coverage ≥70%

### Documentation ✅
- [x] Environment variables reference added to DEVELOPMENT.md
- [x] SECURITY.md updated (path traversal, rate limiting)
- [x] API.md updated (error response examples)

### Governance ✅
- [x] Run validate-artifacts.py (expect PASS)
- [x] Run check-compliance.py (expect PASS or minor warnings)
- [x] Update changelog.md with Phase 1 completion
- [x] Mark T1.1-T1.3 as complete in tasks.md

---

## Reference Documents

### Primary Review Document
**[phase0-implementation-review-2025-12-30.md](phase0-implementation-review-2025-12-30.md)**
- Comprehensive 500+ line review
- Architecture assessment
- Security analysis
- Testing gaps
- Code quality review

### IDSE Pipeline Documents
- **Intent**: [intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md](../../../../../intents/projects/IDSE_Core/sessions/milkdown-crepe/intent.md)
- **Context**: [contexts/projects/IDSE_Core/sessions/milkdown-crepe/context.md](../../../../../contexts/projects/IDSE_Core/sessions/milkdown-crepe/context.md)
- **Spec**: [specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md](../../../../../specs/projects/IDSE_Core/sessions/milkdown-crepe/spec.md)
- **Plan**: [plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md](../../../../../plans/projects/IDSE_Core/sessions/milkdown-crepe/plan.md)
- **Tasks**: [tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md](../../../../../tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md)

### Implementation Files
- **Backend**: `backend/services/milkdown-crepe/` (20+ files)
- **Session Metadata**: `projects/IDSE_Core/milkdown-crepe/`

---

## Quick Start for Codex

1. **Acknowledge Handoff**:
   ```bash
   python3 .cursor/tasks/governance.py acknowledge --as codex_gpt
   ```

2. **Review Primary Document**:
   Read `phase0-implementation-review-2025-12-30.md` (comprehensive review)

3. **Install Dependencies**:
   ```bash
   cd backend/services/milkdown-crepe
   npm install @fastify/rate-limit @fastify/cors pino jsonwebtoken
   npm install -D @types/jsonwebtoken
   ```

4. **Start with Security Fixes** (CRITICAL):
   - Create `src/config.ts`
   - Create `src/validators/paths.ts`
   - Modify `src/middleware/auth.ts` (JWT validation)
   - Modify `src/server.ts` (rate limiting, CORS, error handler)
   - Modify `src/routes/documents.ts` (path validation)

5. **Add Response Schemas**:
   - Modify `src/validators/schemas.ts`
   - Update route handlers to use schemas

6. **Expand Test Coverage**:
   - Create contract tests (GET, PUT, POST)
   - Create integration tests (filesystem)
   - Create middleware tests (auth, ACL)

7. **Update Documentation**:
   - Update `docs/DEVELOPMENT.md` (env vars reference)
   - Update `docs/SECURITY.md` (path traversal, rate limiting)
   - Update `docs/API.md` (error examples)

8. **Run Governance Checks**:
   ```bash
   python3 idse-governance/validate-artifacts.py
   python3 idse-governance/check-compliance.py
   ```

9. **Update Session Metadata**:
   - Update `projects/IDSE_Core/milkdown-crepe/changelog.md`
   - Mark T1.1-T1.3 complete in `tasks/projects/IDSE_Core/sessions/milkdown-crepe/tasks.md`

---

## Questions for Codex to Ask (If Needed)

1. **Auth Integration**: Do we have an existing IDSE auth service/library for JWT validation, or should I implement a standalone JWT validator?

2. **ACL Implementation**: Is there an existing session ownership/ACL database/service, or should I create a stub that can be integrated later?

3. **CORS Origins**: What are the production frontend URLs that should be whitelisted for CORS?

4. **Rate Limiting**: Is 100 req/min per IP appropriate, or should it be per-user or per-session?

5. **Logging**: Should logs go to stdout (Docker-friendly) or to files? What log level for production (info vs debug)?

---

## End of Handoff

**Status**: Phase 0 ✅ Complete → Phase 1 🔄 Ready

**Expected Timeline**: Phase 1 completion after security fixes + test expansion

**Next Handoff**: Phase 1 Complete → Phase 2 (Edit/PR Flow) or Phase 3 (ACL Enforcement)

**Contact**: claude_code available for questions via handoff protocol

---

**Prepared by**: claude_code
**Date**: 2025-12-30
**Session**: milkdown-crepe
**Compliance**: IDSE Constitution Article IX (Feedback Incorporation)
