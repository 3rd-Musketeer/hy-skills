# hy-skills

A personal methodology-skills plugin grown from my day-to-day practice using AI across many codebases and products — not tied to any single project. Every rule exists because a real dogfood run surfaced a gap, not because it sounded like good practice.

**Purpose:** better human-agent collaboration, and enabling coding agents to run long-range autonomous tasks with a visible, verifiable process.

**Runs under Claude Code plugins, Codex plugins, or any skill-only agent.** The `skills/` tree is the single source of truth; the two plugin manifests are thin wrappers.

## Skills

| Name | What it does |
|---|---|
| `go` | Implement a feature end-to-end with light TDD — contract → 2–3 e2e tests → implement → simplify → ship. Returns a working feature the user can play with, not read as code. |
| `my-simplify` | Review recent code changes for reuse, quality, and efficiency simplifications. Used by `go` when the current harness has no native Simplify capability. |
| `refactor` | Audit code for maintainability, naming, contract boundaries, architecture coherence, and refactor ROI. Applies small safe refactors or proposes bounded rewrites when needed. |
| `open-worktree` | Propose or create one new task worktree from the repo base branch. Follows worktree-first naming and creation policy. |
| `commit-push-pr` | Publish the current task branch into a ready-for-review PR. Reuses the existing branch PR when present. |
| `loop-for-merge` | Watch one PR every 5 minutes and auto-merge the quiet or bot-approved happy path. Hands review comments back to a human. |
| `close-worktree` | Inspect or clean up one finished task worktree after merge or explicit abandonment. |
| `prototype-board` | Build a feel-first interactive prototype board for a new product — a small React SPA where the team can experience the design before any of it is real. Supports two product shapes (sequence-of-moments with two tabs, or continuous workbench as single view). Encodes lessons from xhs-poster-demo and half-law on the five flows that make a prototype board work, the theme system as the in-context A/B substrate, and the script-to-live control flow spectrum. |
| `goal-shaper` | Shape an agent-executable milestone goal document through section-by-section discussion. Keeps humans focused on goal, product experience, contracts, scope, scenarios, and definition of done while deferring implementation details. |
| `gdd` | Shape goals from backlog candidates through a drafting gate, then refine into executable goal documents. Implements the goal-driven development methodology under `.gdd/`. |
| `grilling` | Interview you relentlessly, one question at a time, to stress-test a plan or design before building. Walks each branch of the design tree, resolving decision dependencies and recommending an answer per question. Explicit invocation only. |
| `explain` | Generate user-tailored explanations across different question types — concept intro, mechanism, decision, comparison. Applies a consistent set of expression rules (user-layer concepts first, conclusion first, no code refs by default) while adapting shape per scenario. Explicit invocation only. |
| `html-as-doc` | Render converged content as a single-file, self-contained HTML doc under an apple.com-inspired design discipline — three-layer visual doctrine (Mermaid / HTML-CSS / inline-SVG), a semantic gradient color layer, and a content-first type scale. Medium-only: governs how the HTML expresses, not what it says. Explicit invocation only. |
| `infisical-secrets` | Discover existing secrets in Infisical and dump only the requested subset into local env files for agent or model-provider development. Explicit invocation only. |
| `use-portless` | Start, expose, verify, and manage local dev servers through Portless clean `.localhost` URLs. Defaults to temporary run/alias/probe behavior, with setup guidance for clean URLs and project config suggested for maintained workflows. |

## Install

### Claude Code

Two install paths are supported.

**A · Self-hosted marketplace (recommended)** — in Claude Code, `Add marketplace` and paste `3rd-Musketeer/hy-skills` (or the full GitHub URL). Claude Code reads `.claude-plugin/marketplace.json` at the repo root, lists `hy-skills` as the only plugin, and you install it from there. Updates pull on `Sync`.

**B · Direct plugin discovery** — point Claude Code's plugin discovery at this directory or symlink it into your configured plugins path. The `.claude-plugin/plugin.json` manifest is already present. Use this when you want a local checkout you actively edit.

Skills are invoked by slash command: `/hy-skills:go`, `/hy-skills:my-simplify`, `/hy-skills:refactor`, `/hy-skills:open-worktree`, `/hy-skills:commit-push-pr`, `/hy-skills:loop-for-merge`, `/hy-skills:close-worktree`, `/hy-skills:prototype-board`, `/hy-skills:goal-shaper`, `/hy-skills:gdd`, `/hy-skills:grilling`, `/hy-skills:explain`, `/hy-skills:html-as-doc`, `/hy-skills:infisical-secrets`, `/hy-skills:use-portless`.

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

Codex has no slash aliases — trigger skills by intent: "implement this and ship it" picks up `go`; "simplify this diff" picks up `my-simplify`; "audit this architecture for refactor ROI" picks up `refactor`; "open a task worktree" picks up `open-worktree`; etc. Goal-document and milestone-planning requests pick up `goal-shaper`. The `description` fields in each `SKILL.md` drive matching.

### Skill-only agents (Claude.ai, API Skills runtime, `~/.codex/skills/`, etc.)

Copy or symlink the contents of `skills/` into the agent's skills directory. Each skill folder is self-contained — no plugin manifest required. Invocation is by intent, same as Codex.

## Status

v0.2.0. Dogfooded across many projects on task kickoff, feature delivery, simplification/refactor review, PR publishing, happy-path merge watching, finished-task closeout, feel-first prototype board construction, section-by-section goal document shaping, single-file HTML-as-doc authoring, Infisical-backed local env staging, and Portless-backed dev server URL workflows. Active iteration — expect rules to change as more dogfood data comes in.
