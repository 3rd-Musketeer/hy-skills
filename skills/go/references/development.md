# Development Pack

Load for code, repository features, migrations, executable product behavior, and other work whose result is primarily carried by source.

This pack preserves the development method proven by `/go v1`; it does not make that method universal.

## Contract and test posture

When user-observable behavior is stable enough to specify, default to light TDD:

1. State the public behavior contract and the 2–3 cases that would prove it.
2. Write a few high-value behavior tests first and watch them fail for the intended reason.
3. Implement until they pass, using writing-time test friction as a design signal.
4. Add only discovered production-relevant error paths, regressions, or invariants.

Do not force tests-first onto a spike, mechanical metadata change, generated artifact, or task whose strongest proof is a build, schema inspection, rendered surface, or live integration. State the substitution and why it proves the Outcome better.

Load `development/testing-doctrine.md`, then only the stack reference that matches current source:

- `development/node.md`
- `development/python.md`
- `development/swift.md`

## Implementation signals

Long setup, several third-party mocks, hidden globals, or sprawling parameters are design feedback while writing—not audit findings to postpone. Fix the local seam when it is inside scope. Record larger architecture debt without silently absorbing it.

Tests protect public behavior, not coverage metrics or internal structure. A focused unit test earns its place when implementation reveals non-trivial pure logic.

## User-facing surfaces

For UI work, use the least intrusive evidence that reaches the needed surface:

| Tier | Purpose |
|---|---|
| Unit | Pure formatter, selector, reducer, or state-transition logic |
| Component | Wiring, conditions, props, DOM, and edge states |
| Live | Integration, timing, interaction, and visual outcome |

Default to 1–2 representative live flows plus component coverage for non-trivial wiring. A visual claim needs a rendered screenshot or runtime inspection; passing typecheck and tests is not visual proof. Prefer headless verification. Announce before taking over the human's screen, and exhaust available tools before declaring a surface unreachable.

When streamed model output is in scope, load `development/streaming-ui.md`.

## Canonical checks and code polish

Discover the project's real commands from its task runner, manifest, CI, or instructions. Never invent a test command. Separate cold setup/build duration from warm test duration when it matters to interpretation.

Run a code Simplify pass after implementation and before final proof. Use a native Simplify capability when present; otherwise load the sibling `my-simplify` skill. Act on small, high-confidence findings inside scope and re-run affected checks.

## Repository handoff

When repository ownership and the task boundary are clear, commit the completed change with a message describing the observable result. Preserve unrelated user edits.

Do not push, force-push, open a PR, merge, or publish unless the human explicitly authorized that outward-visible step. Use the dedicated publishing skill when one applies.
