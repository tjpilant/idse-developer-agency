# Feedback Directory

This directory implements the **Feedback** stage of the IDSE pipeline, completing the closed loop:

> **Intent → Context → Specification → Plan → Tasks → Implementation → Feedback**

## Purpose

The feedback directory serves as:
1. **Quality anchor** - Captures the current state of the system
2. **Historical record** - Documents iterations and improvements
3. **Reference point** - Enables Claude/Codex to understand what has been done and why

## Structure

```
feedback/
├── README.md           # This file
├── current/            # Latest iteration feedback
│   └── feedback.md     # Current quality report
└── archive/            # Historical feedback (future use)
    └── YYYY-MM-DD/
        └── feedback.md
```

## How Claude/Codex Use This

When you ask Claude or Codex about the project:
- They can reference `feedback/current/feedback.md` to understand the current state
- They know what improvements have been made and why
- They can continue from the documented baseline

## Updating Feedback

When making significant improvements:
1. Archive current feedback: `mv feedback/current feedback/archive/$(date +%Y-%m-%d)`
2. Create new `feedback/current/feedback.md` with updated state
3. Document what changed and why

## Integration with IDSE

This directory embodies the IDSE principle:

> "Each stage feeds the next, and the final implementation feeds back to validate and refine the original intent."

The feedback captured here informs future:
- **Intent** refinements - What worked? What didn't?
- **Context** updates - Environment changes, new dependencies
- **Specification** improvements - Patterns that emerged
- **Planning** enhancements - Better workflows discovered

---

**Current Status:** See [current/feedback.md](current/feedback.md)
