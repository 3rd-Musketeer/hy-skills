---
name: retro
description: Retrospective on a thread of work. Find what to change in the repository and the workflow so the next run goes better, and file the lessons where the next agent will read them. Explicit invocation only ("retro", "复盘", "收尾").
license: MIT
metadata:
  short-description: Improve the environment and file the lessons after a thread
  derived-from: "github.com/mattpocock/skills@5beb35b skills/engineering/retro/SKILL.md (MIT): the seven environment categories and their triggers, reading existing checks first, mechanical versus judgment violations. The fix-level order for promotions follows github.com/cursor/plugins pstack/skills/correct (MIT). Local additions: the knowledge gate and destinations, project versus workspace scope, the ledger, one plan then write."
---

# retro

You are suggesting improvements to the environment the agent works in, and filing what this thread learned. Nothing is written until the user approves the plan.

An explicit instruction from the user in this conversation outranks this skill. When they conflict, follow the user and name the part of the skill you departed from.

## 1. Read the primary sources

The thread the user names; by default the current one, including the parts before any compaction (the session log on this machine). What the log says beats the summary you were handed. Cross-reference other sessions only when the user asks.

## 2. Collect candidates

**Environment.** Look for these, each with the signal that marks it:

- **Navigation**: the session took long to find a file or a fact. A pointer would have saved it.
- **Automated checks**: the agent made a mistake a linter, type check, test, or filesystem check would have caught. Read the repo's existing check commands first (its lint and check scripts, its CI workflow): a check that exists but is unwired or broken is the finding, not a new one.
- **Standards**: a rule the reviewer, or the project's agent rules, should enforce, or one that should be removed or clarified because it did not stop a mistake. Classify the violation first: a mechanical one (a fixed pattern, a banned API, a file-location rule) gets a deterministic check (a lint rule, a hook, a CI job); a written rule is for judgment calls only.
- **Steering size**: the agent rules file carries instructions that belong in a check or a doc; it is large in the repo or in the user's global scope.
- **Tool economy**: an expensive tool call, or custom tooling that burns tokens.
- **No-ops**: an instruction in a steering file that does not change behavior.
- **Information access**: a crucial piece of information the agent could not reach (logs, a read-only view of a service).

**Knowledge.** Take what passes the gate: a reusable method, a fact that cannot be read out of the code, a pitfall, something still valid a month from now. Destinations follow the project's own documents when they say; otherwise: a decision → `docs/adr/` only when it is hard to reverse, would look odd without its background, or had a real alternative, else a `TODO.md` line; a term → `CONTEXT.md`; a pitfall or convention → the project's `AGENTS.md`; a verified fact → the task directory, unless it stays useful outside this task, then `docs/<subject>.md`; an open action → `TODO.md`.

## 3. Sort by scope

- **Project level** goes into this round's plan (section 4).
- **Workspace level** is anything that would still hold in a different project: a line in the workspace agent rules, a skill change, an environment improvement. Append an entry to the ledger in the form its own header defines (the header is the only place that format lives); the type is one of the seven environment categories above, or `rule` for a candidate line in the agent rules, or `skill` for a skill change, or a type the header adds. Write the event ("finding the report script took 20 minutes"), not the fix; the fix is inferred when two events line up. The ledger is the nearest `LEDGER.md` found walking up from the working directory; if none, create it beside the outermost `AGENTS.md`. Propose a promotion only when the ledger already holds the same event from another session. A promotion names the level that fixes it, highest first: make the mistake impossible (one owner, one supported way, delete the old path an agent would copy), then a type or a lint whose error names the fix, then a test, and a written rule last, only for judgment calls. Say why each higher level does not work. When a written rule was already in place and the event repeated, nothing enforces that rule; the fix goes a level higher. Delete an existing instruction only with evidence it caused a wrong action.

Agent rules files are read by every agent in the repo; they carry navigation pointers, sparingly. Docs are reference files, pointed to from elsewhere; look for an existing doc before writing a new one. Skills hold knowledge whose description should reach the agent, or user-invoked procedures.

## 4. Propose, then write

One plan: every write with its destination and your proposed wording, ordered by what the thread paid (time lost, a mistake made). The user rules; where they change your wording, theirs is written. Record rulings in the user's words. What you proposed is not what they decided.

## 5. Brief

Report the plan back item by item: done, or how it deviated. Then anything the writing turned up, such as a repeated event that now deserves a promotion.
