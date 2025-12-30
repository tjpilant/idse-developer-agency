Contributing to milkdown-crepe

Guidelines for Devs and Reviewers

Branching
- Use feature/<short-desc> or fix/<short-desc> naming
- Target branch: main

PR checklist
- Link PR to tasks in tasks.md
- Ensure tests pass locally (npm test)
- Run IDSE governance checks or ensure CI will run them
- Update spec or changelog for any behavior changes

Commit messages
- Use concise present-tense descriptions (e.g., "Add render endpoint")

Review expectations
- Review API contracts in spec.md and API.md
- Validate sanitizer behavior against fixtures
- Confirm ACL enforcement before approving PUT/PATCH PRs

