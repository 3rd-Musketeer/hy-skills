---
name: goal-shaper
description: Shape an agent-executable milestone goal document through section-by-section human-agent discussion. Use when the user wants to create, refine, or assess a GOAL.md, roadmap milestone, product/engineering goal, execution brief, or agent task spec before implementation.
---

# Goal Shaper

Help the user turn an ambiguous product or engineering intention into a clear goal document that an implementation agent can execute.

This is a coaching skill. Bring judgment. For each section, help the user choose a direction before drafting prose. Offer a small set of plausible framings, explain their decision consequences, recommend a direction, and let the user select or revise.

## Operating Rules

- Work section by section. Do not jump ahead.
- Switch sections only after the user confirms the current section direction.
- Keep the discussion at goal, product experience, contracts, scope, acceptance, and decision policy.
- Push low-level commands, CI details, exact files, library choices, class names, and helper names into the later implementation phase unless the user asks for them.
- When the user is exploring, stay in discussion mode. Write files only after the user explicitly asks.
- If assessing an existing goal doc, lead with readiness, missing decisions, and friction.

## Decision Support Before Drafting

Before drafting section prose, make the choice easy for the user. Option proposals should convey the reasoning that matters for a section-level decision:

- where the framing takes the section
- the ROI or leverage of choosing it
- how it affects later Scope, Design, DoD, and Decisions
- the commitments, risks, and follow-on work it implies
- the project state where it fits best

When recommending a direction, explain the basis: why it fits the current milestone, which signals make it stronger, and what boundary the goal must preserve after choosing it.

Use whatever concise shape best serves the decision: bullets, short comparisons, small tables, or direct recommendation notes. Draft paragraphs only after the user confirms the direction or explicitly asks for prose. If the user says they want decision support only, stay at the option, consequence, ROI, and recommendation level.

## Human Intervention Granularity

Ask the user for decisions that affect:

- overall goal and release intent
- product experience and mental model
- milestone scope and explicit exclusions
- public UX or DX contract
- source of truth and responsibility boundaries
- verifiable scenarios and acceptance bar
- high-risk product or architecture tradeoffs

Let the agent decide and record:

- implementation order
- test runner and command details
- exact file layout below module/package level
- library choices within the accepted tech boundary
- helper/class names
- small adapters and fallback mechanics

If a blocker appears during implementation, the implementation agent may run a small A/B probe or choose a direction. Record the outcome in `Decisions` as `[resolved]` with reason, evidence, and tradeoff. If the decision must wait, it belongs in BACKLOG.md instead, not back in the goal file.

## Workflow

### 1. Establish Mode

Determine whether the user wants to create, revise, or assess a goal document. If a repo has `GOAL.md`, `ROADMAP.md`, or related docs, read only the relevant files first.

### 2. Outcome

Clarify what should exist when this milestone is done. Focus on the target state, not the motivation.

Offer example outcome types without treating them as a fixed taxonomy: public release, internal dev version, prototype, research spike, migration milestone, etc.

### 3. Motivation

Capture the current status, friction, and why now. Why this milestone is worth doing, and what gets easier after it is complete.

For refactor or migration work, focus on the pain: naming friction, hidden coupling, unclear source of truth, awkward UX/DX, repeated implementation blockers, or a product opportunity trapped inside an internal module.

### 4. Scope

Define what is in the milestone and what is explicitly deferred. Treat non-goals as first-class scope control. Keep Scope as a pure boundary — defer items do not need backlog links here; surrounding artifacts carry that.

### 5. Product Experience (PX) & Mental Model

Clarify how the product should feel to use, how users should understand it, what reference product or workflow anchors it, and what should be obvious by default.

### 6. Design

Use this as an umbrella for the visible and architectural shape. Keep the level of detail appropriate to the goal.

Suggested lanes:

- Surface: all external contracts — entrypoints, defaults, visible states, CLI/API signatures, config, schemas, artifacts, lifecycle. Covers both user-facing UX and agent/developer-facing DX.
- Architecture: responsibility separation, source of truth, dataflow, tech stack, and high-level code structure.

Sub-sections are optional; use what the goal needs. Code structure belongs under Architecture and should stay at module/package responsibility level. Avoid file-level plans unless explicitly requested.

### 7. Definition of Done

DoD is the verification section. Two sub-lanes:

- Acceptance Scenarios: 2-3 production-facing scenarios with setup, expected flow, and Pass Criteria. Scenarios validate end-to-end behavior, not only intermediate implementation state.
- Hard Gates: non-scenario commitments — explicit exclusions, key CLI/API existence, documentation responsibilities, release gates.

Avoid turning DoD into a field list or flag checklist that restates code or schemas.

### 8. Decisions

Record decisions made for this milestone. Only two states:

- `[resolved]` — a choice was made between alternatives, with reason and (when non-trivial) consequences.
- `[fact]` — an external constraint or environment fact that shapes this design.

Do not introduce `[open]`. Anything undecided belongs in BACKLOG.md, not in the goal file. When writing Decisions:

- Inline short entries directly in this section with `Reason:` and optional `Consequences:`.
- Extract into `adrs/adr-NNNN-slug.md` (or a folder for long evidence) when the decision has multiple alternatives to compare, benchmarks to preserve, or consequences that span more than one line. The Decisions entry then points to the ADR.

## Output Shape

When drafting a goal document, use this structure unless the user asks for a different one:

```md
---
title: <slug>
status: planned | in-progress | done | parked
desc: <one line>
created_at: YYYY-MM-DD
---

# <Milestone> Goal: <Short outcome>

## Outcome

## Motivation

## Scope

## Product Experience (PX) & Mental Model

## Design
### Surface
### Architecture

## Definition of Done
### Acceptance Scenarios
### Hard Gates

## Decisions
```

See `references/goal-template.md` when the user asks for a concrete template or when writing a new goal document from scratch.

## Project Management Convention

Default layout for a project using this system:

```text
GOAL.md
goals/
  goal-YYYYMMDD-NN-slug.md

BACKLOG.md
backlog/
  backlog-YYYYMMDD-slug.md

adrs/
  adr-NNNN-slug.md
```

- `GOAL.md`: project-level index of milestones grouped by status (active, planned, done, parked). One line per entry linking to the goal record.
- `goals/`: milestone goal records, one file per milestone, named `goal-YYYYMMDD-NN-slug.md` where `YYYYMMDD` is the creation date and `NN` is a 2-digit counter for that day.
- `BACKLOG.md`: lightweight queue of undecided items, future work, and friction observed during execution.
- `backlog/`: expanded backlog briefs for items that need real discussion before promotion.
- `adrs/`: heavy decisions with alternatives, evidence, and consequences.

For small projects a single top-level `GOAL.md` with an inline `## Decisions` section may be enough — introduce `goals/`, `BACKLOG.md`, and `adrs/` only when the project grows past one milestone or one decision.

## Surrounding Artifacts

The goal document is the center. Two surrounding artifacts serve it. Keep them lightweight and only create them when needed.

### BACKLOG.md

All undecided items, future work, and friction observed during execution live here, not inside goal files.

- One line per entry in `BACKLOG.md`: `- <slug> — <one-line why>`
- Create `backlog/backlog-YYYYMMDD-slug.md` only when an item needs real discussion before it can be promoted.
- When a goal finishes, derived next work that the user wants to remember goes to BACKLOG.md.

The brief template (Shape Up pitch, trimmed):

```md
# <slug>

**Problem:** observed friction, use case, or opportunity that triggered this.
**Appetite:** quick | normal | large — how much effort we'd commit if promoted. A constraint, not an estimate.
**Sketch:** rough shape if any. Skip when too early.
**Rabbit holes:** known design risks, traps, or open questions to avoid.
**Promotion criteria:** what would move this into a goal.
```

`Appetite` is the Shape Up idea of time-as-budget: pick the bucket first, then shape a solution that fits. At promotion the appetite turns into the goal's Scope boundary and is no longer carried forward. If you cannot yet name an appetite, the item is probably still a one-line BACKLOG entry, not a brief.

### adrs/

Decisions default to inline in the goal's `## Decisions` section. Extract to a standalone ADR only when one of these holds:

- There are multiple alternatives worth comparing.
- Benchmarks or experiment data need to be preserved.
- Consequences span more than one line.
- The decision may be superseded later and needs a traceable record.

Naming: `adrs/adr-NNNN-slug.md` for short; `adrs/adr-NNNN-slug/README.md` with attachments for long.

The ADR template (Nygard, minimal):

```md
# ADR-NNNN: <slug>

**Status:** proposed | accepted | superseded by adr-MMMM
**Context:** the forces at play — constraints, prior decisions, observations.
**Decision:** the choice taken, stated in active voice.
**Consequences:** what becomes easier, what becomes harder, what is now committed to.
```

The goal's Decisions entry references the ADR by path: `- [resolved] <title> — see adrs/adr-NNNN-slug.md`.

## Readiness Assessment

When reviewing an existing goal document, score whether another agent can execute it:

- Ready: clear outcome, contracts, scope, scenarios, and DoD.
- Almost ready: missing a small number of decisions.
- Not ready: core product contract, scope, or acceptance remains ambiguous.

Lead with the readiness judgment, then list the missing decisions by section.
