---
name: grilling
description: Interview the user about a plan, decision, or idea until you share one understanding. Explicit invocation only ("grill me", "拷问我", "/grilling", "还有什么要问我的"); never trigger on ordinary planning talk.
license: MIT
metadata:
  short-description: Outline-first, frontier-round plan grilling
  derived-from: "The design-tree / frontier-round method is from github.com/mattpocock/skills@6654f6b skills/productivity/grilling (MIT). Local additions: the outline file, stakes per question, decide/probe/backlog triage, the no-action rule, ruling-vs-proposal columns, terms into CONTEXT.md as they settle, landing in TODO."
---

# grilling

Goal: a shared understanding of the plan. Nothing left silently assumed. Do not act on the plan until the user says so.

## 1. Build the outline before asking anything

1. Walk the plan end to end as if executing it. Every point where you would need a decision that is not written down is a candidate question.
2. Write the candidates to `.tmp/grilling/YYYYMMDD-<slug>.md` as a **design tree**: each decision lists the decisions that depend on it. The outline is for you, not the user. It keeps the whole tree in view when one answer pulls you into a local detail.
3. Facts are your job. Anything answerable from code, docs, or tools: look it up, or dispatch a subagent and keep asking the questions that do not depend on it.
4. Triage each candidate. Most candidates are not decisions. A **fact gap** (how slow, how many, does it block) is answered by lookup, estimate, or a cheap experiment: **probe**, never a preference question. A **design flaw** (one option is no worse on every axis and better on one; or a different approach dissolves the conflict) is fixed, not offered. Off the current path: **backlog**, record and do not ask. Only a real trade, where each option wins on something the user cares about and the consequences are already known, is a **decide** question.
5. Every `decide` question carries its **stakes**, which are two things. **Impact**: who sees something different depending on the choice, written as a scene: "when the user does X, A makes them Z because Y; that lands on W". W must be something the user cares about: what users see, click, and wait for; how well agents work with the system; data truth; outward commitments in copy, docs, or messages to the team; irreversibles such as schema, contract, URL, naming; colleagues' branches, lanes, and reviews; what stays blocked until this is decided. Give the magnitude: a measured range, or a qualitative bound; never an invented number. **After-effect**: when a wrong choice can be undone and at what cost; zero if it flips tomorrow for free, large once others depend on it. If W is not on that list, or the after-effect is zero, decide it yourself and note the choice in the outline. No stakes, no question.
6. Two sources that contradict each other are a `decide` question, not a lookup. Name both sources in the question.

## 2. Ask in frontier rounds

The **frontier** is every `decide` question whose prerequisites are settled. Ask the whole frontier in one round. A question that depends on another question still open in this round waits for a later round. Then stop and wait.

Group questions that share one parent decision. Open a group with one or two sentences: what these questions settle, and which conflict or ambiguity they resolve. Add a diagram only when the questions are about structure, flow, or boundaries and words would take longer.

Open the round with the choices you made yourself, one line each, so the user can veto without a question being asked.

A question hands the user a prepared decision, not a pair of options to analyze. Write it as prose in the user's words, never in the words you coined while working. Say what happens today. Say what each path changes, as the scene from step 5, with its magnitude and after-effect. Recommend one path with its basis, and name the fact or priority that would flip the recommendation. End with the one sentence the user actually has to answer: the trade they are accepting or refusing. Cut every sentence that repeats what the scene already says. Options are paths you have already thought through, so the user chooses instead of designing.

Lay every question out the same way, so the user can answer "3 B" without re-reading:

```
**3. <what is being decided, in the user's words>**
<Today: who does what.> <A: when the user does X, it makes them Z because Y; lands on W. Magnitude.> <B: same shape.> <After-effect: when it can be undone, at what cost.>
推荐 B，<basis>。改选条件：<what would flip it>。
要定的一句：<the trade the user accepts or refuses>。
```

Check the round as the user would: after reading a question, can they say what they are trading, what they are taking on, and what would make them choose otherwise? If not, the question is not ready. If they would still have to ask "what does this change for the user", it is not ready. Short sentences, nothing they have to translate.

After each round: write the user's answer into the outline's **ruling** column in their words. The proposal column is yours; the ruling column is theirs; never promote one to the other. If they decide something outside your options, record what they decided. If they say "that is not what I asked", re-read the original question and ask again.

When a term is used two ways, ask which one before going on. Use the project's `CONTEXT.md` terms where they exist. When a term is settled in a round, write it into `CONTEXT.md` right then, in the domain-modeling skill's format; this is the one write allowed besides the outline, because a settled term serves every task after this one. Once the user settles a term, write it into `CONTEXT.md` right then, in the domain-modeling skill's format; a term settled in grilling should already be there when the work starts.

## 3. Rules while grilling

- Write nothing except the outline and settled terms in `CONTEXT.md`. No implementation, no other files, no proposals for how to build it.
- One line of echo after a ruling, then the next round. No re-summarizing what they just said.

## 4. Done

The session ends when the frontier is empty and the user confirms the shared understanding. Then:

- Rulings and action items go to the project's action list (`TODO.md` or its equivalent). A decision may sit there as a temporary line; filing durable decisions is retro's job, not grilling's.
- Probes are dispatched or handed over as concrete plans. Backlog items go to the project's backlog file.
- Report in one line: N decided, X probes, Y backlogged, and the file paths. Delete the outline.
