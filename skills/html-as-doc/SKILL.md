---
name: html-as-doc
description: Render a piece of converged content as a single-file self-contained HTML doc, applying a design discipline based on apple.com marketing aesthetics. Medium-only — does not regulate what content says, only how the HTML expresses it. Explicit invocation only — do not auto-trigger on ordinary "render this as html" requests.
when_to_use: Use only when the user explicitly invokes /html-as-doc or asks for HTML output in this specific design style. Do NOT auto-trigger on ordinary "render this as html" / "做成 html" / "出个网页" mentions — those usually mean something else (a marketing site, a frontend component, a quick UI mockup). The user calls this skill deliberately when they want this expression discipline applied. NOT for multi-page doc sites (VitePress / Astro territory), NOT for production frontend code (→ frontend-design).
---

# html-as-doc

Render the content the user hands you as **one single-file HTML document** that applies the design discipline below. You receive content (a summary, a section list, anything already converged); you produce HTML. You do not transform the content's structure, do not rewrite its meaning, do not invent an authoring framework. Authoring is single-threaded, one shot, written end-to-end inline. (A separate, optional, post-author build step for *sharing* — §13 — is the one carve-out; it never changes how you author.)

## §1 · What this skill is

An **authoring expression discipline**, not a runtime framework. The user typed `/html-as-doc` deliberately because they want apple.com-feel HTML output. The skill does not need to be invoked through subagents, does not need scaffolding, does not need an authoring helper. Read the user's content, open one HTML file, write it end-to-end inline.

Sharing a finished doc as one portable file may use an **optional post-author build step** (§13) — shiki highlight + image compress/inline. It is compile-time only (like mmdc in §11), runs on explicit request, writes to a *separate* file, and ships nothing extra to the document. It does not change the authoring model above: you still write one inline HTML file by hand.

If the content is too sparse to render (e.g., one sentence), say so and ask. If the content has its own structural opinions (numbered sections, called-out scenarios), honor them rather than imposing a template.

## §2 · Stack — thin on purpose

```
HTML5 + inline <style> + Alpine.js (CDN, single script tag)
     + inline SVG + Lucide static <symbol> + Mermaid via mmdc
```

**Do not** introduce: Vue / React / Astro / Vite / TypeScript / Tailwind / any framework that ships **runtime** JS beyond Alpine. Every runtime dependency added becomes a place the document can fail to render.

This ban is about the **runtime** (what the output document loads). **Compile-time** tooling that runs once and ships nothing to the document is fine — that is what mmdc already is (§11), and what the optional share build is (§13): they transform static HTML/SVG ahead of time, leaving the output as plain self-contained markup.

Healthy artifact range for a **handoff-shape doc** (single-scroll, sparse): **30–50 KB / 500–2200 lines**. This ceiling guards against *doing too much* — runtime weight, scope sprawl, a kitchen-sink page — **not against explaining deeply**. A content-dense explainer that genuinely needs to walk a mechanism will exceed it, and should: depth is the content's right (see §6 — form-restraint is not explanation-shallowness). Judge by "is every block earning its place," not by line count.

## §3 · Three-layer visual doctrine (spine)

Every visual block on the page goes through this triage in order. This is the load-bearing decision of the skill:

```
What needs to be drawn?
├─ Standard-form diagram (sequence / state / flowchart / ER / class / gantt / pie / mindmap)
│   → Mermaid + Apple themeVariables, compiled via mmdc to static SVG
│
├─ Information-dense text structure (table / card / mock UI / comparison matrix / control / tooltip)
│   → HTML + CSS
│
└─ Neither matches → inline SVG fallback
    + inline note to reader: "this is hand-SVG because <reason>; ok to polish?"
    + do not log to a friction tracker — say it where it appears
```

**Orthogonal pillar** (not in the triage, separate axis): **Icons = Lucide static `<symbol>` + `<use>`**. One `<symbol>` block at the top of `<body>`, referenced by `<use href="#i-name"/>` throughout. Centralizes definitions, lets icons inherit `currentColor`.

If the SVG fallback fires **≥ 2 times in one document**, that is a signal the three layers do not cover something — see §12 reversal triggers.

**Raster figures** (a photo, a paper-figure screenshot) are *content*, not a drawn diagram, so they sit outside this triage: author them as `<img src="figure.png">` (external ref keeps the source light and diffable). `.figure img` styles them. Making the doc self-contained for sharing — inlining + WebP compression — is the optional build step (§13), not something you hand-encode while authoring.

## §4 · Token unification across layers

The three layers share **one** set of Apple palette tokens, injected differently:

| Layer | Injection mechanism |
|---|---|
| Mermaid | `themeVariables` in `mermaid-theme.json` (build-time) |
| HTML / CSS | `:root` custom properties (runtime, light-dark aware) |
| SVG fallback | external CSS selector on `[data-k="..."]` attribute |

The unification is the **load-bearing reason** these three layers cohere visually. Any future fourth layer (say, Vega-Lite for charts) earns its admission only if it can consume the same palette tokens — if not, do not add it.

## §5 · Aesthetic anchor — form, density & color

The output rides **two independent axes, anchored separately**. Conflating them is the mistake that makes a content doc feel wrong — it inherits marketing terseness it shouldn't.

**FORM (look & restraint) → apple.com marketing pages.** Palette, contrast, component restraint:

- White background `#FFFFFF` with warm dark text `#1D1D1F` (not pure black on light gray)
- Link/accent `#0066CC` (web blue), not `#007AFF` (SF Blue)
- Borders `#D2D2D7` (crisp), not `rgba(...)` (muddy)
- Restraint: default no border, shadows rare, one accent.

**DENSITY (type / measure / depth) → technical-documentation reading discipline** (Stripe / Linear / good docs), **not** marketing. Our docs are content-dense; the apple-marketing scale (15px body, 56px hero display, 128px section gaps, a 1040 column) is tuned for sparse visual-first pages and actively fights us. So:

- Body `18px` with comfortable leading; headings **organize, not dominate** — H1 `40px`, not a `56px` hero.
- A **single reading column** (~720 content) — everything left- **and** right-aligned to it (see §6 / §7).
- **Form-restraint governs how it looks, never how deep it explains.** An explainer explains to the depth its material warrants; apple's terseness is a visual property, not a word budget (see §2, §6).

**The color layer (additive over a grayscale skeleton).** apple.com chrome is near-grayscale; color rides **three channels only**, never the skeleton:

1. **Gradient-text focus** — one per screen (a headline word or the single key stat), via `.grad[data-grad="…"]`. Body text never gradients.
2. **Glyph stroke** — icon strokes carry a gradient (`gradient-defs.html`, `stroke="url(#g-…)"`).
3. **Imagery** — real photos / screenshots / figures hold the saturation.

Skeleton stays grayscale + the single blue accent. **Color is not content**: a saturated panel never stands in for a missing image. Pick the gradient by **semantic** (`tech` / `growth` / `creative` / `attention` / `critical` / `warm` / `neutral` / …), not by taste — the 16 `--grad-*` tokens are mapped to meaning.

**Structure comes from the apple.com *specs / compare* pages** — single content column, everything aligned to it — not the marketing hero pattern (heading-left / body-centered; that mismatch needs per-section hand-tuning, see §12).

The full design system — palette + content-first type tokens + `--grad-*` + layout primitives + components — lives in **`references/component-styles.css`**; read and embed it. (It supersedes embedding `apple-palette.css` / `typography-tokens.css` separately — it already contains them.)

## §6 · Typography & breathing baseline

Do not re-derive — embed `references/component-styles.css`, which carries the calibrated tokens: `--t-*` (content-first type ladder), `--lh-*`, `--ls-*`, `--s-*` (4px grid), `--max-content` (the single reading column), `--grad-*`, and font stacks.

The content-first calibration: body `18px`, line-height `1.6`; H1 / `--t-display` `40px`; H2 `29px`; section gap `64px`; **eyebrow `22px`** (its own `--t-eyebrow`, so the section overline reads without dragging stat labels / table heads, which stay `13px`). These replace the old 15 / 56 / 128 marketing-hero scale — they make a dense doc *readable* rather than *sparse*.

**Single reading column.** `--max-content` *is* the column; content (≈720) = `--max-content` minus side padding. Every block — prose, `.stat` row, `.compare` table, `.figure`, `.grid` — fills the **same** width, so left and right edges align. No dual-width: a narrow prose cap inside a wide container is exactly the split that reads as "broken." `<figure>` ships a browser-default `margin-inline` — the reset zeros it; don't reintroduce per-figure margins.

**Type comes in roles, not loose sizes.** component-styles.css defines roles (`display / title / subtitle / lead / caption / eyebrow`) that each lock `font-size + line-height + letter-spacing` together. Headings (`h1/h2/h3`) map to roles automatically; for any other text apply a `.t-*` class — **never set `font-size` alone**. Applying a role is the cheapest move and the correct one.

**Depth is the content's, not the form's.** The restraint here is about *look*, not *length*. If a mechanism needs three paragraphs, write three — feed the renderer deep, mechanism-level content (not a bullet summary) and it stays readable at this scale. A thin doc is usually a thin *input*, not a skill constraint (see §2).

## §7 · Component rules

- **Default no border.** White-on-white separated by padding + whitespace.
- **Shadows rare.** Only for dropdown / popover. Not for cards.
- **Hover unchanging.** No transform, no border swap. At most a `rgba(0,0,0,0.02)` background nudge.
- **Lists separated by gap, not by bordered rows.**
- **Tooltips CSS-only:** `data-tip="..."` attribute + `::after` / `::before` pseudo-elements. Never the browser's native `title=` (renders as the system yellow box, breaks aesthetic).
- **Icons:** `stroke="currentColor"`, `stroke-width="1.5"`, `fill="none"`. Inheritance from text color keeps them theme-coherent. For an *accent* glyph, swap the stroke to a semantic gradient from `gradient-defs.html` (`stroke="url(#g-tech)"`) — the color layer's glyph channel; default icons stay `currentColor`.

### Structural primitives — write the cheapest thing, it's the correct thing

component-styles.css removes whole classes of spacing/layout bugs by construction. Author *with* the grain:

- **Vertical rhythm is the container's job (gap-stack).** `main / header / section` are flex-column stacks that own the gap between their children. So **do not put `margin-top` / `margin-bottom` on block children** — drop a new paragraph / block straight into the stack and it is spaced correctly. Adjacent blocks collapsing to a 0 gap is not expressible. Need one pair tighter/looser? Use a `calc(target − stackGap)` delta, sparingly.
- **Multi-column = `data-cols`, never a bespoke grid.** `<div class="grid" data-cols="4">` gives the desktop column count *and* the mobile collapse-to-1 in one move. Never hand-write a grid that needs a paired `@media` override — that's the "forgot the mobile twin" bug. Semantic column count is intentional (4 systems → 4 cols); keep it explicit.

### apple.com-empirical rules (audited, see §10)

- **Container architecture.** A **single reading column** (`--max-content`, content ≈720). Every block — prose, `.stat` row, `.compare` table, `.figure`, `.grid` — fills the **same** width; left **and** right edges align. No dual-width (a narrow prose cap inside a wide container is the split that reads as broken). **No negative margin to break a figure past the column; no `margin-inline: auto` to center prose.** Those produce the marketing-hero mismatch this skill deliberately avoids.
- **`stat` is three-part, homogeneous.** tiny eyebrow + 巨号 (≤4 chars or a number) + tiny label, center-aligned. If the content is a *sentence*, it is not a stat → use `.trio` (h3 + p subsections). In a multi-column row, **all cells get identical visual weight** — no hero card to flag the "winner"; let the numbers speak (apple.com compare pages do this).
- **No hairline between same-level items.** `.stat` / `.step` / `.compare tbody tr` are separated by whitespace, never a `border-top`. Hairlines are only for section boundaries, the `thead` underline, and figure container edges.
- **`mark` = white bold, no tint; `eyebrow` = gray.** Accent color is reserved for links / CTAs (see §9 for `mark` semantics).

### Grid, media cards & images — overview, never decoration

Most content is prose. Reach for structure only when the content is structured:

- **Equal grid (`.grid[data-cols=N]`)** — N genuine **peers** the reader benefits from scanning together (4 systems, 3 use-cases). Can't name why they're peers? It's a list.
- **`.figure`** — one real image (screenshot / photo / diagram). An image is *content* → it fills the column as a figure.
- **Media cards (`.scene` / `.capcard`, inside `.grid[data-cols]`)** — the highest bar. Allowed only when **three things hold at once**: ① it's an **overview the prose below still fully covers** — delete the cards and no information is lost (they're a scannable index, not the source of record); ② **every card has a real image**; ③ the items are peers worth seeing together. Use `.scene` (image fills, scrim + overlaid label) for photos with no baked-in text; `.capcard` (image on top, label below) for images that already carry a caption.

**The anti-pattern (named so it isn't repeated):** turning text-only peers into saturated gradient panels "to add color." A media card with no `<img>`, a bento where every cell is the same weight, a panel whose only job is to be colorful — all decoration masquerading as content. **No real image → not a media card**; drop to an equal grid or a list.

**Image mindset.** Before drawing any visual block, ask *"is there a real image for this?"* — a debug-run screenshot proving it works, a key figure from research, a paper figure, a product shot. If yes → figure or media card. If no → don't manufacture one; use prose / list / equal grid. When sourcing content (e.g. via a research subagent), have it **find real images and write mechanism-level depth**, not bullet summaries — the renderer is only as deep and as illustrated as its input.

## §8 · Class taxonomy budget

**≤ 25 semantic class names** per document. Variants are expressed via `[data-v="..."]` / `[data-k="..."]` attribute selectors, not by opening new classes (`.btn` + `[data-v="primary"]` rather than `.btn-primary`).

**Hand-write CSS over Tailwind + `@apply`.** Tailwind's preflight + `--tw-*` reset vars cost ~30 KB before any content; on a single-file doc, `@apply` ends up being CSS authoring with one extra indirection, so just write the CSS. (Tested: v3 with Tailwind + `@apply` = 66 KB; v4 hand-written same content = 41 KB; v4.2 with the same approach + polish = 38 KB.)

## §9 · Editorial discipline

- **`<mark>` = editorial judgment, not typographic bold.** Reserve for "if the reader only reads this one sentence, the section's core message survives." Cap at **~1 `<mark>` per section**.
- **`<mark>` renders as white bold inline — no background tint.** apple.com marketing emphasis is a white-weight word inside gray body ("best-ever iPhone battery life"), not a highlighter swipe. The old `--hl-bg` tint is removed. `<strong>` is plain bold; neither carries a background.
- **No navigation chrome** (TOC, anchor CTAs, jump-to-X banners) unless the document is ≥ 15 screens. Handoff-shape docs scroll once; nav chrome interrupts more than it helps.

## §10 · Polish discipline

- **Tokenize before re-tuning.** If you find yourself reaching for the same `line-height` / `padding` / `margin` value in **≥ 3 places**, lift it to a `:root` token first, then tune the token once. Second-round polish should change one line, not thirty.
- **Dogfood phase and polish phase are separate passes.** First make the document content-complete and doctrine-correct. Then polish the typography / spacing / `<mark>` placements. If you mix them, you cannot tell whether a change came from doctrine or from typography drift.
- **实证 > 约定 — verify "Apple idioms" against real pages, don't inherit by hearsay.** Before relying on any "this is how apple.com does it" claim in the polish phase, audit it against **≥ 3 real apple.com pages**. Do not carry a previous doctrine version's claim forward on trust. This rule exists because v4.2 shipped three wrong idioms (mark background tint, hairlines between same-level items, accent-colored eyebrows) that nobody had re-checked against ground truth — each was a self-reinforced convention, not an observed fact. This single discipline outweighs any individual detail rule below it.

## §11 · Mermaid invocation (mmdc)

Compile time, not runtime. Never load Mermaid from a CDN — past attempts hit `stateDiagram-v2` syntax errors and ESM defer races. The right invocation is:

```bash
npx --yes @mermaid-js/mermaid-cli \
  -i path/to/diagram.mmd \
  -o path/to/diagram.svg \
  -c references/mermaid-theme.json \
  -b transparent
```

The output SVG is static — embed it inline in the HTML alongside the hand-written content. The theme JSON encodes the Apple palette (see §4) so Mermaid output visually matches the rest of the doc without runtime adaptation.

For a working source-and-output pair, see `references/seq-before.mmd`, `references/seq-after.mmd`.

## §12 · Reversal triggers

The doctrine is honest about where it could be wrong. Reverse a rule when:

- **Mermaid for some diagram type repeatedly feels "not good enough"** → fall back to hand SVG or post-process the Mermaid output with CSS hooks for that type only.
- **SVG fallback fires ≥ 2 times in one document** → the three layers do not cover something specific; consider extracting a fourth primitive (chart layer, etc.).
- **Same component reused across ≥ 2 documents** → time to extract primitives. Look at Astro (or a similar SSG) for cross-document component reuse; the single-file rule was a 1-document optimization.
- **mmdc install or maintenance breaks** → consider vendoring a fixed mermaid-cli version into the repo.
- **Doc genuinely needs marketing-style layout** (heading-left / body-centered mismatch, full-bleed media breaking the column, per-section hand-tuned spacing) → this skill's single-column left-aligned specs discipline does not fit. Hand-write that CSS, or split a sister `/html-as-marketing` skill. Do not bend the single reading-column rule with negative margins to fake it.

Until one of these triggers, do not invent abstractions.

## §13 · Optional build step (sharing)

Two modes, one source:

- **Authoring (default).** Keep the source **light**: images as `<img src="figure.png">` (external ref), code as plain `<pre><code>…</code></pre>`. Small, diffable, cheap to re-read and edit. This is everything §1–§12 describe.
- **Sharing (on explicit request).** When the doc needs to go out as one portable file, run the build. It produces a **self-contained** copy — code shiki-highlighted, images inlined as base64 **WebP** — written to a *separate* path. The source is never touched, so you can keep editing after a build.

```bash
node <skill-dir>/scripts/build.mjs <src.html> <out.html> [--no-compress]
# e.g.  build.mjs report.html report.share.html
```

`<skill-dir>` is this skill's install directory — `${CLAUDE_SKILL_DIR}` when the harness provides that substitution, otherwise the directory containing this SKILL.md. Never assume cwd is the plugin repo.

- Output naming convention: `foo.html` → `foo.share.html` (or `dist/foo.html`).
- `out` must differ from `src` — the build refuses to overwrite the source.
- Compression is on by default (sharing is the reason to build); `--no-compress` inlines originals as-is.
- First run in `scripts/` needs `npm install` (deps: `shiki`, `sharp`).
- It is **compile-time and explicit** — never auto-runs, never on save. The output is still plain self-contained HTML with no runtime build artifacts (consistent with §1/§2).

Do **not** hand-inline base64 images while authoring — that bloats the source (a 2 MB figure makes the file un-editable). Let the build do it at share time.

## References

These files live next to this SKILL.md under `references/`. Load policy varies by file — do not preload all of them.

### Snippet templates — read once and embed into the output

- **`references/component-styles.css`** — **the primary embed.** The full design system in one block: palette + **content-first type tokens** (18px body / 40px H1 / 64px section gap / dedicated `--t-eyebrow`) + **single reading column** (`--max-content`, all blocks edge-aligned) + **16 `--grad-*` semantic gradients** + T2 layout primitives (gap-stack / type-roles / grid-collapse) + T1 components (mark, eyebrow, table, code chip, stat, surfaces, **`.grad` gradient-text**, **`.scene`/`.capcard` media cards**) + `.shiki` dual-theme switch. Paste into the document's `<style>` block. Supersedes embedding the two granular files below — it already contains them.
- **`references/apple-palette.css`** — light + dark palette tokens (granular source; already inside component-styles.css). Embed standalone only if you deliberately want palette without the rest.
- **`references/typography-tokens.css`** — typography / spacing / font tokens (granular source; already inside component-styles.css).
- **`references/lucide-symbols.html`** — 11 Lucide `<symbol>` definitions (zap, clock-arrow-down, radio, archive, lightbulb, wand-2, alert-triangle, circle-help, arrow-down, git-commit, file-text). Paste into the top of `<body>`; reference via `<use href="#i-name"/>`.
- **`references/gradient-defs.html`** — 8 icon-stroke `<linearGradient>` defs (the color layer's glyph channel). Paste into the top of `<body>` next to the Lucide symbols; reference via `stroke="url(#g-name)"`. Embed only when an accent glyph is actually used.

### Build configuration — not embedded; passed to mmdc

- **`references/mermaid-theme.json`** — Apple `themeVariables` for Mermaid. Pass as `mmdc -c` argument (see §11). Do not embed in the HTML.

### Optional share build — run on request, never embedded (see §13)

- **`scripts/build.mjs`** — orchestrator: `node <skill-dir>/scripts/build.mjs <src.html> <out.html> [--no-compress]` (path resolution per §13). Highlights code + compresses/inlines images into a self-contained copy; refuses `out == src`.
- **`scripts/highlight.mjs`** — shiki dual-theme (github-light/dark) for `<pre><code>` blocks; honors `class="language-X"`, auto-detects JSON.
- **`scripts/compress-images.mjs`** — sharp raster→WebP (q82, max-width 2400, alpha preserved, SVG passed through).
- **`scripts/inline-images.mjs`** — `<img src>` → base64 data URI (idempotent; compresses via the above unless `--no-compress`).
- **`scripts/package.json`** — deps `shiki` + `sharp`; `npm install` in `scripts/` before first run.

### mmdc demo source/output — reference example

- **`references/seq-before.mmd`**, **`references/seq-after.mmd`** — minimal sequenceDiagram pair showing the mmdc compile pattern. Reference when writing new `.mmd` sources.

### Calibration material — load only when the eye needs reference

- **`references/exemplar-v6-expression.html`** — the current high-water-mark exemplar. Embodies the full expression-v2 system: content-first scale (18px body / 40px H1 / 22px eyebrow), the **single reading column** with every block edge-aligned, the **semantic color layer** (gradient-text focus, gradient-stroke icons), **grid + media cards used as overview-not-decoration**, mechanism-level deep prose, a Mermaid figure, and shiki-highlighted code — alongside the inherited T1/T2 rules (no same-level hairlines, `mark` white-bold, gray small-labels, right-aligned table numerics, stat 三段式, gap-stack rhythm, type-roles, `data-cols` collapse). Open when calibrating density / rhythm / color / micro-typography. Doctrine drives structure; the exemplar calibrates finish. (Supersedes v5, whose 1040 column + 15px/56px marketing scale + colorless palette were overturned by the expression-v2 recalibration.)
- **`references/visual-doctrine-showcase.html`** — D2 / Satori / Mermaid / hand-SVG horizontal evaluation. Open only when the three-layer triage in §3 is uncertain for a specific diagram shape.

The two HTML files together are ~70 KB — substantial cost when loaded into context. Treat them as on-demand reference, not default reading.
