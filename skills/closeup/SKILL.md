---
name: closeup
description: Close out a finished task. Retire what the session created, restore what it borrowed, update the project's documents, record reusable learning in the ledger, and brief the user. Explicit invocation only ("closeup", "收尾", "close this up").
metadata:
  short-description: Close out a finished task and brief the user
---

# closeup

Run when the user says the task is done: shipped, merged, or the thread reached its stopping point. A session that produced only discussion still gets a closeup; only sections 3, 4, and 6 apply.

## Propose, then wait

Inspect first: `git worktree list`, `git status --short`, local and remote branches this session created, processes, containers, and port-forwards you started, shared state you changed. Then present one plan: what will be deleted, what will be restored to which original value, what is kept and how to recreate it, every file this closeup will write with its destination and your proposed wording, and any ledger promotion section 4 turned up. The user's answer to the plan is the ruling; where they change your wording, theirs is what gets written. Wait for the user's go. Do not delete, restore, or write before it.

## 1. Environment

- Created by you (worktrees, branches, containers, servers, port-forwards, scratch files): destroy. Merged branches are deleted; anything dirty or unmerged: ask.
- Borrowed (a shared env var, seeded rows, a flag, a preview target): restore the recorded original. No recorded original: ask, never guess. Verify by identity (image tag, value), not by liveness.
- Kept on purpose: one recreate command in the brief.

## 2. Tracking

Close what tracks the work: PR or issue state, the task README's state line, the project's action list. Nothing should still read "in progress".

## 3. Project documents

Take from this session what passes the gate: a reusable method, a fact that cannot be read out of the code, a pitfall, something still valid a month from now. Destination follows the project's own documents when they say; otherwise these defaults:

- decision → `docs/adr/`, only when it is hard to reverse, would look odd without its background, or had a real alternative. Use the domain-modeling skill's ADR format. Any other decision stays a line in `TODO.md`.
- term → `CONTEXT.md`
- pitfall or convention → the project's `AGENTS.md`
- verified fact → `docs/<date>-<slug>.md`
- open action → `TODO.md`

Record rulings in the user's words. What you proposed is not what they decided.

## 4. Ledger

A candidate is a lesson that would still hold in a different project: an `AGENTS.md` line, a skill change, an environment improvement (a navigation pointer, an automated check, an expensive tool call, an instruction that changes nothing, information the agent could not reach). Append one line per candidate: `date · type · one line · session id`.

The ledger is the nearest `LEDGER.md` found by walking up from the working directory; if there is none, create it beside the outermost `AGENTS.md`. If the ledger already holds the same candidate from another session, put the promotion in the plan. The user decides; write it only after. Delete an existing instruction only with evidence that it caused a wrong action.

## 5. Baseline

Check, do not assert: working tree clean, only the expected worktrees and branches, no orphan processes, and every invariant that had to survive the change still holds.

## 6. Brief

In the user's language, short. Shipped. Verified versus pending, with the evidence. Destroyed, restored, kept. Files written. Candidates recorded. Residuals that need the user. Next step.

## Stop and ask

A merge that is required but not done. A dirty or unmerged worktree. Borrowed state with no recorded original. Anything you are not sure is yours to destroy.
