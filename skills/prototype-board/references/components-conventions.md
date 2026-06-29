# Drafts, Components, and the Promotion Flow

The `drafts/` folder is for **divergent design exploration** — generate candidates, compare, decide, promote. The `components/` folder holds **decided** implementations. This file explains how to stage candidates, the two patterns for evaluating them, and the promote flow.

## The draft file

A draft is a self-contained `.tsx` file that renders one design candidate. It exports:

- A `meta` object: `{ topic, variant, status, notes? }`
- A named-export component (so the dispatch wrapper can import it explicitly)

```tsx
// drafts/composer-serif.tsx
export const meta = {
  topic: "composer",
  variant: "serif",
  status: "candidate" as const,
};

export function ComposerSerif(props: ComposerProps) { /* … */ }
```

The `meta.status` field is what distinguishes states; common values:

| Status | Meaning |
|---|---|
| `candidate` | Still in the running |
| `rejected` | Lost the A/B; kept as audit trail |
| `archived` | Same as rejected but explicitly preserved long-term |

`promoted` doesn't appear here — promoted code lives in `components/`, not `drafts/`. (See § The promote flow.)

**Rejected drafts are not deleted.** They are the receipt that proves the team considered the alternative. Git history works too, but a visible file in the tree is much harder to forget than a commit hash.

## Topic prefix groups related drafts

Drafts exploring the same problem share a topic prefix:

```
drafts/
├── composer-serif.tsx          topic: "composer"
├── composer-sans.tsx           topic: "composer"
├── nav-item-italic.tsx         topic: "nav-item"
├── nav-item-bracket.tsx        topic: "nav-item"
└── nav-item-marker.tsx         topic: "nav-item"
```

The file tree itself becomes the comparison surface.

---

## Two patterns for staging a draft into the live app

There are two ways to evaluate candidates. Pick by the design question's nature, not by reflex.

### Pattern A · Theme-axis dispatch (feel-in-context)

Use when you want to **experience the candidate inside the real app** — color, type, interaction style, anything where isolated comparison loses signal.

How it works:

1. Each candidate lives in `drafts/<topic>-<variant>.tsx`.
2. `components/<Component>.tsx` is a thin **dispatch wrapper** that reads a theme axis and renders the matching draft.
3. `theme/ThemePanel.tsx` exposes a chip group for the axis. Switching the chip swaps which draft renders.
4. The whole app responds — whether you're in workbench, scenes, or anywhere the component is used.

```tsx
// components/Composer.tsx — dispatch during A/B
import { ComposerSerif } from "../drafts/composer-serif";
import { ComposerSans } from "../drafts/composer-sans";
import { useTheme } from "../theme/ThemeProvider";

export function Composer(props: ComposerProps) {
  return useTheme().composer === "serif"
    ? <ComposerSerif {...props} />
    : <ComposerSans {...props} />;
}
```

When you decide:

- The winning draft's content moves into `components/Composer.tsx`, **collapsing** the dispatch
- ThemePanel's chip group for that axis is removed
- The losing draft stays in `drafts/` with `status: "rejected"`
- `decisions.md` gets a one-paragraph entry

Pattern A is the default for Shape B. Most "color / type / interaction" decisions belong here. See `theme-system.md`.

### Pattern B · One-shot candidate exploration (gallery comparison)

Use when you want to **sketch N concepts side-by-side**, pick one, and not put any of them in the live app until decided. Good for icon style sets, mention chip layouts, navigation densities — things where the in-context feel adds little signal.

How it works:

1. Candidates live in `drafts/`.
2. A `views/VariantGallery.tsx` (Shape A's Components tab) renders N candidates side-by-side, sometimes with a PropEditor for tweaking.
3. The live app uses none of the candidates yet — `components/X.tsx` doesn't exist (or is the previous winner).
4. After comparison, the winner is promoted (see below).

Pattern B is the historic Components tab pattern. It's right for Shape A boards that have a lot of visual-vocabulary work.

### How to choose between A and B

| Signal | Pattern |
|---|---|
| "I want to feel this in real use" | A |
| "Could be a long-lived user preference" (like dark mode) | A |
| "I have 5 sketches and just want to see them next to each other" | B |
| "This is a one-time decision; one winner ships forever" | A then collapse, or B |
| "It's a color / type / interaction style" | A |
| "It's a layout / icon set / spacing scale" | B (or Figma) |

A and B can coexist on the same board. Some axes use A (composer style), some use B (icon set).

---

## The promote flow

When a draft wins:

### From Pattern A (theme-axis dispatch)

1. Open `components/<Component>.tsx`. It's currently a dispatch wrapper.
2. Replace its body with the winning draft's implementation. Delete the dispatch.
3. Remove the chip group from `theme/ThemePanel.tsx` and the corresponding axis field from `theme/tokens.ts`.
4. Mark losing drafts `status: "rejected"`. Keep them in `drafts/`.
5. Append to `decisions.md`.

### From Pattern B (one-shot)

1. Move the winning draft from `drafts/` to `components/`, renaming to a noun: `gallery-icon-dots.tsx` → `IconDotsGallery.tsx` or whatever the consuming view will call it.
2. Update any `views/` (especially `VariantGallery.tsx`) that imported from `drafts/` to import from `components/`.
3. Mark losing drafts `status: "rejected"`. Keep them in `drafts/`.
4. Append to `decisions.md`.

### What if neither candidate wins?

That's a **reset**, not a promote. Both drafts get `status: "rejected"` (or are deleted), the dispatch / gallery is removed, and you start a new round with new drafts. Note the reset in `decisions.md` too — "we considered serif and sans, neither felt right, going to monospace next" is a real signal for future you.

---

## Comparison views (Pattern B)

The default `VariantGallery.tsx` page renders one variant at a time when reached via `#components/<slug>`. For real decisions, also build a **summary entry** that renders multiple variants in a grid for side-by-side comparison.

The first thing a stakeholder lands on should be the comparison page, not an individual variant.

## The PropEditor pattern

The single highest-leverage addition to a Pattern B variant gallery. It eliminates the "change source code → reload → screenshot → revert" loop that plagues prototype boards.

**What it does**: a small panel rendered above a variant lets the user tweak props through UI controls (checkbox, dropdown, slider, text input) — live, no reload.

**When to add**: the second time you find yourself hacking `useState(item.id === "xxx")` to test a hover/selected/error state. Day one default is no PropEditor.

**Cost**: ~80 lines of self-written code, no dependencies.

For the implementation, see `examples/PropEditor.tsx`. The schema is `{ fieldName: { kind: "bool" | "select" | "number" | "text", ... } }` and the component returns the live values via `onChange`.

**When NOT to use PropEditor**: for comparing entirely different layouts (use a comparison page instead), or for stateful component behavior (PropEditor controls inputs, not internal state).

## CVA for component variants

Use [class-variance-authority](https://cva.style/) when **one component has 3+ visual variants driven by an enum prop** (e.g. `<Card status="candidate" | "promoted" | "rejected">`). For 1–2 variants, a ternary is clearer.

For file-size signals and import-boundary rules, see `code-structure.md`.
