# Testing Doctrine — Cross-Language

The principles below apply to Python, Node, and Swift backend code. Each language ref crystallizes how the principle plays out concretely in that stack.

This is the document the agent reads first. It defines *what we believe*; the per-language refs define *how we enact it*.

## Why testing methodology matters

Tests are the only engineering practice that **actively complains about bad design**, because a bad design hurts the test author first. So:

> **Testability is a proxy for design quality.** Hard-to-test code is almost always tightly-coupled, side-effect-heavy, or insufficiently abstracted code. Easy-to-test code is almost always well-factored.

Every principle below has a corresponding **writing-time signal** — a friction you'll feel while writing the test if the principle is being violated. The signals section at the bottom names those frictions so the agent can recognize them in the moment, not as a post-hoc audit.

## Test density: light TDD

Before anything else, an explicit stance on **how much to test**:

> **A few e2e tests that cover real user use cases are enough to ship.** Exhaustive unit tests are not the goal — most of them can be added later if at all.

Concretely:

- **Write 2-3 e2e tests per feature** against the user-observable contract. These are the must-haves.
- **Add a unit test** only when you discover an important pure function with non-trivial logic that genuinely benefits from isolated testing.
- **Don't chase coverage metrics.** A test that exists to move a number is a test with no value.
- **Don't test defensive code, internal helpers, or combinatorial branches.** They don't help the user.

This inverts the classic pyramid more aggressively than "standard TDD". The reason: the user's goal is to ship confidence, not accumulate tests. Tests earn their keep by protecting real user behavior — everything else is debt.

## The 10 principles

| # | Principle | One-line meaning |
|---|---|---|
| 1 | **Test behavior, not implementation** | Test what callers see — inputs, outputs, side-effect contracts. Refactoring internals must not require rewriting tests. |
| 2 | **Invert the pyramid aggressively** | Highest value is **a few in-process e2e tests covering real user use cases**. Unit tests only for genuinely complex pure functions you discover during implementation. Don't chase coverage. |
| 3 | **One test, one behavior** | Test name = the assertion. If you need "and" in the name, split it. |
| 4 | **Arrange length is a coupling signal** | Long arrange blocks are not a test problem — they're a design signal. Pause and ask whether the SUT really needs that many preconditions. **This is a smell to consider, not a hard threshold.** |
| 5 | **Don't mock what you don't own** | Test doubles only on **interfaces you defined**. Never patch third-party internals. HTTP-protocol-level interception (respx / MSW) is the one allowed exception. |
| 6 | **Determinism via injection** | Time, randomness, IDs, environment are dependencies. Inject them. Tests pass fixed values, production passes real impls. This is the root cure for flakiness. |
| 7 | **Flaky tests don't get retried — they get fixed or deleted** | A retry loop in CI is a tolerance for noise. The cost compounds. Fix the race, or admit the test had no value and remove it. |
| 8 | **The full unit suite runs in under 60 seconds** | Past that threshold, no one runs it locally and the feedback loop dies. Tier slower work into separate suites (`integration`, `nightly`). |
| 9 | **CI command == local command** | One command (`just check`, `npm test`, `swift test`) does the same thing in both places. CI must not add secret flags. |
| 10 | **Test data lives next to tests** | Fixtures in `tests/fixtures/`, not in repo-root `data/`. Test files within two directory levels of the code under test. |

## App factory pattern (universal)

The single highest-leverage architectural decision for testable backends. Names differ by language:

| Language | Idiom |
|---|---|
| Python (FastAPI) | `def create_app(deps) -> FastAPI` |
| Node (Express/Fastify) | `export function createApp(deps)` |
| Swift (Vapor) | `Application.make(.testing)` + `app.test()` |

**Rule**: the production entrypoint is a thin shell that builds real dependencies and calls `serve()`. The factory itself is pure, takes its dependencies as arguments, and is what tests instantiate. This makes:

- Tests run **in-process** (no port, no race, milliseconds)
- Dependencies **explicit** (satisfies #6 automatically)
- Fakes **easy** (you fake your own `deps` shape, not third-party internals — satisfies #5)

If you can't do this in your stack, that's the first thing to fix before writing more tests.

## CI shape (three tiers, not more)

| Tier | Trigger | Budget | Runs |
|---|---|---|---|
| **pre-commit** | local git hook | < 5s | typecheck + lint + tests for changed files |
| **on-push** | every push to branch | < 3min | full unit suite + minimal integration (in-process fakes) |
| **nightly / pre-merge** | schedule or label | < 20min | real DB, real external services, e2e |

CI's only added job over local: **collect flaky stats**. If a test fails > 2 times in 7 days but isn't always failing → flag for human attention. **Never auto-retry to mask flakiness.**

## Writing-time signals (design conscience)

When you write tests for code you just implemented, **friction is information**. The per-language refs enumerate specific signals; the common shape is:

> **If you're fighting the test — too much setup, too much mocking, too much state to control — the code is wrong, not the test.**

Pause. Refactor the implementation. Continue. Don't push through and file it as tech debt later; debt filed is debt forgotten.

### The four friction categories

1. **Arrange friction** — setup is long, fixtures nest 3 deep, you need many doubles to construct the SUT. Signal: SUT has too many collaborators. Action: split or group.
2. **Mock friction** — you're about to stub a third-party SDK method directly. Signal: you don't own the boundary yet. Action: introduce your own protocol/interface, fake that.
3. **Determinism friction** — you can't assert because time / random / IDs change every run. Signal: SUT reads these from the environment. Action: inject them.
4. **Assertion friction** — you need `and` / `then` to describe what the test checks. Signal: testing two behaviors at once. Action: split the test.

The per-language refs (`python.md`, `node.md`, `swift.md`) name these in each stack's specific vocabulary (e.g. "`monkeypatch` a stdlib module" = mock friction in Python; `URLSession.shared` access = determinism friction in Swift).

### Anti-patterns (workarounds that don't actually fix the signal)

These are the common ways teams avoid refactoring. They all just push the pain further down the road:

- "It's only a few `@patch` calls" → testing the SDK, not your code (#5 violation)
- "Just one global singleton" → undermines #6, makes #2 impossible
- "Add a `@retry` decorator to the flaky test" → #7 violation
- "Wrap setup in a 30-line fixture" → hiding #4, not solving it

### Using signals during /go

These signals are **most useful during the development pack's implementation loop**, when you're alternating between writing the test and the implementation. The agent feels the friction and acts on it immediately. They are not an audit pass to run at the end; that's what turns methodology into bureaucracy.

## A judgment heuristic

> **A test that takes longer than 5 minutes to understand what behavior it protects is not worth keeping.**

Deleting tests is not the failure mode — accumulating tests that no one understands is. The value of a test suite is that it **lets you change the code with confidence**. If a test doesn't serve that, it's debt.
