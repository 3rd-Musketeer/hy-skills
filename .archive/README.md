# Archived skills

Skills that were shipped once and have been withdrawn from `skills/`. They are kept here — not deleted — so a revival is one `git mv` away and the reasoning survives.

**They do not ship as skills.** All supported clients load from `skills/` only. Anything under `.archive/` is copied into the plugin cache as bytes and never registered.

To revive one:

```
git mv .archive/skills/<name> skills/<name>
```

then re-add it to the skill inventory in `plugin.meta.json`, restore its README row and invocation entry, bump the version, and render the generated manifests — the same checklist as adding a new skill in AGENTS.md.

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

## Archived 2026-08-20 (v0.9.0 → v0.10.0)

These two skills were withdrawn because their responsibilities moved to the owner's text-quality domain kit. This is an ownership decision, not a low-usage judgment.

### explain

- **Usage:** The 2026-07-29 scan found 3 explicit invocations, including 2 typed directly by the user, so it was deliberately kept in v0.7.0. The later text-quality consolidation absorbed both its universal expression rules and its Decision / Mechanism / Comparison / Concept shapes.
- **Reason:** Keeping the skill after that move would leave two authorities for the same explanation behavior. The skill's own backlog had already identified this extraction as the right change once the universal rules appeared elsewhere.
- **Revive when:** three explicit explanation requests within one quarter need a repeatable workflow that the general conversation standard does not cover. Revive only the distinct workflow, not copied expression rules.

### speak-normally

- **Usage:** It auto-applied to substantive prose, so explicit invocation counts never represented its real use. Its complete effective rule set — direct engineering prose, natural terminology, no invented translations, no rhetorical inflation, and evidence instead of fake precision — was absorbed by the text-quality base rules.
- **Reason:** A cross-cutting writing standard belongs in the writing-quality owner, not as a second resident methodology skill. Keeping both would duplicate rules and let their wording drift.
- **Revive when:** a portable, project-agnostic writing standard has a single publishable upstream and repeated cross-project demand that cannot be met by project or user-level writing guidance.

## Archived 2026-09-03 (v0.10.0 → v0.11.0)

Usage evidence: explicit invocations in both harnesses, 2026-08-19 → 2026-09-01 (Codex 107 sessions: `[$hy-skills:<name>]` links in user turns; Claude Code 23 sessions: user `/name` slash text + `Skill` tool calls). Combined counts: go 56 · grilling 47 · closeup 13 · my-simplify 6 · open/close-worktree 4 · commit-push-pr 1 · gdd 1 · refactor / mindset / loop-for-merge 0. Owner's ruling: keep the four entry skills (go, grilling, closeup, reflect-to-be) plus my-simplify; everything the model already does by default, or that another skill covers, is withdrawn.

### refactor
- **Usage:** 0 in the window.
- **Reason:** the two-axis review it prescribes is what a capable model does when asked to refactor; Pocock's `code-review` covers the standards/spec split if it is ever needed.
- **Revive when:** a refactor session goes wrong in a way a written procedure would have prevented, twice.

### mindset
- **Usage:** 0 in the window.
- **Reason:** method-and-grain routing overlaps `go`'s reference packs; the owner picks method by naming it, not by consulting a library.
- **Revive when:** `go` loses its per-shape reference packs and method choice becomes a recurring friction.

### loop-for-merge
- **Usage:** 0 in the window.
- **Reason:** review-bot loops are now run by a background subagent with an active poll; the fixed heartbeat skill was never invoked.
- **Revive when:** merge monitoring stops being delegated and needs a user-invoked procedure again.

### commit-push-pr
- **Usage:** 1 in the window.
- **Reason:** commit/push/MR is default model behavior; the team-repo conventions it wrapped live in the workspace's `areta-dev` skill.
- **Revive when:** a PR-shaping convention appears that is not repo-specific and is violated by default behavior.

### open-worktree · close-worktree
- **Usage:** 1 + 3 in the window, all in Claude Code; 0 in Codex.
- **Reason:** the owner judges the worktree-first workflow internalized by current models. `closeup` keeps a fallback that classifies a finished worktree (merged / open-PR / dirty / abandon) when this skill is absent; that classification is folded into the closeup rewrite.
- **Revive when:** an agent retires a worktree in the wrong order (branch before worktree, or a dirty tree) twice.

### gdd
- **Usage:** 1 in the window; `go` (56) replaced it in practice.
- **Reason:** the goal document and `.gdd/` layout are superseded by the tasks/ model (task README as thread authority, TODO as the action list, docs/adr for decisions). Its one increment over default model behavior, **stakes** (ask only when a real tradeoff falls on something the owner cares about, and state why the decision is needed now, what differs between an arbitrary and a deliberate choice, and where that difference lands), moves into the grilling rewrite.
- **Revive when:** never as a goal-document skill; the tasks/ model owns that role. `references/goal-driven-dev.md` stays here as history.
