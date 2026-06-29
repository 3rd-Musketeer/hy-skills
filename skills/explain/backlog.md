# explain — MVP backlog

Items deferred from MVP. Each is preserved as a design sketch + pickup trigger, not a "definitely later" — pick up only when reality says it's needed.

## 1. Persistence + retro / pattern surfacing

**Why deferred**: judged overkill for MVP. Real recurrence patterns probably take weeks of usage to emerge; building infra before then is premature.

**Sketch (preserved for pickup)**:

- Single append-only JSONL at `~/.claude/skills/explain/invocations.jsonl` (or equivalent per-client location)
- Each entry minimal but structured:
  - `ts`: ISO timestamp
  - `q`: one-line distillation of the question (not raw text)
  - `matched`: archetype name or `"fallback"`
  - `shape`: brief description of the shape used
  - `notes`: optional — `"fallback"` / `"reshape: style"` / `"reshape: structure"`
- Read on signal, not every invocation:
  - Auto-read recent fallbacks when current invocation hits fallback
  - Auto-read recent reshapes when user reshapes the answer
  - Manual `/explain retro` for periodic overview
- When ≥2 similar entries surface, propose archetype promotion or refinement
- User confirms before SKILL.md is updated
- Reshape note splits into `style` (global rules issue) vs `structure` (archetype issue) — they trigger different evolution actions
- No embeddings, no DB — plain JSONL, agent does clustering at retro time

**Pickup trigger**: noticing that fallbacks or reshapes feel like they're repeating; or, wanting a retrospective on how the skill has been used.

## 2. Auto-trigger

**Why deferred**: user prefers explicit invocation. Auto-triggering would muddy boundaries with domain skills (claude-api, update-config, etc.) and create false positives on ordinary "what is X" questions that don't need this specific expression discipline.

**Pickup trigger**: hitting cases where explicit invocation feels annoying or gets forgotten, AND the false-positive cost becomes acceptable.

## 3. Cross-skill coordination

**Why deferred**: not a real conflict yet. The universal expression rules (用户层概念优先, 结论先行, no code refs, etc.) plausibly belong higher than this skill — they apply to all explaining behavior, not just when /explain is invoked. But extracting them prematurely creates coupling without payoff.

**Sketch (preserved for pickup)**:

- Extract universal rules into either a project / user-level CLAUDE.md or a dedicated `style` skill
- explain then references the global rules and only owns archetype shapes
- Other skills (claude-api, code-review, etc.) inherit the same expression rules automatically

**Pickup trigger**: noticing the same expression rules getting re-stated across multiple skill files, or noticing other skills producing answers that violate the rules in ways the user has to correct manually.

## 4. Mixed-scenario shape composition

**Why deferred**: MVP says "compose shapes" and leaves it to agent judgment. Works fine for obvious mixes (Concept + Decision) but may break down on subtle ones.

**Pickup trigger**: a mixed-scenario answer feels structurally off and the user reshapes it.
