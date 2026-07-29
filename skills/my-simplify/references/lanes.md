# Review lane checklists

Detailed per-lane prompts for the `my-simplify` skill. Load when a lens needs prompting — the lane names and postures in SKILL.md are usually enough.

## Reuse Lane

Find duplicated logic and unnecessary divergence:

- Repeated parsing, validation, formatting, fetch, or state-update logic.
- Local helpers that duplicate existing project utilities.
- Similar branches that can share a clearer path.
- Abstractions that remove real duplication while keeping call sites readable.

## Quality Lane

Find clarity and correctness issues:

- Hard-to-follow control flow, nested conditionals, unclear names, dead branches.
- Brittle types, optional handling, error paths, and boundary cases.
- Tests that miss changed behavior or assert implementation details.
- UI state that can be represented with fewer states or derived values.

## Efficiency Lane

Find avoidable runtime, memory, and I/O cost:

- Repeated expensive work inside loops, renders, effects, or request handlers.
- Unbounded data loading, excessive cloning, repeated serialization, N+1 calls.
- Cache or memoization opportunities with clear invalidation.
- Slow tests caused by heavy setup where a lighter fixture gives the same signal.
