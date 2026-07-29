# State Management

Two related decisions, often confused:

1. **Where state lives** — in-memory, localStorage, URL, etc. (§ Where state lives)
2. **What manages it** — `useState`, `useReducer`, Zustand, XState. (§ The progression)

Default to in-memory `useState`. Upgrade either dimension only when specific pain appears.

---

## Where state lives

| Layer | Use for | Survives |
|---|---|---|
| `useState` / `useReducer` (in-memory) | almost everything | component lifetime |
| `useContext` (in-memory, shared) | theme, locale, current user — values multiple distant components read | component tree mount |
| **localStorage** (via Provider effect) | user preferences (theme choice, panel-open state, last-selected matter) — anything you want recovered on reload | reload, browser restart |
| **sessionStorage** | rare; mostly unused | tab close |
| **URL hash** (`#/?key=value`) | view routing (which scene / which tab) | reload, sharing a link |
| IndexedDB | basically never; you're not building offline-first | reload |

**Default for theme persistence**: localStorage (the user comes back to their last config). Don't add URL hash persistence preemptively — the "shareable URL" feature sounds appealing but is YAGNI for boards used as local design surfaces. Add hash persistence only when you have a real "I need to send a teammate the exact frame I'm looking at" workflow.

**Default for routing**: URL hash. Hash routing for `which view / which scene` is unavoidable; that's `parseHash` in `App.tsx`. This is separate from theme state.

If you find yourself writing both layers (theme in hash AND in localStorage), pick one as canonical:

- **Hash priority** — if the URL has values, use them; otherwise fall back to localStorage. Right when sharing is the primary use case.
- **localStorage priority** — always use localStorage; ignore hash. Right when local debugging is the only use case.

Don't write both as a "smart merge". It's almost always confusing.

---

## The progression

```
useState  →  Zustand (+ devtools)  →  XState
   90%             ~10%                  rare
```

Most prototype boards live their entire life in the first column. One fully-scripted Shape A board only needed Zustand because it grew a Story tab with one-take walkthrough — and even there XState would have been overreach.

## Stage 1 · useState (default)

### When it works

- Each scene owns its own state, scenes don't share state (Shape A).
- Or: shared state is internal to one workbench, lifted to the view root (Shape B).
- A single component has < 10 useState hooks.
- State doesn't need to survive component unmount (tab switch, scene navigation).
- No time-based / parallel / barrier orchestration logic.

This covers most variants, all standard scenes, and the entire MVP shape.

### Patterns to use

**Group related state with a small local reducer when the count grows:**

```tsx
type Action = { type: "submit"; text: string } | { type: "reset" };
type State = { draft: string; submitted: string | null; phase: "idle" | "sent" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "submit": return { ...s, submitted: a.text, phase: "sent" };
    case "reset": return { draft: "", submitted: null, phase: "idle" };
  }
}

const [state, dispatch] = useReducer(reducer, { draft: "", submitted: null, phase: "idle" });
```

A `useReducer` is the **last stop before Zustand**. If you find yourself needing to share the reducer across multiple components, that's the upgrade signal.

**Discriminated unions for multi-step scene state:**

```tsx
type Step =
  | { kind: "intro" }
  | { kind: "typing"; draft: string }
  | { kind: "submitted"; text: string; respondedAt: number | null };

const [step, setStep] = useState<Step>({ kind: "intro" });
```

This is often clearer than 3 separate booleans.

### Context for shared static-ish values

`useContext` is fine for theme / locale / current user. It's not a substitute for shared mutable state across many subscribers (see § Why this progression and not React Context below).

If you have 2–3 distinct concerns to share, prefer 2–3 small Contexts over one big one — coarse-grained Context re-renders all consumers on any change.

### Anti-patterns at this stage

- ❌ Reaching for Context "to avoid prop drilling" when you have one parent and one child. Just pass the prop.
- ❌ A `useReducer` with > 8 actions. Probably needs decomposition or a store upgrade.
- ❌ A global `let counter = 0` outside a component "because it's a prototype". Use `useState` — it's not slower.

## Stage 2 · Zustand (earned)

### When to upgrade

Any one of:

- A single scene component crosses ~10 useState hooks.
- A Story tab (linear walkthrough) is being added — Zustand is the default for Story state.
- State must survive across tab switches or scene navigation.
- Multiple components 2+ levels apart need to read/write the same state.

You don't upgrade because "it's nicer". You upgrade when the pain is concrete.

### How to add cleanly

Wrap your store factory with `devtools` middleware — always. It's free, gives you Redux DevTools time-travel, and is a no-op in production when the extension isn't installed.

For a copy-ready store template, see `examples/ZustandStore.ts`.

### Selector hygiene

Subscribe narrowly: `useStore((s) => s.step)`, not `useStore()`. The selector form re-renders only when its returned slice changes; the bare form re-renders on every state change.

### When NOT to upgrade

- One component has 11 useState hooks but they're all semantically related and only that component uses them. Try `useReducer` first.
- A scene "would be nicer with a store" but actually works fine as `useState`. KISS.
- Tempted to put scene-local interaction state into the store "because it's there". The store is for state with cross-component or cross-mount lifetime needs.

## Stage 3 · XState (rare)

### When to consider

You tried scaling the Zustand store to time-based or parallel orchestration logic and the code became hard to read. Concrete signals:

- The store has 5+ `setTimeout` / `setInterval` calls coordinating a flow.
- You're hand-rolling a "wait for all of A, B, C to finish then proceed to D" barrier.
- State transitions have implicit guards ("if step is X and condition Y, then Z") that keep being violated by new code paths.
- You want to visualize the flow and reason about reachability.

### What XState gives you

- States, transitions, and guards are first-class values, not implicit in code.
- `after`, `invoke`, parallel states are language primitives — no hand-rolled scheduler.
- Stately Visualizer / Studio renders your machine as a clickable flow diagram.
- Time-travel and replay are richer than Zustand devtools.
- Illegal state transitions are statically prevented.

### What XState costs

- **Steep learning curve**. Actor model, machine schemas, `assign` actions, `invoke` are not intuitive on day one.
- **Verbose**. A simple flow that's 10 lines in Zustand can be 40 lines in XState.
- **Viral**. Once a machine owns a flow, satellite components tend to absorb XState idioms. Mixing XState + ad-hoc state in the same surface is worse than committing fully.

### When NOT to add XState

- "It would let me visualize the flow." Visualization is great but not enough alone — write the flow as a markdown sequence diagram instead.
- "Zustand felt a bit messy." Refactor the Zustand store first; XState's verbosity is not a fix for messy thinking.
- "I want to learn it." Not a reason to add a tool to a real project.

If you do add it, scope it strictly: **only the orchestration machine uses XState**. Scenes still use useState; shared store state still uses Zustand. XState is for the flow-of-time logic only.

## Why this progression and not React Context

React Context is sometimes proposed as a Zustand alternative. Two specific problems:

1. **Coarse re-renders**: any consumer of a Context re-renders on any value change. Workarounds (split Contexts, useMemo, useContextSelector) replicate Zustand's selector hygiene at higher cost.
2. **No devtools**: no time-travel, no diff, no event log. For prototype debugging this is a major gap.

Context is the right tool for **theme, locale, current-user** — values that change rarely and where a global re-render on change is actually wanted. For mutable shared state with frequent updates, Zustand wins.

## A lesson from a real board

One Shape A board's `demo/useCase.tsx` accumulated **20 useState hooks in a single 800-line component**. The cause: a one-take Story walkthrough with state that accumulates across visible "steps". Each addition felt small; cumulative cost was severe.

What should have happened earlier:

1. **At ~7 useState hooks**: notice the pattern, switch to Zustand store + per-step files.
2. **At ~12 useState hooks**: refactor became urgent, but the moment was already past.

The signal isn't a hard count — it's "I'm afraid to add another useState because I can't trace the flow anymore". When that fear hits, upgrade.

## Anti-patterns

- ❌ Adding Zustand on day one "because we'll need it eventually". Premature.
- ❌ Adding Zustand and putting all scene-local state into it. Defeats the purpose; also breaks scene independence.
- ❌ Mixing Zustand and XState in the same flow. Pick one for orchestration.
- ❌ Using Redux Toolkit "because we know it". Zustand is strictly better for this scope.
- ❌ Using `useSyncExternalStore` directly. Zustand is built on it; use the abstraction.
- ❌ A "cross-tab" store that lets Components and Prototype tabs influence each other. Tabs are physical isolation; respect it.
- ❌ Persisting everything to localStorage "in case". Persist only what genuinely needs to survive reload — typically theme + last-selected view. Persisting workbench scratch state can lead to confusing "why is the app stuck on this state from yesterday" sessions.
