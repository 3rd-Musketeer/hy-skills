---
name: context-layout
description: Decide where a piece of project context lives (decision, term, pitfall, reference doc, task material, next action, someday idea, retired code, scratch) and which file is its authority; tidy a repo's context after a sub-goal; move, rename, or archive docs without breaking links. Use when unsure where something belongs, when a self-contained sub-goal finishes and its context needs tidying, before moving, renaming, or archiving docs, or when the user says "tidy the context layout" / "整理 context layout". Applies its default layout only in a repo that already uses this kind of layout (tasks/, TODO.md, docs/adr/) or when the user asks for it; elsewhere it follows the repo's own conventions and adds no new structure.
metadata:
  short-description: Where project context lives, and keeping it tidy
---

# context-layout

Where context lives decides whether the next agent finds the right answer. This skill covers documents, decisions, task material, and state; code layout belongs to the language and framework.

## 1. Project rules win

Read the project's `AGENTS.md` first. Where it names a location, a state record, a completion marker, or a directory name, follow it; everything in sections 2 and 3 is a default the project may override. Apply the defaults only in a repo that already uses this kind of layout (`tasks/`, `TODO.md`, `docs/adr/`) or when the user asks for it. In any other repo, put things where that repo already puts them, and do not introduce `tasks/`, `TODO.md`, or similar unasked.

Three principles do not vary:

- **One authority per question.** Every other copy says it is a summary, an index, or history.
- **State has exactly one home.** Progress, next steps, and open items live in the project's state record and nowhere else. Do not copy what git or the platform already shows (branches, PRs, pipelines, releases).
- **Every written file is registered at an entry its reader will open.** Before writing, answer: who reads this, at what moment, from which entry? No answer, no file.

When a doc names another file, write its path from the repo root, not a bare filename. The discussion itself is not written down; the session transcript and git history already record the process.

## 2. Defaults

| What | Where | Registered at |
|---|---|---|
| Decision | `docs/adr/`, only when hard to reverse, surprising without its background, and the result of a real trade-off; format in the domain-modeling skill. Otherwise a line in the state record. | Its `Scope:` line, naming the code paths it governs |
| Term | `CONTEXT.md` | Itself; agents check terms against it |
| Pitfall, convention | The project's `AGENTS.md` | Itself; every agent reads it |
| Cross-task reference (mechanism, contract, runbook) | `docs/<subject>.md` | A row in the README's question → doc routing table |
| One piece of work | A task directory (section 3) | `tasks/` itself |
| Next action | The project's state record: `TODO.md` by default, grouped by task, line deleted when done; a repo that uses an issue tracker uses the tracker | Itself |
| Someday | `BACKLOG.md`. Move a line to the state record once committed; an item lives in one or the other, never both. | Itself |
| Retired code, paused prototype | `.archive/` | The entry that used to point at it |
| Scratch | `<task>/tmp/` (section 3) | Nowhere; it is not kept |

The README holds only what rarely changes: what this is, the directory map, the routing table. No status, no task list. A title such as "spec" or "method" does not make a document cross-task: a doc that mixes general rules with one task's evidence is split, the general part in `docs/`, the rest in the task.

## 3. Tasks

Open a task directory when a piece of work first produces something worth keeping. It holds that work's context (requirements, investigation, the plan and its reasons), artifacts (reports, review results, verification evidence), and code written only for it. Anything still useful outside this task goes to a shared place instead (`docs/`, `src/`, `scripts/`). Code meant to be imported never lives in a dated directory; `2026-…` is not a valid package name.

- **In progress**: `tasks/<slug>/`, no date. When the repo uses issues, the slug starts with the issue number: `tasks/88-message-pop/`.
- **Done**: the issue is closed (when the repo uses issues) and the directory is moved to `tasks/done/<YYYY-MM-DD>-<slug>/`, dated by completion. The move is the PR's last commit and rewrites every reference to the old path in that same commit, so merging closes the issue and lands the directory in done at once. Without issues, the move itself marks completion.
- **Why**: the path states intent. `tasks/<slug>/` is live and may change; `tasks/done/<date>-<slug>/` is a record as of that date, which lets readers judge how stale it is and sorts done tasks in the order they landed. Directories named under an older convention move to the new one in a single dedicated change (all of them, references rewritten in the same commit, per section 5), never one at a time.

The task README states the goal, decisions with their reasons, where the materials are, verification evidence, and known limits; never progress or next steps. Write only sentences whose deletion would make the next person do the wrong thing.

Scratch (temp files, probe scripts, screenshots, logs) goes in `<task>/tmp/`, which the repo ignores (for example `tasks/**/tmp/` in `.gitignore`). Before opening the PR, decide each file there: promote it to a real test, move it out as evidence, or leave it. `git worktree remove` silently deletes ignored directories, so nothing that must survive stays only in `tmp/`.

`tasks/` is its own index; neither the README nor the state record lists tasks. Add `tasks/INDEX.md` only when listing the directory stops being enough.

## 4. Tidy checkpoint

After each self-contained sub-goal, and before handing a stage back:

1. This round's new material sits in its task directory; anything shared is registered at its entry.
2. Status written anywhere but the state record is removed.
3. One-off material in `docs/` moves into its task.
4. When work moved elsewhere, the old entry says where it continues.
5. Fresh-reader check: an agent that reads only the entries (README, `AGENTS.md`, the state record, the task README) would not redo finished work, miss an open commitment, or follow a superseded plan. Fix whatever it would get wrong; link and format checks only support this.

## 5. Move, rename, archive

Audit before moving; do not normalize in bulk. `mv` and every reference rewrite land in the same commit. If you cannot say which file is the single authority after the move, do not move it. Follow `references/migration.md` for the procedure, the reference rewrite, and archiving.

## 6. Stop and ask

- A path cannot say what question it answers or which file is its authority.
- Something to delete cannot be shown unreferenced or rebuildable.
- A path to move is in use by a script, automation, or another agent.
- A reference to it lives outside this repo.
