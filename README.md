# hy-skills

A personal methodology-skills plugin grown from my day-to-day practice using AI across many codebases and products — not tied to any single project. Every rule exists because a real dogfood run surfaced a gap, not because it sounded like good practice.

**Purpose:** better human-agent collaboration, and enabling coding agents to run long-range autonomous tasks with a visible, verifiable process.

**Runs under Claude Code plugins, Codex plugins, Kimi Code plugins, or any skill-only agent.** The `skills/` tree is the single source of truth; the plugin manifests are thin wrappers.

## Skills

| Name | What it does |
|---|---|
| `go` | Implement a feature end-to-end with light TDD — contract → tests-first → implement → patch tests → frontend verify → simplify → stage the pickup → ship. Returns a tested feature staged for the human to pick up as end user #2, not read as code. |
| `my-simplify` | Review recent code changes for reuse, quality, and efficiency simplifications. Used by `go` when the current harness has no native Simplify capability. |
| `refactor` | Audit code for maintainability, naming, contract boundaries, architecture coherence, and refactor ROI. Applies small safe refactors or proposes bounded rewrites when needed. |
| `open-worktree` | Propose or create one new task worktree from the repo base branch. Follows worktree-first naming and creation policy. |
| `commit-push-pr` | Publish the current task branch into a ready-for-review PR. Reuses the existing branch PR when present. |
| `loop-for-merge` | Watch one PR every 5 minutes and auto-merge the quiet or bot-approved happy path. Hands review comments back to a human. |
| `close-worktree` | Inspect or clean up one finished task worktree after merge or explicit abandonment. |
| `closeup` | Close out a shipped session downstream of merge — retire scaffolding, restore borrowed (created-vs-borrowed) environments, finalize tracking status, file the decision, verify a clean baseline, and hand off honestly. Orchestrates `close-worktree` and adds the ephemeral-environment teardown no other skill covers. |
| `gdd` | Shape goals from backlog candidates through a drafting gate, then refine into executable goal documents. Implements the goal-driven development methodology under `.gdd/`. Keeps humans focused on outcome, product experience, contracts, scope, scenarios, and definition of done while deferring implementation details to `/go`. |
| `mindset` | Interpret the user's development methodology and action words — probe, smoke, eyeball, 体感, sweep, review, audit, wrap up — to choose method and grain without turning the work into ceremony. |
| `grilling` | Question you relentlessly about a plan before building — brain-test first, write a question outline to tmp, then strictly one question at a time with options, analysis, and a recommendation each. Mixes three question energies (boundary-alignment, stress-test pressure, exploratory openers), triages decide/probe/backlog, and lands every ruling in artifacts. Explicit invocation only. |
| `explain` | Generate user-tailored explanations across different question types — concept intro, mechanism, decision, comparison. Applies a consistent set of expression rules (user-layer concepts first, conclusion first, no code refs by default) while adapting shape per scenario. Explicit invocation only. |
| `speak-normally` | Register discipline for Chinese prose output — plain Mandarin, engineering register, direct declarative statements, English technical terms kept as-is, no rhetorical inflation or fake precision. Constrains wording only, not content or structure; stacks on top of whatever skill shapes the content. Auto-applies to substantive Chinese prose without explicit invocation. |

## Install

### Claude Code

Two install paths are supported.

**A · Self-hosted marketplace (recommended)** — in Claude Code, `Add marketplace` and paste `3rd-Musketeer/hy-skills` (or the full GitHub URL). Claude Code reads `.claude-plugin/marketplace.json` at the repo root, lists `hy-skills` as the only plugin, and you install it from there. Updates pull on `Sync`.

**B · Direct plugin discovery** — point Claude Code's plugin discovery at this directory or symlink it into your configured plugins path. The `.claude-plugin/plugin.json` manifest is already present. Use this when you want a local checkout you actively edit.

Skills are invoked by slash command: `/hy-skills:go`, `/hy-skills:my-simplify`, `/hy-skills:refactor`, `/hy-skills:open-worktree`, `/hy-skills:commit-push-pr`, `/hy-skills:loop-for-merge`, `/hy-skills:close-worktree`, `/hy-skills:closeup`, `/hy-skills:gdd`, `/hy-skills:mindset`, `/hy-skills:grilling`, `/hy-skills:explain`, `/hy-skills:speak-normally`.

### Codex

Two install paths are supported.

**A · Self-hosted marketplace (recommended)** — `codex plugin marketplace add 3rd-Musketeer/hy-skills`, or use the equivalent flow in the Codex Electron app. Codex reads `.agents/plugins/marketplace.json` at the repo root (its preferred manifest path; `.claude-plugin/marketplace.json` is also accepted as a fallback). The marketplace registers under `[marketplaces.hy-skills]` in `~/.codex/config.toml`, and the plugin under `[plugins."hy-skills@hy-skills"]`.

**B · Reference from a project's marketplace** — when a project hosts a Codex marketplace, list `hy-skills` in its `<repo>/.agents/plugins/marketplace.json`. Minimal entry:

```json
{
  "name": "hy-local",
  "interface": { "displayName": "Hy Local" },
  "plugins": [
    {
      "name": "hy-skills",
      "source": { "source": "local", "path": "./devtools/hy-skills-plugin" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Developer Tools"
    }
  ]
}
```

Or drop the plugin directory under `~/.codex/plugins/` for a home-local install.

Codex has no slash aliases — trigger skills by intent: "implement this and ship it" picks up `go`; "simplify this diff" picks up `my-simplify`; "audit this architecture for refactor ROI" picks up `refactor`; "open a task worktree" picks up `open-worktree`; etc. Goal-document and milestone-planning requests pick up `gdd`. The `description` fields in each `SKILL.md` drive matching.

### Kimi Code

Two install paths are supported.

**A · Direct GitHub install (recommended)** — in Kimi Code CLI, `/plugins install https://github.com/3rd-Musketeer/hy-skills`. Kimi Code reads `kimi.plugin.json` at the repo root, then run `/reload` or `/new` to activate. As a third-party source, the install shows a trust confirmation first.

**B · Self-hosted marketplace** — `/plugins marketplace https://raw.githubusercontent.com/3rd-Musketeer/hy-skills/main/.kimi-plugin/marketplace.json` (or a local path to `.kimi-plugin/marketplace.json` in a checkout). The catalog lists `hy-skills` as the only plugin; install from there.

Skills are invoked by intent or via `/skill:<name>`; the `description` fields in each `SKILL.md` drive matching.

### Skill-only agents (Claude.ai, API Skills runtime, `~/.codex/skills/`, etc.)

Copy or symlink the contents of `skills/` into the agent's skills directory, **including `skills/references/`** — `gdd`, `go`, and `closeup` cite the shared methodology doc at `skills/references/goal-driven-dev.md`; `go` falls back to the sibling `my-simplify` skill when the harness has no native Simplify; and `closeup` orchestrates the sibling `close-worktree` and cites `speak-normally` for its report register. Apart from those shared files, each skill folder is self-contained; no plugin manifest required. Invocation is by intent, same as Codex.

## Status

v0.7.1. Dogfooded across many projects on task kickoff, feature delivery, simplification/refactor review, PR publishing, happy-path merge watching, finished-task closeout, session-level session close-out, section-by-section goal document shaping, development mindset routing, plan grilling, tailored explanation, and plain-register Chinese writing. Active iteration — expect rules to change as more dogfood data comes in.

Four skills were withdrawn in v0.7.0 on the evidence of a transcript usage scan — `prototype-board`, `html-as-doc`, `infisical-secrets`, `use-portless`. They live under [`.archive/skills/`](.archive/) with the usage data, the reason, and the condition under which each should come back.
