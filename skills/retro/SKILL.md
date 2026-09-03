---
name: retro
description: Retrospective on a thread of work. Find what to change in the repository and the workflow so the next run goes better, and file the lessons where the next agent will read them. Explicit invocation only ("retro", "复盘", "收尾").
license: MIT
metadata:
  short-description: Improve the environment and file the lessons after a thread
  derived-from: "github.com/mattpocock/skills@6654f6b skills/productivity/retro/SKILL.md (MIT): the seven environment categories and their triggers. Local additions: the knowledge gate and destinations, project versus workspace scope, the ledger, one plan then write."
---

# retro

You are suggesting improvements to the environment the agent works in, and filing what this thread learned. Nothing is written until the user approves the plan.

## 1. Read the primary sources

The thread the user names; by default the current one, including the parts before any compaction (the session log on this machine). What the log says beats the summary you were handed. Cross-reference other sessions only when the user asks.

## 2. Collect candidates

**Environment.** Look for these, each with the signal that marks it:

- **Navigation**: the session took long to find a file or a fact. A pointer would have saved it.
- **Automated checks**: the agent made a mistake a linter, type check, test, or filesystem check would have caught.
- **Standards**: a rule the reviewer, or the project's agent rules, should enforce, or one that should be removed or clarified because it did not stop a mistake.
- **Steering size**: the agent rules file carries instructions that belong in a check or a doc; it is large in the repo or in the user's global scope.
- **Tool economy**: an expensive tool call, or custom tooling that burns tokens.
- **No-ops**: an instruction in a steering file that does not change behavior.
- **Information access**: a crucial piece of information the agent could not reach (logs, a read-only view of a service).

**Knowledge.** Take what passes the gate: a reusable method, a fact that cannot be read out of the code, a pitfall, something still valid a month from now. Destinations follow the project's own documents when they say; otherwise: a decision → `docs/adr/` only when it is hard to reverse, would look odd without its background, or had a real alternative, else a `TODO.md` line; a term → `CONTEXT.md`; a pitfall or convention → the project's `AGENTS.md`; a verified fact → `docs/<date>-<slug>.md`; an open action → `TODO.md`.

## 3. Sort by scope

- **Project level** is written in this round.
- **Workspace level** is anything that would still hold in a different project: a line in the workspace agent rules, a skill change, an environment improvement. Append one line to the ledger: `date · type · what happened · session id`. Write the event ("finding the report script took 20 minutes"), not the fix; the fix is inferred when two events line up. The ledger is the nearest `LEDGER.md` found walking up from the working directory; if none, create it beside the outermost `AGENTS.md`. Propose a promotion only when the ledger already holds the same event from another session. Delete an existing instruction only with evidence it caused a wrong action.

Agent rules files are read by every agent in the repo; they carry navigation pointers, sparingly. Docs are reference files, pointed to from elsewhere; look for an existing doc before writing a new one. Skills hold knowledge whose description should reach the agent, or user-invoked procedures.

## 4. Propose, then write

One plan: every write with its destination and your proposed wording, ordered by what the thread paid (time lost, a mistake made). The user rules; where they change your wording, theirs is written. Record rulings in the user's words. What you proposed is not what they decided.

## 5. Brief

Report the plan back item by item: done, or how it deviated. Then anything the writing turned up, such as a repeated event that now deserves a promotion.
