# Review lane checklists

Detailed per-lane prompts for the `refactor` skill. Load when a lens needs prompting — the lane names and postures in SKILL.md are usually enough.

## Maintainability Lane

Check local reasoning cost:

- large modules or functions with mixed responsibilities
- hidden coupling through globals, registries, side effects, or environment reads
- branching that obscures the common path
- tests that are hard to set up because the system is too coupled
- small helpers that add indirection without removing complexity

## Naming Semantics Lane

Check names against behavior:

- misleading names
- stale names after migration or rename
- overloaded terms
- implementation names leaked into public API
- hard-to-name concepts that indicate boundary or contract trouble

## Boundary & Contract Lane

Check:

- public contract versus implementation detail
- ownership of data, policy, and lifecycle
- dependency direction between layers
- adapter/plugin imports crossing into storage, UI, service, or concrete implementation
- compatibility shim leakage into new code paths

## Conceptual Integrity Lane

Check for architecture coherence:

- duplicate source of truth
- role/package/lifecycle conflation
- architecture residue from old designs
- concepts that only make sense through another concept
- repeated explanations needed to distinguish two core concepts

## Lifecycle Lane

Trace important objects through:

```text
create -> validate -> store -> update -> fail/retry -> delete -> observe
```

Each stage should have a clear owner. State transitions should not be scattered across unrelated layers.

## Efficiency Lane

Check only obvious and current costs:

- N+1 queries or calls in common paths
- repeated serialization or parsing
- expensive import side effects
- unbounded loads
- slow tests with avoidable setup
