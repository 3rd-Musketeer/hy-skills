---
name: go
description: Implement a feature end-to-end with light TDD — contract → tests-first → implement → patch tests → frontend verify (if applicable) → simplify → stage the pickup → ship. Returns a tested feature staged for the human to pick up as user #2.
when_to_use: When the human dispatches a feature implementation task and wants it brought to a usable, verified state in one shot. Triggers include explicit "/go", or framing like "implement this and ship it", "build X and let me try it". NOT for read-only investigation, refactor-only changes, or one-off scripts where the human just wants a quick result.
---

# /go

Implement a feature so the human can come back and **play with it as a real end user** — not so they can read your code or audit your tests.

`/go` operates under a specific role contract: **agent = full-context worker, human = end-user consumer**. See `../references/goal-driven-dev.md` § Roles. The two principles that judge every mechanic below — **transparence** (calibrated visibility, not exhaustive disclosure) and **UX** (stage the verification environment, don't punt setup) — come from there. If a step you're considering doesn't serve at least one, it's overhead.

The methodology is **light TDD**: write a few e2e tests for the user-observable contract first, implement until they pass, patch tests with what you discovered along the way, verify the user-facing experience. **Not exhaustive unit testing.** Coverage is not the goal — confidence to ship is.

## How to use this skill

This is **one skill, several sections**. Skip sections that don't apply:
- Pure backend feature → §1, §2, §4, §5, §6
- Frontend feature (web / native UI) → all sections
- Backend + frontend → all sections

Sections are principle-led, not bureaucratic checklists. Use judgment.

For stack-specific conventions consult `references/` in this skill **on demand** — they're teaching material the agent reasons with, not rules to mechanically apply. Don't preload all four; load what matches the language(s) in scope.

---

## §1 · Internalize the plan (you usually arrive with one)

The expected upstream pattern is: **the human and the dispatching agent discuss the plan via `gdd` before /go is invoked**. So when you start, you usually already know:

- The user-observable behavior being added
- The contract that captures it (HTTP route shape, function signature, UI flow)
- The 2-3 use cases that prove it works
- **The goal's Pickup section** — who picks this up (end-user role), the single pickup action, what staging the agent owns vs the human owns. This drives §5.5 and shapes the §6 handoff. If Pickup is missing or empty, that is itself a planning gap to flag.

Your §1 job is to **state the plan back in 3-5 lines** before any work, surface the contract crisply, and flag anything still ambiguous. This isn't ceremony — it's the last cheap moment to catch a misalignment.

**If material things are still unspecified**, the path depends on your context:

- **Interactive context** (you can talk to the human): ask before coding. Implementing the wrong thing fast is the worst outcome.
- **Non-interactive context** (you're a subagent and the dispatcher can't reach the human mid-flow): make the most defensible judgment, **enumerate every assumption** in the §6 handoff so upstream can sanity-check.

**Hard escalation rule**: the trigger is **nature, not count**. If you're non-interactive AND **any one assumption is structural / protocol-shape level** — API shape, scope boundary, storage tier, core data model, auth model — **stop and report back** instead of guessing. Implementation-detail assumptions (which wiring style, which stub strategy, how to handle a defensive null) don't count; you can make those and document them in §6.

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

Type-check + tests passing on a UI change does NOT mean the user-facing experience works. Verify at the right tier.

### 3.0 Minimum-disturbance — least intrusive tier that still verifies

Do the verification the change needs — §3.1–§3.3 decide *what* to check, and §3.3's exhaust-before-defer still binds. §3.0 only orders *how*: tiers differ in **how much they intrude on the user's machine** — a headless / in-process run is invisible, while a visible browser window, `computer-use`, or driving the user's real logged-in browser **takes over their screen and steals focus** mid-work. Among the tiers that genuinely verify the change, prefer the one the user can't see. This is a tie-breaker, never a license to skip a needed check or to downgrade one that truly needs a visible, real surface.

- **Default to invisible.** Logic, wiring, DOM assertions — and most *visual* checks — need no window the user can see. Modern headless (`--headless=new`) loads extensions, renders real pages, and takes screenshots. If a headless run can produce the evidence, use it; never pop a visible window for a check that could run unseen.
- **"Visual" ≠ "must be visible".** A screenshot is visual evidence and needs no on-screen window. The dividing line is *isolated-and-invisible* vs *takes over the user's actual screen or session*.
- **Announce before you take the screen.** When verification genuinely needs a visible browser, `computer-use`, or the user's real browser session (native apps, real logged-in state, a human eyeballing *live*) — say so first: what you're opening, why headless can't reach it, and roughly how long it will hold focus. Then open it.

### 3.1 Three tiers — don't skip the middle

| Tier | What | Cost | Catches |
|---|---|---|---|
| **Unit** | Pure helpers (formatters, reducers, selectors) | Cheap | Logic bugs in isolated helpers |
| **Component** | Mount in jsdom with realistic props; assert DOM matches contract | Cheap | Wiring bugs — gate conditions, missing fields, streaming flags |
| **Live** | Drive the real running app | Expensive | Integration, timing, visual — only a real user would catch |

Default budget: **1–2 live flows matching a real use case**, plus component tier for anything non-trivial that live doesn't exercise. Skipping the middle tier is the most common way wiring bugs leak straight to the user.

Note on reducers: state-library update callbacks (Zustand `set((s) => ...)`, Redux reducers, MobX actions) **are pure functions hiding inside framework syntax**. The moment the update does anything non-trivial (find-by-id, conditional merge, tail mutation), extract to a named function at module top level and unit-test it. Your store binding stays a one-liner; the logic gets Tier 1 coverage for free.

### 3.2 Visual check (only when the change has visual outcome)

Wiring passes ≠ it looks right. So:

1. **Does this change have a visual outcome?** (new UI, layout, styling, design tweak)
   - No (pure logic, analytics wiring, hidden state) → skip this section.
   - Yes → continue.
2. **Capture the relevant state(s) using whatever tool you have** — Playwright screenshot, browser-driver MCP, Preview MCP, computer-use. The UX principle requires you to attempt before deferring (see `../references/goal-driven-dev.md` § Roles). Compare against design / the human's description / prior baseline. Mismatch = not done. Prefer a headless screenshot (invisible — §3.0); reserve a visible window for surfaces headless can't reach.
3. If no available tool reaches the surface → see §3.3.

The bar: any change with visual intent gets an actual eyeball-or-screenshot pass, not just DOM assertions. Reading code and declaring it "should look right" does not count.

### 3.3 If you can't drive the real UI — exhaust tools first, then name what's left

Some surfaces can't be driven by any tool you have (native macOS WKWebView, iOS simulator, platform-specific webview shells, sometimes browser extension popups depending on the harness). Before declaring this:

1. **Try the tools you have.** Browser drivers, computer-use, project-specific automation skills — each may reach surfaces the others miss. The contract's UX principle is **exhaustion before deferral**.
2. **If genuinely no tool reaches it**, then:
   - Say so explicitly in the handoff's **Tried but deferred** slot (§6) — list what was tried and what blocked each attempt. Generic "can't drive the UI" is not enough; "tried browser-driver X, couldn't reach surface Y because Z" is.
   - Minimum bar becomes Tier 1 + Tier 2 — component-level DOM verification in jsdom replaces the live check you couldn't do.
   - The remaining human-only step is named explicitly with the specific surface and blocker.

The carve-out is for surfaces beyond your tool reach, not for the convenience of skipping the drive. Honesty without exhaustion is still a cop-out.

### 3.4 Streaming UI

When the change touches how streamed LLM output renders, load `references/streaming-ui.md` and think through the failure modes before declaring done.

### Tools (when you can drive the UI)

Specific tool names depend on the project's harness; the categories below are what to look for. If the harness exposes a dedicated tool-specific skill (e.g. a "use the browser driver" skill referenced from project docs), prefer that — it encodes the project's specific invocation conventions.

| Category | When |
|---|---|
| **Headless browser test runner** (Playwright, vitest-browser, etc.) | Standard web flows; CI-friendly; persistent assertions |
| **Real-browser driver** (browser-driver MCPs, ad-hoc agent-browser tools) | Ad-hoc, real Chrome / Firefox, login-required surfaces; one-off "did this render" checks |
| **Desktop / OS-level automation** (computer-use and equivalents) | Native macOS/desktop targets; only what browser tools can't reach — heavy, reserve for the irreplaceable sanity check |

**Disturbance:** headless runner = invisible (default, incl. screenshots); real-browser drivers and desktop/OS automation take over the user's screen — announce first (§3.0).

---

## §4 · Simplify

Before declaring done, run a **Simplify pass** on your changes. This is a gate, not a suggestion — it runs between implementation (§2/§3) and final test run (§5) on every /go.

Use the native Simplify capability when the current harness provides one:

- Claude Code: invoke `/simplify`, passing any relevant focus from the task.
- Other harnesses with a native Simplify skill/tool: use that native capability.

When native Simplify is unavailable, load the sibling plugin skill named `my-simplify` and follow it as the fallback. If file access is needed, resolve it relative to this `go` skill directory as `../my-simplify/SKILL.md` or `${CLAUDE_SKILL_DIR}/../my-simplify/SKILL.md` when that substitution is available. In Codex plugin installs, this is the Marketplace-provided `my-simplify` skill shipped with this plugin.

The Simplify pass reviews the diff for:
- Reuse opportunities (existing util that does this)
- Hacky patterns (redundant state, parameter sprawl, copy-paste with variation)
- Efficiency issues (unnecessary work, sequential where concurrent fits)

Act on what's tractable inside the current scope. Flag what needs design judgment for the human (it goes in §6 out-of-scope findings, not simplify outcome).

**Re-run §5 tests** after any simplify-driven edits — don't assume green carries.

**If both native Simplify and `my-simplify` are genuinely unavailable** in this environment: do the same scan inline, and say so explicitly in the §6 Simplify outcome.

**Report the outcome in §6** — see "Simplify pass outcome" in the handoff shape. Silent passes don't count. "Ran Simplify, nothing worth collapsing" is a valid outcome — the point is making the pass verifiable, not manufacturing findings.

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

Before the handoff, walk the goal's Pickup section and **bring the system to the state the human will arrive at**. Then walk the verification flow yourself as the first user, to the extent your tools allow. This section operationalizes the UX principle (see `../references/goal-driven-dev.md` § Roles).

### 5.5.1 Stage what the goal asks for

For each item the goal's Pickup → Staging required lists:

1. **Agent-scriptable items**: do them. Builds, migrations against accessible environments, dev-server bring-up, fixture loading, CLI invocations with available credentials, version bumps if the project conventionally has the agent do them. Confirm each landed — the server actually responds, the migration is actually listed, the artifact actually exists. The confirmation becomes a §6 **Staged for you** entry.
2. **Human-only items**: leave them. Note the reason carried over from the goal, and surface them as §6 **Tried but deferred** entries (or as part of the staged list with explicit human-only marking).
3. **Items the goal didn't anticipate**: if you discover during implementation that something else needs staging (e.g. the migration introduced a new env var the dev server reads), add it. The goal's Pickup is the floor of what to stage, not the ceiling.

### 5.5.2 Drive the verification flow as the first user

After staging, walk through the goal's Acceptance Scenarios yourself using whatever tools you have:

- Open the dev server / app surface (browser driver, computer-use, etc.)
- Walk the happy path the scenario describes
- Capture screenshots or traces of the result
- Compare against the expected behavior

The human's pickup is **user #2** — they walk a path the agent already walked. The screenshots / traces become trust-calibrating evidence in §6 (transparence principle — see `../references/goal-driven-dev.md` § Roles).

### 5.5.3 Two anti-patterns to refuse

- **"I'll let the human run X"** when X is a build / server / migration command the agent could run. That is staging the agent owes the goal.
- **"I'll let the human check the UI"** without first attempting available browser / screenshot tools. Beyond reach is a fact about tools, not a default.

When deferring is genuinely correct, the deferral comes with **what was tried**. "Tried tool X, couldn't reach surface Y because Z" is a real deferral; "letting you check" is not.

---

## §6 · Commit & hand back

- **Commit** with a message describing the user-observable change (what works now, not internal mechanics)
- **Don't push, force-push, or open a PR unless the human explicitly asked** — those are visible-to-others actions and need consent each time
- **Hand back** with this shape. The first three slots are the **pickup runway** — they decide whether the human can act in one step. The remainder is **audit material** — it lets the human calibrate trust. Don't blur them.

Default medium is a structured chat handback per the slot structure below. When a richer doc artifact is wanted (HTML, PDF, deck, etc.), render the same slots via whatever doc-render skill matches the medium — the slot structure is the contract, medium is the rendering layer.

Body expression discipline (体裁 / 信息密度 / 语言纪律 / visual judgment) lives in `references/handoff-doctrine.md` — medium-agnostic.

### Pickup runway (top of the handoff)

- **Pickup action** — the single thing the human does to start verifying. Quote the goal's Pickup → Pickup action verbatim if it still applies; if implementation revealed it should differ, state the new action and why.
- **Staged for you** — what the agent already did so the human doesn't have to. One bullet per staged action with concrete status: "dev server up at <url>", "migration applied to <env>", "extension built at <path>", "screenshots of the happy path under <path>". An empty list is fine — it means the human's pickup action stands alone with no setup, which is a clean handoff.
- **Tried but deferred** — only when something landed in human-only. Each entry names what was tried and why it didn't reach. "Tried browser-driver X, can't reach surface Y because Z" is a real entry. "I'll let you check the UI" is not — that goes back to §5.5 for another attempt.

### Audit material

- **One-line summary** of behavior that works now (the user-observable change, not internal mechanics)
- **The 2-3 e2e tests covering it** (file paths)
- **Simplify pass outcome** (per §4): which Simplify path ran, what it found, what you acted on, what you rejected and why. "Ran, nothing worth collapsing" is a valid entry. If you had to do it inline because native Simplify and `my-simplify` were unavailable, say so here.
- **Out-of-scope findings** (per §2.3): any real design problem you noticed during implementation but did not fix. One bullet per finding. The human decides whether to address now, log to `.gdd/backlog.md` (or the repo's backlog convention), or skip.
- **Assumptions you made** (per §1, if non-interactive): every material assumption so the human can sanity-check.
- **Ref candidates**: any decision made during implementation whose scope is broader than the current goal (likely to be cited by future goals). Goal-local decisions stay inline in the goal's Decisions section by default; only flag what is cross-goal. See `../references/goal-driven-dev.md` for the promotion rule.

The pickup runway makes the contract's UX principle operational. The audit material makes the transparence principle operational. Both judging standards live in `../references/goal-driven-dev.md` § Roles. A handoff that has audit material but no working pickup runway has failed the contract regardless of how thorough the audit is.

---

## References (load on demand)

- `references/testing-doctrine.md` — testing philosophy, the 10 principles, app factory pattern, light-TDD density rationale
- `references/python.md` — pytest stack, conventions, things to notice while writing Python tests
- `references/node.md` — Vitest / node:test / Jest detection + per-shape conventions
- `references/swift.md` — Swift Testing + protocol-DI + macOS app supplement
- `references/streaming-ui.md` — failure modes to think through when changing streamed LLM rendering

Read what matches the language(s) you're working in.
