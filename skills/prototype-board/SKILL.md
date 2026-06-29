---
name: prototype-board
description: Build a feel-first interactive prototype board for a new product — a small React SPA where the team can experience the design before any of it is real. Encodes lessons from building real prototype boards (both fully-scripted and live-LLM shapes) on the five flows that make a prototype board work, the two product shapes it serves (sequence-of-moments vs continuous-workbench), and the stage-gated tech choices that keep it maintainable.
when_to_use: When the user wants to start a new prototype board for an unbuilt product, scaffold a "storybook-like" interaction sandbox, or extend an existing one. Triggers include "做一个 prototype / storybook", "搭交互原型", "先把感觉做出来 / 验证交互手感". Also use when extending an existing prototype board (add a tab, add a scene, promote a draft, set up theme A/B). NOT for production component libraries, real Storybook setups, or business-feature implementation.
---

# Prototype Board

Build a small React SPA whose job is to let the team **feel** a product's interaction before any of it is real. Default to mocking everything; real LLM / API integration is fine when the design judgment requires it.

This is a **horizontal prototype**. The deliverable is a clickable artifact that doubles as an executable spec.

## How to use this skill

This skill is **principle-led, not law**. Read the section that matches your moment and load references on demand. References are teaching material — when your situation breaks one of the defaults below, the reference usually explains the underlying reason so you can decide whether the deviation is sound.

| Your moment | Read here | Then load |
|---|---|---|
| Starting a new board | §1, §2 | `architecture.md`, `tech-stack.md` |
| Picking your shape (A vs B) | §2 | — |
| "Where does my data / state / interaction live?" | §1 (Five Flows) | matching flow's reference |
| Adding drafts / promoting one to a component | §1 (Promotion Flow) | `components-conventions.md` |
| Setting up theme A/B mechanism | §1 (Control + Promotion) | `theme-system.md` |
| Deciding whether to script vs. integrate real LLM | §1 (Control Flow) | `control-flow-spectrum.md` |
| Scenes / story tab / playback | — | `story-conventions.md` |
| "Mess accumulating in one component" | §1 (State Flow) | `state-management.md` |
| File layout, naming, file-size signals | §3 | `code-structure.md` |
| "Should we add framework X?" | §4 | `tech-stack.md` |
| Want concrete code samples | — | `examples/` |

---

## §1 · Five Flows

These are the disciplines that make a prototype board different from a normal frontend project. The folder structure (§3) looks ordinary; the flows do not. Each flow has a **default**, a **deviation signal** (when leaving the default is sound), and a **floor** (what to preserve even when deviating).

### Flow 1 · Import Flow

**Default**: single direction, with a visible boundary between decided and undecided code.

```
fixtures/  →  ø                                  data, no imports
theme/     →  ø                                  theming infra, no imports
drafts/    →  components/, fixtures/, theme/     in-flight, may consume decided
components/ → fixtures/, theme/                  decided, plus drafts/ only
            + drafts/ (dispatch files only)      via the A/B dispatch bridge
views/     →  components/, drafts/, fixtures/, theme/   top-level assemblers
views/     ↛  views/         views don't import each other
drafts/    ↛  drafts/        drafts don't import each other
```

**Deviation signal**: you find yourself wanting `drafts/` to import another `drafts/`, or `components/` to depend broadly on `drafts/`. Usually means the A/B has gone on too long or the draft is becoming a real shared atom — promote it.

**Floor**: `fixtures/` stays a leaf node; drafts stay independently deletable.

### Flow 2 · Data Flow

**Default**: `fixtures/*.ts` is the single source of mock data. Read-only fan-out to drafts / components / views; no writes back.

**Deviation signal**: you need real data variety (e.g. 100 sampled real contracts) that's tedious to inline. Acceptable to read from a real read-only source — but pin a snapshot into `fixtures/` so the prototype is reproducible offline.

**Floor**: data flows in one direction; nothing writes back to `fixtures/`. No "dev uses mock, prod uses real" toggle — a prototype board is mock-first by definition.

### Flow 3 · Control Flow

**Default**: scripted. User actions trigger `setState` immediately or after a `setTimeout`. Agent thinking is `setTimeout(1200ms) → setState(finding)`. No real async, no retries.

**The spectrum**: real prototypes sit on a 3-point scale. Pick the point that matches your design question.

```
┌──────────── pure script ────┬──── recorded ────┬──── live integration ────┐
│ setTimeout + hardcoded       │ pre-recorded     │ real LLM / real API      │
│ responses                    │ JSON replayed    │ behind a thin client     │
├──────────────────────────────┼──────────────────┼──────────────────────────┤
│ video demo, fastest iter,    │ reproduce a bug, │ A/B prompts, feel real   │
│ no token cost                │ no token cost,   │ latency / failure modes, │
│                              │ deterministic    │ judge agent behavior     │
└──────────────────────────────┴──────────────────┴──────────────────────────┘
```

**Deviation signal**: you keep being uncertain whether a UI decision (e.g. "is the loading spinner placement right") survives real latency. Time to upgrade one notch.

**Floor (any tier)**: no real backend with auth/persistence; no production-grade retry / cancellation / error-handling — failure shows in UI, the prototype doesn't try to recover. Keep the integration thin enough that ripping it out and replacing with script still works.

For when each tier earns itself, see `control-flow-spectrum.md`.

### Flow 4 · State Flow

**Default**: state is owned by the view that renders it. `useState` until pain hits. Theme is the one legitimate global, served via Context + CSS variables.

**Deviation signal**: cross-view coordination need (clicking in view A should scroll view B); single component crosses ~10 useState; story tab being added (state must accumulate across "steps"). Then upgrade to Zustand.

**Floor**: theme stays in its own provider, doesn't leak into business store. View-local state stays view-local where possible.

For Shape A scenes, state is per-scene by default (enables parallel agent development). For Shape B continuous workbench, internal shared state is natural (lift to view root).

For the full progression, see `state-management.md`.

### Flow 5 · Promotion Flow

**Default**: drafts → components is one-directional. When a candidate wins:

1. The winning draft's content moves into `components/X.tsx` (overwriting any dispatch wrapper).
2. The losing drafts stay in `drafts/` with `status: "rejected"` — audit trail.
3. If A/B was wired through theme axis, remove the chip group from ThemePanel and the dispatch.
4. Append to `decisions.md`.

**Deviation signal**: midway through A/B you realize "neither is right" — that's a **reset**, not a promote. Drop both drafts (or move to an `_archive/` subfolder), restart with new candidates. Note the reset in `decisions.md` too.

**Floor**: every A/B has a terminus. A ThemePanel that keeps growing chip groups is the smell that decisions are being deferred — periodically clear them.

There are **two patterns** for staging a draft into the live app: theme-axis dispatch (you can feel it in context, switchable from a chip) and one-shot candidates (you compare side-by-side, then promote). See `components-conventions.md`.

---

## §2 · Two product shapes — pick yours first

Before scaffolding, identify which shape you're building. The shape determines what `views/` contains; everything else stays the same.

### Shape A · Sequence of moments

- 5–15 independent moments to demo (each is a discrete story beat)
- Many small visual decisions that benefit from side-by-side comparison
- Variant comparison is a real activity (icon styles, mention chips, list densities)
- Example: a fully-scripted content-creation board — variant-heavy, discrete demo moments

```
views/
├── VariantGallery.tsx     ← "Components" tab content (variant comparison)
└── scenes/                ← "Prototype" tab content (clickable moments)
    ├── registry.ts
    └── Scene<NN><Name>.tsx
```

App.tsx renders two top-level tabs. Each variant lives in `drafts/` (in-flight) or, once promoted, in `components/`.

### Shape B · Continuous workbench

- One connected interactive surface the user "lives in"
- Every design decision is "feel in context" — isolated comparison adds little signal
- Theme axes (color / typography / interaction style) are the unit of A/B
- Example: a live-LLM workbench — one connected surface driven by real model behavior

```
views/
└── Workbench.tsx          ← single continuous view (split into a folder if it grows)
```

App.tsx renders the workbench plus a ThemePanel (the FAB-style theme control). No variant gallery, no scene registry. A/B happens through the theme axis dispatch pattern.

### How to tell

If you can't tell which one you have, you most likely have Shape A. Shape B announces itself: "I want to use the app to evaluate the design, not look at variants in isolation." Small projects can hybridize (mostly B with one or two scenes), but pick a primary shape first and resist mixing tab structures.

---

## §3 · Directory structure (one shape, six folders)

Both shapes share the same six top-level folders:

```
src/
├── App.tsx               two-tab shell (A) or single workbench shell (B)
├── views/                user-facing pages (whatever lives at a route or tab)
├── components/           decided shared implementations
├── drafts/               in-flight, undecided (any type)
├── fixtures/             pure data mocks (.ts only)
├── theme/                theme system (CSS vars, Provider, control surface)
└── styles/global.css     global tokens + reset
```

The structure looks like a normal React project — that's intentional. The discipline lives in the **flows** (§1), not the folder names. A new contributor reading `src/` shouldn't need a translation table.

For naming, file-size signals, and import boundary details, see `code-structure.md`.

---

## §4 · Stage-gated tech — earn each addition

Day-one baseline beyond the MVP shape:

- **ThemeProvider + ThemePanel** are recommended day-1 for any board doing visual A/B (most are). See `theme-system.md` and `examples/ThemeProvider.tsx`.
- Everything else below is **earned**, not default.

| Tool | Trigger that earns it | How to add |
|---|---|---|
| **Zustand** + devtools | One component crosses ~10 useState OR Story tab added OR state must survive view navigation | `npm i zustand` · always wrap with `devtools` middleware · see `examples/ZustandStore.ts` |
| **PropEditor** (~80 lines, self-written) | Hacking `useState(item.id === "xxx")` to test hover/selected states for the second time | Copy `examples/PropEditor.tsx`, no deps |
| **shadcn copy** (Dialog/Popover/Tooltip/Combobox) | About to write your second popover-based component | `npx shadcn-ui@latest add <component>` · copy mode only, never `npm install` UI kits |
| **cmdk** (command palette) | Scene count > 15 OR live-demo tab-clicking is too slow | `npm i cmdk` · ⌘K to open, fuzzy-search across registries |
| **CVA** | One component has 3+ visual variants driven by an enum | `npm i class-variance-authority` · use only at the variant boundary, not for one-off ternaries |
| **MDX for decisions** | Want decisions doc to render live component comparisons inline | `npm i @mdx-js/rollup` + Vite plugin · only worth it if comparisons matter visually |
| **XState** | You scaled Zustand to time-based orchestration and it hurts | `npm i xstate` · scope strictly to the orchestration machine |
| **Story tab** | Need auto-playing walkthrough for recording / live demo | New `views/story/` directory + Zustand store from day one · see `story-conventions.md` |
| **Real LLM client** (OpenAI / Anthropic SDK) | Design judgment depends on real model behavior or real latency | Thin client only; no retries, no tool use abstractions; see `control-flow-spectrum.md` |

### Usually doesn't earn its weight (war stories in `tech-stack.md`)

These have been tried or seriously evaluated for prototype boards and rarely justified themselves. Read the war story before re-litigating, but the door isn't bolted shut — if your constraint genuinely differs, document the reason in `decisions.md`.

- **Next.js / Remix / Astro / TanStack Start** — kills HMR, file routing overkill for 2–7 tabs
- **Storybook** — loses the linear-walkthrough leg
- **Redux / Jotai / Valtio** — Zustand wins for this scope
- **framer-motion / react-spring** — CSS transitions usually suffice
- **TanStack Query / SWR** — no real backend
- **TanStack Router / React Router** — hash route is enough for flat tabs
- **daisyUI / MUI / Ant Design** — these are "套主题" libraries; prototype boards are *building* visual vocabulary, not consuming it

---

## §5 · Decisions log

Single file: `decisions.md` at repo root. Append-only. Format:

```markdown
## YYYY-MM-DD · <Title>
**Decided**: one line
**Why**: real constraint
**Alternatives**: what was rejected and why
**Files**: relevant code paths
```

Every promote, every reset, every "we decided not to add X" gets one entry. Three sentences each is enough.

Upgrade to ADR (one file per decision) **only after ~30 entries**. Premature ceremony slows the team that needs to skim history fastest.

---

## §6 · Project-specific rules go in README.md

This skill captures the **method**. Each project has its own visual / domain rules — those go in a `README.md` at the project root:

- Visual hard constraints (panel size, fonts, theme axes)
- Domain vocabulary (terms the prototype names — matters / findings / clauses for legal, posters / mentions / agents for content, etc.)
- The scene outline / script for this specific prototype
- Visual fidelity tier (layout-only? surface? OS-contextualized?)

Don't write project-specific rules into this skill. Don't write method into the project's README.

---

## §7 · Real-world adoption notes

Living record of what real boards validated and where they pushed back on this skill. Keep additions short — three lines per case. Names don't matter; the friction and the fix do.

### Shape A board — fully scripted

- Validated: scene registry, PropEditor pattern, the promote flow.
- Exposed: a 1062-line `chatStream.tsx` that mixed schema + fixture + scene composition + runtime — drove the four-layer mock-data split.
- Stress-tested: Story tab cost (~2000 lines of orchestration); led to the "Story tab is earned, not default" rule.

### Shape B board — live LLM

- Validated: theme axis as the A/B substrate, drafts/ + components/ folder separation, ThemePanel FAB pattern.
- Pushed back on: mandatory two-tab default, "Mock everything" absolutism, scene independence as universal rule, URL-hash persistence as default.
- Drove changes: this skill's Shape A/B fork, the Five Flows reframing, the control flow spectrum, theme-system.md.

When you adopt this skill on a new project and find yourself fighting it, add a case here describing what didn't fit. The friction is the signal.

---

## References (load on demand)

- `references/architecture.md` — how the shell works, registry pattern, lazy import, scaling tabs
- `references/code-structure.md` — six-folder layout, naming, import boundaries, mock-data layering, file-size signals
- `references/components-conventions.md` — drafts vs components, two promote patterns (theme-axis vs one-shot), PropEditor
- `references/theme-system.md` — Provider + tokens + ThemePanel; theme as the A/B substrate
- `references/control-flow-spectrum.md` — script / recorded / live tiers; when to upgrade; what to preserve
- `references/state-management.md` — useState → Zustand → XState progression; where state lives (memory / localStorage / hash)
- `references/story-conventions.md` — auto-playback walkthrough as earned upgrade
- `references/tech-stack.md` — locked stack, rejected with war stories, evaluation process

## Examples (copy-ready code)

- `examples/AppSkeleton.tsx` — two-tab + hash-route shell
- `examples/ThemeProvider.tsx` — Context + CSS-vars + localStorage persistence
- `examples/ThemePanel.tsx` — FAB-style theme control
- `examples/PropEditor.tsx` — the ~80-line PropEditor implementation
- `examples/ZustandStore.ts` — Story tab Zustand store template
