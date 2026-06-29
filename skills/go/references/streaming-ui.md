# Streaming UI — failure modes to think through

When you change how streamed LLM output renders, think through these before declaring done:

- **Event ordering** — what if `turnDone` arrives before the final `textDelta`? before the first?
- **Empty turns** — thinking-only, tool-only, cancelled-at-zero.
- **Mid-stream cancel** — does the UI leave partial state behind?
- **Rapid re-prompt** — if the user sends another prompt before the last settles, does state collide?

Not all need tests. Some are structural (impossible by contract), some are corner. Think them through; the ones that can happen in production are Tier 2 (component-level) tests.
