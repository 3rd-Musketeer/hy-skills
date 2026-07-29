---
name: go
description: Implement a feature end-to-end with light TDD — contract → tests-first → implement → patch tests → frontend verify (if applicable) → simplify → stage the pickup → ship. Use when the human dispatches a feature implementation task and wants it brought to a usable, verified state in one shot — explicit "/go", or framing like "implement this and ship it", "build X and let me try it". NOT for read-only investigation, refactor-only changes, or one-off scripts where the human just wants a quick result.
---

# /go

Implement a feature so the human can come back and **play with it as a real end user** — not so they can read your code or audit your tests.

`/go` operates under a specific role contract: **agent = full-context worker, human = end-user consumer** (`../references/goal-driven-dev.md` § Roles). Two principles from that contract judge every mechanic below:

- **Transparence** — calibrated visibility, not exhaustive disclosure.
- **UX** — stage the verification environment, don't punt setup. Exhaust your own tools before deferring anything to the human; a deferral is only real when it names what was tried and what blocked it.

If a step you're considering doesn't serve at least one, it's overhead.

The methodology is **light TDD**: write a few e2e tests for the user-observable contract first, implement until they pass, patch tests with what you discovered along the way, verify the user-facing experience. Coverage is not the goal — confidence to ship is.

## Sections

Skip what doesn't apply:

- Pure backend feature → §1, §2, §4, §5, §6
- Frontend involved (web / native UI) → all sections

Stack-specific conventions live in `references/` — teaching material to reason with, not rules to mechanically apply. Load what matches the language(s) in scope, on demand; don't preload all four.

---

## §1 · Internalize the plan (you usually arrive with one)

The expected upstream pattern is: **the human and the dispatching agent discuss the plan via `gdd` before /go is invoked**. So when you start, you usually already know:

- The user-observable behavior being added
- The contract that captures it (HTTP route shape, function signature, UI flow)
- The 2-3 use cases that prove it works
- **The goal's Pickup section** — who picks this up (end-user role), the single pickup action, what staging the agent owns vs the human owns. This drives §5.5 and shapes the §6 handoff. If Pickup is missing or empty, that is itself a planning gap to flag.

Your §1 job is to **state the plan back in 3-5 lines** before any work, surface the contract crisply, and flag anything still ambiguous — the last cheap moment to catch a misalignment.

**If material things are still unspecified**, the path depends on your context:

- **Interactive context** (you can talk to the human): ask before coding. Implementing the wrong thing fast is the worst outcome.
- **Non-interactive context** (you're a subagent and the dispatcher can't reach the human mid-flow): make the most defensible judgment, **enumerate every assumption** in the §6 handoff so upstream can sanity-check.

**Hard escalation rule**: the trigger is **nature, not count**. If you're non-interactive AND **any one assumption is structural / protocol-shape level** — API shape, scope boundary, storage tier, core data model, auth model — **stop and report back** instead of guessing. Implementation-detail assumptions (which wiring style, which stub strategy, how to handle a defensive null) don't count; make those and document them in §6.

The principle: you can't predict what the human/upstream wanted on shape questions, but you can pick defensibly on implementation details. If even one shape question is open, planning was insufficient — better to redo planning than ship a feature built on shape guesses.

---

## §2 · Light TDD (backend / pure-logic work)

### 2.1 Establish the contract

Articulate (in your head, scratch, or a brief message to the human) what the contract looks like:
- Input shape
- Output shape
- The 2-3 use cases that prove it works

The contract is what the e2e tests will assert against. If you can't write the contract down, you don't understand the task yet — go back to §1.

### 2.2 Write 2-3 e2e tests FIRST

Based on the contract. They will fail. **This is the high-leverage step** — getting these tests right captures the spec better than English does.

- Backend HTTP / service: in-process via app factory (FastAPI `TestClient`, supertest, Vapor `app.test()`). See `references/testing-doctrine.md` § App factory.
- Pure-data module: function-level e2e against the public surface.
- **Don't write 10 tests.** Write the few that, if green, mean a user can use this.

If writing the test reveals the contract is unclear, stop and clarify with the human — don't paper over with vague assertions.

### 2.3 Implement

Make the tests pass. **While implementing, listen to friction** — these are the doctrine signals showing up at writing time:

- A test needs 20 lines of setup → SUT is too coupled. Refactor before continuing.
- About to mock a third-party SDK directly → introduce your own protocol/interface, fake that.
- About to read `process.env` / `os.environ` / a global singleton inside the SUT → inject it.
- A 5-arg function feels right when 3 would be → group into a config object.

These are **not audit findings to file later** — they're signals that the design is wrong **right now**. Pause, fix, continue. Friction in writing the test is friction the user will feel later as bugs.

**If the friction points at something larger than your scope** (e.g. the upstream module has no app factory, or a whole subsystem needs DI rework): don't silently absorb the design tax, but also don't expand scope to fix it. **Note it as an out-of-scope finding** and surface it in the §6 handoff so the human can decide whether to address now, log to backlog, or skip.

### 2.4 Patch tests with discoveries

Implementation surfaces edge cases and branches you didn't predict. **Cover the ones that matter for production**, not all of them:

- ✅ Worth a test: error path a real user could trigger; a regression you nearly introduced; a discovered invariant.
- ❌ Skip: combinatorial branches, internal helpers, defensive code that can't actually fire, "for completeness" tests.

If you discover an important pure function with non-trivial logic, **add a focused unit test for it**. Don't go fill out a test pyramid — only the units that genuinely earn it.

---

## §3 · Frontend verify (if user-facing UI changed)

Type-check + tests passing on a UI change does NOT mean the user-facing experience works. Verify at the right tier, with the least intrusive tool that still verifies.

**Minimum disturbance.** Prefer verification the user can't see: modern headless (`--headless=new`) loads extensions, renders real pages, and takes screenshots — a screenshot is visual evidence and needs no on-screen window. When verification genuinely needs to take over the user's screen (native apps, real logged-in sessions, a human eyeballing live), **announce first** — what you're opening, why headless can't reach it, roughly how long it will hold focus — then open it. This orders *how* to verify, never *whether*: it's not a license to skip or downgrade a check the change needs.

### 3.1 Three tiers — don't skip the middle

| Tier | What | Cost | Catches |
|---|---|---|---|
| **Unit** | Pure helpers (formatters, reducers, selectors) | Cheap | Logic bugs in isolated helpers |
| **Component** | Mount in jsdom with realistic props; assert DOM matches contract | Cheap | Wiring bugs — gate conditions, missing fields, streaming flags |
| **Live** | Drive the real running app | Expensive | Integration, timing, visual — only a real user would catch |

Default budget: **1–2 live flows matching a real use case**, plus component tier for anything non-trivial that live doesn't exercise. Skipping the middle tier is the most common way wiring bugs leak straight to the user.

Note on reducers: state-library update callbacks (Zustand `set((s) => ...)`, Redux reducers, MobX actions) **are pure functions hiding inside framework syntax**. The moment the update does anything non-trivial (find-by-id, conditional merge, tail mutation), extract to a named function at module top level and unit-test it. Your store binding stays a one-liner; the logic gets Tier 1 coverage for free.

### 3.2 Visual check (only when the change has visual outcome)

Pure logic, analytics wiring, hidden state → skip. Otherwise: capture the relevant state(s) with whatever tool reaches the surface — Playwright screenshot, browser-driver MCP, Preview MCP, computer-use — and compare against the design / the human's description / prior baseline. Mismatch = not done. Reading code and declaring it "should look right" does not count.

### 3.3 If no tool reaches the surface

Some surfaces can't be driven by any tool you have (native macOS WKWebView, iOS simulator, platform-specific webview shells, sometimes extension popups). Before declaring that, **actually try the tools** — browser drivers, computer-use, project-specific automation skills each reach surfaces the others miss. If genuinely unreachable:

- Minimum bar becomes Tier 1 + Tier 2 — component-level DOM verification in jsdom replaces the live check you couldn't do.
- The handoff's **Tried but deferred** slot (§6) names the specific surface, what was tried, and what blocked each attempt.

### 3.4 Streaming UI

When the change touches how streamed LLM output renders, load `references/streaming-ui.md` and think through the failure modes before declaring done.

### Tools (when you can drive the UI)

Specific tool names depend on the project's harness; the categories below are what to look for. If the harness exposes a dedicated tool-specific skill (e.g. a "use the browser driver" skill referenced from project docs), prefer that — it encodes the project's invocation conventions.

| Category | When | Disturbance |
|---|---|---|
| **Headless browser test runner** (Playwright, vitest-browser, etc.) | Standard web flows; CI-friendly; persistent assertions | Invisible — default, incl. screenshots |
| **Real-browser driver** (browser-driver MCPs, ad-hoc agent-browser tools) | Real Chrome / Firefox, login-required surfaces; one-off "did this render" checks | Takes the screen — announce first |
| **Desktop / OS-level automation** (computer-use and equivalents) | Native targets; only what browser tools can't reach | Takes the screen — announce first; reserve for the irreplaceable check |

---

## §4 · Simplify

Before declaring done, run a **Simplify pass** on your changes. This is a gate, not a suggestion — it runs between implementation (§2/§3) and final test run (§5) on every /go.

Use the native Simplify capability when the current harness provides one:

- Claude Code: invoke `/simplify`, passing any relevant focus from the task.
- Other harnesses with a native Simplify skill/tool: use that native capability.

When native Simplify is unavailable, load the sibling plugin skill `my-simplify` (resolve as `../my-simplify/SKILL.md`, or `${CLAUDE_SKILL_DIR}/../my-simplify/SKILL.md` when that substitution is available). If both are genuinely unavailable, do the same scan inline and say so in the §6 Simplify outcome.

The pass reviews the diff for reuse opportunities, hacky patterns (redundant state, parameter sprawl, copy-paste with variation), and efficiency issues. Act on what's tractable inside the current scope; what needs design judgment goes to §6 out-of-scope findings.

**Re-run §5 tests** after any simplify-driven edits — don't assume green carries.

**Report the outcome in §6.** Silent passes don't count; "ran Simplify, nothing worth collapsing" is a valid, verifiable outcome.

---

## §5 · Final test run

Run the canonical test command from the repo. Read the project's task runner / build config (`Justfile`, `package.json`, `Package.swift`, `Makefile`, `Cargo.toml`, etc.) — **never invent a command**. For tier-chained scripts (`unit && e2e`), default to fastest tier unless full verification was requested.

Report duration in two parts:

```
Setup: <cold install / build time, separate>
Tests: <pass / fail counts, warm test time>
```

Cold-start cost is infrastructure, not a test signal. Don't conflate.

If failing: fix what's local and obvious; for design-judgment failures, **stop and report** instead of expanding scope.

---

## §5.5 · Stage the pickup

Before the handoff, walk the goal's Pickup section and **bring the system to the state the human will arrive at**. Then walk the verification flow yourself as the first user, to the extent your tools allow.

### 5.5.1 Stage what the goal asks for

For each item the goal's Pickup → Staging required lists:

1. **Agent-scriptable items**: do them. Builds, migrations against accessible environments, dev-server bring-up, fixture loading, CLI invocations with available credentials, version bumps if the project conventionally has the agent do them. Confirm each landed — the server actually responds, the migration is actually listed, the artifact actually exists. The confirmation becomes a §6 **Staged for you** entry.
2. **Human-only items**: leave them, note the reason carried over from the goal, surface as §6 **Tried but deferred** entries.
3. **Items the goal didn't anticipate**: if implementation revealed something else needs staging (e.g. the migration introduced a new env var the dev server reads), add it. The goal's Pickup is the floor, not the ceiling.

Refuse the two classic punts: "I'll let the human run X" when X is a build / server / migration command you could run — that's staging you owe; and "I'll let the human check the UI" without exhausting §3.3 first.

### 5.5.2 Drive the verification flow as the first user

After staging, walk the goal's Acceptance Scenarios yourself using whatever tools you have: open the app surface, walk the happy path, capture screenshots or traces, compare against expected behavior.

The human's pickup is **user #2** — they walk a path the agent already walked. The screenshots / traces become trust-calibrating evidence in §6.

---

## §6 · Commit & hand back

- **Commit** with a message describing the user-observable change (what works now, not internal mechanics)
- **Don't push, force-push, or open a PR unless the human explicitly asked** — those are visible-to-others actions and need consent each time
- **Hand back** with this shape. The first three slots are the **pickup runway** — they decide whether the human can act in one step. The remainder is **audit material** — it lets the human calibrate trust. Don't blur them.

Default medium is a structured chat handback per the slot structure below. When a richer doc artifact is wanted (HTML, PDF, deck, etc.), render the same slots via whatever doc-render skill matches the medium — the slots are the contract, medium is the rendering layer. Body expression discipline (体裁 / 信息密度 / 语言纪律 / visual judgment) lives in `references/handoff-doctrine.md`.

### Pickup runway (top of the handoff)

- **Pickup action** — the single thing the human does to start verifying. Quote the goal's Pickup → Pickup action verbatim if it still applies; if implementation revealed it should differ, state the new action and why.
- **Staged for you** — what the agent already did so the human doesn't have to. One bullet per staged action with concrete status: "dev server up at <url>", "migration applied to <env>", "screenshots of the happy path under <path>". An empty list is fine — it means the pickup action stands alone with no setup.
- **Tried but deferred** — only when something landed in human-only. Each entry names what was tried and why it didn't reach (§3.3 / §5.5.1).

### Audit material

- **One-line summary** of behavior that works now (the user-observable change, not internal mechanics)
- **The 2-3 e2e tests covering it** (file paths)
- **Simplify pass outcome** (per §4): which path ran, what it found, what you acted on, what you rejected and why.
- **Out-of-scope findings** (per §2.3): real design problems noticed but not fixed. One bullet each. The human decides: address now, log to `.gdd/backlog.md` (or the repo's backlog convention), or skip.
- **Assumptions you made** (per §1, if non-interactive): every material assumption so the human can sanity-check.
- **Ref candidates**: decisions made during implementation whose scope is broader than the current goal. Goal-local decisions stay inline in the goal's Decisions section; only flag what is cross-goal — see `../references/goal-driven-dev.md` for the promotion rule.

A handoff that has audit material but no working pickup runway has failed the contract, regardless of how thorough the audit is.

---

## References (load on demand)

- `references/testing-doctrine.md` — testing philosophy, the 10 principles, app factory pattern, light-TDD density rationale
- `references/python.md` — pytest stack, conventions, things to notice while writing Python tests
- `references/node.md` — Vitest / node:test / Jest detection + per-shape conventions
- `references/swift.md` — Swift Testing + protocol-DI + macOS app supplement
- `references/streaming-ui.md` — failure modes to think through when changing streamed LLM rendering
- `references/handoff-doctrine.md` — handoff body expression discipline, medium-agnostic

Read what matches the language(s) you're working in.
