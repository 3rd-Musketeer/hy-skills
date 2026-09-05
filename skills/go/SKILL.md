---
name: go
description: Execute an already-aligned task and deliver it proven. Use ONLY when the user explicitly invokes "/go" or says "use go"; never infer it from an ordinary implementation, research, writing, or configuration request.
metadata:
  short-description: Execute an aligned task and deliver it proven
---

# go

Carry an aligned task to a state the user can use directly, and prove it before saying so.

## 1. Contract

Before changing anything, state five things in a few lines. The handback mirrors them.

- **Outcome**: the observable end state, in behavior terms.
- **Proof**: which checks you will run to support exactly that claim, decided now, not after the work. A narrow check cannot back a broad claim.
- **Boundary**: scope, authorization, irreversible or outward-visible operations, adjacent state that must survive, and any shared state you will borrow with its current value, so it can be restored. "None" is a valid answer.
- **Pickup**: zero or one action the user takes after handback, and how they will do it (for example, try the new feature in the simulator). Zero when the result is already delivered; more than one means staging is incomplete.
- **Layout**: where every output of this task will live, and which file is the authority for it. Agreeing this first is what keeps the context from scattering.

Ask only when a missing choice changes the outcome, the scope, a public contract, the source of truth, or an irreversible consequence. Decide ordinary implementation details yourself. "Finish" or "do not stop" never grants permission to publish, send, delete, pay, or change a broader target.

## 2. Read the project's standards

Before acting, find what the project already says, wherever it keeps it: the rules it gives agents, the words it uses for its concepts, the decisions that constrain the paths you will touch, the current state of this thread, and how to operate the surface you are about to use. Before writing any file, find where this project keeps that kind of file; do not invent a location. Current evidence beats a summary; when sources conflict in a way that changes the contract, say so.

## 3. Execute

Work inside the Boundary. When you find the scope should grow, including an adjacent defect you noticed on the way, report it and leave it; do not grow the scope. When you find a bug that resists the first fix, use the diagnosing-bugs skill instead of guessing. Report material discoveries and changed risk; do not keep a diary.

## 4. Prove

A completion claim carries the command you ran and its output. No command, no claim: write "unverified" instead. The evidence comes from the surface the user will see, not from the diff: the actual build, the simulator, the deployed lane, the right workspace. Before acting on a target, confirm its identity (which app, which workspace, which branch). Cover the failure boundary that would make the claim false. Separate what was verified from what only production can verify. When the proof itself needs an outward-visible operation (a push that deploys, a message sent), that operation belongs in the Boundary: authorized in the contract, or the claim stays unverified.

Once the proof matches the Outcome, stop. Broaden or repeat testing only when a new change, a failure, or an unresolved concern justifies it. Do not write tests that mirror a reversible, low-impact change.

## 5. Polish and put the world back

Run the project's simplify pass (native Simplify, or the my-simplify skill) on the change, then re-run the proof it touched. Then:

- Destroy what this task created: processes, servers, port-forwards, scratch files, merged branches and their worktrees. Anything dirty or unmerged: ask.
- Restore what this task borrowed to the original recorded in the Boundary. No recorded original: ask, never guess. Verify by identity (the value, the image tag), not by liveness.
- Close what tracks the task: PR state, the task README's state line, the action list. Nothing should still read "in progress".
- Check, do not assert: tree clean, only the expected worktrees and branches, no orphan processes, and every invariant that had to survive the change still holds.

## 6. Hand back

Stage the system as the user will meet it: builds done, servers up, fixtures loaded, the Pickup walked through once by you. Then report by filling in the contract, one line per item, in the user's language:

- **Result** against the Outcome: what is true now.
- **Proof**, item by item: the command and its output, or "unverified".
- **Pickup**: none, or the one action, as agreed.
- **Layout**: where things went, one or two bullets.
- **Deviations** from the contract: scope left undone, route changed, assumptions made. "None" when clean.

Boundary is not reported; it was honored during execution.
