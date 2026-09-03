---
name: my-simplify
description: Clean up the changed code without changing behavior. Review the diff for reuse, simplification, efficiency, and altitude cleanups, then apply the fixes. Quality only; it does not hunt for bugs. For Codex and any client without a native Simplify; in Claude Code use the built-in /simplify.
metadata:
  short-description: Post-change cleanup on four angles, then apply the fixes
  derived-from: "Claude Code built-in /simplify (claude 2.1.258), prompt text adapted. Local additions: the two duplication tests under Reuse and Simplification."
---

# my-simplify

You are improving the quality of the changed code, not hunting for bugs. Review it for reuse, simplification, efficiency, and altitude issues, then fix what you find. Do not look for correctness bugs; that is a code review's job.

## Phase 0: gather the diff

Run `git diff @{upstream}...HEAD` (or `git diff main...HEAD` / `git diff HEAD~1` if there is no upstream). If there are uncommitted changes, or the range diff is empty, also run `git diff HEAD` and include the working-tree changes. If a PR number, branch, or path was passed as an argument, review that target instead. This diff is the review scope.

## Phase 1: review on four angles

With a subagent tool, launch four independent review agents in one message, each with the diff and one angle. Without one, work through all four angles yourself in one pass; do not skip an angle, and say in the summary that this was a single pass. Each finding carries `file`, `line`, a one-line summary, and the concrete cost: what is duplicated, wasted, or harder to maintain.

- **Reuse**: new code that re-implements something the codebase already has. Grep shared and utility modules and the files adjacent to the change; name the existing helper to call instead. Merge only semantic duplicates, code that shares one piece of knowledge; two pieces that merely look alike today stay apart.
- **Simplification**: unnecessary complexity the diff adds: redundant or derivable state, copy-paste with slight variation, deep nesting, dead code left behind. Name the simpler form that does the same job. Before flagging a module as needless, apply the deletion test: would removing it concentrate the complexity somewhere else (a real finding), or only move it (not one)?
- **Efficiency**: wasted work the diff introduces: redundant computation or repeated I/O, independent operations run sequentially, blocking work added to startup or hot paths, long-lived objects built from closures that keep the enclosing scope alive.
- **Altitude**: is each change implemented at the right depth, not as a fragile bandaid? Special cases layered on shared infrastructure are a sign the fix is not deep enough; prefer generalizing the underlying mechanism over adding a branch.

## Phase 2: apply the fixes

Wait for all angles, dedup findings that point at the same line or mechanism, and fix each remaining one directly. Skip any finding whose fix would change intended behavior, require changes well outside the reviewed diff, or that you judge a false positive; note the skip rather than arguing with it. Run the narrowest check that covers what you touched. Finish with a brief summary of what was fixed and what was skipped, or confirm the code was already clean.
