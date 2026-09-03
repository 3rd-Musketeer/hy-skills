---
name: go
description: Execute an already-aligned task and deliver it proven. Use ONLY when the user explicitly invokes "/go" or says "use go"; never infer it from an ordinary implementation, research, writing, or configuration request.
metadata:
  short-description: Execute an aligned task and deliver it proven
---

# go

Carry an aligned task to a state the user can use directly, and prove it before saying so.

## 1. Contract

Before changing anything, state four things in a few lines:

- **Outcome**: the observable end state, in behavior terms.
- **Proof**: which evidence would support exactly that claim. A narrow check cannot back a broad claim.
- **Boundary**: scope, authorization, irreversible or outward-visible operations, adjacent state that must survive.
- **Pickup**: zero or one action the user takes after handback. Zero when the result is already delivered; more than one means staging is incomplete.

Ask only when a missing choice changes the outcome, the scope, a public contract, the source of truth, or an irreversible consequence. Decide ordinary implementation details yourself. "Finish" or "do not stop" never grants permission to publish, send, delete, pay, or change a broader target.

## 2. Read the project's standards

Read what the project already says before acting: `AGENTS.md`, `CONTEXT.md`, the ADRs whose Scope covers the paths you will touch, the task's README, and the runbook for the surface you are about to use. Before writing any file, find where this project keeps that kind of file; do not invent a location. Current evidence beats a summary; when sources conflict in a way that changes the contract, say so.

## 3. Execute

Work inside the Boundary. When you find the scope should grow, including an adjacent defect you noticed on the way, report it and leave it; do not grow the scope. When you find a bug that resists the first fix, use the diagnosing-bugs skill instead of guessing. Report material discoveries and changed risk; do not keep a diary.

## 4. Prove

A completion claim carries the command you ran and its output. No command, no claim: write "unverified" instead. The evidence comes from the surface the user will see, not from the diff: the actual build, the simulator, the deployed lane, the right workspace. Before acting on a target, confirm its identity (which app, which workspace, which branch). Cover the failure boundary that would make the claim false. Separate what was verified from what only production can verify. When the proof itself needs an outward-visible operation (a push that deploys, a message sent), that operation belongs in the Boundary: authorized in the contract, or the claim stays unverified.

## 5. Polish

Run the project's simplify pass (native Simplify, or the my-simplify skill) on the change, remove temporary processes and files this task created, then re-run the proof that the polish touched. Session-level teardown belongs to closeup.

## 6. Hand back

Stage the system as the user will meet it: builds done, servers up, fixtures loaded, the Pickup walked through once by you. Then report, leading with the end state:

1. **Result**: what is true now.
2. **Pickup**: none, or the single action.
3. **Proof**: the command and output, and its limits.
4. **Residuals**: real deferrals, assumptions, and out-of-scope findings, each with an owner.
