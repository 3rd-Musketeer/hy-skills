---
name: mindset
description: Development methodology library for choosing method and grain on ambiguous tasks. Use when the user invokes /mindset, asks how to approach work in their style, or signals method/grain ambiguity through action words — probe, smoke, e2e, eyeball, 体感, sweep, A/B, review, audit, wrap up, 看看, 试试, 检查, 验证. Not a substitute for /go, /gdd, /refactor, or other execution skills once the right execution path is already clear.
---

# Mindset

This is a development-methodology material library. It teaches how the user tends to turn ambiguous work into evidence, decisions, implementation, and handoff.

Use it to choose **method and grain**. Do not turn it into a rigid workflow.

## Core frame

The user works through evidence-gated, taste-aware development:

1. Identify the current uncertainty.
2. Choose the smallest real evidence that can reduce it.
3. Keep exploration separate from production.
4. Make qualitative judgment visible before asking for taste or 体感.
5. Preserve reusable learning at handoff.

## Two entry points

### The user named an action

If the user says a short action word — `probe`, `smoke`, `eyeball`, `体感`, `sweep`, `A/B`, `review`, `audit`, `wrap up`, `看看`, `试试`, `检查`, `验证` — read `references/action-lexicon.md` if the meaning is not obvious from context.

The lexicon maps user vocabulary to canonical moves. It is an index, not the source of truth.

### The task is ambiguous

If the user did not name a method, diagnose the uncertainty and choose a move from the table below. Read `references/method-library.md` for the full move definition when needed.

| Current uncertainty | Candidate moves | Misuse to avoid |
|---|---|---|
| Can this boundary work at all? | `smallest-real-probe`, `sandbox-spike` | Designing the whole system before proving the risky primitive |
| Does the live path still breathe? | `live-smoke`, `release-ladder` | Calling a smoke pass full correctness |
| Which approach or parameter range is better? | `variant-matrix`, `ab-compare`, `sweep` | Overbuilding variants when one representative sample would answer it |
| Is the readable output obviously wrong before the user sees it? | `preflight-eyeball` | Dumping raw output to the user without agent self-inspection |
| Does the result need human taste, visual judgment, or lived-context fidelity? | `human-preview-gate`, `representative-samples` | Pretending the agent can decide the user's 体感 |
| Does an agent-facing interface teach agents what to do? | `agent-as-caller`, `trace-based-learning` | Testing only backend functions and declaring the interface good |
| Could this change regress known behavior? | `regression-lock`, `e2e-check` | Treating happy-path success as regression coverage |
| Is this ready to merge, deploy, or hand off? | `review-pass`, `audit-pass`, `release-ladder`, `wrap-up-devlog` | Summarizing before checking diff, docs, CI, dirty state, and residual risk |

## Grain

Every move has a grain. Pick the lightest grain that can produce decision-grade evidence:

- **s0 — ping**: one real call, one sample, one screenshot, one diff check.
- **s1 — focused pass**: a few representative cases or one narrow flow.
- **s2 — broad pass**: matrix, sweep, multi-client smoke, cross-repo review, or release ladder.

If the user says "quickly", "先", "试试", or "probe", default to s0 or s1. If they say "完整", "全面", "pre-prod", "merge-ready", or "final check", consider s2.

## This is a library, not a sequence

Moves compose and repeat. A real task may go:

- `smallest-real-probe` -> `sandbox-spike` -> `preflight-eyeball`
- `variant-matrix` -> `representative-samples` -> `human-preview-gate`
- `regression-lock` -> `review-pass` -> `release-ladder` -> `wrap-up-devlog`

Do not force work through fixed stages. Tag the moment, pick the move, then keep going.

## Reference loading

Load only what matches the moment:

- `references/method-library.md` — canonical move definitions; owns the meaning of each move.
- `references/action-lexicon.md` — user words mapped to canonical moves; preserves wording like `体感`, `看看`, `audit`.
- `references/scenario-playbook.md` — illustrative scenarios and move compositions; not recipes.

## Boundaries with other skills

`/mindset` decides **grain and method**. Execution belongs elsewhere:

- Use `/gdd` when the work needs a goal document or human decision shaping.
- Use `/go` only when the Outcome and Boundary are aligned and the human explicitly invokes its result-responsibility mode. `/go` chooses a method pack itself; use `/mindset` first only when method or grain is still genuinely ambiguous.
- Use `/refactor` for maintainability or architecture-coherence audits.
- Use `/my-simplify` for focused simplification of current changes.
- Use `/grilling` when the user wants adversarial plan interrogation.

## Anti-patterns

- Turning stages into ceremony.
- Preloading every reference "just in case".
- Using `eyeball` as an excuse to skip agent self-check.
- Asking the user to inspect raw artifacts when a preview can be prepared.
- Calling subjective inspection a benchmark.
- Letting `action-lexicon.md` or `scenario-playbook.md` redefine moves instead of citing `method-library.md`.
