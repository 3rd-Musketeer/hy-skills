---
name: explain
description: Generate user-tailored explanations across different question types — concept intro, mechanism, decision, comparison. Adapts shape per scenario while applying a consistent set of expression rules.
when_to_use: Use only when the user explicitly invokes /explain or asks for an explanation in this style. Do NOT auto-trigger on ordinary "what is X" or "how does X work" questions — the user calls this skill deliberately when they want this specific expression discipline. Not for domain-specific Q&A that another skill (claude-api, update-config, etc.) should handle.
---

# explain

Produce an explanation that lands fast. This skill is **guidance, not template** — adapt to the question, don't mechanize it.

## Universal rules (apply always)

1. **用户层概念优先**. Lead with concepts the user already shares. Internal vocabulary (source code names, framework jargon, internal abstractions) appears only when the user explicitly asks. When it does appear, put it in parentheses as a locator anchor, not as the explanation itself.
2. **结论先行**. First sentence is the answer. Supporting structure comes after.
3. **No code refs by default**. No `file:line`, no source identifiers, no function names dropped into prose. Include them only when the user explicitly asks for source navigation.
4. **Tables only for real comparison**. Two or more things weighed on shared dimensions. Don't use tables to "organize prose" or "look structured."
5. **Bold / numbering serve skim-reading**. They mark the load-bearing sentence in each section, not every phrase that feels important.
6. **Long answers separate spine from detail**. The main spine should be readable on a skim; detail follows, or sits under collapsibles if the rendering format supports it.
7. **No process narration, no self-congratulation**. Skip "I'll go check X first" openings. Skip "All green ✅" closings. State the result; the user does not need the narration.

## Scenario archetypes (default shapes; adapt freely)

Each is a starting shape, not a template. Bend or compose as the question requires. If nothing fits, use the fallback.

### Decision (选型评估)
For: "should I use X" / "X 适合我吗" / "上不上 X" / "值不值得"

- What kind of object X is (technology choice, runtime config, workflow pattern, etc.)
- Why X was invented — the pain it answers
- Fit with the user's current situation
- Cost / risk
- Current call + the trigger condition for revisiting

### Mechanism (机制解释)
For: "how does X work" / "X 是怎么实现的" / "什么时候触发 X"

- One-line user-layer conclusion
- The main flow described in terms the user can feel — not in terms of internal call stacks
- Edges, defaults, hidden constraints

Do not insert source code identifiers unless the user explicitly asks. When they do ask, they belong in parentheses as locator anchors, not as the explanation itself.

### Comparison (比较)
For: "X vs Y" / "X 和 Y 的区别" / "哪个好" / "选哪个"

- One-line: the most important difference
- Table comparing on shared dimensions
- For the user's situation: which one, and why

### Concept (概念入门)
For: "什么是 X" / "X 是个啥"

- What category of thing X belongs to + minimal usable description
- Differences from neighboring concepts users commonly confuse it with
- The most common reason people care about X

### Fallback (no archetype matches)

Generic shape: one-line conclusion + skim-friendly main spine + detail layer below.

When falling through to fallback, mention it briefly in the response. Recurring fallbacks are signal that the archetype set needs to grow.

## Mixed scenarios

A question can span archetypes — e.g. "what is Astro and should I use it" = Concept + Decision. Compose the shapes rather than forcing the question into one.

## Backlog

Persistence, retro / pattern surfacing, auto-trigger, and cross-skill coordination are deferred from MVP. See `backlog.md` next to this file for the preserved design notes and pickup triggers.
