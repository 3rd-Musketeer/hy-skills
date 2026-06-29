---
name: gdd
description: Shape a goal from a backlog item through drafting, then refine into an executable goal document. Use when the human wants to create, refine, or assess a goal in a project using the goal-driven development methodology under .gdd/.
---

# gdd

Shape goals from backlog candidates through human-agent discussion. Operates on the `.gdd/` layout.

The methodology this skill implements is defined in `../references/goal-driven-dev.md`. Read it before operating if it is not already in context.

## Modes

The skill operates in one of three modes. The human signals the mode by intent; if ambiguous, ask before proceeding.

- **drafting** — test whether a backlog item is mature enough to become a goal
- **shaping** — refine a mature draft into an executable goal document
- **assessing** — review an existing goal document for execution readiness

## Behavior

Across all modes — note `gdd` operates under the **co-author contract** (see `../references/goal-driven-dev.md` § Roles): the human is an active participant in decisions, not a downstream consumer.

- Coaching, not authoring. Lead the human to a decision. Do not draft prose ahead of decisions.
- One decision at a time. Surface options, explain consequences, recommend a direction, let the human choose.
- Stay at artifact level. Push implementation detail (commands, file paths, library choices) to `/go`.
- Discussion mode does not produce files. Write to `.gdd/` only when the human explicitly asks.

## Drafting

Drafting tests whether a backlog item is concrete enough to become a goal. The draft attempts a short specification. If the draft cannot be completed without speculation ("we'll figure it out during implementation"), the underlying problem is not yet surfaced; the item returns to backlog.

A draft minimally answers:

- The current friction or use case the item addresses
- The shape of a solution that would resolve it
- What would qualify it for promotion to a goal

A draft is mature when these three are stable and complete.

Output: `.gdd/backlogs/backlog-YYYYMMDD-slug.md` with `status: drafted` in frontmatter. Upgrade to a folder (`backlog-YYYYMMDD-slug/backlog.md` + assets) when non-markdown companions are needed, per the file-or-folder invariant in `../references/goal-driven-dev.md`. See `references/draft-template.md`.

## Shaping

Shaping refines a mature draft into a goal document an implementation agent can execute against.

A goal document covers these dimensions. The discussion may visit them in any order the human finds natural.

- **Outcome** — what exists when the milestone is done
- **Motivation** — why now; what gets easier after
- **Scope** — what is in; what is explicitly deferred
- **Product Experience** — how the result feels; the mental model the user holds
- **Design** — visible surface (contracts, entrypoints, schemas) and architectural shape (responsibility boundaries, dataflow)
- **Definition of Done** — acceptance scenarios + hard gates
- **Pickup** — who picks this up (end-user role), the single pickup action, and the split between agent-scriptable staging and human-only steps that `/go` will honor at handoff. See the role contract in `../references/goal-driven-dev.md` § Roles.
- **Decisions** — `[resolved]` choices with reason; `[fact]` external constraints

### Eliciting Pickup

Pickup is the dimension `/go` reads to honor the role contract — sloppy Pickup produces friction-heavy handoffs no matter how clean the rest of the goal is. Walk it in this order:

1. **User role** — who is the human picking this up acting as? One line. Anchor it in the project's actual end-user shape, not a generic "developer".
2. **Pickup action** — what is the single thing they do to start verifying? If the human needs more than one action before the first observable behavior, push back: staging is incomplete.
3. **Staging required** — for each item, ask "could the agent conceivably do this in `/go`?" If yes → agent-scriptable. If genuinely no (credentials missing, GUI-only, irreversible) → human-only with reason. When in doubt, default to agent-scriptable — `/go` will defer at execution time and report what it tried, which is cheaper than over-pessimistic shaping here.

Decisions default to inline in the goal's Decisions section. Decisions that affect more than one goal are flagged as ref candidates and promoted to `.gdd/refs/` per the rules in `../references/goal-driven-dev.md`.

Output: `.gdd/goals/goal-YYYYMMDD-slug.md`. Upgrade to a folder (`goal-YYYYMMDD-slug/goal.md` + assets) when the goal carries mockups, screenshots, or other non-markdown companions, per the file-or-folder invariant in `../references/goal-driven-dev.md`. The goal index `.gdd/goal.md` is updated to point at it (citation omits `.md` so the file → folder upgrade is transparent). See `references/goal-template.md`.

## Assessing

When given an existing goal document, judge whether another agent can execute it **and** whether the handoff at the end will be contract-compliant.

- **ready** — outcome, contracts, scope, scenarios, decisions, **and Pickup** are all clear
- **almost ready** — small number of decisions missing, or Pickup has minor gaps (e.g. user role implicit but inferable)
- **not ready** — core product contract, scope, or acceptance is ambiguous, **or** Pickup is missing/empty (without Pickup, `/go` cannot honor the role contract — see `../references/goal-driven-dev.md` § Roles)

Lead with the readiness verdict. List missing decisions by section. Treat Pickup gaps with severity equal to scope or acceptance gaps.

## References

- `../references/goal-driven-dev.md` — methodology this skill implements
- `references/goal-template.md` — concrete goal document structure
- `references/draft-template.md` — draft brief structure
