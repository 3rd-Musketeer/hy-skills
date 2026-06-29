# AGENTS.md

Operating notes for agents working on this plugin repository.

## What this repo is

`hy-skills` is a methodology plugin. Skills live under `skills/` and are shared across two ecosystems. Each ecosystem has its own manifest pair:

| Ecosystem | Plugin manifest | Marketplace catalog |
| :-- | :-- | :-- |
| Claude Code | `.claude-plugin/plugin.json` | `.claude-plugin/marketplace.json` |
| Codex | `.codex-plugin/plugin.json` | `.agents/plugins/marketplace.json` |

The `skills/` tree is the single source of truth; all four manifests point at it.

## Release discipline

Installed clients load the plugin from a local cache, not from this repo. After any change under `skills/`, **bump the version** — otherwise the marketplace updater sees the same version, treats the install as current, and never pulls the new commits. Codex requires `version`; it cannot be omitted.

On every release, set the same version string in all four manifests:

- `.claude-plugin/plugin.json` — `version`
- `.claude-plugin/marketplace.json` — top-level `version`
- `.codex-plugin/plugin.json` — `version`
- `.agents/plugins/marketplace.json` — `plugins[0].version`

Do not add `version` to the `plugins[]` entry of `.claude-plugin/marketplace.json`. When `version` is set in both `plugin.json` and the marketplace entry, `plugin.json` wins silently and the marketplace value becomes a stale trap.

Minor bump (`0.x.0`) for a new skill or a skill behavior change; patch bump (`0.x.y`) for skill fixes and reference-doc edits. Repo-meta files (`README.md`, `AGENTS.md`) ship nothing to clients and need no bump.

When adding or removing a skill, also update the skill list in the `description` of all four manifests, and the `interface.longDescription` in `.codex-plugin/plugin.json`.

## Client-side update

After pushing, the change does not reach a client until the client refreshes:

- Claude Code: `/plugin` -> update `hy-skills` -> restart.
- Codex: refresh the marketplace, update the plugin, restart.
