---
name: grilling
description: Interview the user about a plan, decision, or idea until you share one understanding. Explicit invocation only ("grill me", "拷问我", "/grilling", "还有什么要问我的"); never trigger on ordinary planning talk.
license: MIT
metadata:
  short-description: Outline-first, frontier-round plan grilling
  derived-from: "The design-tree / frontier-round method is from github.com/mattpocock/skills@6654f6b skills/productivity/grilling (MIT). Local additions: the outline file, stakes per question, decide/probe/backlog triage, the no-action rule, ruling-vs-proposal columns, landing in TODO."
---

# grilling

Goal: a shared understanding of the plan. Nothing left silently assumed. Do not act on the plan until the user says so.

## 1. Build the outline before asking anything

1. Walk the plan end to end as if executing it. Every point where you would need a decision that is not written down is a candidate question.
2. Write the candidates to `.tmp/grilling/YYYYMMDD-<slug>.md` as a **design tree**: each decision lists the decisions that depend on it. The outline is for you, not the user. It keeps the whole tree in view when one answer pulls you into a local detail.
3. Facts are your job. Anything answerable from code, docs, or tools: look it up, or dispatch a subagent and keep asking the questions that do not depend on it.
4. Triage each candidate: **decide** (the user's call), **probe** (a cheap experiment answers it: propose the probe instead), **backlog** (real, off the current path: record, do not ask).
5. Every `decide` question carries its **stakes** on one line, three short clauses: why it must be decided now / what differs between an arbitrary choice and a deliberate one / which thing the user cares about that difference lands on. If the difference lands on nothing the user cares about, decide it yourself and note the choice in the outline. No stakes, no question.
6. Two sources that contradict each other are a `decide` question, not a lookup. Name both sources in the question.

## 2. Ask in frontier rounds

The **frontier** is every `decide` question whose prerequisites are settled. Ask the whole frontier in one round, numbered, each with its stakes, options, and your recommended answer with a one-line basis. Keep each question under ten lines; the stakes line and the options carry the content, not prose around them. A question that depends on another question still open in this round waits for a later round. Then stop and wait.

```
❓ **Q1 · <title>**
Stakes: <why now> / <arbitrary vs deliberate> / <lands on>
<options>
➡️ <recommendation and basis>
```

After each round: write the user's answer into the outline's **ruling** column in their words. The proposal column is yours; the ruling column is theirs; never promote one to the other. If they decide something outside your options, record what they decided. If they say "that is not what I asked", re-read the original question and ask again.

Use the user's words and the project's `CONTEXT.md` terms. When a term is used two ways, ask which one before going on.

## 3. Rules while grilling

- Write nothing except the outline. No implementation, no files, no proposals for how to build it.
- One line of echo after a ruling, then the next round. No re-summarizing what they just said.

## 4. Done

The session ends when the frontier is empty and the user confirms the shared understanding. Then:

- Rulings and action items go to the project's action list (`TODO.md` or its equivalent). A decision may sit there as a temporary line; filing durable decisions is closeup's job, not grilling's.
- Probes are dispatched or handed over as concrete plans. Backlog items go to the project's backlog file.
- Report in one line: N decided, X probes, Y backlogged, and the file paths. Delete the outline.
