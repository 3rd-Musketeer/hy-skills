# Archived skills

Skills that were shipped once and have been withdrawn from `skills/`. They are kept here — not deleted — so a revival is one `git mv` away and the reasoning survives.

**They do not ship as skills.** All three ecosystems load from `skills/` only (Codex and Kimi via an explicit `"skills": "./skills/"`, Claude Code via default scan). Anything under `.archive/` is copied into the plugin cache as bytes and never registered.

To revive one:

```
git mv .archive/skills/<name> skills/<name>
```

then re-add it to the skill list in all six manifests, restore its README row and slash-command entry, and bump the version — the same checklist as adding a new skill in AGENTS.md.

## Why archive instead of delete

A skill withdrawn without a stated reason and a revival condition is just a deletion with extra steps. Six months on, the folder alone cannot tell you whether it was withdrawn because it was bad, because it was unused, or because it never belonged here — and so it can never be correctly reclaimed. Every entry below records the usage evidence at withdrawal time, the reason, and the condition under which it should come back.

## Archived 2026-07-29 (v0.6.0 → v0.7.0)

Usage evidence came from a scan of local Claude Code transcripts (`~/.claude/projects/**/*.jsonl`, 747 files, deduplicated by record uuid), counting explicit invocations only: `Skill` tool calls made by the model plus slash commands typed by the user. Observation window **2026-06-07 → 2026-07-29** (~7.5 weeks) — earlier transcripts had already been cleaned up. The window undercounts by construction: it cannot see implicit adherence, and it predates nothing built before June.

### infisical-secrets

- **Usage:** 2 invocations, both model-initiated, 2026-07-07 and 2026-07-10. None since.
- **Reason:** category mismatch, not low usage. This is an operating manual for one external tool, not a methodology. Its value is bound to whether Infisical is still in the workflow at all, which is a different question from whether the skill is any good.
- **Revive when:** never, as a skill in this plugin. If Infisical secret staging is needed again, the content belongs in a project-level skill or a runbook next to the project that uses it. Keep the file here as a reference for that rewrite.

### use-portless

- **Usage:** 0 invocations in the window.
- **Reason:** same category mismatch as `infisical-secrets` — an operating manual for Portless, bound to an external tool's presence in the workflow.
- **Revive when:** never, as a skill in this plugin. Same disposition: reuse the content in a project-level skill if Portless comes back.

### html-as-doc

- **Usage:** 0 invocations in the window.
- **Reason:** the scenario does not occur, which is not the same as the skill being unfinished. This was the heaviest investment in the repo — 716K of skill and references, plus three goal documents, two backlogs, and a full Mermaid renderer fidelity study under `.gdd/`, all built in May 2026. It fires only when content has already converged *and* the user explicitly asks for a single-file HTML doc. Those two conditions rarely hold at the same time. Polishing it further would not change that.
- **Revive when:** three real "content is final, I want it as a good-looking single-file HTML doc" requests occur within one quarter. That is the missing demand signal — until it appears, more craft work on the skill is unfunded.
- **Note:** the `.gdd/` goal documents and backlogs for this skill deliberately stay in place. `.gdd` is the decision archive; it records what was decided when, and does not move with a skill's lifecycle.

### prototype-board

- **Usage:** 1 invocation, 2026-07-11.
- **Reason:** frequency, not fit. The scenario is real — it was genuinely used to build a prototype board — but it recurs at roughly once per new product, so a resident skill is the wrong shape for it. A resident skill costs more than disk: its `description` occupies the session skill listing every turn and dilutes trigger matching for the skills that fire weekly.
- **Revive when:** the next new product needs a feel-first prototype board. This one is expected to come back; it is parked, not retired.

## Kept, against the original cut

`explain` was on the withdrawal list and was kept. It had 3 invocations in the window, 2 of them typed directly by the user, most recently 2026-07-21. A user-typed invocation is the strongest available value signal, stronger than a model-initiated one. At 16K with no cross-skill dependencies, its residency cost is close to zero.
