---
name: open-worktree
description: Open one task worktree from the repo base branch with a worktree-first git workflow. Use when the user asks to start a task branch, create a new worktree for a task, or run the standard task kickoff flow.
metadata:
  short-description: Open one task worktree
---

# open-worktree

Kick off one task: one new branch, one new worktree, rooted on the best available base.

## Conventions

- **1 worktree : 1 branch : 1 task.** Never switch branches inside a worktree.
- **Branch name**: `<type>/<scope>-<descriptor>`, kebab-case. `type` ∈ `feat · fix · refactor · docs · chore · test · exp`.
- **Worktree path**: sibling to the current repo. For a repo at `<parent>/<repo>`, use `<parent>/<repo>-<slug>`, where `<slug>` is the branch name without the `<type>/` prefix.
- **Base**: default `main`. Prefer `origin/<base>` when available. For local-only repos, branch from a clean local `<base>`.

## Resolve base mode

Inspect remotes and base state first:

```bash
git remote -v
git branch --show-current
git status --short
git rev-parse --verify origin/<base>
git rev-parse --verify <base>
```

Use one mode:

| Mode | Condition | Base ref | Required check |
|---|---|---|---|
| **remote** | `origin/<base>` exists | `origin/<base>` | `git fetch origin --prune` succeeds |
| **local-only** | no usable `origin/<base>` | `<base>` | retained base worktree is on `<base>` and clean |

## Propose first

Before creating, report: proposed branch, base mode, base ref, worktree path, and any conflict (existing branch name, occupied path, missing base ref, dirty local base). Wait for go-signal.

## Create

Remote mode:

```bash
git fetch origin --prune
git worktree add -b <type>/<scope>-<descriptor> <parent>/<repo>-<slug> origin/<base>
git -C <path> status --short
```

Local-only mode:

```bash
git status --short
git worktree add -b <type>/<scope>-<descriptor> <parent>/<repo>-<slug> <base>
git -C <path> status --short
```

Return: branch, base mode, base ref, worktree path, current status, next step. In remote mode, next step is usually the `commit-push-pr` skill. In local-only mode, next step is task work or a local smoke close with `close-worktree`.

## Blockers (stop and ask)

- Branch name already exists locally or on `origin`.
- Target worktree path already occupied.
- No usable `origin/<base>` and no local `<base>`.
- Local-only mode with dirty retained base worktree.
