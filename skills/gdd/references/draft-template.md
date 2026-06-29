# Draft Template

A draft tests whether a backlog item is concrete enough to be promoted to a goal. Keep it short. If you cannot complete the three sections without speculation, the item is not yet mature; it returns to backlog.

```md
---
title: <slug>
status: drafted
created_at: YYYY-MM-DD
appetite: quick | normal | large
---

# Draft: <Short title>

## Friction

The observed friction, use case, or opportunity that triggered this item. What is currently painful or missing?

## Solution shape

The rough shape of a solution that would resolve the friction. Not an implementation plan — the level of detail of a Shape Up sketch.

## Promotion criteria

What would move this from a draft into a goal? Concrete signals that the underlying problem is now ready to commit to.
```

`appetite` follows Shape Up: `quick | normal | large` is a constraint on effort, not an estimate. Pick the bucket first; the solution shape must fit. If you cannot pick an appetite, the item is probably still a one-line entry in `.gdd/backlog.md`, not a draft.
