---
name: closeup
description: Close out a finished work session — retire scaffolding, restore borrowed environments, finalize tracking status, file the decision, verify a clean baseline, and hand off honestly. Use AFTER the change is merged/shipped (downstream of commit-push-pr and loop-for-merge) when the user says "close", "closeup", "收尾", "wrap up", "打完收工", or asks to clean up and wrap the session. NOT for mid-work, NOT the merge itself, and NOT a deep docs-vs-code-vs-runtime reconciliation (that's a knowledge-governance pass). Orchestrates close-worktree; does not replace it.
metadata:
  short-description: Close out a shipped session — teardown, restore, file, verify, report
---

# closeup

Close out a work session that has shipped. A session is not done when the code merges; it is done when the scaffolding is gone, the borrowed environment is back to how you found it, the tracking state is closed, the decision is recorded, and the report is one the next person (including future-you) can trust.

**Position in the flow.** `/go` removes residue created directly by its task before handoff. closeup runs **after** the change is published and merged — `commit-push-pr` publishes, `loop-for-merge` (or a human) merges, then closeup closes the broader session. The shipping/merge step is upstream and separate. closeup **orchestrates `close-worktree`** for each finished worktree and adds the session-level facets that per-worktree cleanup doesn't cover.

## What closeup covers

| # | Facet | Done when |
|---|---|---|
| 1 | **Worktrees & branches** | each finished worktree retired + its branch deleted (via `close-worktree`) |
| 2 | **Ephemeral environments** | everything you spun up is destroyed; everything you borrowed is restored to its pre-session value |
| 3 | **Tracking status** | the work's tracker (issue / PR / goal doc / task list) reads closed; stale chips/todos dismissed |
| 4 | **Decision** | the durable record is written — what was decided, residuals with owners, recreate pointers |
| 5 | **Clean baseline** | working tree clean, only expected worktrees/branches remain, no orphan infra, surviving invariants still hold |
| 6 | **Closeout report** | layered honest handoff — shipped / verified-vs-pending / teardown / filed / residuals / next |

Not every session needs all six. A session that shipped nothing (pure investigation or design) usually needs only 4 and 6 — don't manufacture teardown.

## Propose first

closeup deletes branches, tears down environments, and restores shared state — all destructive or outward-visible. **Inspect, present the full closeout plan, then wait for a go-signal.**

Inspect:

```bash
git worktree list
git -C <each-worktree> status --short
git branch --list ; git branch -r --list          # local + remote branches this session created
docker ps ; jobs ; ps aux | grep -E 'port-forward|tunnel'   # local ephemera you started
```

Present the plan as the report's teardown section in draft form (what will be deleted, what restored to which original value, what kept and how to recreate it). **An initial "clean up after yourself" is not the go-signal — the plan is.** Wait for explicit "close" / "go".

## Execute (after go-signal)

### 1. Worktrees & branches → `close-worktree`

For each finished worktree, use the available `close-worktree` skill. It classifies merged / open-PR / dirty / abandon and does the worktree-remove-then-branch-delete in the right order. If that skill is unavailable, perform the same classification and preserve the same removal order locally. A multi-repo or multi-worktree session runs the flow once per worktree.

**Remote protected branches** (deploy-only or lane branches that are *not* the auto-deleted PR source) reject `git push --delete`. Delete via the host API:

```bash
gh  api -X DELETE repos/<owner>/<repo>/git/refs/heads/<branch>                      # GitHub
glab api -X DELETE "projects/<url-encoded-path>/repository/branches/<url-encoded>"  # GitLab
```

### 2. Ephemeral environments → tear down / restore

An **ephemeral environment** is anything you spun up or mutated during the session that is not part of the clean baseline. Two kinds, two rules:

- **Created** (yours alone — local containers, dev servers, port-forwards, tunnels, background processes, scratch files, a temporary deploy target you provisioned) → **destroy it.**
- **Borrowed** (shared and pre-existing — an env var you overrode on a shared service, rows you seeded into a shared datastore, a config flag you flipped, a named feature/preview environment you pointed somewhere) → **restore it to the pre-session value.**

This depends on a habit closeup can't perform retroactively: **record the original before you mutate it.** If you flipped shared state without recording what it was, you can't safely restore — stop and ask rather than guess (see Blockers).

Anything you deliberately keep (rare — e.g. a re-creatable local container you'll want next session) is not silently retained: leave a **one-line recreate pointer** (the exact command) in the report and the decision record.

Two gotchas when the borrowed environment is shared:

- **Single-slot environments.** If a restore you pushed gets overwritten by a parallel task reclaiming the slot, that's expected — **don't fight to reclaim it.** Confirm your scaffolding is no longer running (compare the running image tag / process, not just that an endpoint responds).
- **Verify by identity, not liveness.** "The endpoint answers" doesn't prove your override is gone; check the actual value/image/config.

### 3. Tracking status → finalize

Close whatever system carries the work: mark the issue/ticket resolved, confirm the PR is merged/closed, set the goal doc's status to done, mark the host's task list items complete, dismiss stale suggestion chips or todos. The tracker should not still say "in progress" for shipped work.

### 4. Decision → file

Write the durable record into the memory/notes system the harness provides. Include:

- the **decision reached** — the what-and-why that a future session shouldn't have to re-derive
- **residuals with owners** — known-not-fixed and deferred items, each attributed
- **recreate pointers** — the commands to rebuild anything kept (facet 2)

Keep out what's already recorded elsewhere: a replay of the session (git/PR history holds that) and anything derivable from the code. One fact per record if the store is file-per-fact.

Light doc-sync belongs here too — update the docs you actually touched (README / API doc / rules file) to match what shipped. **Broad docs-vs-code-vs-runtime reconciliation is a knowledge-governance pass, not closeup** — if drift is wide, defer it rather than absorb it.

### 5. Verify clean baseline

Check — don't assert:

```bash
git worktree list                 # only the expected worktrees
git status --short                # clean
git branch --list ; git branch -r # temporary branches gone (0 refs)
docker ps ; jobs                  # no orphan containers / background jobs
```

Plus any invariant that had to survive the change (a data identity, a contract test, a health check) — confirm it still holds.

### 6. Closeout report

Layered and honest. Use the `speak-normally` register when available; otherwise report in direct engineering prose. Expose enough result, evidence, limits, and judgment for trust calibration without narrating every step.

```
## closeup 完成 / Closeout complete

**上线了什么 / Shipped**: <merged/deployed + links>

**验过 vs 待验 / Verified vs pending**:
- 验过: <dimensions actually proven, with evidence pointers>
- 待验(仅 live/prod 能验): <what only production can prove>

**拆除 & 还原 / Teardown & restore**:
- 删 / destroyed: <worktrees, branches, containers, processes>
- 还原 / restored: <borrowed state → original value>
- 留(可重建) / kept: <what + exact recreate command>

**落档 / Filed**: <decision records written>

**残留(待你拍) / Residuals (your call)**: <owner-decisions, deferred items; "无 / none" if clean>

**下一步 / Next**: <the natural next action>
```

## Blockers (stop and ask)

- **Not merged yet.** closeup is downstream of merge. If the PR/MR isn't merged, stop — that's `commit-push-pr` / `loop-for-merge`, not closeup.
- **No go-signal on the plan.** Never delete branches, tear down environments, or restore shared state before the user confirms the presented closeout plan.
- **Borrowed state with no recorded original.** You can't safely restore what you never captured — ask for the pre-session value instead of guessing.
- **Ambiguous environment ownership.** Unsure whether something was created by you or pre-existing shared infra → confirm before destroying. Don't delete shared infra on assumption.
- **Dirty or open worktree.** Resolve or get explicit abandon approval — let `close-worktree` classify; don't force-retire.
