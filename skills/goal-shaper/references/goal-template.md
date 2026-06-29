# Goal Document Template

Use this as a flexible template. Do not fill every prompt mechanically. Match depth to the milestone.

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

Example outcome types: public release, internal dev version, prototype, research spike, migration milestone, etc.

## Motivation

What is the current status?
What friction or opportunity makes this milestone worth doing now?
What gets easier after this milestone is complete?

## Scope

What is in this milestone?
What is explicitly deferred?

Keep Scope as a pure boundary. Undecided items and future work belong in BACKLOG.md, not here.

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

2-3 production-facing scenarios. Each scenario includes setup, expected flow, and Pass Criteria.

### Hard Gates

Non-scenario commitments: explicit exclusions, key CLI/API existence, documentation responsibilities, release gates.

Avoid restating field lists or flag checklists that already live in code or schemas.

## Decisions

Record decisions made for this milestone. Two states:

- `[resolved] <title>` — a choice between alternatives. Follow with `Reason:` and optional `Consequences:`.
- `[fact] <title>` — an external constraint or environment fact that shapes the design. Follow with `Consequences:` where relevant.

Do not use `[open]`. Anything undecided belongs in BACKLOG.md.

Examples:

- [resolved] search --context default = 10
  Reason: 3 too fragmented for schedule-retrieval scenarios; 20 costs ~6k tokens per hit; 10 lands at 2.4k-3.8k.
  Consequences: long sessions with --around may still exceed the context window.

- [fact] SQLite 3.53 supports FTS5 trigram on this machine.
  Consequences: trigram + BM25 is available; re-verify when deploying to a different environment.

When a decision has multiple alternatives worth comparing, benchmarks to preserve, or consequences that span more than one line, extract it to `adrs/adr-NNNN-slug.md` (short) or `adrs/adr-NNNN-slug/` (with attachments). The entry in this section then references the ADR:

- [resolved] FTS5 trigram with LIKE fallback — see adrs/adr-0007-fts-vs-like.md
```
