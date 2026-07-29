---
name: refactor
description: Audit code for maintainability, naming accuracy, boundary clarity, architecture coherence, and refactor ROI. Use when the user asks to refactor, review architecture/code quality, reduce conceptual friction, evaluate whether a rewrite is warranted, or inspect a changed or unfamiliar codebase for maintainability problems.
---

# Refactor

Run a friction-driven refactor audit. The goal is maintainability and conceptual integrity: names, boundaries, ownership, dependency direction, lifecycle, and contracts should make the system easier to understand and change.

Default posture: apply small safe refactors when evidence is clear; propose bounded rewrites or reshapes when local cleanup cannot restore coherence.

`$ARGUMENTS` may name a scope or focus, such as API boundary, naming, architecture coherence, tests, frontend state, package layout, or rewrite feasibility.

## Scope

1. Inspect `git status --short` and `git diff --stat`.
2. Inspect the current diff first. Include nearby docs, public contracts, entrypoints, callers, tests, and directory names only as needed.
3. If there is no diff, inspect the requested module through docs, public API, file layout, dependency graph, and main workflows.
4. Preserve unrelated user edits. Ask only when scope is impossible to infer.

## Friction Log

Record friction while reading before deciding fixes:

- a module, type, or function takes a long explanation to describe
- a name does not match behavior, ownership, or lifecycle
- two concepts overlap or require repeated "X versus Y" explanation
- a call path feels indirect for the behavior it performs
- public contract imports implementation detail
- state transition owner is unclear
- the same fact or policy appears in multiple places
- tests know too much about internals
- a compatibility shim appears in the main path

Treat friction as evidence, not as a final judgment. Explain the concrete code signal.

## Concept Map

For the main concepts in scope, answer:

- What is it?
- Who owns it?
- Who creates it?
- Who mutates it?
- Who reads it?
- What contract exposes it?
- What implementation backs it?

Flag concepts that are hard to name, need long explanations, or duplicate another concept's role.

## Review Lanes

Seven lenses. Run sequentially, or in parallel when subagents are available. Per-lane checklists live in `references/lanes.md` — load when a lens needs prompting, not by default.

- **Maintainability** — local reasoning cost. Prefer deletion, direct code, smaller ownership boundaries, and easier tests.
- **Naming semantics** — names versus behavior, ownership, lifecycle. Rename only when it improves reading and the blast radius is manageable.
- **Boundary & contract** — public contract versus implementation detail; dependency direction; ownership of data, policy, lifecycle. Clarify boundaries before adding abstractions.
- **Conceptual integrity** — duplicate sources of truth, role conflation, architecture residue. This lane may produce a proposal instead of an immediate patch.
- **Lifecycle** — trace important objects create → observe; each stage owned, transitions not scattered across unrelated layers.
- **Efficiency** — only obvious, current costs. Optimize when the signal is clear and validation is cheap.
- **Scope discipline** — reject refactors driven only by future possibility. Evidence comes from code, tests, public API, docs, recent implementation friction, or known near-term goals. No generic layers unless they remove real complexity now.

## Triage

Classify each finding:

| Class | Meaning | Action |
|---|---|---|
| Fix now | Small diff, clear friction, low risk, easy validation | Implement |
| Propose | Structural issue, larger blast radius, meaningful ROI | Write a bounded plan |
| Defer | Real issue, blocked by product decision or later feature | Record briefly |
| Ignore | Aesthetic, speculative, or low-value | Drop |

Score with: friction severity · correctness risk · maintainability gain · leverage for current known goals · change size · validation confidence.

## Rewrite Gate

Propose a rewrite or larger reshape when at least two are true:

- core concepts overlap and cannot be renamed cleanly
- ownership or source of truth is duplicated across layers
- dependency direction is inverted
- local fixes add shims, branches, or special cases
- tests require internal knowledge to verify public behavior
- new work repeatedly reopens the same boundary problem

Rewrite proposals must include: evidence from code · target boundary · public contract changes · migration path · validation plan · risk and rollback story · minimum viable rewrite scope.

Do not execute large rewrites without explicit user authorization.

## Implementation

For fix-now items:

1. State scope and focus in one short update.
2. Gather context with fast search/read tools.
3. Report a compact finding list grouped by lane.
4. Apply only the best impact-to-risk fixes.
5. Keep edits narrow and behavior-preserving unless explicitly improving a contract.
6. Prefer deletion, rename, import cleanup, ownership movement, and contract tightening.
7. Avoid broad formatting churn.

## Validation

Run the narrowest meaningful checks:

- targeted unit tests for touched behavior
- typecheck or lint for touched language
- API contract tests for public surface changes
- frontend build when API types or UI changed
- E2E smoke when user flow, contract, or runtime wiring changed

## Output

Lead with the result:

- files changed
- refactors applied
- validation run and outcome
- proposed rewrites or deferred items with ROI reason

For review-only use, lead with findings ordered by severity and include file/line references.
