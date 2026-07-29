---
name: gdd
description: Shape a goal from a backlog item through drafting, then refine into an executable goal document. Stages working artifacts under .tmp/gdd/ during shaping and asks the human where to place them as the final decision before promotion. Use when the human wants to create, refine, or assess a goal using the goal-driven development methodology.
---

# gdd

Shape goals from backlog candidates through human-agent discussion. The canonical layout lives under `.gdd/` (see `../references/goal-driven-dev.md`), but **where** an artifact belongs is a human decision — not assumed from cwd or repo count.

The methodology this skill implements is defined in `../references/goal-driven-dev.md`. Read it before operating if it is not already in context.

## Modes

The skill operates in one of three modes. The human signals the mode by intent; if ambiguous, ask before proceeding.

- **drafting** — test whether a backlog item is mature enough to become a goal
- **shaping** — refine a mature draft into an executable goal document
- **assessing** — review an existing goal document for execution readiness

## Behavior

Across all modes — note `gdd` operates under the **co-author contract** (see `../references/goal-driven-dev.md` § Roles): the human is an active participant in decisions, not a downstream consumer.

- Coaching, not authoring. Lead the human to a decision. Do not draft prose ahead of decisions.
- One decision at a time. Surface options, explain consequences, recommend a direction, let the human choose (see § Decision support).
- Stay at artifact level. Push implementation detail (commands, file paths, library choices) to `/go`.
- **Stage first, place last.** While shaping, write working artifacts under `.tmp/gdd/` (create the directory if needed). Do not promote to a permanent path until content is converged **and** the human has chosen placement (see § Staging and placement).

## Decision support

How to present each decision, in any mode. An option proposal carries the reasoning that matters at section level:

- where the framing takes the section, and its ROI / leverage
- how it constrains later Scope, Design, DoD, and Decisions
- the commitments, risks, and follow-on work it implies

When recommending a direction, state the basis: why it fits the current milestone, which signals make it stronger, and what boundary must hold after choosing it. Use the most concise shape that serves the decision — bullets, a short comparison, a direct recommendation note. If the human asks for decision support only, stay at option / consequence / recommendation level; no prose drafting.

### Intervention granularity

Bring to the human the decisions that affect: overall goal and release intent · product experience and mental model · milestone scope and explicit exclusions · public UX/DX contracts · source of truth and responsibility boundaries · acceptance scenarios and the acceptance bar · high-risk product or architecture tradeoffs.

Do not bring to the human during shaping — these belong to `/go` at execution time: implementation order · test runner and command details · file layout below module level · library choices within the accepted tech boundary · helper naming · small adapters and fallback mechanics.

## Staging and placement

Artifact location is a **load-bearing decision** — especially for cross-repo work where `.gdd/` may live in a repo, a service group, a workspace topic, or nowhere yet.

### While shaping (default)

- Write drafts and converged goal/backlog bodies to **`.tmp/gdd/`** under cwd.
- Use descriptive filenames: `goal-YYYYMMDD-slug.md`, `backlog-YYYYMMDD-slug.md`.
- Updating the staged file as sections converge is fine; tmp is disposable until promotion.
- If `.tmp/` already exists at workspace root and cwd is inside that workspace, prefer `<workspace>/.tmp/gdd/` — same intent, follows local convention.

### Placement is the **last** decision before promotion

After Outcome, Scope, DoD, Pickup, and Decisions are stable, **stop and ask** where the artifact should live permanently. Present options with tradeoffs; recommend one based on scope discovered during shaping. Do not pick silently.

Typical options (adapt to what you found in the tree):

| Target | When it fits |
|--------|----------------|
| `<repo>/.gdd/goals/…` or `backlogs/…` | Single-repo milestone; executing agent's cwd will be that repo |
| `<service-group>/.gdd/goals/…` | Cross-repo under one deploy/product boundary (a directory grouping the repos of one service or product) |
| `topics/<slug>/goal.md` (or `GDD.md`) | Cross-repo exploratory work, design memos, or scope spans repos/topics/refs |
| Custom path the human names | Monorepo layouts, vendored copies, or project-specific conventions |

For each option, state: who will run `/go` from where, whether an index file (`goal.md`, `backlog.md`) must be updated, and whether the path already exists.

**Only after the human confirms placement:** move (or copy) from `.tmp/gdd/` to the chosen path, apply the file-or-folder invariant, update any index, and report the final paths. If the human revises placement, adjust before treating the artifact as authoritative.

### When not to ask

- **Assessing** an existing goal at a known path — placement is already decided.
- The human **already specified** the destination path when asking to write ("put it in `topics/foo/GDD.md`"). Confirm briefly, then promote directly.

## Drafting

Drafting tests whether a backlog item is concrete enough to become a goal. The draft attempts a short specification. If the draft cannot be completed without speculation ("we'll figure it out during implementation"), the underlying problem is not yet surfaced; the item returns to backlog.

A draft minimally answers:

- The current friction or use case the item addresses
- The shape of a solution that would resolve it
- What would qualify it for promotion to a goal

A draft is mature when these three are stable and complete.

Output: stage as `.tmp/gdd/backlog-YYYYMMDD-slug.md` while drafting; after maturity + placement decision, promote to `.gdd/backlogs/backlog-YYYYMMDD-slug.md` with `status: drafted` in frontmatter. Upgrade to a folder (`backlog-YYYYMMDD-slug/backlog.md` + assets) when non-markdown companions are needed, per the file-or-folder invariant in `../references/goal-driven-dev.md`. See `references/draft-template.md`.

## Shaping

Shaping refines a mature draft into a goal document an implementation agent can execute against.

A goal document covers these dimensions. The discussion may visit them in any order the human finds natural.

- **Outcome** — what exists when the milestone is done
- **Motivation** — why now; what gets easier after
- **Scope** — what is in; what is explicitly deferred
- **Product Experience** — how the result feels; the mental model the user holds
- **Design** — visible surface (contracts, entrypoints, schemas) and architectural shape (responsibility boundaries, dataflow)
- **Definition of Done** — acceptance scenarios + hard gates
- **Pickup** — who picks this up (end-user role), the single pickup action, and the split between agent-scriptable staging and human-only steps that `/go` will honor at handoff.
- **Decisions** — `[resolved]` choices with reason; `[fact]` external constraints

### Eliciting Pickup

Pickup is the dimension `/go` reads to honor the role contract — sloppy Pickup produces friction-heavy handoffs no matter how clean the rest of the goal is. Walk it in this order:

1. **User role** — who is the human picking this up acting as? One line. Anchor it in the project's actual end-user shape, not a generic "developer".
2. **Pickup action** — what is the single thing they do to start verifying? If the human needs more than one action before the first observable behavior, push back: staging is incomplete.
3. **Staging required** — for each item, ask "could the agent conceivably do this in `/go`?" If yes → agent-scriptable. If genuinely no (credentials missing, GUI-only, irreversible) → human-only with reason. When in doubt, default to agent-scriptable — `/go` will defer at execution time and report what it tried, which is cheaper than over-pessimistic shaping here.

Decisions default to inline in the goal's Decisions section. Decisions that affect more than one goal are flagged as ref candidates and promoted to `.gdd/refs/` per the rules in `../references/goal-driven-dev.md`.

Output: stage as `.tmp/gdd/goal-YYYYMMDD-slug.md` while shaping; after Pickup + placement decision, promote to the human-chosen path (often `.gdd/goals/goal-YYYYMMDD-slug.md`). Upgrade to a folder (`goal-YYYYMMDD-slug/goal.md` + assets) when the goal carries mockups, screenshots, or other non-markdown companions, per the same file-or-folder invariant. When landing under `.gdd/`, update the goal index `.gdd/goal.md` (citation omits `.md` so the file → folder upgrade is transparent). See `references/goal-template.md`.

## Assessing

When given an existing goal document, judge whether another agent can execute it **and** whether the handoff at the end will be contract-compliant.

- **ready** — outcome, contracts, scope, scenarios, decisions, **and Pickup** are all clear
- **almost ready** — small number of decisions missing, or Pickup has minor gaps (e.g. user role implicit but inferable)
- **not ready** — core product contract, scope, or acceptance is ambiguous, **or** Pickup is missing/empty (without Pickup, `/go` cannot honor the role contract)

Lead with the readiness verdict. List missing decisions by section. Treat Pickup gaps with severity equal to scope or acceptance gaps.

## References

- `../references/goal-driven-dev.md` — methodology this skill implements
- `references/goal-template.md` — concrete goal document structure
- `references/draft-template.md` — draft brief structure
