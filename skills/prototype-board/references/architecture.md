# Architecture

The shell is small: hash routing, lazy import, a registry per tab (or just a single view for Shape B). This file describes how the pieces fit together and how the architecture scales.

## The two product shapes

This skill serves two shapes, sketched here for context. SKILL.md §2 has the full pitch.

| Shape | What `views/` contains | App.tsx role |
|---|---|---|
| **A · Sequence of moments** | `VariantGallery.tsx` + `scenes/` (with registry) | Two-tab shell: Components / Prototype |
| **B · Continuous workbench** | `Workbench.tsx` (single view) | Single workbench shell + ThemePanel |

The architecture below describes Shape A in detail (it's the more complex one). Shape B is essentially "skip the registry, render one view".

## The two-tab model (Shape A)

| Tab | Purpose | State model |
|---|---|---|
| **Components** | N candidate variants of a single design problem, side-by-side | Local `useState` per variant |
| **Prototype** | Click-through user flows, one scene at a time | Local `useState` per scene |

Why exactly two:

- **Components** is the divergent space — generate options, compare, decide.
- **Prototype** is the convergent space — assemble decided components into the user flow.

The two tabs are the two halves of the design loop. A third tab is rarely needed and always earned (see § Scaling to N tabs).

## Registry pattern (Shape A only)

Each registry-backed view (`scenes/`, optionally `VariantGallery`) exports a flat list of entries:

```ts
export type Entry = {
  slug: string;       // hash-route segment + key
  title: string;      // sidebar label
  Component: ComponentType;
};

export const entries: Entry[] = [
  { slug: "summon", title: "S1 · Summon panel", Component: lazy(() => import("./Scene01Summon")) },
  { slug: "retrieve", title: "S2 · Retrieval", Component: lazy(() => import("./Scene02Retrieve")) },
];
```

Why flat list:

- Adding a scene is one file + one line. No nesting, no parent component, no router config.
- The registry is the table of contents. Anyone reading it sees the whole prototype in 30 seconds.
- Multiple agents writing different scenes in parallel only collide on the registry line — git's three-way merge handles single-line additions trivially.

## Lazy import is recommended

Every entry uses `lazy(() => import("./..."))`. Three reasons:

1. **Code splitting** — only the visible scene's bundle is loaded. Vite ships separate chunks per scene.
2. **Failure isolation** — a syntax error in Scene 07 doesn't blank the whole app. The lazy import fails, the Suspense fallback renders, you fix Scene 07.
3. **HMR scope** — Fast Refresh only re-evaluates the scene file you're editing. Edits to Scene 12 don't re-run Scene 03's mock state.

Skipping `lazy()` because "it's just a small prototype" is the most common shortcut to regret.

For Shape B, lazy import isn't needed for the single workbench view (it's always rendered) but stays useful inside drafts/ and any optional secondary views.

## App.tsx shape

App.tsx is ~80 lines for Shape A: parse hash → look up the matching registry → suspense-render the matching component. Hard cap is 150 lines — if you're adding logic, it belongs in a view or a component.

For Shape B, App.tsx is even smaller (~30 lines): mount ThemeProvider + ThemePanel + the single Workbench view.

For the full skeleton, see `examples/AppSkeleton.tsx`.

## Hash routing — why not React Router / TanStack Router

Hash routing is 50 lines and rarely breaks. It works without server config, deep links work in static hosting, and it has zero learning curve.

A real router earns its weight when you need: nested routes, route guards, type-safe params, data loaders. None of those apply to a typical prototype board. The architecture is two flat tabs of N entries each (Shape A) or a single view (Shape B). A router is over-engineering until you have at least 4 tabs and nested navigation.

## State ownership

Tabs / views are physical isolation. Scenes own their own state via local `useState`; if two scenes appear to share data, that shared thing is a **fixture**, not shared state.

Shape B's continuous workbench is a different case: shared state is natural inside one workbench (which matter is selected, which finding is active). Lift to the view root and prop-drill until pain.

The moment you reach for "let me hoist state to App.tsx so two scenes see it" — stop, you're either building a Story tab (see `story-conventions.md`) or it should be in a fixture.

For the full state progression, see `state-management.md`.

## Scaling to N tabs

The default tabs (Components + Prototype for Shape A, or single Workbench for Shape B) handle 95% of needs. Resist adding a third tab.

The most common earned third tab is **Story** (auto-playing walkthrough for video / live demo). It's a major complexity upgrade — see `story-conventions.md`.

Other tabs sometimes considered:
- **Animation** — isolated motion verification. Usually solvable inside Components tab; only earn it if isolation is genuinely needed.
- **Recording** — chrome-removed fullscreen mode. Usually a CSS toggle, not a whole tab.

Adding a tab follows the same pattern: new view (with optional registry), new branch in `parseHash`, new TabBtn in TopBar (~30 lines). When you reach 4 tabs and App.tsx view functions are 80% duplicated, factor out a generic `<RegistryView entries={...} />`. Not before.

## Anti-patterns

- ❌ Nesting registries (a scene that contains sub-scenes). Flatten — `Scene04aIntro`, `Scene04bRetrieve` is fine.
- ❌ A "step machine" in a registry. Each entry should render independently when the user lands directly via hash URL.
- ❌ Cross-view state leaks through module-level singletons. Tabs/views are physical isolation; respect it.
- ❌ A "shared" Layout component that knows about specific scenes. Layout is dumb chrome; scenes are independent.
