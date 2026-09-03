---
name: close-worktree
description: Wrap up a task worktree after merge or explicit abandonment with a worktree-first git workflow. Use when the user asks to close a merged task branch, clean up the finished worktree, or run the standard post-merge cleanup flow.
metadata:
  short-description: Close one finished task worktree
---

# close-worktree

Retire one merged, local-clean, or explicitly abandoned task worktree + its branch. Same day as the PR merge when a PR exists.

## Conventions

- **1 worktree : 1 branch : 1 task.** Close them together.
- Operate from a **retained worktree** (another worktree that already owns the base branch, usually the repo's `main` worktree) for the base-branch sync and branch delete.
- Base defaults to `main`.
- Prefer remote/PR evidence when available. For local-only repos, use local branch ancestry, dirty status, and explicit abandon approval.

## Propose first

Inspect, then report:

```bash
git remote -v
git -C <retiring-worktree> status --short
git -C <retiring-worktree> branch --show-current
git worktree list
git -C <retained-worktree> rev-parse --verify origin/<base>
git -C <retained-worktree> merge-base --is-ancestor <branch> <base>
gh pr view <branch>           # PR state, when GitHub remote exists
```

Remote mode: if `origin/<base>` exists, run `git -C <retained-worktree> fetch origin --prune` before PR and ancestry checks.

Local-only mode: if no usable GitHub remote or PR exists, skip `gh pr view` and classify from local state.

Classify as one of:

| Classification | Meaning | Action after go-signal |
|---|---|---|
| **merged** | PR is merged, or branch is ancestry-merged into base | remove worktree, delete branch with `-d` when possible |
| **open-PR** | PR exists and is open | stop unless user approves abandon |
| **dirty** | retiring worktree has local changes | stop unless user approves discard |
| **abandon-request** | user explicitly asks to abandon a remote/PR branch | remove worktree, delete branch with `-D` |
| **local-clean** | local-only branch is clean and ancestry-merged into local base | remove worktree, delete branch with `-d` |
| **local-dirty** | local-only retiring worktree has local changes | stop unless user approves discard |
| **local-abandon-clean** | local-only branch is clean, has branch-only commits, and user explicitly approves abandon | remove worktree, delete branch with `-D` |

Wait for go-signal.

## Cleanup

Order matters — **remove the worktree before deleting the branch** (Git blocks deletion of a checked-out branch).

```bash
# 1. Sync base from a retained worktree that already owns main, in remote mode
git -C <retained-worktree> fetch origin --prune
git -C <retained-worktree> pull --rebase origin <base>

# 1b. In local-only mode, verify retained base is current and clean
git -C <retained-worktree> branch --show-current
git -C <retained-worktree> status --short

# 2. Remove the retiring worktree
git worktree remove <retiring-worktree>

# 3. Delete the local branch from the retained worktree
#    -d if fully merged in Git ancestry
#    -D if squash-merged (ancestry still looks unmerged) or explicitly abandoned
git -C <retained-worktree> branch -d <branch>     # or -D

# 4. Verify
git worktree list
git branch --list
```

Return: PR/branch target, base, merge status, branch deleted or retained, worktree removed, residual follow-ups.

## Blockers (stop and ask)

- PR still open and user hasn't approved abandon.
- Retiring worktree is dirty — user resolves or explicitly approves discard.
- Local branch has no merge signal and no explicit abandon approval.
- Local-only mode with dirty retained base worktree.

## Notes

- Squash-merged branches almost always need `-D` — ancestry doesn't show them as merged.
- Don't sync base from the retiring worktree; it's about to disappear.
- In local-only mode, `local-abandon-clean` still needs explicit approval because branch-only commits disappear after `branch -D`.
