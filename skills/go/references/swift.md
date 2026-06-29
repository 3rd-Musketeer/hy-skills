# Swift Testing Reference

Read after `testing-doctrine.md` when Swift files are in scope.

## Project shape detection

Read this **first**. Swift codebases split into two very different worlds, and the wrong signal table will misfire badly.

### Detect the shape

| Indicator | Shape | Where the rest of this doc fits |
|---|---|---|
| `Package.swift` at the module root, no `*.xcodeproj` | **SwiftPM library or server** (Vapor / Hummingbird / pure lib) | Use the **default tables below** verbatim |
| `*.xcodeproj` / `*.xcworkspace`, AppKit / SwiftUI / UIKit imports | **macOS or iOS app** | Use the default tables **plus** the macOS/iOS app supplement (next subsection) |
| Both — Package.swift + Xcode project (mixed) | **Hybrid** | App = supplement, library targets = default |

### macOS / iOS app supplement

These signals are **specific to Apple-platform apps** and are not in the main tables (which were written for server-side Swift). Apply them in addition to the universal signals (force-unwraps, concrete-type deps, etc.).

#### Strong (`⚠`) — desktop / mobile only

| Signal | Detection | Hint |
|---|---|---|
| `NSScreen.screens` / `NSScreen.main` direct read | grep | Pass screen geometry as a parameter; or inject a `ScreenGeometryProvider` protocol |
| `NSPasteboard.general` / `NSWorkspace.shared` / `NSApp.activate` direct call | grep | Wrap in a protocol (`Pasteboard`, `Workspace`); inject |
| `UIApplication.shared` / `UIScreen.main` direct read | grep (iOS) | Same as above for AppKit equivalents |
| `@MainActor class` containing **non-trivial logic** (more than view bindings) | grep `@MainActor\s+class` + skim body | Move logic out to a non-`@MainActor` testable type; let the actor-bound class be a thin shell |
| `deinit` spawns `Task { ... }` referencing `self` state | grep `deinit\s*\{[\s\S]*?Task\s*\{` (multiline) | Add an explicit `shutdown()` method; tests can await it |
| `SCStream` / `SCShareableContent` / `SCScreenshotManager` (ScreenCaptureKit) used directly without a wrapper protocol | grep + check for protocol around it | Define an `ScreenCapturing` protocol; only the prod impl touches SCKit. Same for `AVCaptureSession`, `CLLocationManager`, etc. |
| Hardcoded test-name allowlist in a wrapper script (e.g. `run-swift-tests.sh` enumerates every test) | inspect `<module>/scripts/*.sh` | Adding a test requires editing a shell script — fragile. Pass a glob or `--testPlan` instead |

#### Weak (`ℹ`) — desktop / mobile only

| Signal | Detection | Hint |
|---|---|---|
| Test target without a screen-recording / camera / location TCC entitlement, but tests touch those APIs | check Info.plist + test target settings | Tests will pass locally (TCC granted) but fail on fresh CI runners — document the requirement |
| `Thread.sleep` / `DispatchQueue.main.asyncAfter` used inside production code (not test) for timing coordination | grep | Replace with proper async/await sync; sleeps in prod are also a doctrine #6 smell |
| App uses XCTest **shim wrapping `static func main()`** (custom test bootstrap) | grep `class.*XCTestCase` + `static func main()` in test files | This pattern bridges to a custom runner but loses individual test-case names in `xcodebuild` output. Migrate to true `@Test` |

### Operational notes for Xcode-based projects

These don't fire signals — they affect how Phase 4 of the skill behaves on these projects:

- **`xcodebuild test -quiet` swallows test-case names.** If you might need failure detail, drop `-quiet`. If a wrapper enforces it, grep stdout for `Test Case '-\[.*\]' failed` patterns to recover names.
- **Cold build is slow** (50-90s for a single test target). Don't compare the duration to SwiftPM's `swift test` baseline — they're different categories. Always report **setup time and test time separately** (per SKILL.md Phase 4c).
- **`swift test --fail-fast` doesn't translate to xcodebuild.** Pick the smallest test target relevant to scope instead.

## Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | **Swift Testing** (`@Test`, `#expect`) | macros, async-native, parallel default, expression-expanding diagnostics |
| Build | **SwiftPM** (`swift test`) | CI-friendly, fast, no Xcode required |
| HTTP test (server) | Vapor `app.test()` / Hummingbird in-process | matches the app-factory pattern |
| UI test (sparingly) | XCUITest | only for irreplaceable end-to-end paths |
| Mocks | **Hand-written `struct` conforming to a `protocol`** | no dynamic mock library — Swift culture favors explicit fakes |

**Avoid**: new code in `XCTestCase` (the new framework supersedes it), Xcode project for backend/library targets (use SwiftPM), Cuckoo / Mockingbird (manual stubs are the idiom — and it's a feature, not a gap).

## The Swift advantage

Swift cannot dynamically patch third-party types. **Doctrine #5 ("don't mock what you don't own") is enforced by the language**, not by discipline. This is unique among the three stacks and shapes the whole testing culture: writing protocols for your own boundaries isn't best-practice, it's the only way to test.

## Conventions

- **`@Test` functions, not `XCTestCase` subclasses.**
- **Test names are sentences**: `@Test("URL normalization drops trailing slash")` — they appear in failure output.
- **`#expect(...)` everywhere**, not `XCTAssertEqual`. On failure, the macro expands the expression and shows actual values.
- **Parameterized tests are first-class**: `@Test(arguments: [...])`.
- **Async-native**: `@Test func foo() async throws` — no `XCTestExpectation`.
- **Layout** (SwiftPM):
  ```
  Sources/MyLib/Foo.swift
  Tests/MyLibTests/
    FooTests.swift
    Fixtures/
  ```

## App factory pattern (Vapor example)

```swift
@Test func getUsersReturnsList() async throws {
    let app = try await Application.make(.testing)
    try configure(app, deps: testDeps())

    try await app.test(.GET, "users") { res in
        #expect(res.status == .ok)
        #expect(res.body.string.contains("alice"))
    }

    try await app.asyncShutdown()
}
```

In-process, no port. Same shape as `supertest` / `TestClient`.

## Protocol + struct DI (the Swift idiom)

```swift
protocol HTTPClient {
    func get(_ url: URL) async throws -> Data
}

struct UserService {
    let http: HTTPClient
    func getUser(id: String) async throws -> User { ... }
}

struct StubHTTP: HTTPClient {
    let responses: [URL: Data]
    func get(_ url: URL) async throws -> Data {
        responses[url] ?? Data()
    }
}

@Test func decodesUser() async throws {
    let svc = UserService(http: StubHTTP(responses: [...]))
    let u = try await svc.getUser(id: "123")
    #expect(u.name == "alice")
}
```

**`StubHTTP` is just a `struct`.** No mock framework. If implementing a stub feels painful, the protocol is too wide — that's a doctrine signal.

## Traits (test metadata)

Swift Testing's traits replace pytest markers + skip annotations + timeout decorators in one system:

```swift
@Test(.tags(.integration), .timeLimit(.seconds(10)))
func endToEndFlow() async throws { ... }

@Test(.disabled("needs real API key, see #123"))
func hitsProductionAPI() { ... }

@Test(.enabled(if: ProcessInfo.processInfo.environment["CI"] == nil))
func slowLocalOnly() { ... }
```

CLI:
```bash
swift test                                    # full suite, parallel default
swift test --filter "tag:integration"
swift test --skip "tag:slow"
```

## Two scenario splits

### Server-side Swift (Vapor / Hummingbird)
Mirrors Node's app-factory model exactly. Use `app.test()`, in-process, fakes for deps.

### macOS / iOS client
- **Extract core logic into a SwiftPM package** that knows nothing about UI. Test with `swift test`.
- **UI layer** uses ViewInspector / snapshot testing for SwiftUI views. Don't cross the bridge in tests.
- **Bridge layer** (e.g. Swift ↔ JS via `WKWebView`): contract test the message schema, both sides separately.
- **End-to-end** via XCUITest: keep small, only critical paths.

The HALF macOS client is a typical case where extracting non-UI logic to a SwiftPM module would make the bulk of it testable in seconds rather than via Xcode.

## Writing-time signals — Swift

The items below are **frictions to notice while writing tests** in Swift, not a grep checklist to run at the end. If one fires during `/go` §2.3, pause and fix the design before continuing.

> Tables cover **universal Swift signals** (any Swift code). For Apple-platform apps (`*.xcodeproj`, AppKit / SwiftUI / UIKit), **also apply the macOS / iOS app supplement** in Project shape detection above.

**Strong friction** — design is actively wrong; refactor before shipping.

### Strong

| Signal | Detection | Suggested fix |
|---|---|---|
| Stored property is a **concrete type** instead of a protocol (e.g. `let http: URLSession`) | scan `let \w+: [A-Z]` in modified `.swift`; check if the type is a known concrete (URLSession, FileManager, …) | Define a protocol; store the protocol type |
| Code under test calls `URLSession.shared` / `FileManager.default` / `UserDefaults.standard` directly | grep | Inject a wrapper protocol; pass real impl in production |
| `try!` or `as!` in test bodies | grep | Use `try` + `#expect(throws:)` so failures show context |
| `@testable import` of more than one internal module per test file | grep | Crossing too many abstraction boundaries — sign tests bind to implementation |
| New code uses `XCTestCase` instead of `@Test` (in a project that has adopted Swift Testing) | grep `class.*XCTestCase` | Migrate to `@Test` for new code |
| Test code mutates a `static var` / global singleton | grep | The SUT depends on global state — refactor to inject |

**Weak friction** — borderline smells; address if cheap.

### Weak

| Signal | Detection | Suggested fix |
|---|---|---|
| Async test without `.timeLimit(...)` trait | scan `@Test func.*async` and check trait list | Add `.timeLimit(.seconds(N))` to prevent CI hangs |
| Protocol used as a dependency has > 5 methods (forces large stubs) | count methods in protocol decl | Split the protocol (ISP) |
| Test file > 300 lines | line count | Likely covering multiple SUTs — split |
| `Thread.sleep` / `DispatchQueue.main.asyncAfter` in test body | grep | Use proper async/await sync primitives |

**Code-layer signals** — visible in the implementation before/while you write the test.

### Code-layer

Apply to `.swift` source files (not test files):

| Signal | Detection | Hint |
|---|---|---|
| `init` takes > 4 dependencies | AST / regex on init signatures | Split the type or group deps into a config struct |
| Public API exposes a concrete third-party type (e.g. returns `URLResponse`) | scan public signatures | Wrap in your own value type |
| Singleton pattern (`static let shared = ...`) on a service that does I/O | grep `static let shared` + look for I/O imports | Composition-root injection instead |
| `@Published` properties read directly by other modules | grep cross-module `.<name>` | Expose via a method/protocol; reduces coupling |

## Anti-patterns to flag

- `XCTestExpectation` for async work in new code (use `async`/`await`)
- A test that imports `XCTest` *and* `Testing` for unclear reason (pick one per file)
- Force-unwrapping (`!`) in production code that handles user/network input
- Using `XCUITest` for what could be a unit test on extracted logic
- Mocks via OCMock / Objective-C runtime tricks — you're working around the language for the wrong reason
