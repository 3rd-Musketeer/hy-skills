---
name: commit-push-pr
description: Publish the current task branch into a ready-for-review pull request with a worktree-first git workflow. Use when the user asks to commit and push the current change, open or update the branch PR, or run the fixed commit-push-pr workflow for review.
metadata:
  short-description: Publish the current branch PR for review
---

# commit-push-pr

Publish the current worktree's branch as one PR. Reuse the same branch + PR for follow-up fixes.

## Conventions

- **1 worktree : 1 branch : 1 PR.**
- Baseline comparison: `origin/main`. Treat local `main` as personal WIP.
- Stage by file name. Never `git add -A` / `git add .`.
- Default merge style: `squash`. Default base: `main`.

## Flow

```bash
git fetch origin --prune
git status --short
git log --oneline origin/main..HEAD        # sanity: only your commits
git diff --stat origin/main...HEAD         # sanity: scope matches task
git add <files>                            # by name
git commit -m "<intentful message>"
git push                                   # or --force-with-lease after a deliberate rebase on your own branch
gh pr create --base main                   # if none exists; otherwise skip
```

PR body template:

```
## Summary
<user-visible change>

## Verification
<what you actually ran>

## Risks / Notes
<only when relevant>
```

## Handoff

Return PR URL and the verification you ran. Stop at review — merge belongs to the `loop-for-merge` skill or a human.

## Blockers (stop and explain)

- Unrelated dirty files in the worktree.
- Rebase conflicts.
- Ambiguous scope (commit would cross task boundaries).
- Missing auth for `gh` / `git push`.

## Notes

- Prefer GitHub connector; fall back to `gh`.
- `--force-with-lease` is fine on your own feature branch after a rebase; never on `main` / `release/*`.
- Short-lived branches publish directly after fetch. Rebase only when stale or conflicts demand it.
