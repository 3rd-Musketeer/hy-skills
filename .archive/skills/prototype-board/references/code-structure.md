# Code Structure

File layout, naming, import boundaries, and mock-data layering. Adopt these from day one — retrofitting them is much more painful than starting clean.

## Top-level layout (six folders, both shapes)

```
project-root/
├── README.md                  project-specific rules (visual constraints, vocabulary, scene script)
├── decisions.md               append-only log of design decisions
├── package.json
├── vite.config.ts             strictPort, single dev server
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx                two-tab shell (A) or single-workbench shell (B)
    ├── views/                 user-facing pages (anything you can deep-link to)
    │   │
    │   ├── (Shape A) VariantGallery.tsx     Components tab content
    │   ├── (Shape A) scenes/                Prototype tab content
    │   │             ├── registry.ts
    │   │             └── Scene<NN><Name>.tsx
    │   │
    │   └── (Shape B) Workbench.tsx          single continuous view
    │
    ├── components/            decided shared implementations (used by views)
    ├── drafts/                in-flight, undecided implementations (any type)
    ├── fixtures/              pure-data mocks (.ts only)
    ├── theme/                 ThemeProvider + tokens + ThemePanel
    └── styles/global.css      theme tokens + reset
```

The structure looks like a normal React project on purpose. The discipline lives in the **flows** (SKILL.md §1), not the folder names.

## Naming

- **Scenes** (Shape A): `Scene<NN><Name>.tsx` — `Scene01Title`, `Scene02FabCapture`. Two-digit NN gives stable sort and headroom.
- **Drafts**: `<topic>-<variant>.tsx` (kebab-case) — `composer-serif.tsx`, `composer-sans.tsx`, `nav-item-italic.tsx`. The topic prefix groups related candidates in the file tree.
- **Components**: descriptive nouns — `PanelShell`, `Composer`, `MentionList`. Avoid `XxxView`, `XxxContainer`.
- **Fixtures**: domain nouns — `posters.ts`, `mentionCandidates.ts`. Plural if a list, singular if a single object.

## Import boundaries

```
fixtures/    ← imports nothing
theme/       ← imports nothing
drafts/      ← may import: components/, fixtures/, theme/
components/  ← may import: fixtures/, theme/
             + drafts/ (only via dispatch wrappers; see theme-system.md)
views/       ← may import: components/, drafts/, fixtures/, theme/
             ↛ may NOT import: another views/* file

drafts/      ↛ may NOT import: another drafts/* file
drafts/      ↛ may NOT import: views/
```

Why these matter:

- `drafts/` files staying independent means **any draft can be deleted without touching others** — promotion / abandonment is cheap.
- `components/` not depending broadly on `drafts/` means **decided code is not held hostage to in-flight code**. The dispatch-wrapper exception (one component file imports two drafts to A/B them) is bounded and short-lived: when the A/B resolves, the dispatch is collapsed and the drafts move out.
- `views/` not importing `views/` means **scene independence** (Shape A) or **clean view-tree composition** (Shape B). No accidental shared module-level state.
- `fixtures/` as a leaf means **mocks are pure data**, swappable, testable, never accidentally a component.

You don't need a lint rule on day one. Add `eslint-plugin-boundaries` only when someone actually crosses a line. The convention itself is what matters; enforcement can be social.

## Mock-data layering

Three layers, by intent. **Use the simplest layer that works.** Don't preemptively split.

### Layer 1 · `fixtures/*.ts` (default)

Pure TypeScript data. No JSX. No React imports. No functions beyond simple builders.

```ts
export type Poster = { id: string; title: string; thumbUrl: string; source: string };

export const posters: Poster[] = [
  { id: "p1", title: "红色劳动节工人海报", thumbUrl: "/mock/p1.jpg", source: "feed:1234" },
  // ...
];
```

This is the layer 90% of mocks live in. Start here. Stay here as long as possible.

### Layer 2 · `fixtures/<name>.tsx` (when JSX is needed)

When a mock needs to embed real components (a chat thread with `<ToolCard>` `<UserMessage>` etc.), keep it in `fixtures/` but as `.tsx`. Still treat it as data — just data that happens to be JSX.

```tsx
export const summonChatScene: ChatItem[] = [
  { id: "u1", kind: "user", text: <>@<MentionChip label="刚才的浏览" /> 帮我做一个海报</> },
  { id: "a1", kind: "assistant", text: "我看看你刚才的浏览轨迹..." },
];
```

If the same JSX-shaped fixture is read by 3+ scenes, it's earned its place; otherwise inline it in the scene that uses it.

### Layer 3 · separate `schemas/*.ts` (rare — only when types span layers)

Standalone type definitions, only when fixtures and views share types that aren't owned by a single component.

```ts
export type ChatItem = UserMessage | AssistantMessage | ToolCard | ThoughtBlock;
```

If a type is used by exactly one component, it lives next to that component. Don't preemptively centralize types.

### When NOT to layer

If you have one workbench (Shape B) or 5 scenes (Shape A) and each consumes its own one-off mock, **don't create elaborate fixture structure**. Inline the data in the consumer file. Premature data extraction is as bad as premature abstraction.

You add a fixture file the moment the **same data is needed in two places**.

## File size guidelines

| File type | Comfort zone | Investigate when |
|---|---|---|
| Scene (`Scene*.tsx`, Shape A) | 50–250 lines | > 300 lines (split, or extract mock to `fixtures/`) |
| Draft (`drafts/*.tsx`) | 50–200 lines | > 300 lines (likely doing too much) |
| Component (`components/*.tsx`) | 30–200 lines | > 300 lines (probably needs decomposition) |
| Workbench (`views/Workbench.tsx`, Shape B) | 100–500 lines | > 600 lines (split into a folder) |
| Fixture (`fixtures/*.ts`) | any size, it's data | — |
| App.tsx | ~30–80 lines | > 150 lines (logic should live elsewhere) |

These are signals to investigate, not hard limits.

### Splitting a Workbench into a folder (Shape B)

When `views/Workbench.tsx` outgrows ~500 lines, promote to a folder with the same name:

```
views/
└── Workbench/
    ├── index.tsx          composes the sub-views
    ├── Sidebar.tsx
    ├── MainArea.tsx
    └── DetailPanel.tsx
```

Import path stays `views/Workbench`. Sub-files are private to the workbench (no other view imports them).

## Anti-patterns

- ❌ A `utils/` folder. Utilities belong next to the code that uses them, or in a named module like `formatTime.ts`.
- ❌ A `types/` folder for all type definitions. Types live next to their owners.
- ❌ A `hooks/` folder. Hooks are co-located with the component or feature that needs them.
- ❌ Index files (`components/index.ts`) re-exporting everything. They make grep slower and add a layer of indirection. Import from the real file path.
- ❌ Barrel files in `fixtures/`. Same reason.
- ❌ A `data/` folder mixing real data and mock data. Either it's all mock (call it `fixtures/`) or you're building the wrong thing.
- ❌ Two files with mutual deps. One Shape A board had `chatItems.tsx` ↔ `useCase.tsx` cycles that made type errors appear in unrelated files; the only fix was reorganizing to a single direction (`chatItems` becomes data consumed by `useCase`).
- ❌ A "data" folder owned by one tab but read by another. The same board had a `playground/data/` that prototype scenes ended up importing — the folder name no longer reflected actual ownership, and refactoring became impossible. Fix: shared mock data lives at top level (`src/fixtures/`), not inside a tab folder.
- ❌ Mixing schema + fixture + scene composition + runtime in one file. That board had a 1062-line `chatStream.tsx` doing all four; any edit risked breaking 12 dependents. Fix: the layered split above is what prevents this — schema in dedicated file (or co-located), data in `fixtures/`, JSX composition in `fixtures/*.tsx`, runtime in components.
- ❌ Status-by-filename (e.g. `Composer.draft-serif.tsx` mixed into `components/`). Folder boundaries are visible in import statements and IDE trees; filename suffixes are easy to miss. Use `drafts/` as a separate folder.
