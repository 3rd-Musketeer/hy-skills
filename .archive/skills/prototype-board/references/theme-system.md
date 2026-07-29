# Theme System

The theme system is the lightweight A/B mechanism for prototype boards. It's recommended day-1 for any board doing visual A/B (most are).

This file describes:
- What the theme system is and why it's the right shape
- The three pieces (`ThemeProvider`, `tokens.ts`, `ThemePanel`)
- How to use it for in-context A/B (Pattern A from `components-conventions.md`)
- How it collapses when an A/B resolves

## What it is

Three small pieces working together:

1. **`ThemeProvider`** — Context that holds current theme state and writes it to the DOM (CSS variables on `:root`, data attributes for selector-based variants).
2. **`tokens.ts`** — pure data: the candidates available on each axis (which colors, which fonts, which interaction styles).
3. **`ThemePanel`** — UI control to switch between candidates. Often a FAB (floating action button) that expands into a panel.

CSS reads the values via `var(--stamp)` and `[data-lang="cn"]` selectors. Components don't generally need to know theme exists; only those that need to dispatch between different React implementations (e.g. two composer designs) read theme via `useTheme()`.

## Why this shape (and not daisyUI / shadcn theming / styled-components)

- **Zero runtime dependencies.** Three files of self-written code, < 200 lines total.
- **CSS-native.** Variables and data attributes are the platform's own theming primitives. No JSX wrapper hell, no className composition gymnastics.
- **Decouples theme axes from React.** Most axes (color, surface, language) are pure CSS; React reads only when it needs to dispatch implementations.
- **Project-specific vocabulary.** Tokens are named for *your* product (`--stamp`, `--ink`, `--paper`), not someone else's `--primary` / `--secondary`. Naming alignment matters a lot for design judgment.
- **In-context A/B is the killer feature.** Switch a chip → workbench changes. No "open Components tab → click variant → flip back" round-trip.

## The three pieces

### 1. `theme/tokens.ts`

Pure data dictionary. Each axis lists its candidates with the values needed to render them.

```ts
export const stamps = {
  signal:    { base: "#ff9500", deep: "#d97800", ink: "#6b3d00" },
  marigold:  { base: "#f08800", deep: "#c26d00", ink: "#5c3500" },
  amber:     { base: "#e07a1f", deep: "#b25e13", ink: "#522b08" },
  // ...
} as const;

export const surfaces = {
  pure:  { bg: "#ffffff", surface: "#ffffff", recess: "#f7f7f8" },
  paper: { bg: "#faf8f3", surface: "#fdfcf8", recess: "#f4f1ea" },
  // ...
} as const;

export type ThemeState = {
  surface: keyof typeof surfaces;
  stamp: keyof typeof stamps;
  lang: "en" | "cn" | "mix";
  // ...
};

export const defaults: ThemeState = {
  surface: "paper",
  stamp: "signal",
  lang: "en",
};
```

`tokens.ts` is the only place candidate sets are defined. Adding a stamp candidate = one line here. Removing one = one line.

### 2. `theme/ThemeProvider.tsx`

Holds state, persists to localStorage, writes to DOM. See `examples/ThemeProvider.tsx` for a complete implementation.

The Provider does three things on every state change:

```tsx
useEffect(() => {
  const root = document.documentElement;
  // 1. Write CSS variables (for axes consumed by CSS only)
  const stamp = stamps[theme.stamp];
  root.style.setProperty("--stamp", stamp.base);
  root.style.setProperty("--stamp-deep", stamp.deep);
  // 2. Write data attributes (for selector-based variants)
  root.dataset.lang = theme.lang;
  root.dataset.surface = theme.surface;
  // 3. Persist
  localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
}, [theme]);
```

CSS then responds:

```css
:root[data-surface="paper"] {
  --bg: #faf8f3;
  --surface: #fdfcf8;
}

[data-lang="cn"] .brand-mark {
  font-family: var(--kai);
}
```

This split — variables for color, attributes for variants — keeps CSS readable and JS minimal.

### 3. `theme/ThemePanel.tsx`

The control surface. Two common shapes:

- **Inline bar** at the top of the page — easiest to discover, takes vertical space.
- **FAB** at bottom-right that expands into a panel — invisible when not in use, no real estate cost.

For a continuous workbench (Shape B) the FAB is usually preferable; for a Components tab board (Shape A), inline is fine since the surface is already busy.

See `examples/ThemePanel.tsx` for a FAB implementation.

## Using it for in-context A/B (Pattern A)

This is the mechanism for `components-conventions.md`'s **Pattern A · Theme-axis dispatch**.

### Setup steps for one A/B round

1. **Add a new axis to `tokens.ts`**:

   ```ts
   export const composers = {
     serif: { /* maybe nothing — the axis just identifies the variant */ },
     sans: {},
   } as const;

   export type ThemeState = {
     // ...existing axes...
     composer: keyof typeof composers;
   };
   ```

2. **Write the candidate implementations** in `drafts/`:

   ```
   drafts/composer-serif.tsx
   drafts/composer-sans.tsx
   ```

3. **Write the dispatch component** in `components/`:

   ```tsx
   // components/Composer.tsx
   import { ComposerSerif } from "../drafts/composer-serif";
   import { ComposerSans } from "../drafts/composer-sans";
   import { useTheme } from "../theme/ThemeProvider";

   export function Composer(props: ComposerProps) {
     const { composer } = useTheme().theme;
     return composer === "serif"
       ? <ComposerSerif {...props} />
       : <ComposerSans {...props} />;
   }
   ```

4. **Add a chip group to `ThemePanel`** for the new axis.

5. **Use the workbench**. Click the chip; the dispatch updates; the whole app reflects the choice.

### Collapsing the A/B (decision)

When you decide:

1. Open `components/Composer.tsx`. Replace the dispatch with the winner's implementation directly.
2. Delete the imports from `drafts/`. The losing draft stays in `drafts/` with `status: "rejected"`.
3. Remove the `composer` field from `ThemeState` and `defaults`, remove the `composers` export from `tokens.ts`.
4. Remove the chip group from `ThemePanel`.
5. Append to `decisions.md`.

The whole collapse is < 10 lines deleted across 4 files. That low cost is what makes A/B cheap.

## Theme as the only legitimate global state

`useTheme()` is called from many places — sidebars, composers, table cells. That's intentional: theme is the one piece of state that's truly application-global. Everything else (selected matter, current scene, draft text) is view-local.

This works because:
- Theme changes are rare (user clicks a chip occasionally), so the Context's coarse re-render is acceptable.
- The shape of theme state is small (5–10 enum values), trivially memoizable.
- No business logic should ever live in theme — it's pure visual state.

If you find yourself wanting to put non-visual state in theme ("currently selected matter" because "it's needed everywhere") — that's a sign you need Zustand, not theme. See `state-management.md`.

## Persistence

Default: localStorage. The user comes back to their last config without thinking.

URL hash for theme is **not the default** — it's only worth it if you need to share an exact state with a teammate via URL. For local-only debugging, localStorage is enough. See `state-management.md` § Where state lives.

## Anti-patterns

- ❌ Putting non-visual state in theme. Theme is for "how things look", not "what things show".
- ❌ Naming tokens `--primary` / `--secondary` etc. Use project-specific semantic names (`--stamp`, `--ink`, `--paper`). The naming itself is a design judgment.
- ❌ Letting ThemePanel grow chip groups indefinitely. Each axis should have a defined "decision will collapse this" lifecycle. A panel with 8+ axes means too many open decisions.
- ❌ Adopting daisyUI / shadcn / Radix theming "to save time". They solve a different problem (skin an app with someone else's vocabulary), not yours (build your own vocabulary).
- ❌ Inline `style={{ color: themeStamp }}` instead of CSS variables. The whole point is that CSS reads from `--stamp`; React shouldn't pass colors as props.
- ❌ Reading theme in a component that doesn't actually need to dispatch. Most components should use CSS variables and not call `useTheme()` at all.
