# Story Tab Conventions (earned upgrade)

The Story tab is for **auto-playing walkthroughs of a specific use case** — a continuous one-take where state visibly accumulates from beginning to end. Used for video recording or live stakeholder demos.

**This is the earned third tab.** Most prototype boards don't need it. Read this entire file before adding it; if you adopt it, follow the implementation rules below to avoid the cost overruns documented from a real Shape A board.

## Story tab vs Prototype tab — keep them separate

| Aspect | Prototype tab (or Workbench) | Story tab |
|---|---|---|
| User control | Free, click-anywhere, navigate at own pace | Auto-advances through scripted steps |
| State model | Local `useState` per scene, scenes independent | Global store (Zustand), state accumulates |
| Mount lifecycle | Each scene mounts/unmounts on navigation | One long-lived component, "steps" are sub-views |
| Use case | Validate "interaction feels right" | Record video / live demo of a specific narrative |

Mixing the two is the most common Story tab mistake. Don't put auto-play into Prototype scenes; don't put click-anywhere freedom into Story steps.

## When Story tab is earned

Add it when **all three** are true:

1. You have a specific narrative use case to tell start-to-finish (e.g. "user does X, agent does Y, result is Z").
2. State must visibly accumulate (Step 7 must show what user typed in Step 3).
3. You're recording video, doing a live demo, or need stakeholders to experience the flow without manual navigation.

If only the first two are true, the Prototype tab covers it (just navigate manually).

## When Story tab is NOT earned

- "It would be nice to see what the next scene looks like with this state" — just navigate the Prototype tab
- "I want a cleaner story for the demo deck" — use video editing
- "Let's add it for completeness" — KISS
- "We had it in the last board" — that was a specific recording requirement, not a defaults pattern

## What it costs

A Story tab is a **major complexity upgrade**. One Shape A board's Story-equivalent (the `demo/` subsystem) grew to **~2000 lines** of orchestration code:

- 800-line `useCase.tsx` god component
- 600-line `runtimePlan.ts` event scheduler
- 400-line auxiliary files (chat items, profiles, sections)

That cost was real but largely **avoidable**. The lessons below are how to avoid repeating it.

## Implementation rules (if you build one)

### Rule 1 · Per-step files from day one

Do **not** start with one component that grows. Each step gets its own file: `views/story/steps/Step<NN><Name>.tsx`. The orchestrating component is a router (~50 lines), not a god component.

### Rule 2 · Zustand store from day one

Story tab state never fits in `useState` because it accumulates across long-lived component lifetime + multiple sub-components. Use Zustand from the very first step. See `state-management.md` § Stage 2 and `examples/ZustandStore.ts` for the template.

### Rule 3 · Steps are declarative, not procedural

The orchestrator drives a **declarative step list** (which step is current, transitions on `next` action). It does **not** contain a procedural script ("do A, then wait, then do B"). Procedural orchestration was that board's biggest cost — every step change required touching 6 files.

### Rule 4 · Latency / playback runtime is OPT-IN, not default

Manual user-driven advance (press → to go to next step) covers ~90% of Story tab needs. Automated playback with realistic latency simulation is a **separate, project-specific layer** to add only when video recording explicitly requires it.

That board's latency runtime was an agent-system requirement (making agent thinking feel real for video) that got generalized into a "demo subsystem" feature. That generalization was a mistake. Keep latency simulation scoped to the project that needs it.

### Rule 5 · Reset and rewind

Provide a `reset` action that clears store state and returns to Step 0. Provide keyboard shortcuts: `→` next, `←` previous, `R` reset. The user (and the agent verifying scenes) needs cheap restart.

## File layout (when you add it)

```
src/
└── views/
    └── story/
        ├── registry.ts          one entry per story (each story = a use case narrative)
        ├── store.ts             Zustand store, devtools middleware
        ├── StoryView.tsx        ~80-line orchestrator: reads current step, renders matching component
        └── steps/
            └── Step<NN><Name>.tsx
```

Story is a third top-level view, alongside the existing ones. If you have multiple use cases to demo, each gets its own story registry entry with its own step list.
