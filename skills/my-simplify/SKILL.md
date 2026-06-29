---
name: my-simplify
description: Review recently changed code for simplification opportunities, then apply small high-confidence cleanup fixes. Use when native Simplify is unavailable, or when the user asks to simplify, clean up, reduce complexity, improve code reuse, improve quality, or improve efficiency after a code change.
argument-hint: "[focus]"
---

# my-simplify

Review recent code changes, identify concrete simplification opportunities, and apply focused fixes.

`$ARGUMENTS` is the user's focus, such as memory efficiency, duplication, readability, API shape, test simplification, or frontend state complexity.

## Scope

Default scope is recently changed files:

1. Inspect `git status --short`.
2. Inspect `git diff --stat` and `git diff`.
3. Include nearby files only when needed to understand contracts, callers, or tests.
4. Ask for scope only when there is no git repository and the user gave no files, directories, or focus.

Preserve unrelated user edits. Keep changes small and directly tied to simplification.

## Review Lanes

Run these lanes in parallel when the platform supports subagents. Otherwise, perform them sequentially.

### Reuse Lane

Find duplicated logic and unnecessary divergence:

- Repeated parsing, validation, formatting, fetch, or state-update logic.
- Local helpers that duplicate existing project utilities.
- Similar branches that can share a clearer path.
- Abstractions that remove real duplication while keeping call sites readable.

Prefer local, obvious reuse. Avoid broad architecture changes.

### Quality Lane

Find clarity and correctness issues:

- Hard-to-follow control flow, nested conditionals, unclear names, dead branches.
- Brittle types, optional handling, error paths, and boundary cases.
- Tests that miss changed behavior or assert implementation details.
- UI state that can be represented with fewer states or derived values.

Prefer direct code, semantic names, and tests that pin behavior.

### Efficiency Lane

Find avoidable runtime, memory, and I/O cost:

- Repeated expensive work inside loops, renders, effects, or request handlers.
- Unbounded data loading, excessive cloning, repeated serialization, N+1 calls.
- Cache or memoization opportunities with clear invalidation.
- Slow tests caused by heavy setup where a lighter fixture gives the same signal.

Prefer measurable wins and simple data flow.

## Triage

Report and fix only findings that satisfy all conditions:

- The issue is visible in the current diff or directly caused by it.
- The fix is smaller or clearer than the existing code.
- The behavior is preserved or explicitly improved.
- The risk is low enough to validate in this session.

Defer broad refactors, speculative abstractions, style-only churn, and changes outside the requested focus.

## Implementation

1. State the chosen scope and focus in one short update.
2. Gather context with fast search/read tools.
3. Produce a compact finding list grouped by lane.
4. Select the fixes with the best impact-to-risk ratio.
5. Edit files.
6. Run the narrowest meaningful validation: targeted tests, typecheck, lint, build, or a focused manual check.
7. Report changed files, fixes applied, and validation result.

## Output Style

Lead with the result. Keep the final response short:

- Files changed.
- Simplifications applied.
- Validation run and outcome.
- Remaining deferred items only when they are important.

For review-only use, lead with findings ordered by severity and include file/line references.
