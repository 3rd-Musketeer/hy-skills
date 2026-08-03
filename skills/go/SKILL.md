---
name: go
description: Execute an already-aligned task as a high-agency outcome contract — recover relevant standards, own the result within existing authority, choose a task-appropriate method, prove completion, polish the resulting state, and leave zero or one Pickup action. Use ONLY when the human explicitly invokes "/go" or explicitly asks to use the go skill; do not infer it from a generic implementation, research, writing, configuration, or operations request.
---

# /go

Take responsibility for an aligned outcome and carry it to a real, evidenced, directly usable terminal state.

`/go` is a role switch: **agent = full-context worker; human = end-user consumer** (`../references/goal-driven-dev.md` § Roles). Two principles judge every mechanic:

- **Transparence** — expose enough result, evidence, limits, and judgment for trust calibration; do not narrate every step.
- **UX** — stage everything within tool reach and walk the verification path as user #1. The human should arrive as user #2, not as setup staff.

This mode increases agency, not authority. “Finish,” “ship,” or “do not stop” never grants permission to publish, message, share, delete, pay, or mutate a broader target.

## 1 · Establish the execution contract

State four things before mutating:

- **Outcome** — the observable terminal state, in behavior language.
- **Proof** — what current evidence would be strong enough to support that exact claim.
- **Boundary** — scope, authorization, irreversible or outward-visible operations, and protected adjacent state.
- **Pickup** — zero or one action the human takes after handoff. Zero is correct when the result is already delivered; more than one means staging is incomplete.

When a shaped goal or approved plan exists, treat it as authoritative. For a lightweight task, hold this contract in the working context; do not create a goal artifact just to satisfy `/go`.

Restate the contract briefly. Ask only when a missing choice changes outcome shape, scope, public contract, source of truth, authority, or irreversible consequence. In a non-interactive context, stop on any such unknown rather than guessing. Decide ordinary implementation details yourself.

## 2 · Recover relevant standards

Read what a capable full-context worker would need: project instructions, current source and runtime state, goal or plan, runbooks, nearby decisions, and available user preferences. Retrieve progressively; do not preload unrelated history or references.

Prefer current evidence over stale summaries. If sources conflict in a way that changes the contract, surface the conflict. Do not make the human repeat standards already recoverable from the environment.

## 3 · Select method and evidence

Load one primary pack that matches the dominant work shape:

| Work shape | Primary pack |
|---|---|
| Code, repository feature, migration, or executable product change | `references/development.md` |
| User/system configuration, local tooling, runtime, or operations | `references/system-config-and-ops.md` |
| Investigation leading to a recommendation or decision | `references/research-and-decision.md` |
| Document, guide, prose, or structured writing change | `references/document-and-writing.md` |
| Product flow, interaction, visual hierarchy, or rendered experience | `references/product-and-design.md` |
| Dataset, metric, evaluation, report, or analytical conclusion | `references/data-analysis.md` |

When any step publishes, sends, shares, installs, deletes, pays, or otherwise changes a target visible beyond the local working state, also load `references/external-actions.md` as an overlay.

Use a second primary pack only when the outcome genuinely crosses domains. If method or grain remains ambiguous after inspecting the task, use the available `mindset` skill/library on demand; it is not a prerequisite.

Choose proof before execution. The core standard is scope alignment: a narrow check cannot support a broad completion claim.

## 4 · Execute and adapt

Carry out all agent-scriptable work inside the accepted Boundary. Preserve unrelated state and prefer the smallest complete mechanism with one clear owner.

Implementation is a discovery loop. New evidence may change order, tools, local design, or the proof plan. Adapt without ceremony when the contract still holds. Stop and realign before changing Outcome, Boundary, authority, irreversible consequences, or a human-approved product direction.

Keep the human updated enough to understand material discoveries, changed risk, or a revised route. Do not turn progress updates into a work diary.

## 5 · Prove the outcome

Obtain current, task-appropriate evidence from the primary pack. Exercise the real Pickup path yourself wherever tools reach it.

- Verify the result, not merely the intended configuration, source diff, command exit, or artifact existence.
- Cover representative states and the failure boundary that would make the completion claim false.
- Record what the evidence does and does not prove. A real tool-reach limit becomes an explicit deferral only after concrete attempts.
- If proof fails, fix what is local and inside scope. Escalate instead of hiding a structural failure or expanding authority.

## 6 · Polish and complete the resulting state

Review the whole state produced by the task:

- Is the mechanism simpler than the problem, with no duplicate owner or misleading source of truth?
- Are temporary processes, sessions, fixtures, files, overrides, and partial attempts removed or intentionally retained?
- Is adjacent user state unharmed and the surviving state legible to the next agent?
- Did execution uncover a real out-of-scope issue or reusable decision that needs an explicit owner?

The development pack performs its code-specific Simplify pass here. Other packs use their own completion lens. `/go` removes direct task residue; the `closeup` skill remains responsible for post-ship session lifecycle, worktree retirement, and restoration of broader borrowed environments.

Re-run affected proof after any polish change.

## 7 · Stage the Pickup

Bring the system to the state the human will encounter. Builds, migrations, server startup, fixture loading, local installation, generated artifacts, and tool-drivable verification remain agent work when authorized and reachable.

Then walk the Pickup as user #1. If the original action no longer applies, update it and explain the material reason. Never manufacture an action solely to make the handoff look interactive.

## 8 · Hand back the result

Lead with the terminal state, not the implementation sequence. Default shape:

1. **Result** — what is true now, in behavior language.
2. **Pickup** — `None` or the single action; include what is already staged.
3. **Proof** — the strongest evidence and its scope; include relevant limits.
4. **Polish** — what was cleaned, simplified, restored, or intentionally retained.
5. **Residuals** — only real deferrals, assumptions, out-of-scope findings, or cross-goal ref candidates, each with an owner or decision needed.

Load `references/handoff-doctrine.md` when the handback needs more than a brief chat response or is rendered as a document artifact.
