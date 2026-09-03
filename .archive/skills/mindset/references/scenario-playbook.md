# Scenario Playbook

These scenarios are illustrative compositions, not recipes. If none fit, fall back to the `SKILL.md` uncertainty table and compose moves directly.

When a scenario repeats in real dogfood but is not covered here, add a new scenario instead of stretching an old one.

## New API / MCP / CLI feasibility

**User signal:** "能不能用 X 测试我们的 MCP？probe 一下。"

**Uncertainty:** Does the boundary work at all?

**Moves:** `smallest-real-probe` -> optionally `live-smoke`.

**Good response shape:** Try one real connection or call. Report exact endpoint/command, status, response shape, and blocker if any. Stop before designing the full integration unless asked.

**Bad response shape:** Spend the turn designing architecture before proving the client can connect.

## Agent-facing interface behavior

**User signal:** "看 trace，分析 tool description 是否需要更精确的引导。"

**Uncertainty:** Does the interface teach an agent what to do?

**Moves:** `agent-as-caller` -> `trace-based-learning` -> `preflight-eyeball`.

**Good response shape:** Inspect real traces, classify where the agent got confused, propose the smallest description/schema/response change, then pre-read the updated wording for obvious ambiguity.

**Bad response shape:** Only test the backend handler and declare the MCP interface good.

## UI / product preview

**User signal:** "给我 preview 一下，我看看效果。"

**Uncertainty:** Does this feel right visually or interactively?

**Moves:** `human-preview-gate` with `representative-samples`; sometimes `ab-compare`.

**Good response shape:** Build a page, screenshot, toggle, or side-by-side view that matches the real use context. Agent can pre-check obvious layout bugs, but final taste belongs to the user.

**Bad response shape:** Describe the UI in prose or ask the user to inspect raw code.

## Text / prompt / generated document quality

**User signal:** "做出来 eyeball 一下。"

**Uncertainty:** Is the readable output obviously wrong before user-facing verification?

**Moves:** `preflight-eyeball` -> if needed `human-preview-gate`.

**Good response shape:** Produce the candidate, read it, fix clear issues, and present a concise preview or representative excerpt. If the content is large, make an HTML/doc preview; if small, show inline.

**Bad response shape:** Hand the raw artifact to the user without inspecting it first.

## Search / retrieval evaluation

**User signal:** "我们要看 agent search 完 pick 的 relevant 文档 recall。"

**Uncertainty:** Is the whole search interface useful to an agent caller, not just one retrieval function?

**Moves:** `variant-matrix` / `sweep` -> `agent-as-caller` -> `representative-samples`.

**Good response shape:** Separate retrieval recall, answer quality, and agent tool-use behavior. Use agent-caller traces or simulated callers when evaluating interface behavior.

**Bad response shape:** Report one top-k query result and call the whole search interface solved.

## Cross-repo production change

**User signal:** "不要混 scope，单独 commit；两个 repo 要同步上线。"

**Uncertainty:** What is the reviewable unit and what deployment ordering is safe?

**Moves:** `scope-split` -> `regression-lock` -> `review-pass` -> `release-ladder`.

**Good response shape:** Split by repo/contract/deploy risk, validate each piece, identify ordering constraints, and say what happens if one side lands first.

**Bad response shape:** Bundle unrelated cleanup, plugin copy, backend behavior, and docs in one change.

## Release / deploy verification

**User signal:** "我是不是可以去 ChatGPT 测试了？看部署是否上线。"

**Uncertainty:** Which release rung is actually verified?

**Moves:** `release-ladder` -> `live-smoke`.

**Good response shape:** Distinguish pushed, merged, CI green, deploy job, live route, authenticated tool call, and client-specific smoke. State the highest verified rung and remaining gap.

**Bad response shape:** Say "deployed" because CI passed.

## Regression or silent fallback risk

**User signal:** "检查有没有 silent fallback；希望 fail-fast 暴露问题。"

**Uncertainty:** Could the old failure mode silently return?

**Moves:** `audit-pass` -> `regression-lock` -> `review-pass`.

**Good response shape:** Trace the failure semantics, distinguish degraded/empty/error/success, and add a narrow regression check when implementation changes.

**Bad response shape:** Add generic tests that do not assert the silent-fallback behavior.

## Topic wrap-up

**User signal:** "wrap up，检查有没有遗漏，归档 topic。"

**Uncertainty:** Can a future agent continue without rediscovering decisions?

**Moves:** `review-pass` -> `wrap-up-devlog`.

**Good response shape:** Record decisions, evidence, discarded options, current state, cleanup, and remaining uncertainty. Keep raw personal data out of repo artifacts unless explicitly intended.

**Bad response shape:** Only list files changed or tests passed.

## Fallback

If the task does not match a scenario:

1. Use the `SKILL.md` uncertainty table.
2. Pick one or two canonical moves already routed by the core skill.
3. Say briefly that you are composing moves directly rather than following a scenario.
4. If this fallback recurs, add a scenario later.
