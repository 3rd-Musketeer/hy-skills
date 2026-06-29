---
title: html-as-doc-build
status: done
desc: T3 — optional post-author build pipeline (shiki highlight + image inline + WebP compress) with a light source / self-contained share two-mode contract
created_at: 2026-05-29
---

# HTML-as-Doc Build Pipeline Goal (T3)

The third thread from the 2026-05-29 dogfood. Near-zero coupling with T1/T2 (only touches `<img>` / `<pre>` and SKILL.md §1/§2/§3). Source draft: [`backlog-20260529-html-as-doc-asset-pipeline`](../backlogs/backlog-20260529-html-as-doc-asset-pipeline.md) Pillar 1.

## Outcome

1. **`skills/html-as-doc/scripts/` exists** with an orchestrator + three transforms + deps:
   - `build.mjs` — orchestrator: reads a source HTML, runs the transforms in memory, writes a **separate** output file. Guards `out ≠ src` (refuses to overwrite source).
   - `highlight.mjs` — shiki compile-time highlighting (github-light + github-dark dual-theme, `defaultColor:false` → emits the `--shiki-light/--shiki-dark` vars that component-styles.css already consumes).
   - `inline-images.mjs` — `<img src="…">` → base64 data URI; idempotent (skips already-`data:`/`http(s):`/`file:`).
   - `compress-images.mjs` — sharp: raster → WebP q82, max-width 2400, preserve alpha, skip SVG.
   - `package.json` — deps `shiki` + `sharp`.

2. **Two-mode contract is real and documented.** Authoring uses a **light source**: `<img src="figure.png">` (external ref) + plain `<pre><code>`. Sharing runs the build to a **self-contained output**: shiki-highlighted code + base64 WebP images, written to a distinct path. The build never mutates the source.

3. **SKILL.md doctrine reconciled (b1).** §1/§2 no longer flatly forbid a build pipeline; they carve out the one exception: the skill is an authoring expression discipline, **plus** an *optional, explicit, post-author* build step for sharing — which does not change the one-shot inline authoring model. Plus the raster-figure authoring note that closes the gap T1/T2 left (author `<img src>`; build inlines+compresses for sharing).

4. **Plugin version 0.13.0 → 0.14.0.**

## Motivation

The dogfood hit a real conflict: a raster paper figure inlined as base64 bloated the source to 2.7 MB (un-editable, token-explosive, unreadable diffs), but sharing a single file *requires* inlining. The two needs — light source for editing vs self-contained-and-small for sharing — can't both live in one artifact. Today the agent has no clean path: keep `<img src>` (breaks "self-contained" on send) or inline (bloats source). T3 resolves this with a dev/build split (mirrors Astro/mdx): author light, build heavy-but-portable, on explicit action only.

Also closes two loose ends from T1/T2: the shiki highlight *script* (the `.shiki` CSS already shipped; the script that produces highlighted spans was deferred here), and the raster-figure doctrine note (where `<img>` fits and how it survives sharing).

## Scope

### In

- `skills/html-as-doc/scripts/`: `build.mjs`, `highlight.mjs`, `inline-images.mjs`, `compress-images.mjs`, `package.json`.
- SKILL.md edits: §1/§2 b1 carve-out (optional post-author build step); §3 (or §7) raster-figure authoring note + cross-ref to the build step; a new short section documenting the two-mode contract + how to run `build.mjs`.
- Version bump 0.13.0 → 0.14.0 across all manifests (incl. Codex multi-target).

### Out (→ backlog / other)

- Any change to T1/T2 CSS, primitives, or exemplar (decoupled).
- Auto-running the build (it is explicit-only — never on save, never silent).
- Stylelint token-lint / visual-regression harness (deferred in the styling goal; unchanged here).
- A custom `shiki-theme.json` apple palette — built-in github dual-theme already produces the vars the CSS consumes; no custom theme needed (decision below).
- Astro / SSG / multi-file output (single-file in, single-file out).

## Product Experience (PX) & Mental Model

**Author light, build to share.** While writing/iterating, the doc stays small and diff-friendly — images are `<img src>`, code is plain. When the doc is ready to send, one explicit command produces a self-contained, reasonably-sized single file. The source is never touched by the build, so editing can continue after a build.

Mental model = **dev vs build**, like Astro/mdx. The skill's authoring discipline (one-shot inline HTML) is unchanged; the build is a separate, optional post-processor that only runs when the human asks to share.

## Design

### Surface

- `node skills/html-as-doc/scripts/build.mjs <src.html> <out.html>` — the one entrypoint. `--no-compress` escape hatch (compress is on by default, since sharing is the reason to build). Refuses if `out` resolves to `src`.
- Each transform is also runnable standalone (`highlight.mjs in out`, etc.) for debugging — but `build.mjs` is the normal path.
- Naming convention (documented, not enforced): source `foo.html` → output `foo.share.html` or `dist/foo.html`.

### Architecture

- **Two layers**: independent transforms (pure `(html, opts) → html` in memory) + a thin orchestrator that chains them and does the one file read + one file write. Rationale: each transform is independently testable/debuggable; shiki init is slow, so standalone re-runs of one transform are useful; a pure stdin|stdout pipe would lose the base-dir needed to resolve relative image paths.
- **Order in build.mjs**: highlight → (compress images → inline images) → write. Compress before inline so the base64 carries the WebP bytes.
- **Source-of-truth**: the source HTML is read-only to the pipeline; the `out ≠ src` guard makes "accidentally bloat the source" unrepresentable (the same make-illegal-states-unrepresentable spirit as T2).
- **Shiki theme**: built-in `github-light` + `github-dark`, `defaultColor:false`. No custom theme file — the dual-theme output already emits `--shiki-light/--shiki-dark` per-token vars, and component-styles.css's `.shiki` rules switch on them.

## Definition of Done

### Acceptance Scenarios

1. **Build a light source into a self-contained share file.** Given a doc with `<img src="fig.png">` and plain `<pre><code>{…json…}</code></pre>`, running `build.mjs src.html out.html` produces `out.html` that: has no external `<img src>` (all base64 WebP), has shiki-highlighted code (`.shiki` spans with `--shiki-light/dark`), renders identically in a browser, and is materially smaller than a naive base64-PNG inline. `src.html` is byte-identical to before.
2. **out ≠ src guard.** `build.mjs src.html src.html` exits non-zero with a clear message; source untouched.
3. **Real-doc size validation.** Run on the dogfood (`lifedialbench_explainer` with the paper PNG): confirm the self-contained output lands in the ~hundreds-of-KB range (target ≲ ~700 KB), versus 2.7 MB for naive PNG inline — i.e. WebP compression delivers the expected multiple-× reduction. Report actual numbers.

### Hard Gates

- The pipeline **never writes to the source path** (guard + tests).
- `shiki` + `sharp` are in `scripts/package.json`; `build.mjs` runs via `node` with deps installed.
- SKILL.md §1/§2 updated so they no longer contradict the existence of the build step; the build is documented as explicit-only and post-author.
- No change to T1/T2 CSS, primitives, or exemplar.
- Version bumped across all manifests.

## Pickup

### User role

half-dev-skills maintainer in a shell at the repo root, with a finished html-as-doc source file (e.g. the dogfood doc) in hand, wanting a single self-contained file to send to a colleague.

### Pickup action

Run `node skills/html-as-doc/scripts/build.mjs <their-doc>.html <their-doc>.share.html` and open the `.share.html` output.

### Staging required

- **Agent-scriptable**: create the four scripts + package.json; `npm install` in `scripts/` (shiki, sharp); run `build.mjs` on the real dogfood doc; report before/after sizes; open the built output in a browser and confirm it renders self-contained (no broken images, code highlighted); capture a screenshot.
- **Human-only**: none expected — the whole flow is agent-runnable. (If `sharp`'s native binary fails to install in this environment, name that as the one blocker with what was tried.)

## Decisions

- [resolved] §1/§2 doctrine via b1 — build = optional post-author post-processor
  Reason: the conflict was "skill is not a build system" vs "T3 adds a build." b1 keeps the authoring model one-shot-inline (unchanged) and frames the build as a separate, explicit, share-time step — so §1/§2 get a carve-out sentence, not a rewrite. Chosen over b2 (sibling skill) because the build is intrinsically about *this skill's* output and shares its references (component-styles.css `.shiki`), so co-locating is cleaner than a separate skill.
  Consequences: SKILL.md §1/§2 must be edited carefully to preserve "no framework / no runtime-JS build" while admitting this one post-processor.

- [resolved] Two-layer architecture (transforms + build.mjs orchestrator)
  Reason: independent test/debug; slow shiki init wants standalone re-runs; pure pipe loses base-dir for image path resolution.

- [resolved] build never mutates source; `out ≠ src` guarded
  Reason: the dogfood pain was an in-place inline bloating the source. The guard makes that unrepresentable.
  Consequences: naming convention `foo.html → foo.share.html` / `dist/foo.html` documented.

- [resolved] sharp → WebP, q82, max-width 2400, preserve alpha, skip SVG; compress default-on with `--no-compress`
  Reason: WebP is the largest-reduction format with universal 2026 support (incl. iOS Safari 14+); sharing is the reason to build so compress defaults on; sharp is cross-platform-consistent and Node-native (over system imagemagick).
  Consequences: sharp ships a native binary — install can fail on exotic platforms; flagged in Pickup.

- [resolved] No custom `shiki-theme.json`; use built-in github-light/github-dark dual-theme
  Reason: `defaultColor:false` already emits the `--shiki-light/--shiki-dark` per-token vars that component-styles.css's `.shiki` rules consume; a custom apple theme would be net-new surface with no consumer. (Supersedes the asset/expression drafts' tentative shiki-theme.json item.)

- [fact] highlight.mjs + inline-images.mjs prototypes already validated this session (in `/tmp/html-rework/`)
  Consequences: those two transforms are port-and-harden, not greenfield; compress-images.mjs + build.mjs are the new work.

- [fact] Current plugin version 0.13.0 (after T1+T2 merge)
  Consequences: this goal bumps 0.14.0.
