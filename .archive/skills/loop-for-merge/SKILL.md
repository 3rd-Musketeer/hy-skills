---
name: loop-for-merge
description: Watch one review PR on a heartbeat and auto-merge it on the quiet or bot-approved happy path. Use when the user asks to wait for review, monitor a PR every few minutes, or run the fixed loop-for-merge workflow after commit-push-pr.
metadata:
  short-description: Watch one PR, self-heal small bot review, and auto-merge the happy path
---

# loop-for-merge

Run after the `commit-push-pr` skill. Watches one PR on a 5-minute heartbeat, self-heals small bot feedback, merges the happy path, hands off anything bigger.

## Start mode (invoked by human)

- Resolve target PR URL or number.
- Create a 5-minute heartbeat that re-invokes this skill (`loop-for-merge`) on each wake. Use whatever scheduling primitive the host agent provides (e.g. Claude Code `/loop 5m`, `CronCreate`, or `ScheduleWakeup`; Codex's scheduled-task facility; etc.). Record the head SHA at start as the loop's initial "last-acted SHA."
- Initialize `quiet_polls=0`, `auto_fix_cycles=0`, `bot_working_polls=0`.
- Return watcher status and PR.

## Wake mode (invoked by heartbeat)

Each wake, read fresh state with `gh pr view`, then pick the first matching action:

1. **Human review, merge conflict, failing check, closed PR** → stop heartbeat. Report blocker (see shape below).
2. **New actionable bot feedback** that is single-theme, locally scoped, verification path is clear, and `auto_fix_cycles < 5` → implement smallest fix, run minimum verification, commit, push, `auto_fix_cycles += 1`, `quiet_polls = 0`, `bot_working_polls = 0`, keep heartbeat.
3. **Bot review that needs judgment** (product behavior, API contract, data shape, multiple plausible fixes, same theme reappeared, or `auto_fix_cycles >= 5`) → stop heartbeat. Hand off (see shape below).
4. **Bot approved + mergeable + checks green** → squash merge, stop heartbeat.
5. **Bot still working** (`👀` or equivalent pending) → `bot_working_polls += 1`, `quiet_polls = 0`. If `bot_working_polls >= 6` (~30 min of stuck bot) → stop and report. Otherwise keep heartbeat.
6. **Quiet poll** (no new bot activity since last wake, no `👀` pending) → `quiet_polls += 1`, `bot_working_polls = 0`. If `quiet_polls >= 3` and mergeable + checks green → squash merge, stop. Otherwise keep heartbeat.

### Definitions

- **New feedback** — unresolved bot review threads whose last comment is on a commit SHA newer than the last SHA this loop acted on (initial wake = the commit the heartbeat started on). Stale threads against rewritten code count as resolved for this loop's purposes.
- **Bot approved** — the bot's most recent review state is `APPROVED`, OR the most recent review is `COMMENTED` with all its threads resolved. Bots that never formally approve (e.g. Codex Review) still qualify via the second clause.
- **`👀` or equivalent** — any of: a 👀 reaction the bot added to the head commit or PR body, a GitHub review in `PENDING` state from the bot, or a bot-owned check-run in `in_progress`. If none of those, treat as no pending bot work.
- **Thread resolved** — read via GraphQL `pullRequest.reviewThreads { isResolved outdated }`; either `isResolved=true` or `outdated=true` counts as resolved for this loop. `gh api graphql -f query='...'` works when the connector doesn't expose it.
- **Multiple actionable threads in one wake** — if they share a single theme (same file cluster, same behavior area), batch into one fix. If they span independent themes, pick the narrowest one first and let the next wake pick up the rest. Never interleave fixes across themes in one commit.

## Handoff shape (for action 3)

Report to the user:

- `What bot found` — unresolved thread summary
- `Why it matters` — consequence if ignored
- `Proposed fix` — concrete direction, not pseudocode
- `Decision needed` — the specific call you need from the user

## Blocker shape (for action 1)

Report to the user:

- `Blocker` — which of: human review, merge conflict, failing check, closed PR
- `Evidence` — reviewer/check name, conflict file list, or close reason
- `Next step` — what the user needs to do to unblock (respond, resolve, rerun, reopen)

## Wake report

Every wake (merge, fix, blocker, or plain quiet poll) reports:

- `action` — which of the 6 above
- `quiet_polls`, `auto_fix_cycles`, `bot_working_polls`
- `mergeable`, `checks` — as read from `gh pr view`
- `next` — what the next wake will do, or `stopped`

## Notes

- Prefer GitHub connector; fall back to `gh` when connector coverage is insufficient.
- Only `quiet_polls`, `auto_fix_cycles`, and `bot_working_polls` persist, plus the last-acted SHA for "new feedback" comparison. Everything else re-read from the PR each wake.
- A new human-started fix cycle restarts at the `commit-push-pr` skill, then a fresh loop.
- One heartbeat per PR.
