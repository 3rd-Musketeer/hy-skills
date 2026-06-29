---
title: html-as-doc
status: done
desc: Ship /html-as-doc skill + handoff doctrine merge into /go, codifying the rinote dogfooded handoff and HTML expression discipline
created_at: 2026-05-28
---

# HTML-as-Doc Skill + Handoff Doctrine Goal

## Outcome

When this milestone is done, three things are true:

1. **`/html-as-doc` exists as a user-deliberate-invocation skill.** In any agent session with half-dev-skills 0.12.0 installed, a human can type `/html-as-doc` with content in hand and receive a self-contained single-file HTML doc that matches the v4.2 design system baseline (apple.com palette, v4.2 typography tokens, three-layer visual doctrine, token unification across Mermaid / HTML / SVG fallback).

2. **`/go` §6 handback text carries the handoff doctrine.** §6 cites `references/handoff-doctrine.md` for body discipline (体裁 / 信息密度 / 语言纪律 / visual judgment / 思考骨架). §6 stays **medium-agnostic** — it does not name `/html-as-doc` or any other concrete doc-render skill; it uses phrasing like "whatever doc-render skill matches the medium." The doctrine ref is itself medium-agnostic.

3. **Both ship in the same `half-dev-skills` version bump** (0.11.0 → 0.12.0), so `/go` §6's reference to `handoff-doctrine.md` lands at the same time the file exists.

## Motivation

`rinote` dogfooded the handoff doctrine and HTML expression discipline over 7 iterations of the `instant-writes` milestone, producing `handoff-html-method.md` (40KB) as the methodology compilation and `instant-writes-handoff-v4.2-apple.html` (38KB) as the current high-water exemplar.

Cost of not skill-ifying: every future milestone's handoff would re-discover doctrine from scratch. The 7-iteration arc in rinote is not repeatable; each future re-discovery is roughly a day of work that the doctrine already answers.

Cost of not merging doctrine into `/go`: `/go` §6's current contract is structural (pickup runway / audit material slot shape). It enforces **what slots exist** but not **how the body reads** — so an agent honoring the contract can still produce an RFC-style or implementation-checklist-style handback (rinote's v1 reports are exactly this failure mode).

Why now:
- v4.2 is the internal convergence point of the dogfood; further iteration would be over-polish, not new insight.
- Source staging is already in `.staging/handoff-source/`.
- `.gdd/` has never been initialized for `half-dev-skills`; bootstrapping it with this goal saves a separate setup pass.

## Scope

### In

- `.gdd/` full layout bootstrap: `goal.md` index + `goals/goal-20260528-html-as-doc.md` (this file) + `backlog.md` with deferred items.
- New skill: `skills/html-as-doc/SKILL.md` + `references/` (snippet templates + calibration exemplars + mermaid config).
- New reference for `/go`: `skills/go/references/handoff-doctrine.md`.
- `skills/go/SKILL.md` §6 patch: ≤6 added lines naming default medium + medium-agnostic escape hatch + cite of handoff-doctrine ref.
- Extension to `skills/references/goal-driven-dev.md`: file-or-folder invariant clarifies that companions include both pre-execution items (mockups, sketches, snapshots) and post-execution items (handoff docs, validation reports), with flat layout default inside the goal folder.
- Plugin version bump 0.11.0 → 0.12.0 across all manifests (including Codex multi-target).
- `.staging/handoff-source/` cleanup after skill files land.

### Out

- `/handoff` skill for multi-agent handoff (name reserved; backlog).
- Astro / VitePress / build pipeline (deferred to 2nd handoff dogfood).
- Cross-handoff primitives library extraction (deferred to N ≥ 2 reuse signal).
- `/pdf-as-doc` / `/slidev-as-doc` or other media-discipline skills (YAGNI; current use case is HTML only).
- Modifications to other existing skills (`gdd`, `refactor`, `goal-shaper`, etc.).
- Authoring helper (build.mjs / template literal / Eleventy) for repeated section structure (KISS; agent writes HTML directly).
- `frontend-design` skill integration (rinote §4 failure mode #1: agent treats audit as deliverable — doctrine embeds frontend-design output into prompt rather than letting agent call it).
- Cleanup of `rinote` source artifacts (entirely out of scope; no handback reminder either).
- AGENTS.md / devlogs entries unless release notes need them.

## Product Experience (PX) & Mental Model

### `/html-as-doc` user mental model

"I have a piece of converged content (milestone summary, tech spec, retro notes, tutorial draft, anything). I want it rendered as an HTML doc that does **not** look generic-AI-ish — apple.com transparency, high information density, visuals that explain rather than decorate. I deliberately type `/html-as-doc`, paste the content, and get a single-file HTML I can open directly, attach to email, or commit into `.gdd/goals/<slug>/handoff.html`.

I do not expect the agent to sniff intent from natural phrases like 'render as html' — that's `/explain`-style explicit invocation territory; I'll type the command when I want this expression discipline applied."

### `/go` downstream handoff user mental model

"After `/go` finishes a milestone, the §6 handback reads more directly than before: 'what changed / how to verify' leads, 'why this design' links back to the goal doc. It no longer reads like a RFC or a concatenated commit log. If I want a richer doc artifact, I separately invoke `/html-as-doc` myself — `/go` does not decide medium upgrades for me."

## Design

### Surface

**File tree** (additions and changes marked):

```
half-dev-skills/
├── .gdd/                                       ← NEW (this bootstrap)
│   ├── goal.md
│   ├── goals/
│   │   └── goal-20260528-html-as-doc.md
│   └── backlog.md
│
├── skills/
│   ├── references/
│   │   └── goal-driven-dev.md                  ← PATCH (file-or-folder invariant extension)
│   │
│   ├── go/
│   │   ├── SKILL.md                            ← PATCH (§6, ≤6 lines added)
│   │   └── references/
│   │       └── handoff-doctrine.md             ← NEW
│   │
│   └── html-as-doc/                            ← NEW skill
│       ├── SKILL.md
│       └── references/
│           ├── apple-palette.css               ← snippet
│           ├── typography-tokens.css           ← snippet
│           ├── lucide-symbols.html             ← snippet
│           ├── mermaid-theme.json              ← config
│           ├── exemplar-v4.2-apple.html        ← calibration material
│           └── visual-doctrine-showcase.html   ← decision evidence
│
├── .gitignore                                  ← already updated (.staging/)
└── plugin manifests                            ← PATCH (0.11.0 → 0.12.0)
```

**Key contracts**:

| Surface | Form |
|---|---|
| `/html-as-doc` invocation pattern | User-deliberate (typed `/html-as-doc`); skill description follows `/explain` pattern with explicit "do NOT auto-trigger on ordinary 'render as html' mentions." |
| `/html-as-doc` output | Single-file self-contained HTML, 30–50KB healthy range for moderate content, apple.com palette + v4.2 typography baseline + three-layer visual doctrine. |
| `/go` §6 contract | Existing pickup runway / audit material slot shape unchanged; adds medium-agnostic hint + cite of handoff-doctrine ref. |
| `/go` `handoff-doctrine.md` | Carries 体裁 / 信息密度 / 语言纪律 / visual judgment / 思考骨架; medium-agnostic. |
| `goal-driven-dev.md` invariant extension | File-or-folder invariant explicitly covers pre-execution and post-execution companions; flat layout default inside goal folder. |
| Plugin version | 0.12.0 across all manifests synchronously. |

### Architecture

Two skills sit on opposite axes and are explicitly orthogonal:

```
┌──────────────────────────────────────────────────┐
│  /go SKILL.md §6 (contract layer)                │
│   • Pickup runway slot shape                     │
│   • Audit material slot shape                    │
│   • Medium-agnostic hint                         │
└─────────────────────┬────────────────────────────┘
                      │ cites (intra-skill ref)
                      ▼
┌──────────────────────────────────────────────────┐
│  /go references/handoff-doctrine.md              │
│  (content discipline layer)                      │
│   • 体裁 / 信息密度 / 语言纪律                     │
│   • 思考骨架 / visual judgment                    │
│   • Medium-agnostic                              │
│   • Cross-ref to goal-driven-dev.md for output   │
│     path (file-or-folder invariant)              │
└──────────────────────────────────────────────────┘

           ╳ orthogonal — no cross-naming ╳

┌──────────────────────────────────────────────────┐
│  /html-as-doc SKILL.md                           │
│  (medium discipline layer)                       │
│   • Three-layer visual doctrine                  │
│   • Token unification primitive                  │
│   • Apple palette / v4.2 typography / polish     │
└─────────────────────┬────────────────────────────┘
                      │ cites
                      ▼
┌──────────────────────────────────────────────────┐
│  references/{snippets, exemplars, config}        │
│   • Snippets: apple-palette / typography / lucide│
│   • Config: mermaid-theme.json                   │
│   • Exemplars: v4.2-apple, doctrine-showcase     │
└──────────────────────────────────────────────────┘
```

Composition is the human's call: read `/go` §6 handback, decide "I want HTML," invoke `/html-as-doc` separately. `/go` does not invoke `/html-as-doc` on the human's behalf, and `/html-as-doc` does not know anything about handoff structure.

## Definition of Done

### Acceptance Scenarios

#### S1 — `/html-as-doc` triggers and produces doctrine-compliant HTML

```
Setup    half-dev-skills 0.12.0 installed; fresh agent session
Trigger  Human types `/html-as-doc` explicitly and provides a piece of
         converged content
Expected Agent triggers /html-as-doc, reads SKILL.md + relevant references
         on demand, produces a single-file self-contained HTML
Pass     ✓ File opens standalone with no external dependencies beyond
            Alpine.js CDN (single script)
         ✓ Applies apple.com palette (sample: bg #FFFFFF, text #1D1D1F,
            accent #0066CC)
         ✓ Applies v4.2 typography baseline (sample: body line-height 1.65,
            h1 56px)
         ✓ Visual blocks use one of the three layers (Mermaid / HTML+CSS
            / inline SVG fallback)
         ✓ File size lands in the 30–50KB healthy range for moderate content
         (sampling-level verification — 3 to 5 spot checks per axis, not full grep)
```

#### S2 — `/go` §6 medium-agnostic, decoupled from any concrete doc-render skill

```
Setup    Any /go run completing a milestone
Trigger  Agent produces §6 handback
Expected Handback text is strictly medium-agnostic; names no specific
         render skill
Pass     ✓ grep over §6 output finds no literal "/html-as-doc" string
         ✓ §6 text contains medium-agnostic escape hatch phrasing
            (e.g., "doc-render skill matching the medium")
         ✓ §6 cites references/handoff-doctrine.md (intra-skill ref allowed)
         ✓ handoff-doctrine.md itself names no specific render skill
```

#### S3 — `.gdd/` bootstrap is cold-readable and the invariant extension carries its weight

```
Setup    Fresh reader opens half-dev-skills/.gdd/ for the first time
Trigger  cat goal.md → goals/goal-20260528-html-as-doc.md
Expected Layout is intelligible without external context; invariant
         extension lets reader derive future handoff path
Pass     ✓ .gdd/{goal.md, goals/, backlog.md} all exist
         ✓ This goal lives in goals/ as single-file form (this milestone
            produces no handoff doc itself)
         ✓ goal.md index cites this goal correctly (no .md suffix)
         ✓ backlog.md lists deferred items as one-line entries (Astro,
            primitives, /handoff skill, authoring helpers, etc.)
         ✓ goal-driven-dev.md's file-or-folder invariant section has
            been extended so that a cold reader can derive: "a future
            milestone's HTML handoff lands at
            .gdd/goals/goal-YYYYMMDD-slug/handoff.html" without
            consulting any other file
```

### Hard Gates

| Gate | Verification |
|---|---|
| **G1** | Plugin version 0.11.0 → 0.12.0 landed; grep all manifest files (`plugin.json` + Codex marketplace manifests) for consistent `version` field |
| **G2** | `/html-as-doc` description + when_to_use explicitly carries "user-deliberate invocation" semantics with "Do NOT auto-trigger on ordinary X" phrasing, mirroring `/explain` |
| **G3** | `/html-as-doc` SKILL.md body ≤ 2000 words (`wc -w` minus frontmatter) |
| **G4** | `/go` references/handoff-doctrine.md ≤ 1500 words |
| **G5** | All snippet references syntactically valid (apple-palette.css parses as CSS; mermaid-theme.json parses as JSON; lucide-symbols.html parses as HTML fragment) |
| **G6** | mmdc compile demo runs successfully: `npx --yes @mermaid-js/mermaid-cli -i seq-after.mmd -o /tmp/out.svg -c mermaid-theme.json -b transparent` exits 0 |
| **G7** | `.staging/handoff-source/` deleted (`test ! -d .staging/handoff-source`) |
| **G8** | `goal-driven-dev.md` invariant extension is grammatically integrated into the existing file-or-folder paragraph, not bolted on as a separate section |
| **G9** | This goal doc itself follows the 8-dimension shape of `gdd/references/goal-template.md` |

## Pickup

### User role

`half-dev-skills` developer with plugin 0.12.0 installed locally, in a fresh agent session in any project, holding a piece of converged content (a recent milestone summary, a tech spec, a tutorial draft, anything renderable as an HTML doc). Knows `/html-as-doc` is a user-deliberate-invocation skill and will type the command actively rather than expecting the agent to sniff intent from natural language.

### Pickup action

In a fresh agent session, explicitly type `/html-as-doc` and provide the content.

### Staging required

#### Agent-scriptable (`/go` performs these in execution)

| Item | Verification |
|---|---|
| All new files / patches / new directories land at expected paths | `find .gdd skills/html-as-doc skills/go/references -type f` matches expected inventory |
| Plugin manifest version 0.11.0 → 0.12.0 across all manifests | grep `version` field consistency |
| Snippet references syntactically valid (G5) | parse each format with the right tool (JSON.parse / CSS sanity / HTML fragment grep) |
| mmdc compile demo (G6) | run `npx --yes @mermaid-js/mermaid-cli -i ... -o /tmp/out.svg -c ...`, check exit code |
| `.staging/handoff-source/` deleted (G7) | `rm -rf` then `test ! -d` |
| `.gdd/` bootstrap (this file, goal.md index, backlog.md) | files exist, cross-cites correct, backlog carries deferred one-liners |
| `git add` + `git commit` per `/go` §6 default | standard commit flow |

#### Human-only (`/go` defers with reason)

| Item | Reason |
|---|---|
| Real invocation of `/html-as-doc` to judge whether output reaches v4.2 quality | End-user subjective quality call — agent cannot grade "feels right." Agent can verify the skill loads and produces a file (G5/G6/G3-G4) but cannot judge the design fit. |
| Decision to `git push` / open a PR | Per `/go` default contract: visible-to-others operations require explicit human consent each time. |

## Decisions

### Resolved

- [resolved] `/html-as-doc` is expression-style discipline skill, single-thread, agent writes HTML directly, no intermediate transformation / no build pipeline / no subagent
  Reason: KISS, mirrors `/explain` pattern, avoids framework lock-in.

- [resolved] Handoff doctrine merges into `/go` (new `references/handoff-doctrine.md` + §6 patch); no standalone `/handoff` skill in this milestone
  Reason: handoff is a content discipline applied to `/go`'s existing §6 contract, not a separate workflow.

- [resolved] `/handoff` name is reserved for future multi-agent handoff scenarios; not used in this milestone
  Reason: avoids name collision when multi-agent flows materialize.

- [resolved] House style: verb-led description (go-style frontmatter), body allows second-person; lean SKILL.md + progressive disclosure adopted strictly from skill-creator guidance
  Reason: maintain half-dev-skills consistency on voice; strictly follow lean SKILL.md to avoid context bloat.

- [resolved] `references/` flat structure, holds both snippet templates (paste-into-output) and calibration exemplars (study-don't-copy)
  Reason: small skill, shallow tree clearest; categorization handled by file naming.

- [resolved] Apple themeVariables JSON vendored from rinote into `references/mermaid-theme.json`
  Reason: this is a stable build-time config, vendoring eliminates external dependency.

- [resolved] Astro / VitePress / build pipeline / cross-handoff primitives library / authoring helpers all deferred to second handoff dogfood
  Reason: §10 reversal triggers in master doc; need N ≥ 2 real reuse signal before deciding the right shape.

- [resolved] `frontend-design` skill is not integrated into the doctrine; doctrine instead embeds design specification into prompt at handoff time
  Reason: rinote §4 failure mode #1 — agent treats `frontend-design` audit response as final deliverable.

- [resolved] `/go` §6 does not name `/html-as-doc` or any other concrete doc-render skill; uses "whatever doc-render skill matches" phrasing
  Reason: preserve content-discipline × medium-discipline orthogonality; `/html-as-doc` serves other doc types too and should not be narrowed to handoff-only by exclusive naming from `/go`.

- [resolved] `.staging/handoff-source/` cleanup is within this goal's scope
  Reason: staging was created for this goal, tightly coupled; defer would lose context.

- [resolved] `rinote` source artifact cleanup is entirely out of this goal's scope; no handback mention or reminder either
  Reason: cross-repo deletion is human-decision territory; this goal stays focused on `half-dev-skills` deliverables.

- [resolved] Anti-pattern HTML reports (rinote v1, RFC-style v2) do not enter `references/`; doctrine ref carries the anti-pattern semantics in prose
  Reason: anti-patterns serve doctrine drafting; once doctrine prose absorbs the lessons, raw files add noise to the agent's context.

- [resolved] Exemplar filename carries version: `exemplar-v4.2-apple.html`
  Reason: version-in-filename mirrors `goal-driven-dev.md` time-in-filename invariant; future v5 exemplar coexists without rename pressure.

- [resolved] Do not vendor rinote's `goal-20260526-instant-writes.md` as an example; doctrine ref points at `gdd/references/goal-template.md` instead
  Reason: goal doc shape is `gdd` skill's responsibility; `/go` doctrine should not re-teach methodology.

- [resolved] Handoff documents (and other post-execution artifacts) attach to the goal folder per file-or-folder invariant; layout inside goal folder defaults to flat (goal.md + handoff.html + assets at same level)
  Reason: KISS / YAGNI — sub-divide only when asset count makes pre/post artifacts visually hard to scan.

- [resolved] `handoff-attaches-to-goal-folder` convention lives in `skills/references/goal-driven-dev.md` (extend file-or-folder invariant); `/go` doctrine carries a one-line cross-ref but not the rule itself
  Reason: this is a `.gdd/` methodology-level convention applying to any post-execution artifact, not a `/go`-specific path rule. Future post-mortem / validation-report skills would derive the same placement from the same invariant.

- [resolved] S1 pass criteria uses sampling-level verification (3–5 spot checks per axis), not full grep
  Reason: S1 is a user-facing acceptance scenario, not a lint task; full-axis verification is the job of G5.

- [resolved] S3 includes the cognitive check "cold reader can derive future handoff path from `goal-driven-dev.md` alone"
  Reason: this is the load-bearing test that the invariant extension is well-written; without it, the extension could be technically present but cognitively dead.

- [resolved] G6 (mmdc compile demo) runs for real (not just lint check)
  Reason: mmdc compile path is the key revival route of the master doc §10; this milestone's goal is to lock that path down — not running it once leaves uncertainty.

- [resolved] `/go` does not self-render a demo HTML during staging for this goal; G1–G9 cover structural validation, first live invocation is the human's pickup action
  Reason: no organic content to render (goal deliverable is the skill itself); synthetic demo would not exercise doctrine meaningfully; quality judgment is human-only anyway. Handback explicitly names this as deferred-with-reason per transparence principle.

- [resolved] `/html-as-doc` is a user-deliberate-invocation skill (mirrors `/explain` pattern); description + when_to_use explicitly say "Do NOT auto-trigger on ordinary 'render as html' mentions"
  Reason: expression-style skills should not auto-fire on ambiguous natural language; user calls deliberately when they want this specific discipline.

### Fact

- [fact] rinote's `.gdd/reports/` and `.gdd/refs/handoff/` directories were entirely untracked at staging time
  Consequence: source materials had to be copied to `.staging/handoff-source/` before any deletion to avoid permanent loss; staging is the only canonical preserved copy.

- [fact] `half-dev-skills` is currently at version 0.11.0; bump target is 0.12.0
  Consequence: G1 must sync all manifests including the Codex multi-target manifest.

- [fact] `mmdc` is invoked via `npx --yes @mermaid-js/mermaid-cli` on demand; not vendored as a repo dependency
  Consequence: G6 runs through `npx` invocation; no `package.json` is created in this repo.
