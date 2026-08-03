# Handoff Doctrine

Expression discipline for the `/go` handback. Medium-agnostic — applies whether the handback is delivered as a chat message to the dispatcher, an HTML doc, a PDF, a deck, or any other artifact. Load it when shaping a substantial or rendered handoff; it is not required reading at contract time.

`/go`'s **Hand back the result** section defines the slot structure. This doctrine defines how each slot reads — the typology, density, language layer, and visual judgment that turn a contract-compliant handback into one the human can actually use.

## §1 · Typology — handback is the catch-up-and-verify artifact

A handback is **not** an RFC. It is not an implementation-followed-by-list. It is not a design doc. The reader's job is to **catch up** on what shipped and **verify** that it works, not to evaluate whether the work was worth doing — that decision is in the past, sitting in the goal doc.

This inverts the RFC priority. An RFC leads with "why" because the reader is deciding. A handback leads with "what changed" and "how to verify" because the reader is consuming. When the body wants to explain why, it links back to the goal doc rather than re-litigating the decision.

A handback that reads as design rationale, an author's diary, or a complete changelog has missed the brief — see §6 for the three common drift modes.

## §2 · Section thinking framework — three questions per block

Every substantive block in the handback (a behavior change, an out-of-scope finding, an assumption) earns its place by carrying three things:

1. **触发场景 / Trigger.** Under what condition does this surface — when does a real user hit it, when does a future agent run into it?
2. **形状 / Shape.** What does the change, finding, or assumption actually look like — described at the behavior level, not the implementation level.
3. **后果 / Consequence.** What downstream effect follows — for the user, for future work, for adjacent systems.

The point of the framework is to force completeness of **thinking**, not completeness of **writing**. Drop the consequence line when nothing material follows. Collapse the shape into one sentence when one sentence suffices. The discipline is upstream: if you cannot answer all three for a block, that block is not yet earned and should be cut or refined.

## §3 · Information density

Every block, paragraph, and visual answers one specific question. There are no "for completeness" sections, no "background" warmups, no parallel restating of what the goal doc already says.

Density beats length. Prefer a dense paragraph to a thin bulleted list when there is no structural reason to list. Lists are for genuine enumeration (parallel items, ordered steps); use them when the items are parallel, not when bullets feel safer than prose.

Concretely: a section that the reader could skip without losing information is a section that should be removed. The handback is short by virtue of having cut everything that did not earn its place, not by virtue of having been written tersely.

## §4 · Language discipline — keep implementation language out of the body

The body of a handback contains **behavior language**, not implementation language. Function names, file paths, variable identifiers, type names, package names — these belong in code review, in commit messages, in audit appendices. They do **not** belong mid-paragraph in the prose a human reads to understand what changed.

The mechanism: when a `setInterval(15_000)` or a `SyncIndicator.tsx` lands in the body, the reader has to context-switch from "what behavior changed" to "what is this code symbol" — a layer break the handback was supposed to spare them. The reader can always navigate to source if they want; the handback's job is to make that navigation optional.

When source navigation is genuinely required (e.g., the human needs to read the new e2e test before verifying), put it in a dedicated location: a footer cite, a code-block aside, a dedicated "Tests covering this" list. Do not sprinkle source identifiers through the prose.

Two style rules that follow from the same discipline:

- Drop colloquial intensifiers — "丝滑", "拙劣", "一眼就", "完美", "perfectly" and their kin. They consume tokens and convey no information.
- For technical terms with ambiguous Chinese translation, use the English original on first use, optionally followed by the Chinese in parentheses, and (if the medium supports it) a brief tooltip. Subsequent uses can stay in English.

## §5 · Visual and widget judgment

Visuals must **explain**. A visual that conveys nothing the prose does not already carry is decoration; cut it. Two examples of the trap to avoid: a progress bar mocking a latency comparison (looks like visualization, conveys no information the reader could not get from "latency went from 600ms to 50ms"); two adjacent screenshots that look identical (the difference is hidden).

A visual earns its place when the reader can absorb a structural relationship — sequence, comparison, magnitude, state transition — from the visual that would take a paragraph of prose to convey.

When the medium supports interactive widgets, treat them as a budget — roughly three per handback. Each should let the reader **feel** something the prose cannot capture (a debounce delay, a retry cadence, a state machine traversal). Widgets that just display a result the prose already gave are decoration in moving form.

The choice of visual form (a sequence diagram vs. a table vs. a hand-drawn SVG vs. a mock UI) is **the medium-discipline skill's job**, not this doctrine's. This doctrine only requires that whatever visual the medium produces, it carry information.

## §6 · Anti-patterns absorbed

Three drift modes seen repeatedly in dogfooding. When the handback starts feeling like any of these, return to §1.

- **Implementation-followed list.** The body reads as "files changed: A, B, C; cards summarizing each change." Reads like a git log rendered in prose. Failure mode: the reader cannot tell what to verify first, what to skip, or what depends on what. Comes from treating the handback as a record of work rather than an aid to verification.
- **RFC body.** The body reads as Context → Outcome → Trade-offs, with prominent design rationale. Reads like a decision document. Failure mode: prioritizes "why we did it this way" over "what is true now" — the reader is left re-litigating decisions that the goal doc already settled.
- **Author's narration.** The body reads as a first-person sequenced account: "first I tried X, then it turned out Y, so I switched to Z." Reads like a journal entry. Failure mode: the reader cannot extract a single verification path because the path the author walked is not the path the reader needs.

All three are recoverable by going back to §1 and re-asking: what does the reader need to catch up on, and what specific action do they take to verify?

## §7 · Output path

When the handback is rendered as a non-markdown artifact (HTML, PDF, deck, or any other doc-render skill's output), it attaches to the goal folder per the file-or-folder invariant in `../../references/goal-driven-dev.md` § Invariants — alongside `goal.md`, triggering the file-or-folder upgrade if it has not already triggered. The agent does **not** invent a separate top-level location for handoff artifacts.
