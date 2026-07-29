# AGENTS.md

Operating notes for agents working on this plugin repository.

## What this repo is

`hy-skills` is a methodology plugin. Skills live under `skills/` and are shared across three ecosystems. Each ecosystem has its own manifest pair:

| Ecosystem | Plugin manifest | Marketplace catalog |
| :-- | :-- | :-- |
| Claude Code | `.claude-plugin/plugin.json` | `.claude-plugin/marketplace.json` |
| Codex | `.codex-plugin/plugin.json` | `.agents/plugins/marketplace.json` |
| Kimi Code | `kimi.plugin.json` | `.kimi-plugin/marketplace.json` |

The `skills/` tree is the single source of truth; all six manifests point at it.

## Release discipline

Installed clients load the plugin from a local cache, not from this repo. After any change under `skills/`, **bump the version** — otherwise the marketplace updater sees the same version, treats the install as current, and never pulls the new commits. Codex requires `version`; it cannot be omitted.

On every release, set the same version string in all six manifests:

- `.claude-plugin/plugin.json` — `version`
- `.claude-plugin/marketplace.json` — top-level `version`
- `.codex-plugin/plugin.json` — `version`
- `.agents/plugins/marketplace.json` — `plugins[0].version`
- `kimi.plugin.json` — `version`

Do not add `version` to the `plugins[]` entry of `.claude-plugin/marketplace.json`. When `version` is set in both `plugin.json` and the marketplace entry, `plugin.json` wins silently and the marketplace value becomes a stale trap. Kimi's `.kimi-plugin/marketplace.json` has no per-plugin `version` field at all — the marketplace `"version": "2"` is the catalog schema version, not the plugin version.

Minor bump (`0.x.0`) for a new skill or a skill behavior change; patch bump (`0.x.y`) for skill fixes and reference-doc edits. Repo-meta files (`README.md`, `AGENTS.md`) ship nothing to clients and need no bump.

When adding or removing a skill, also update the skill list in the `description` of all six manifests, and the `interface.longDescription` in `.codex-plugin/plugin.json` and `kimi.plugin.json`. Check `keywords` and `interface.defaultPrompt` too — removing a skill can orphan an entry there.

## Retiring a skill

Skills are withdrawn to `.archive/skills/<name>/`, not deleted. All three ecosystems load from `skills/` only — Codex and Kimi via an explicit `"skills": "./skills/"`, Claude Code via default scan — so moving the folder out of `skills/` is the whole de-registration. Editing the skill list in a manifest `description` does **not** withdraw anything; that string is prose for humans and Codex intent matching, not a registry.

Before moving, reverse-check that no remaining skill references it. Shared dependencies are real: `go` falls back to `my-simplify`, `closeup` orchestrates `close-worktree`, and `gdd`/`go`/`closeup` all cite `references/`.

Every archived skill needs an entry in `.archive/README.md` recording the usage evidence at withdrawal, the reason, and the condition under which it should come back. Without a revival condition an archive is a deletion with extra steps — the folder alone cannot say whether a skill was withdrawn for being bad, unused, or out of category, so it can never be correctly reclaimed.

`.gdd/` goals and backlogs for an archived skill stay where they are. `.gdd` is the decision archive; it records what was decided when, and does not move with a skill's lifecycle.

## Skill authoring conventions

Checks for every new or edited skill under `skills/`:

- **Frontmatter.** `name` + `description` are required. `description` must carry both what-the-skill-does *and* the trigger guidance, because some runtimes (Codex intent matching, skill-only agents) read only `description`. In particular, explicit-invocation-only skills must say so **inside `description`**, not only in `when_to_use`. `when_to_use` is optional and carries **only what `description` doesn't already say** — never repeat the trigger list, because both fields are resident in the session skill listing and duplication is paid every turn. If `description` can absorb the delta in a clause, drop `when_to_use` entirely. `metadata.short-description` is an optional display label.
- **Say it once; trust judgment.** State a principle at its natural home and reference it — don't restate it in every section that applies it, don't add an anti-patterns section that re-lists rules already given imperatively, and don't add meta-commentary defending the skill's weight ("this isn't ceremony"). Detailed generic checklists (things any strong model already knows) go to the skill's `references/` for on-demand loading, or get cut; SKILL.md keeps this repo's specific opinions, thresholds, and conventions. Precision stays where operations are destructive or outward-visible (git, teardown, merge loops).
- **Codex display metadata.** Every skill ships `agents/openai.yaml` with `interface.display_name`, `short_description`, `default_prompt`.
- **Script paths are install-relative.** A skill that ships `scripts/` must reference them relative to the skill's install directory (`${CLAUDE_SKILL_DIR}` when available, else the directory containing SKILL.md) — never as repo-relative paths like `skills/<name>/scripts/...`, which break under plugin installs.
- **Project-agnostic.** No personal project names, private paths, or company-specific identifiers in `skills/` or `README.md`. Case studies are described by shape ("a fully-scripted content board", "a live-LLM workbench"), not by name. Research residue (spikes, experiment outputs) lives under `.gdd/`, not inside shipped skill folders.
- **Cross-skill references.** Shared methodology lives in `skills/references/`; skills cite it as `../references/<file>.md`. Any new cross-folder dependency must be reflected in README's skill-only-agent install note.

## Client-side update

After pushing, the change does not reach a client until the client refreshes:

- Claude Code: `/plugin` -> update `hy-skills` -> restart.
- Codex: refresh the marketplace, update the plugin, restart.
- Kimi Code: `/plugins` -> install the available update on the Installed tab -> `/reload` (or `/new`).
