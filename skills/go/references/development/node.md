# Node / TypeScript Testing Reference

Read after `testing-doctrine.md` when Node files are in scope.

## Project shape detection

Read this **first**. Node ecosystems vary widely; the signal table at the bottom is biased toward Vitest+TS (the recommended default). For other shapes, **a sub-section below tells you which signals to skip and what to substitute**.

### Detect the shape

Look at `package.json` and `tsconfig.json` to identify:

| Indicator | Shape |
|---|---|
| `"vitest"` in `devDependencies` + TS source | **Vitest + TS** (default — full table applies) |
| Test files use `import { test } from "node:test"` | **node:test** (zero-dep) |
| `"jest"` in `devDependencies` | **Jest** (legacy) |
| No `tsconfig.json`, source files are `.js` / `.mjs` | **Plain JS** (combine with one of the above) |

### Per-shape signal adjustments

**`node:test`** (e.g. agent-service):
- ❌ Skip: `vi.mock`, `vi.useFakeTimers`, `expectTypeOf`, `.snap` files, MSW assumptions
- ✅ Substitute: `mock.method()` / `t.mock.method()` for owned-method seams, plus DI for module seams; `--test-concurrency` for parallelism
- ✅ Reinforce: DI is even more important here (no `vi.mock` escape hatch)
- 🆕 Strong signal: any `node:test` file that imports a third-party module at top level *and* doesn't pass it via DI — testability is gone (no `vi.mock` to fall back on)

**Jest**:
- 🔁 Translate: `vi.mock` → `jest.mock`, `vi.fn()` → `jest.fn()`, `vi.useFakeTimers` → `jest.useFakeTimers`
- ❌ Skip: inline-snapshot recommendations (Jest's are clunkier — external `.snap` is tolerable here)
- ✅ Add weak signal: presence of `babel.config.js` purely for Jest = ESM friction tax

**Plain JS** (no TS):
- ❌ Skip: `tsc --noEmit` advice, `expectTypeOf`, type-test recommendations
- ✅ Reinforce: every signal becomes weightier (no compiler to catch shape errors)
- 🆕 Strong signal: a stray `.ts` file in an otherwise-JS project — either compile it properly or rename `.js` with JSDoc types

### Always-applies regardless of shape

These signals are stack-agnostic and stay strong:

- App factory pattern (no `app.listen()` in importable modules)
- `process.env.X` read inline (not via injected `Config`)
- Top-level side effects on import
- Default-exported singleton with I/O
- `setTimeout` in a test to wait for async work

## Stack

| Concern | Default | Alternative | Reason |
|---|---|---|---|
| Runner | **Vitest** | `node:test` | ESM-native, fast, great watch, inline snapshots |
| HTTP integration | **supertest** against app factory | — | in-process, no port |
| External HTTP mock | **MSW** (Mock Service Worker) | — | protocol-layer, dev/test/storybook can share handlers |
| Type test | `expectTypeOf` (Vitest) | `tsd` | type-only assertions belong with tests |
| Mocking | `vi.fn()` / handwritten objects | `vi.mock(path)` | prefer DI over module patching |

**Avoid**: Jest (ESM friction, slow startup, config sprawl), Sinon (overkill for most cases — `vi.fn()` covers it), `jest.mock` cargo-culted into Vitest code.

**`node:test` only when**: you're shipping a zero-deps library and want to advertise that.

## Conventions

- **Co-locate tests**: `src/foo.ts` next to `src/foo.test.ts`. No `__tests__/` directories.
- **Flat `test()` or shallow `describe`**. Three levels of `describe` is a code smell from the Jest era.
- **Inline snapshots** beat external `.snap` files — diffs visible in the test file at review time.
- **Never use real `fetch`/`axios` in tests without an interceptor** (MSW handles this — see below).

## App factory pattern

The single most important architectural decision. **Never `app.listen()` in importable code.**

```ts
export function createApp(deps: Deps) {
  const app = express()
  app.get("/users/:id", makeGetUser(deps))
  return app
}

// server.ts (production entrypoint, not tested directly)
createApp(realDeps()).listen(3000)
```

```ts
import request from "supertest"
import { createApp } from "./app"

test("GET /users returns user", async () => {
  const app = createApp({ db: fakeDb([alice]), clock: fixedClock })
  const res = await request(app).get("/users/1")
  expect(res.status).toBe(200)
  expect(res.body).toEqual(alice)
})
```

**No port, no race, no flake.** Handler factories like `makeGetUser({ db, clock })` follow the same DI pattern at handler granularity.

## Test command tiers

```bash
npx vitest run                       # default CI mode (one-shot)
npx vitest                           # watch mode (local dev)
npx vitest run --changed             # only tests affected by current diff
npx vitest run --coverage            # nightly only
```

Always run `tsc --noEmit` first in CI — type errors are the cheapest test failures, and there's no point running runtime tests on code that doesn't compile.

## MSW pattern (external HTTP)

```ts
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"

const server = setupServer(
  http.get("https://api.example.com/users/:id", () =>
    HttpResponse.json({ id: 1, name: "alice" })
  )
)

beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

`onUnhandledRequest: "error"` is critical — any unmocked outbound HTTP becomes a loud failure instead of a silent flake.

Handler files in `tests/msw/handlers.ts` can be reused by Storybook, dev mock servers, and contract tests.

## Three-tier mock layering (in order of preference)

1. **Handwritten fake** as a constructor argument — `createApp({ db: fakeDb })`. Default choice.
2. **MSW** for external HTTP calls — when you can't easily inject because you `fetch` directly.
3. **`vi.mock("module-path")`** — last resort. If you reach for this often, your module boundaries are wrong.

Going down this list means your code is harder to test than it should be.

## TypeScript carries half the weight

`tsc --noEmit` covers shape correctness. Tests only cover **runtime behavior**. So:

- ✅ Test: branches, side effects, error paths, integration
- ❌ Test (compiler does it): wrong arg types, nullability, enum exhaustiveness
- → Node test counts can be ~25% lower than Python for the same protection level

## Writing-time signals — Node

The items below are **frictions to notice while writing tests** in Node/TS, not a grep checklist to run at the end. If one fires during the development implementation loop, pause and fix the design before continuing.

> Tables assume **Vitest + TS** (the default shape). For `node:test`, Jest, or plain JS, see **Project shape detection** at the top of this file for which signals to skip and which to substitute.

**Strong friction** — design is actively wrong; refactor before shipping.

### Strong

| Signal | Detection | Suggested fix |
|---|---|---|
| `vi.mock("<bare-package-name>")` (third-party module path) | grep `vi\.mock\(["'](?!\.)` | Wrap behind your own interface; inject a fake instead |
| Any production code path uses `fetch` / `axios.create()` directly without an injected client | grep + check imports | Introduce an `HTTPClient` interface; inject |
| `app.listen(...)` in any non-entrypoint file | grep | Extract `createApp(deps)`; call `listen` only in `server.ts` |
| Tests start a real port (look for `.listen(0)` or hardcoded ports in test files) | grep | Use `supertest(app)` instead |
| Production code reads `process.env.X` inline (not via a `Config` object passed in) | grep in modified `.ts` | Centralize in a `Config`; inject |
| `import` with top-level side effect (DB connect, file write at module load) | scan top-level | Move into `createApp` or a lazy init |

**Weak friction** — borderline smells; address if cheap.

### Weak

| Signal | Detection | Suggested fix |
|---|---|---|
| `describe` nested 3+ levels | count `describe(` indent | Flatten — Jest era artifact |
| `beforeAll` mutates module-level state | grep | Pass via factory args |
| External `.snap` file with no review activity in last 30 days | git log on `__snapshots__/*.snap` | Convert to inline `toMatchInlineSnapshot()` or delete |
| Test file has > 3 assertions on the same response object | count `expect(...)` | One structural `expect(res.body).toEqual({...})` |
| `vi.useFakeTimers()` not paired with `vi.useRealTimers()` cleanup | grep | Add cleanup in `afterEach` to prevent leak |

**Code-layer signals** — visible in the implementation before/while you write the test.

### Code-layer

Apply to `.ts` source files (not test files):

| Signal | Detection | Hint |
|---|---|---|
| Function takes > 5 args (positional) | AST | Group into a single `opts` object |
| Class constructor takes > 4 deps | AST | SRP — split or refactor |
| Default-exported singleton (`export default new Service()`) | grep | Export the class; let composition root instantiate |
| `process.env.*` accessed outside a `Config` boundary | grep | Centralize env reads in one module |

## Anti-patterns to flag

- `setTimeout` in a test to "wait for async" (use `await` or proper sync primitives)
- `expect(...).toBe(true)` without context — meaningless on failure
- Tests that only pass because of execution order (`vitest --shuffle` should still pass)
- `try { ... } catch { /* swallow */ }` in production code — and a corresponding test that doesn't assert the error path
- `// @ts-ignore` / `// @ts-expect-error` in test setup to bypass type errors (means the fake doesn't match the interface — fix the fake)
