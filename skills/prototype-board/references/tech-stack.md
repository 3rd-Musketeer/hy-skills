# Tech Stack

The recommended stack and the additions that have usually proven not worth it, with war stories. Use this when a teammate or agent asks "should we add X?".

For stage-gated additions (when to add Zustand / shadcn / cmdk / etc.), see SKILL.md §4 — that table is the single source of truth for "what to add when".

## The recommended stack (day-one defaults)

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 5+** | Fastest HMR. Strict port. No SSR. |
| Framework | **React 19** | Industry default; Suspense + lazy() are essential |
| Language | **TypeScript** strict mode | Catches mock-data shape mismatches at edit time |
| Styling | **Tailwind v4** + inline `style` | Tailwind for layout/spacing, inline for one-off visuals |
| Icons | **lucide-react** | Tree-shaken, large coverage, consistent stroke |
| Routing | **Hash routing**, ~50 lines hand-rolled | Zero deps, works on static hosting, no learning curve |
| State | **`useState`** | Sufficient for ≥90% of cases; upgrade only when earned |
| Lint/format | **Biome** or **ESLint + Prettier** | Either works; pick one and don't switch |
| Test (optional) | **Vitest** | Only for non-trivial logic; prototypes don't need exhaustive tests |

This stack is **load-bearing**. Substituting pieces is fine if your constraint genuinely differs — just record the reason in `decisions.md`.

## Additions that usually don't earn their weight (with war stories)

These were considered, tried, or seriously evaluated for prototype boards and rarely justified themselves. Read the war story before re-litigating; the door isn't bolted shut, but the rejection has a real reason behind it each time.

### Next.js, Remix, Astro, TanStack Start

**Why usually rejected**: All four are frameworks for production web apps with server-side data needs. Prototype boards typically have no server. The cost: slower HMR (Next/Turbopack measurably slower than Vite), file routing overkill for 2–7 tabs, build/deploy complexity. SSR offers nothing for a no-server prototype.

**Reconsider when**: The prototype board needs to integrate with real backend APIs at multiple endpoints with auth — at which point it's no longer purely a prototype board, and a framework may carry its weight.

### Storybook itself

**Why usually rejected**: Storybook is designed to show components in isolation. The Components tab (or VariantGallery view) does that already, with less ceremony. Storybook can't do the linear walkthrough that Prototype scenes / Workbench provides — switching means losing one of the two legs.

**Reconsider when**: You're building a real production component library that's published as a package, and the linear-walkthrough need has been shed.

### Redux, Jotai, Valtio

**Why usually rejected**: Zustand covers the same need with less boilerplate (Redux), simpler mental model (Jotai's atoms get hard to trace), and better debugging (Valtio's proxies are opaque).

**Reconsider when**: You're working in a codebase that already standardized on one of these — match the codebase.

### framer-motion, react-spring, motion-one

**Why usually rejected**: CSS transitions are sufficient for most prototype animations (fade-in, slide-in, scale on hover). Animation libraries add bundle weight and slow HMR cold starts. The xhs-poster-demo README explicitly avoids them; experience confirms.

**Reconsider when**: A specific scene requires complex coordinated animation (FLIP transitions across mount/unmount, drag-to-reorder, layout animations). Even then, prefer CSS view transitions API first.

### TanStack Query, SWR, React Query

**Why usually rejected**: There's typically no real backend. Mock data is inline TypeScript. Query libraries answer a question you don't have.

**Reconsider when**: You wired the prototype to a real backend, in which case re-read the section on Next/Remix above.

### TanStack Router, React Router

**Why usually rejected**: Hash routing in 50 lines covers 4–7 tabs of N flat entries each. A real router earns its weight at: nested routes, route guards, type-safe params, data loaders. None usually apply.

**Reconsider when**: You add nested routes (a prototype board with nested routes is uncommon and worth pausing to question first).

### Plop, Hygen, code generators

**Why usually rejected**: A scene file is 50–200 lines of straightforward React. Copy-pasting an existing scene is faster than writing a generator template, and the output is more honest.

**Reconsider when**: You're producing 50+ scenes with identical structure (which itself is worth pausing to question — they shouldn't usually be that identical).

### daisyUI, MUI, Ant Design, Chakra (UI kit libraries)

**Why usually rejected**: These libraries are designed for "套主题" (套用现成主题) — quickly skinning an app with someone else's visual vocabulary. Prototype boards typically do the opposite: they're where the team builds *its own* visual vocabulary. Adopting a UI kit dilutes the design judgment you're trying to develop, and "primary / secondary / accent" tokens rarely map cleanly to project-specific semantics (like half-law's "stamp" or xhs-poster-demo's "mention chip").

**Reconsider when**: The prototype is intentionally for a feature that ships inside an existing product using one of these kits, and visual consistency with that product is required.

### Other categories briefly rejected

- **Chromatic / Percy** (visual regression): prototype visuals change constantly; regressions are noise, not signal.
- **Zod** for fixture validation: TS structural typing already catches mismatches at edit time. Zod earns its weight at I/O boundaries; fixtures aren't I/O.
- **Auth libraries** (NextAuth / Clerk / Supabase Auth): nothing to authenticate against; mock the logged-in state inline.
- **Monorepo tools** (Turborepo / Nx / pnpm workspaces): prototype boards are typically single packages with a single goal.

## How to evaluate "should we add X" requests

When someone (often an agent) suggests adding a new tool, walk through:

1. **Is X on the recommended stack?** It's already there. Why are you re-adding?
2. **Is X on the stage-gated list?** Has the trigger condition fired? Provide concrete evidence — not "we might need it later".
3. **Is X on the usually-rejected list?** Read the war story. Has the constraint that drove rejection actually changed for your case?
4. **None of the above?** Document the proposal in `decisions.md` before adding. Include: what specific pain it solves, what existing tool can't solve it, what the cost of adding is.

When in doubt: don't add. Subtraction is cheap, addition is sticky.
