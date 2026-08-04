# AGENTS.md

Operating notes for agents working on this plugin repository.

## What this repo is

`hy-skills` is a portable methodology-skills plugin. Every direct child of `skills/` is one self-contained Agent Skill with its own `SKILL.md`; no runtime resource lives in a sibling or shared top-level skills directory.

The same `skills/` tree ships through four client wrappers:

| Ecosystem | Plugin manifest | Marketplace catalog |
| :-- | :-- | :-- |
| Claude Code | `.claude-plugin/plugin.json` | `.claude-plugin/marketplace.json` |
| Codex | `.codex-plugin/plugin.json` | `.agents/plugins/marketplace.json` |
| Cursor | `.cursor-plugin/plugin.json` | External Cursor Marketplace; no catalog required for this single-plugin repo |
| Kimi Code | `kimi.plugin.json` | `.kimi-plugin/marketplace.json` |

`plugin.meta.json` is the source of truth for shared plugin metadata, version, and skill inventory. The client manifests are generated artifacts.

## Release discipline

Installed clients load versioned or managed copies, not the working checkout. A shipped change under `skills/` therefore requires a version bump in `plugin.meta.json` followed by:

```bash
node scripts/render-manifests.mjs --write
node scripts/validate-plugin.mjs
```

Do not hand-edit generated manifests. `render-manifests.mjs` owns:

- `.codex-plugin/plugin.json`
- `.agents/plugins/marketplace.json`
- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`
- `.cursor-plugin/plugin.json`
- `kimi.plugin.json`
- `.kimi-plugin/marketplace.json`

The shared plugin version is rendered into the Codex plugin and marketplace entry, Claude plugin, Cursor plugin, and Kimi plugin. Claude's marketplace intentionally has no plugin-version duplicate; `.claude-plugin/plugin.json` is authoritative. Kimi marketplace `"version": "2"` is a catalog schema version and never follows the plugin version.

Use a minor bump (`0.x.0`) for a new skill, behavior change, or newly supported client distribution surface. Use a patch bump (`0.x.y`) for compatible skill fixes and reference edits. Repo-only documentation can ship without a bump when it does not affect generated manifests or installed content.

Before release, validate the portable core and the available client wrappers:

```bash
node scripts/render-manifests.mjs --check
node scripts/validate-plugin.mjs
for skill_dir in skills/*; do
  uvx --from 'git+https://github.com/agentskills/agentskills.git@27a9f0c075e876ad632fc2e88b8866c5dc8ca15c#subdirectory=skills-ref' \
    skills-ref validate "$skill_dir"
done
claude plugin validate . --strict
claude plugin validate .claude-plugin/plugin.json --strict
```

`.github/workflows/validate.yml` runs the same source and schema checks on pull requests and pushes to `main`. Update the pinned Agent Skills validator commit and Claude Code version deliberately when adopting a newer specification; do not let release validation drift implicitly.

Also smoke the packaged artifact in each client whose distribution surface changed. Source-checkout success is not proof that an installed cache contains every resource.

## Retiring a skill

Withdraw skills to `.archive/skills/<name>/`, not by deleting them. Remove the name from `plugin.meta.json`, render the manifests, and reverse-check all name-based compositions before shipping.

Skill composition is optional acceleration, never a filesystem dependency. For example, `closeup` may use `close-worktree` when available and `go` may use `my-simplify`; each caller must still contain enough fallback behavior to work when installed alone.

Every archived skill needs an entry in `.archive/README.md` recording usage evidence, the withdrawal reason, and a revival condition. `.gdd/` goals and backlogs remain in place as decision history.

## Skill authoring conventions

Checks for every new or edited skill under `skills/`:

- **Portable frontmatter.** Use `name`, `description`, optional `license`, and optional string-valued `metadata`. `name` matches the directory. `description` carries both capability and trigger guidance, including explicit-only behavior and exclusions. Do not put client-only behavior fields such as `argument-hint`, `arguments`, `whenToUse`, `paths`, or `context` in shared `SKILL.md` files.
- **Self-contained root.** Every direct child directory under `skills/` contains `SKILL.md`. Do not add `skills/README.md`, `skills/references/`, category folders, or any other non-skill entry; strict scanners reject them and flat-file scanners may register Markdown as an unintended skill.
- **One-level resources.** Put optional resources under the owning skill's `references/`, `scripts/`, or `assets/`. Reference them from `SKILL.md` with paths such as `references/foo.md`. Do not use `../`, sibling paths, or reference-to-reference chains.
- **Client-neutral content.** Do not depend on `$ARGUMENTS`, `${CLAUDE_SKILL_DIR}`, `${KIMI_SKILL_DIR}`, or another client substitution in portable instructions. Describe invocation focus in prose and resolve bundled paths from the current skill root.
- **Progressive disclosure.** Keep `SKILL.md` under 500 lines. Put detailed, genuinely on-demand material in focused reference files, but keep routing decisions in `SKILL.md` so references do not need to point at other references.
- **Say it once; trust judgment.** State a principle at its natural home. Cut generic checklists and development history from shipped skill content. Preserve precision where operations are destructive or outward-visible.
- **Codex display metadata.** Every skill ships `agents/openai.yaml` with `interface.display_name`, `short_description`, and `default_prompt`. Other clients safely ignore it.
- **Project-agnostic.** No private paths, company-specific identifiers, or research residue in `skills/`. Research and provenance live under `.gdd/`, `devlogs/`, or repository documentation.

## Client-side update

After publishing, refresh the installed copy:

- Claude Code: `/plugin` → update `hy-skills` → `/reload-plugins` or restart.
- Codex: refresh the marketplace, update the plugin, then start a new task.
- Cursor: update/reinstall the plugin and reload the window.
- Kimi Code: `/plugins` → install the available update → `/reload` or `/new`.
