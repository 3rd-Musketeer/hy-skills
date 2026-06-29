# Goal Document Template

Use as a flexible template. Match depth to the milestone; do not fill every prompt mechanically.

```md
---
title: <slug>
status: planned
desc: <one line>
created_at: YYYY-MM-DD
---

# <Milestone> Goal: <Short outcome>

## Outcome

What will be true when this milestone is done?

Keep this focused on the target state. Motivation goes in the next section.

## Motivation

What is the current status?
What friction or opportunity makes this milestone worth doing now?
What gets easier after this milestone is complete?

## Scope

What is in this milestone?
What is explicitly deferred?

Keep Scope as a pure boundary. Undecided items and future work belong in `.gdd/backlog.md`, not here.

## Product Experience (PX) & Mental Model

What should it feel like to use?
What mental model should users have?
What existing product or workflow anchors the experience?
What should be obvious by default?

## Design

### Surface

All external contracts — entrypoints, defaults, visible states, CLI/API signatures, config, schema, artifacts, lifecycle. Covers both user-facing UX and agent/developer-facing DX.

### Architecture

Responsibility separation, source of truth, dataflow, tech stack, and high-level code structure.

Sub-sections are optional. Use only what the goal needs.

## Definition of Done

### Acceptance Scenarios

2-3 production-facing scenarios. Each scenario includes setup, expected flow, and pass criteria.

### Hard Gates

Non-scenario commitments: explicit exclusions, key CLI/API existence, documentation responsibilities, release gates.

Avoid restating field lists or flag checklists that already live in code or schemas.

## Pickup

What the human needs in order to verify this milestone as the end user — not as a reviewer of the implementation. Required: `/go` reads this to know what to stage before handing back. See `../../references/goal-driven-dev.md` § Roles.

### User role

Who is the human picking this up acting as? One line. Anchor it in the project's actual end-user shape, not a generic "developer".

Examples (the specific shape depends on the project):
- "macOS developer with the browser extension reloaded against prod, signed in, has used the core feature before."
- "Authenticated user on the production web app with a populated account."
- "CLI user with the dev build installed and a sample project initialized."

### Pickup action

The single action the human takes to begin verifying. After `/go` finishes, everything before this action is the agent's responsibility.

Examples:
- "Reload the extension and trigger the highlighted feature on any article."
- "Refresh the running web app and navigate to the new route."
- "Run the CLI's new subcommand in any test project."

If the human needs more than one action before the first observable behavior, the staging is incomplete — list the gap below.

### Staging required

What must be true before the pickup action works. **List at the category level — what must be true, not which commands to run.** `/go` picks the commands at execution time.

Broken into:

- **Agent-scriptable** (agent will do these in `/go`): builds, migrations against accessible environments, dev-server bring-up, fixtures, CLI invocations with available credentials.
- **Human-only** (agent will name these explicitly with reason): credential-gated actions agent has no access to, GUI-only flows, irreversible decisions, anything the agent shouldn't take without consent.

The split is the contract `/go` honors. Items in the wrong bucket are how friction sneaks in. When in doubt, default to agent-scriptable — `/go` will defer at execution time if it actually hits a tool-reach limit, and report what it tried.

## Decisions

Record decisions made for this milestone. Two states:

- `[resolved] <title>` — a choice between alternatives. Follow with `Reason:` and optional `Consequences:`.
- `[fact] <title>` — an external constraint or environment fact that shapes the design. Follow with `Consequences:` where relevant.

Do not use `[open]`. Anything undecided belongs in `.gdd/backlog.md`.

Examples:

- [resolved] search --context default = 10
  Reason: 3 too fragmented for schedule-retrieval scenarios; 20 costs ~6k tokens per hit; 10 lands at 2.4k-3.8k.
  Consequences: long sessions with --around may still exceed the context window.

- [fact] SQLite 3.53 supports FTS5 trigram on this machine.
  Consequences: trigram + BM25 is available; re-verify when deploying to a different environment.

A decision that needs to be cited from more than one goal is promoted to `.gdd/refs/`. The Decisions entry then points at the ref:

- [resolved] FTS5 trigram with LIKE fallback — see .gdd/refs/2026-05-12-fts-vs-like.md
```
