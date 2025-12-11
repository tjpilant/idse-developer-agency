# Using IDSE Developer Agent with Claude Projects

> **A practical guide for integrating Intent-Driven Systems Engineering with Claude's capabilities**

This guide explains how to leverage the IDSE Developer Agent methodology within Claude's environment, including claude.ai with computer use, Claude Code, and the Claude API. While the original repository targets OpenAI Custom GPTs, Claude's architecture offers unique advantages for structured engineering workflows.

---

## Why Claude for IDSE?

Claude's extended thinking, tool use, and memory capabilities align naturally with IDSE's deliberate, stage-by-stage approach. Key advantages:

- **Extended context**: Claude can hold entire specifications, plans, and implementation details in a single conversation
- **Computer use**: Claude can create, edit, and validate IDSE artifacts as actual files
- **Memory persistence**: Claude remembers project context across sessions
- **Tool integration**: Connect to Notion, GitHub, and other systems for artifact management
- **Structured output**: Claude excels at producing consistent, well-formatted engineering documents

---

## Quick Start: Three Approaches

### Approach 1: Conversational IDSE (No Setup Required)

Copy the system prompt philosophy directly into your conversation:

```
I want to work using Intent-Driven Systems Engineering (IDSE).

Pipeline: Intent → Context → Specification → Plan → Tasks → Implementation → Feedback

For this project, please:
1. Help me clarify intent and context before jumping to solutions
2. Produce structured artifacts (spec.md, plan.md, tasks.md format)
3. Never generate code without a plan
4. Follow test-first patterns
5. Mark unclear requirements with [REQUIRES INPUT]

Let's start with: [describe your project]
```

### Approach 2: Project-Based IDSE (Claude.ai Projects)

Create a Claude Project and upload the IDSE knowledge base:

1. Create a new Project in claude.ai
2. Upload these files to Project Knowledge:
   - `docs/01-idse-philosophy.md`
   - `docs/02-idse-constitution.md`
   - `docs/03-idse-pipeline.md`
   - `docs/04-idse-spec-plan-tasks.md`
   - `kb/templates/*` (all templates)
   - `kb/examples/real-time-notifications.md`
3. Set custom instructions using the content from `prompts/custom-gpt-system-prompt.md`
4. Begin conversations with stage-specific prompts

### Approach 3: Claude Code + Local Repository

Clone the repository and use Claude Code for file-based workflows:

```bash
git clone https://github.com/tjpilant/idse-developer-agent.git
cd idse-developer-agent

# Start Claude Code in the repo
claude

# Claude can now reference all IDSE docs and create artifacts directly
```

---

## Adapting the System Prompt for Claude

The original Custom GPT prompt works well, but Claude benefits from a few adaptations:

### Enhanced Claude System Prompt

```markdown
You are **Developer Agent implementing Intent-Driven Systems Engineering (IDSE)**.

## Pipeline
Intent → Context → Specification → Plan → Tasks → Implementation → Feedback

## Core Behaviors
- Never skip stages. Never generate code without a plan. Never plan without a complete specification.
- Use extended thinking for complex architectural decisions
- Create actual files when working on artifacts (not just code blocks)
- Mark unclear requirements with [REQUIRES INPUT]
- Ask clarifying questions before proceeding when context is ambiguous

## Stage Outputs
When asked to work on a stage, produce the corresponding artifact:
- Intent stage → `intent.md`
- Context stage → `context.md`  
- Specification stage → `spec.md`
- Planning stage → `plan.md`
- Tasking stage → `tasks.md`
- Implementation → code files with tests

## Constitution (Always Apply)
1. Intent Supremacy: All decisions map to explicit intent
2. Context Alignment: Architecture reflects scale, constraints, compliance
3. Specification Completeness: No plans/code with unresolved ambiguities
4. Test-First Mandate: Tests precede implementation
5. Simplicity: Favor direct framework use, minimal layers
6. Transparency: Everything explainable, testable, observable
7. Plan Before Build: Full plan before code generation
8. Atomic Tasking: Tasks are independent, testable, parallel where safe
9. Feedback Incorporation: Production findings update artifacts

## Roles
Act as: Senior Full-Stack Engineer, Architect, API & Database Designer, AI/ML Engineer, UI/UX-Oriented Frontend Developer

Build systems from intent. Engineer through context. Deliver clear, testable, production-ready outputs.
```

---

## Stage-by-Stage Claude Workflows

### Stage 1: Intent Capture

**Prompt Pattern:**
```
I need help defining the intent for [feature/project].

Here's my initial idea: [description]

Please help me create an intent.md that captures:
- Goal
- Problem/Opportunity  
- Success Criteria (measurable)
- Scope (in/out)
```

**Claude's Approach:**
Claude will ask clarifying questions about success metrics, boundaries, and constraints before producing the artifact. Expect questions like:
- "What does success look like in measurable terms?"
- "Are there specific outcomes that would mean this failed?"
- "What's explicitly out of scope?"

### Stage 2: Context Discovery

**Prompt Pattern:**
```
Now let's capture context for [feature name].

Environment:
- [Stack details]
- [Scale expectations]  
- [Integrations]

Please identify:
- Missing constraints I should specify
- Risks and unknowns
- Compliance considerations
```

**Claude's Approach:**
Claude will probe for often-overlooked context: team capabilities, deployment constraints, existing technical debt, compliance requirements. The goal is surfacing hidden constraints before they derail implementation.

### Stage 3: Specification

**Prompt Pattern:**
```
Based on our intent and context, generate a specification.

Include:
- User stories (As a..., I want..., So that...)
- Functional requirements
- Non-functional requirements  
- Acceptance criteria
- Open questions (mark with [REQUIRES INPUT])
```

**Claude's Approach:**
Claude will synthesize intent + context into testable requirements. Expect Claude to:
- Reference specific success criteria from intent
- Ground NFRs in context constraints
- Flag ambiguities rather than making assumptions

### Stage 4: Implementation Plan

**Prompt Pattern:**
```
Create an implementation plan for [spec reference].

Cover:
- Architecture summary
- Component breakdown
- Data model
- API contracts
- Test strategy
- Phases
```

**Claude's Approach:**
Claude will produce a plan that traces back to spec requirements. Each component should map to specific functional requirements. Test strategy should cover all acceptance criteria.

### Stage 5: Task Breakdown

**Prompt Pattern:**
```
Break the implementation plan into tasks.

Format:
- Organized by phase
- Mark parallelizable tasks with [P]
- Each task should be independently testable
- Include estimated complexity
```

### Stage 6: Implementation

**Prompt Pattern:**
```
Implement [Task X.Y]: [task description]

Requirements from spec: [reference]
From plan: [component/contract details]

Generate:
1. Test file first
2. Implementation
3. Integration notes
```

---

## Using Claude's Tools with IDSE

### File Creation for Artifacts

When using Claude with computer use enabled, request actual file creation:

```
Create the spec.md file based on our discussion. Save it to /home/claude/project/spec.md
```

Claude will create properly formatted markdown files you can download or copy.

### Notion Integration

If you have Notion connected, Claude can manage IDSE artifacts directly:

```
Create a new page in my [Project] database for this feature's specification.
Structure it using the IDSE spec template with our requirements.
```

### Memory for Project Continuity

Ask Claude to remember project context:

```
Please remember that we're working on [Project Name] using IDSE methodology.
Current stage: [stage]
Key constraints: [constraints]
```

Claude will retain this across sessions, allowing you to resume with:

```
Let's continue work on [Project Name]. Where did we leave off?
```

---

## Validation Checklist

Before moving between stages, verify completeness:

### Intent → Context Checkpoint
- [ ] Success criteria are measurable
- [ ] Scope boundaries are explicit
- [ ] No assumed constraints

### Context → Spec Checkpoint
- [ ] All integrations documented
- [ ] Scale and performance targets explicit
- [ ] Compliance requirements identified
- [ ] Risks cataloged

### Spec → Plan Checkpoint
- [ ] All [REQUIRES INPUT] resolved
- [ ] Acceptance criteria are testable
- [ ] NFRs have numeric targets
- [ ] Open questions answered or deferred with rationale

### Plan → Tasks Checkpoint
- [ ] Each spec requirement traces to plan components
- [ ] Test strategy covers all acceptance criteria
- [ ] API contracts are complete
- [ ] Data models support all requirements

### Tasks → Implementation Checkpoint
- [ ] Tasks are independently testable
- [ ] Parallelization is marked
- [ ] Dependencies are explicit
- [ ] Estimated effort is realistic

---

## Common Patterns

### Pattern: Research-First Context

When context is unclear, Claude can research before documenting:

```
I need to integrate with [Service X]. 
Search for their API documentation and rate limits.
Then update context.md with integration constraints.
```

### Pattern: Spec Refinement Loop

Use Claude to stress-test specifications:

```
Review this spec for completeness:
[spec content]

Identify:
- Ambiguous requirements
- Missing acceptance criteria  
- Untestable statements
- Gaps between user stories and functional requirements
```

### Pattern: Plan Alternatives

Request competing architectural approaches:

```
For this specification, propose two alternative architectures:
1. Simplest viable approach
2. Most scalable approach

Compare trade-offs against our context constraints.
```

### Pattern: Task Parallelization Analysis

Let Claude optimize task ordering:

```
Analyze these tasks for parallelization opportunities:
[tasks]

Identify:
- Which tasks can run simultaneously
- Critical path tasks
- Dependencies that could be eliminated
```

---

## Playbook Quick Reference

| Scenario | Playbook | Key Steps |
|----------|----------|-----------|
| New feature | `full-feature-idse-playbook.md` | Intent → Context → Spec → Plan → Tasks → Implement |
| Bug fix | `bug-fix.md` | Reproduce → Update context → Amend spec → Plan fix → Test |
| Refactor | `refactor-under-idse.md` | Re-express intent → Update spec → Compare → Delta tasks |
| Change request | `change-request.md` | Capture change → Revisit intent → Amend artifacts |
| API integration | `third-party-api-integration.md` | Understand need → Document in context → Extend spec |

---

## Anti-Patterns to Avoid

**❌ Skipping to code**
"Just write me the notification service"
→ Claude should push back and request intent/context first

**❌ Vague success criteria**  
"Make it fast and user-friendly"
→ Ask for specific metrics: "Response time under X ms for Y concurrent users"

**❌ Implicit context**
Assuming Claude knows your stack, scale, or constraints
→ Always document context explicitly, even for follow-up sessions

**❌ Monolithic tasks**
"Build the entire backend"
→ Break into atomic, testable units

**❌ Post-hoc specifications**
Writing specs after code exists
→ Use feedback loop to update specs, don't abandon the process

---

## Example Session

Here's a condensed example of IDSE with Claude:

**User:** I want to add user authentication to my Next.js app.

**Claude:** Let's approach this with IDSE. First, let's clarify intent:

**Intent Questions:**
- What authentication methods? (email/password, OAuth, magic link?)
- What does success look like? (conversion rate, security compliance?)
- What's explicitly out of scope? (admin roles, 2FA in v1?)

**User:** Email/password and Google OAuth. Success = secure login under 3 seconds. Out of scope: 2FA, admin roles.

**Claude:** Good. Now context:

**Context Questions:**
- Current stack details? (Next.js version, API setup?)
- Scale expectations? (concurrent users, session duration?)
- Compliance requirements? (GDPR, SOC2?)
- Existing auth infrastructure?

**User:** Next.js 14 with App Router, Postgres DB, expecting 10k users, GDPR compliance needed, no existing auth.

**Claude:** *[Proceeds to generate intent.md and context.md, then moves to specification...]*

---

## Resources

- **IDSE Philosophy:** Understanding why intent-first matters
- **Constitution:** The nine guardrails that govern all decisions
- **Templates:** Starting points for each artifact type
- **Real-time Notifications Example:** Complete walkthrough from intent to tasks

---

## Tips for Claude-Specific Success

1. **Use extended thinking**: For complex architectural decisions, Claude's reasoning improves output quality

2. **Request file artifacts**: When using computer use, ask for actual files rather than code blocks in chat

3. **Leverage memory**: Have Claude remember project context for multi-session work

4. **Connect tools**: Notion, GitHub, and other integrations can store artifacts durably

5. **Iterate explicitly**: When refining, reference specific sections: "In the spec, requirement FR-3 is ambiguous because..."

6. **Validate with Claude**: Use Claude to review its own artifacts: "Check this plan against the specification. Are all acceptance criteria covered?"

---

*This guide is designed to be a living document. As you discover patterns that work well with Claude + IDSE, consider contributing them back to the methodology.*
