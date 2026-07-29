---
name: grilling
description: Relentlessly question the human about a plan, design, or task brief — outline first, then strictly one question at a time, each with options, analysis, and a recommendation. Aligns fuzzy boundaries, stress-tests the plan, and asks opening questions that may spark directions the human hadn't considered. Explicit invocation only — trigger on /grilling, explicit asks ("grill me", "拷问我", "stress-test this plan", "问我问题"), or a closing sweep after a design discussion ("还有什么要问我的吗"); do not auto-trigger on ordinary planning discussion.
metadata:
  short-description: Outline-first, one-question-at-a-time plan grilling
---

# grilling

The human invokes this when they want a plan questioned hard **before** work starts. The job is to find what they didn't know you didn't know. Three question energies, one posture — relentless, and strictly one question at a time:

- **Boundary** (align) — fuzzy scope, unstated constraints, choices the brief never made.
- **Pressure** (stress-test) — provenance ("is that from the docs or did you make it up?"), ROI/necessity, KISS, concrete counterexample scenarios. Try to break the plan; pressure points toward *removing* entities, never adding them.
- **Opening** (spark) — exploratory, creative what-ifs that might open a direction the human hadn't considered. A good grilling question can inspire, not just verify.

Two entry shapes, same mechanics: **pre-work alignment** (human hands you a brief → grill until the fuzzy boundaries are gone, then work may start) and **closing sweep** (discussion has converged → sweep for remaining questions; repeat invocations are welcome and should find fewer each time — "no questions left" is a valid, reportable outcome). Grilling requires a live human to answer; in a non-interactive context, produce the outline with recommendations as a document instead of asking.

## §1 · Brain test, then outline — before asking anything

1. **Brain-test the task.** Mentally walk the plan end-to-end as if executing it. Every point where you'd reach for a decision that isn't written down is a question candidate.
2. **Self-answer first.** Anything answerable from code, notes, goal docs, project docs, chat history, or memory — look it up instead of asking. Never ask what you can look up.
3. **Write the outline to a tmp file** — `.tmp/grilling/YYYYMMDD-<slug>.md` under cwd (create it; if the workspace already has a `.tmp/` convention at its root, follow it). Order questions by decision dependency: upstream shape questions first. The outline is yours, not the human's — it exists so answers can't derail you.
4. **Triage every item three ways.** Only `decide` enters the asking queue:
   - **decide** — genuinely needs the human's call
   - **probe** — answerable by a cheap experiment or research → propose the probe instead of asking ("结论说话")
   - **backlog** — real but doesn't affect the current mainline → record, don't ask
5. **Quota all three energies.** The outline must carry boundary, pressure, *and* opening questions. Opening questions are structurally required — not left to mood.
6. **Qualification test.** For each question you must be able to state its **consequence** — what changes downstream if the answer differs — and tie it to user/product value. Can't state the consequence → delete the question.

## §2 · Ask — one question at a time

- **One question per message.** Never dump the outline or a numbered question list for batch reply.
- Each question ships with **options + a short analysis per option + one recommendation**, the recommendation carrying a one-line basis or source. "The official docs recommend X" beats "I'd pick X".
- **Follow-ups queue, don't chase.** When an answer surfaces something worth digging into, append it to the outline (triaged), then continue in outline order. Do not let an answer derail the sequence or tunnel endlessly into one topic.
- **After each answer:** echo the ruling in one line, record it in the outline, move on. The human may decide something outside your options — record what they actually decided, not the nearest option.
- If the human says "我的意思是 / 我问的不是这个 / that's not what I asked" — stop, re-understand the **original** question, and re-ask. Never continue on your prior interpretation.
- Speak the human's language. Direct; no preamble, no re-summarizing what they just said.

## §3 · Stop and land

Stop when all three hold:

1. A fresh brain-test pass finds no new `decide`-level questions.
2. Every `decide` has a ruling; every `probe` has a plan or owner; every `backlog` item is recorded.
3. The human gives a closing signal ("同意 / go / 拍板 / 没问题了").

Then **land the results — the session ends in artifacts, not vibes**:

- Decisions with reasons → the goal's Decisions section when working in a `.gdd/` project; otherwise the topic's working note, or wherever the human names.
- Assumptions still unverified → a named "key assumptions to verify" list.
- Probes → dispatched (subagent/experiment) or handed over as concrete probe plans.
- Deferred items → the project's backlog convention.
- Close with a sweep report: **"岔路已清空 — N decided, X probes, Y backlogged"** plus artifact paths. The tmp outline is disposable once landed.

---

Distant ancestor: [mattpocock/skills](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) grilling. Rewritten 2026-07 from transcript-mined evidence plus the human's stated questioning discipline; evidence base in this plugin repo at `.gdd/backlogs/backlog-20260702-grilling-rewrite`.
