Implementation artifacts placeholder for session: milkdown-crepe

Purpose
-------
This README is a minimal implementation placeholder created to satisfy IDSE governance checks.
Replace with detailed implementation notes and links when scaffolding begins.

Intended implementation mapping
-------------------------------
- Backend microservice (Node.js) scaffold: backend/services/milkdown-crepe/
  - src/
    - index.ts (entry)
    - server.ts (app setup)
    - routes/documents.ts, routes/render.ts
    - validators/schemas.ts (zod)
    - github/ (Octokit wrappers)
    - render/ (remark→rehype pipeline + sanitization)
  - tests/fixtures/markdown/ (intent.md, spec.md, plan.md)

- Frontend integration notes:
  - React component using @milkdown/crepe
  - Mount in frontend/widget/src/components/MilkdownEditor.tsx
  - Use useRef + useLayoutEffect, ensure crepe.destroy() on cleanup

Status
------
- Placeholder created 2025-12-30 by IDSE Developer Agent per request.
- Implementation scaffold not yet present. Create backend/service scaffold and tests/fixtures next.

Next steps (recommended)
------------------------
1. Decide framework (Fastify recommended) and record in changelog.md and spec.md.
2. Create backend/service scaffold at backend/services/milkdown-crepe/ per plan.
3. Add 2–3 markdown fixtures under tests/fixtures/markdown/ and add unit/contract tests.
4. Replace this placeholder README with full implementation README linking artifacts and run compliance validation again.
