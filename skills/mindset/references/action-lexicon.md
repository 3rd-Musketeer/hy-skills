# Action Lexicon

This file preserves the user's wording and maps it to canonical moves in `method-library.md`. Do not redefine moves here.

One phrase can map to multiple moves. Interpret by context, stage, and grain.

## Quick index

| User phrase | Felt intent | Common moves |
|---|---|---|
| `看看` / `看下` | Observe first; do not overcommit | `review-pass`, `human-preview-gate`, `smallest-real-probe` |
| `读一下` / `catch up` | Rebuild context before judging | `audit-pass`, `review-pass`, `wrap-up-devlog` |
| `分析` | Decompose, judge, expose tradeoffs | `review-pass`, `audit-pass`, `variant-matrix` |
| `评估` | Judge value/risk/fit | `variant-matrix`, `ab-compare`, `review-pass` |
| `可行吗` / `能不能` | Feasibility, not full implementation | `smallest-real-probe`, `sandbox-spike` |
| `probe` | Smallest real boundary check | `smallest-real-probe` |
| `试试` | Try a bounded variant or spike | `smallest-real-probe`, `sandbox-spike`, `variant-matrix` |
| `跑一下` / `测一下` | Execute an experiment or check | `live-smoke`, `e2e-check`, `regression-lock` |
| `smoke` | Prove the real path still breathes | `live-smoke`, `release-ladder` |
| `e2e` | Verify a user-observable flow | `e2e-check`, `live-smoke` |
| `对比` / `比较` | Compare on meaningful dimensions | `ab-compare`, `variant-matrix` |
| `sweep` / `扫一遍` | Cover a range or broad candidate set | `sweep`, `representative-samples` |
| `benchmark` | More formal measurement baseline | `sweep`, `variant-matrix`, `regression-lock` |
| `效果如何` | Evaluate output quality or behavior | `preflight-eyeball`, `human-preview-gate`, `live-smoke` |
| `eyeball 一下` | Agent pre-checks readable output before user-facing verification | `preflight-eyeball` |
| `体感` | Does this match lived/product feel? | `human-preview-gate`, `representative-samples` |
| `preview` / `展示` / `给我看看` | Prepare a human-reviewable surface | `human-preview-gate` |
| `确认` | Align shared state or fact-check a premise | `review-pass`, `audit-pass` |
| `检查` | Inspect state, scope, omitted work, or readiness | `review-pass` |
| `验证` | Prove a claim with evidence | `regression-lock`, `e2e-check`, `smallest-real-probe` |
| `复核` / `核查` | Re-check because trust is not assumed | `audit-pass` |
| `review` | Structured readiness / issue finding | `review-pass` |
| `audit` | Higher-scrutiny independent judgment | `audit-pass` |
| `排查` | Find root cause | `trace-based-learning`, `audit-pass` |
| `regression` | Lock a known failure mode | `regression-lock` |
| `recap` | Summarize current shared state | `wrap-up-devlog`, `review-pass` |
| `wrap up` | Close the topic with decisions, cleanup, handoff | `wrap-up-devlog` |
| `note down` / `devlog` | Preserve reusable learning | `wrap-up-devlog` |
| `cleanup` | Remove stale local/project state | `review-pass`, `wrap-up-devlog` |
| `push / merge / deploy` | Move into delivery chain | `review-pass`, `release-ladder` |

## Nuance notes

### `看看`

Felt intent: look before acting. It can mean "inspect the document", "show me the UI", or "check whether the live system is reachable".

Not: permission to rewrite everything.

Example: "你看看这个文档是否需要更新" means inspect and recommend; update only if the need is clear or the user asks.

### `试试`

Felt intent: bounded try. The user is inviting a small real attempt, not a production build.

Not: turn the try into a generalized system.

Example: "换成另一个 model 试试" means run a comparable sample and report the delta.

### `probe`

Felt intent: touch the real risky boundary once.

Not: a full validation plan.

Example: "这个 client 能不能连 MCP，probe 一下" means one real connection, a status/result, and the blocker if it fails.

### `smoke`

Felt intent: happy-path liveness through the real path.

Not: correctness, regression coverage, or product quality.

Example: "上线后 smoke 一下" means route/auth/tool behavior should be checked live, while deeper quality may remain unverified.

### `eyeball`

Felt intent: for readable output, the agent should inspect before showing it to the user.

Not: always a human-only taste gate.

Example: "做出来 eyeball 一下" means produce the artifact, read it yourself, fix obvious issues, then present a concise preview or remaining uncertainty.

### `preview`

Felt intent: prepare something the user can see and judge.

Not: raw files or logs dumped into chat.

Example: UI/UX usually needs a page, screenshot, browser preview, or side-by-side view because final judgment belongs to the user.

### `体感`

Felt intent: lived/product feel. It asks whether the result feels right in the user's real context, not whether a metric improved.

Not: a synonym for "looks okay".

Example: activity segmentation should be shown through representative days or a browsable artifact so the user can tell whether it matches how the day actually felt.

### `review` vs `audit`

`review` is readiness-oriented: find blockers, scope issues, missing tests/docs, or merge risk.

`audit` is trust-oriented: do not accept prior summaries; reconstruct facts from source evidence.

### `验证`

Felt intent: evidence-backed proof. The expected evidence depends on the claim: command output, tests, trace, screenshot, live endpoint, or representative cases.

Not: "I read the code and it seems fine."

### `wrap up`

Felt intent: make the work pick-up-able later. It includes decisions, evidence, discarded paths, cleanup, and remaining uncertainty.

Not: a changelog of files touched.
