# Python Testing Reference

Use when the core skill has selected the testing doctrine and Python files are in scope.

## Project shape detection

Read this **before** running the signal table. Most modern Python codebases are pytest, in which case the full table applies as written.

| Signal in repo | Shape | Implication |
|---|---|---|
| `pyproject.toml` mentions `pytest`, or `tests/` uses `def test_*` flat functions | **pytest** (default) | Full table applies |
| Tests are `class XxxTest(unittest.TestCase)` and no pytest config | **unittest** (legacy) | Most signals still apply, but `monkeypatch` rule is moot — flag `mock.patch` instead |
| `setup.py` only, no `pyproject.toml`, very old codebase | **legacy** | Skip the `uv` fallback; use whatever `Makefile` / `tox` says |

**Per-detection adjustments**:

- If the codebase has **already migrated to `monkeypatch`** (no `from unittest.mock import patch` anywhere), the three "patching" signals below collapse into one — treat `monkeypatch.setattr(<third-party-path>, ...)` as the canonical strong signal and skip the `@patch` regex.
- If pytest fixtures aren't used at all, **don't recommend "use a fixture"** as a hint — the codebase may have a no-fixture style for a reason.

## Stack

| Concern | Choice | Reason |
|---|---|---|
| Runner | **pytest** | de facto standard, function-style, rich fixture model |
| Parallel | **pytest-xdist** | `-n auto` → multi-process, exposes hidden shared state |
| HTTP mock | **respx** (httpx) or `httpx.MockTransport` | protocol-layer interception, satisfies doctrine #5 |
| Snapshot | **syrupy** (use sparingly) | fixed-structure outputs only, never LLM text |
| Property | **hypothesis** | pure functions only — encoders, parsers, sorters |
| Async | **pytest-asyncio** with `asyncio_mode = "auto"` | no boilerplate per test |

**Avoid**: `unittest.TestCase` for new code, `requests-mock` (use respx), heavy `unittest.mock.patch` chains, `setUp`/`tearDown` for non-class tests.

## Conventions

- **Flat functions, not classes.** pytest fixtures are function-arg DI — that's enough for ~95% of cases.
- **Fixtures as DI**: `def test_foo(tmp_path, clock, fake_llm):` — the signature lists exactly what this test depends on.
- **Table tests via `@pytest.mark.parametrize`** — never write `for ... assert ...` loops.
- **One module under test → one test file**. Layout:
  ```
  core/<pkg>/
    src/<pkg>/foo.py
    tests/
      test_foo.py
      test_foo_integration.py
      fixtures/
  ```

## App factory (FastAPI example)

```python
def create_app(deps: Deps) -> FastAPI:
    app = FastAPI()
    app.include_router(make_router(deps))
    return app

def test_get_user():
    app = create_app(Deps(db=InMemoryDB(), clock=FrozenClock()))
    client = TestClient(app)
    res = client.get("/users/1")
    assert res.status_code == 200
```

`TestClient` is in-process — no port, no network, no sleep.

## Test command tiers

```bash
pytest -x -q                         # default: fast, fail-fast
pytest -n auto                       # parallel (xdist)
pytest -m "not integration"          # CI on every push
pytest -m integration                # nightly / pre-merge
pytest --snapshot-update             # only after human-reviewing diffs
```

In repos with a Justfile, prefer `just check` / `just test <pkg>` — they wrap the canonical recipe.

## Tool refresher

**pytest-xdist** — Run tests across multiple worker processes. `-n auto` uses CPU count. Forces test independence (no shared state, no fixed ports). Adopt when suite > 100 tests and single-process > 15s.

**respx** — Mock library for `httpx` calls. Intercepts at the transport layer:
```python
@respx.mock
def test_fetch_user():
    respx.get("https://api.example.com/users/1").mock(
        return_value=httpx.Response(200, json={"id": 1, "name": "alice"})
    )
    user = my_client.get_user(1)
    assert user.name == "alice"
```
Allowed because it intercepts the HTTP **protocol**, not third-party SDK internals.

**syrupy** — Snapshot testing. `assert obj == snapshot` writes/compares a serialized snapshot file. Good for: stable JSON, codegen output, structured transforms. Bad for: LLM text, anything with timestamps/UUIDs (unless those are injected per #6).

## Writing-time signals — Python

The items below are **frictions to notice while writing tests** in Python, not a grep checklist to run at the end. If one fires during the development implementation loop, pause and fix the design before continuing — that's how the signal is meant to be used.

**Strong friction** — means the design is actively wrong; refactor before shipping.

### Strong

| Signal | Detection | Suggested fix |
|---|---|---|
| `@patch("<third-party-package>.*")` | grep `@patch\(["']\w+\.` where prefix is not a local module | Introduce a Protocol you own; pass an impl in tests |
| Test imports `unittest.mock.patch` and uses it on > 2 different paths in one test | grep + count | Refactor SUT to take dependencies as args |
| `monkeypatch.setattr` count > 2 in a single test | grep within test body | Same as above |
| Function under test reads `os.environ` / global config directly | grep in modified `.py` files | Pass values as parameters or via a `Settings` object |
| Module-level side effects on import (DB connect, HTTP call, file I/O at top level) | scan top-level statements in modified `.py` | Move to `create_app()` or a lazy initializer |
| Constructor / function takes > 5 **collaborator** deps | AST or grep | Group related deps into a dataclass; consider splitting the SUT |
| Test requires real network (no respx / mock_transport detected and code uses httpx/requests) | grep | Add respx or refactor to inject an HTTP client |

**Weak friction** — borderline smells; address if cheap, otherwise note.

### Weak

| Signal | Detection | Suggested fix |
|---|---|---|
| Test has > 3 `assert` statements on different objects | count in test body | Consider splitting; or one structural `assert obj == expected` |
| Test name contains "and" / "也" / "then" | string match | Likely testing two behaviors — split |
| Fixture chain depth > 2 (fixture A depends on B depends on C) | trace `request.getfixturevalue` / fixture args | Flatten or move setup inline |
| Single test duration > 500ms | pytest `--durations=10` | Inspect for I/O / sleep / heavy setup |
| `setUp` / fixture body > 10 lines | line count | Sign of SUT preconditions accumulating; refactor candidate |

**Code-layer signals** — visible in the implementation, often *before* you even write the test. Worth acting on early.

### Code-layer

Apply to **modified source files**, not test files:

| Signal | Detection | Hint |
|---|---|---|
| Function with > 5 positional params | AST | Group into a dataclass / config object |
| `class Service.__init__` takes > 4 **collaborator** deps (objects with behavior, not config primitives) | AST | SRP violation — split. **Note**: 8 string config kwargs ≠ 8 collaborators; only count things you'd want to fake in tests |
| Top-level `import` with side effects | scan first 30 lines | Move into a function |
| Hardcoded singleton access (`db.session`, `Cache.get_instance()`) | grep | Inject the dependency |

## Anti-patterns to flag in writing

- `try: ... except: pass` in tests (swallows real bugs)
- `time.sleep` to wait for async work (use proper sync primitives)
- Conditional skip without a tracked reason: `pytest.skip("flaky")` with no issue link
- `assert True` / `assert 1` placeholder tests
- A test that only runs on the author's machine because of an env var default
