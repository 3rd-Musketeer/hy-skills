# Method Library

This file owns the canonical move definitions. Other references should link to these move names instead of redefining them.

Each move answers: what uncertainty it reduces, how to run it at the right grain, what evidence it produces, and how it is commonly misused.

## Grain scale

- **s0 — ping**: one real boundary touch, one sample, one screenshot, one status check.
- **s1 — focused pass**: a few representative cases, one narrow flow, or one small comparison.
- **s2 — broad pass**: matrix, sweep, multi-client smoke, cross-repo audit, or pre-prod release ladder.

## `smallest-real-probe`

**Solves:** Whether a risky boundary can work at all.

**Use when:** A new API, CLI, MCP endpoint, model, repo path, auth path, or deployment primitive may or may not be usable.

**Run it as:** Touch the real boundary with the smallest input that exercises the risky part. Prefer s0. Stop after pass/fail unless the user asked to proceed.

**Evidence:** Command, endpoint, status, trace, response shape, screenshot, or exact error.

**Misuse:** Designing wrappers, CI, full architecture, or production code before proving the primitive.

**Often composes with:** `sandbox-spike`, `live-smoke`, `release-ladder`.

## `sandbox-spike`

**Solves:** Whether an approach can be shaped without contaminating production code.

**Use when:** The direction seems plausible but still needs a disposable proof.

**Run it as:** Put work under `/tmp`, `.tmp`, demo/dev service, a throwaway branch, or a local harness. Keep inputs, commands, and outputs easy to inspect.

**Evidence:** Minimal artifact, notes on what worked, what failed, and what should not be promoted.

**Misuse:** Letting spike code silently become production code, or mixing spike cleanup with release changes.

**Often composes with:** `smallest-real-probe`, `variant-matrix`, `preflight-eyeball`.

## `variant-matrix`

**Solves:** Which approach is more promising when multiple approaches can work.

**Use when:** The user asks for A/B, variants, "which is better", "compare", or "try a few".

**Run it as:** Hold inputs stable, vary one meaningful dimension per cell when possible, and record quality, cost, speed, complexity, and fit.

**Evidence:** Matrix, side-by-side outputs, timings, cost estimates, decision recommendation.

**Misuse:** Creating a large benchmark when a two-sample comparison would decide, or comparing variants on shifting inputs.

**Often composes with:** `sweep`, `ab-compare`, `representative-samples`, `preflight-eyeball`.

## `ab-compare`

**Solves:** Which of two concrete options better fits the current goal.

**Use when:** There are exactly two plausible options or the user names "A/B".

**Run it as:** Compare on shared dimensions that matter now. Include a recommendation and what would change the call.

**Evidence:** Short tradeoff table, side-by-side outputs, or a decision note.

**Misuse:** Treating A/B as statistically meaningful when it is only qualitative or n=1.

**Often composes with:** `variant-matrix`, `human-preview-gate`, `review-pass`.

## `sweep`

**Solves:** What parameter range, coverage, or search space looks reasonable.

**Use when:** The user asks to sweep, scan broadly, test windows/ranges, or generate many candidate cases.

**Run it as:** Pick a bounded range, run consistent measurements, summarize shape not every datapoint.

**Evidence:** Range table, curve, bucket summary, anomalies, recommended default.

**Misuse:** Sweeping before the target metric is defined, or presenting all raw output instead of the pattern.

**Often composes with:** `variant-matrix`, `representative-samples`, `regression-lock`.

## `representative-samples`

**Solves:** Whether a result generalizes beyond a cherry-picked case.

**Use when:** The user needs to eyeball quality, inspect model output, review generated content, or understand system behavior through examples.

**Run it as:** Select diverse, representative, and edge-ish cases. Explain why each sample was chosen.

**Evidence:** Sample set, inline excerpts, preview page, or sample index.

**Misuse:** Dumping too many examples without curation, or choosing only best cases.

**Often composes with:** `preflight-eyeball`, `human-preview-gate`, `agent-as-caller`.

## `preflight-eyeball`

**Solves:** Whether a readable or inspectable output has obvious issues before user-facing verification.

**Use when:** The user says "eyeball 一下", "看看效果如何" for text/readable output, generated docs, prompt output, context summaries, reports, or other artifacts the agent can inspect.

**Run it as:**

1. Produce the candidate artifact.
2. Read or inspect it yourself.
3. Compare it against intent, expected format, constraints, and obvious quality bars.
4. Fix clear issues immediately.
5. If uncertainty remains, prepare a preview and call out what needs human judgment.

**Evidence:** Brief self-check summary, fixed issues, remaining uncertainties, inline excerpt or preview.

**Misuse:** Asking the user to inspect raw output before agent self-check, or claiming subjective certainty that belongs to the user.

**Often composes with:** `representative-samples`, `human-preview-gate`, `wrap-up-devlog`.

## `human-preview-gate`

**Solves:** Whether the result passes human taste, visual judgment, product feel, or lived-context fidelity.

**Use when:** The user asks for preview, UI/UX inspection, visual effect, 体感, "我看看", or when final judgment depends on the user's taste or real-life context.

**Run it as:** Prepare the smallest reviewable surface: inline excerpt for small content, HTML/doc/dashboard for long content, side-by-side view for variants, screenshot/browser preview for UI.

**Evidence:** Preview artifact, representative samples, agent pre-read notes, and explicit "needs human call" items.

**Misuse:** Treating agent preference as the user's taste, or overbuilding an HTML preview when inline display is enough.

**Often composes with:** `preflight-eyeball`, `representative-samples`, `ab-compare`.

## `live-smoke`

**Solves:** Whether a real or near-real path still works after a change.

**Use when:** The user says smoke, e2e smoke, "跑通", "上线后看一下", or when deployment/tool/client compatibility is the risk.

**Run it as:** Exercise the happy path through the real boundary: endpoint, auth, tool list, callback, UI flow, or agent call.

**Evidence:** Status, response, trace, screenshot, tool-call log, deploy proof.

**Misuse:** Treating a smoke pass as full correctness or regression coverage.

**Often composes with:** `release-ladder`, `agent-as-caller`, `regression-lock`.

## `agent-as-caller`

**Solves:** Whether an agent-facing interface teaches an agent what to do.

**Use when:** Testing MCP tool descriptions, plugin skills, prompt/interface wording, search interfaces, feedback flows, or get-context behavior.

**Run it as:** Have an agent or harness act like the downstream caller. Observe tool choice, query shape, trace, fallback behavior, and confusion.

**Evidence:** Trace, prompt, tool call sequence, caller output, observed friction.

**Misuse:** Testing only backend functions and declaring the agent-facing interface good.

**Often composes with:** `trace-based-learning`, `live-smoke`, `representative-samples`.

## `trace-based-learning`

**Solves:** Why an agent behaved unexpectedly and what interface guidance should change.

**Use when:** The user asks why an agent did or did not call a tool, used the wrong query, skipped memory, or misread an interface.

**Run it as:** Inspect traces or transcripts, separate model reasoning failure from interface affordance failure, then propose the smallest interface/documentation change.

**Evidence:** Trace excerpt, failure classification, suggested wording/schema/response change.

**Misuse:** Fixing model behavior by guessing without reading the actual trace.

**Often composes with:** `agent-as-caller`, `preflight-eyeball`, `wrap-up-devlog`.

## `regression-lock`

**Solves:** Whether a known failure mode can return unnoticed.

**Use when:** The task fixes a bug, restores behavior, removes silent fallback, changes routing, or touches a public contract.

**Run it as:** Add or run the narrowest test/check that fails on the old problem and passes now. Include edge cases discovered during implementation.

**Evidence:** Test name, before/after behavior, command result, failing mode covered.

**Misuse:** Adding broad tests that do not assert the real regression, or skipping tests because a smoke passed.

**Often composes with:** `review-pass`, `live-smoke`, `/go`.

## `e2e-check`

**Solves:** Whether a user-observable contract works through its intended flow.

**Use when:** The change spans layers or user-facing behavior matters more than internal implementation.

**Run it as:** Drive one or a few real acceptance scenarios. Prefer the least intrusive tool that still verifies the flow.

**Evidence:** Scenario, command/tool used, pass/fail, screenshots or logs when helpful.

**Misuse:** Running exhaustive suites when one user flow answers the question, or skipping the live surface for visual changes.

**Often composes with:** `regression-lock`, `live-smoke`, `/go`.

## `review-pass`

**Solves:** Whether changes are ready for another person or agent to review.

**Use when:** The user says review, "检查一下", "是否可以 merge", or asks for readiness.

**Run it as:** Inspect diff, scope, tests, docs, configs, dirty state, and mismatch between stated intent and actual changes. Lead with blockers.

**Evidence:** Findings, commands/results, changed scope summary, residual risk.

**Misuse:** Starting with a celebratory summary before looking for issues.

**Often composes with:** `audit-pass`, `regression-lock`, `wrap-up-devlog`.

## `audit-pass`

**Solves:** Whether a decision, design, or change should be trusted under higher scrutiny.

**Use when:** The user says audit, asks for independent judgment, or explicitly does not trust a previous agent/session.

**Run it as:** Reconstruct evidence from source material, verify claims directly, separate facts from assumptions, and name confidence.

**Evidence:** Evidence trail, disputed claims, confirmed facts, open questions.

**Misuse:** Treating prior summaries as facts or reducing audit to normal review.

**Often composes with:** `trace-based-learning`, `review-pass`, `/refactor`, `/grilling`.

## `scope-split`

**Solves:** Whether work should be split by reviewable unit, repo, deployment path, or risk.

**Use when:** Work crosses repos, mixes cleanup with feature work, or has different merge/deploy ownership.

**Run it as:** Identify separable changes, order dependencies, and propose commit/branch/MR split.

**Evidence:** Split plan, branch/commit boundaries, deploy ordering, risk notes.

**Misuse:** Bundling unrelated cleanup with production fixes or splitting so much that causality is lost.

**Often composes with:** `/gdd`, `/commit-push-pr`, `review-pass`.

## `release-ladder`

**Solves:** Which release evidence is actually available.

**Use when:** The user asks whether something is deployed, usable, or ready for external testing.

**Run it as:** Walk the ladder: committed -> pushed -> CI green -> merged -> deploy job -> live route -> authenticated call -> user/client smoke.

**Evidence:** Highest verified rung and what remains unverified.

**Misuse:** Treating CI green or merge as live production success.

**Often composes with:** `live-smoke`, `review-pass`, `wrap-up-devlog`.

## `wrap-up-devlog`

**Solves:** Whether future agents can continue without rediscovering decisions.

**Use when:** The user says wrap up, recap, note down, devlog, archive, cleanup, or asks what remains.

**Run it as:** Capture decisions, evidence, discarded options, known limits, next steps, and cleanup status. Do not store raw personal data unless explicitly intended.

**Evidence:** Updated note/devlog/topic, cleanup list, final status, handoff.

**Misuse:** Only saying tests passed, or writing a changelog without why decisions were made.

**Often composes with:** `review-pass`, `release-ladder`, `/gdd`.
