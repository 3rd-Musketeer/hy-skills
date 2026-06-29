# Control Flow Spectrum

How "behavior" — agent thinking, retrieval, generation, errors, latency — is realized in the prototype.

This file expands SKILL.md §1 Flow 3. The default is pure scripts, but real LLM / API integration is fine when the design judgment requires it. This file describes the three tiers and how to choose.

## The three tiers

```
┌──────────── tier 1 ───────────┬──── tier 2 ─────┬──── tier 3 ─────────┐
│ pure script                    │ recorded         │ live integration     │
├────────────────────────────────┼──────────────────┼──────────────────────┤
│ setTimeout + hardcoded         │ pre-recorded     │ real LLM / API       │
│ responses, written by hand     │ JSON replayed    │ behind a thin client │
├────────────────────────────────┼──────────────────┼──────────────────────┤
│ • video demo                   │ • reproduce a    │ • A/B prompts        │
│ • fastest iteration            │   specific bug   │ • feel real latency  │
│ • zero token cost              │ • deterministic  │ • feel failure modes │
│ • no API setup                 │ • zero token     │ • judge agent         │
│ • runs offline                 │   cost during    │   behavior quality    │
│                                │   replay         │                      │
└────────────────────────────────┴──────────────────┴──────────────────────┘
```

## Tier 1 · Pure script (default)

Hand-written `setTimeout` chains with hardcoded responses. The "agent" is not real; it's a deterministic sequence the prototype author wrote.

```tsx
function fakeAgentReply(userMsg: string, setMessages: SetState) {
  setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
  setTimeout(() => {
    setMessages((prev) => [...prev, { from: "agent", text: "thinking…" }]);
  }, 400);
  setTimeout(() => {
    setMessages((prev) => prev.map((m) =>
      m.text === "thinking…" ? { ...m, text: SCRIPTED_RESPONSES[userMsg] ?? "OK." } : m
    ));
  }, 1600);
}
```

**Use when**:
- The design question is about UI / interaction shape, not LLM behavior.
- You're iterating fast and don't want to wait 3s for a real model on every reload.
- You're recording a video where determinism matters.
- You don't have API access yet.

**Pros**: zero cost, zero latency, zero failure modes, zero setup. Demos to stakeholders cleanly.

**Cons**: doesn't expose any real-world surprise (slow first token, model rambling, refusals). Looks fake to anyone who's used a real LLM product.

## Tier 2 · Recorded

Real LLM responses captured once into a JSON fixture, then replayed deterministically.

```tsx
import recordings from "../fixtures/agent-recordings.json";

function replayAgentReply(userMsg: string, setMessages: SetState) {
  const recording = recordings.find((r) => r.userMsg === userMsg);
  if (!recording) return fallbackToScript();

  // Replay token-by-token with original timing
  let i = 0;
  const interval = setInterval(() => {
    if (i >= recording.tokens.length) return clearInterval(interval);
    setMessages(/* append recording.tokens[i] with delay matching recording.timings[i] */);
    i++;
  }, /* token-stream timing */);
}
```

**Use when**:
- You want real LLM behavior (token streaming, real wording, real length) but...
- ...you don't want to burn tokens on every reload during UI iteration, or...
- ...you need the same response every time (debugging a specific layout under a specific output).

**Pros**: realistic feel without recurring cost; deterministic.

**Cons**: you have to record once (small upfront cost); recordings go stale as model versions change; doesn't help judge whether new prompts will produce different / better behavior.

## Tier 3 · Live integration

Real LLM / API calls from the prototype, with a thin client layer.

```tsx
async function callAgent(messages: Message[], setMessages: SetState) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": API_KEY, "anthropic-version": "..." },
    body: JSON.stringify({ model: "claude-...", messages, stream: true }),
  });
  // stream-parse and append to setMessages
}
```

**Use when**:
- The design judgment depends on real model behavior — "does the agent actually catch this issue?", "does the response feel patronizing?", "is the latency tolerable?"
- You're A/B-testing prompts (not just visuals).
- You're validating that an agent product is worth building before investing in production-grade infrastructure.

**Pros**: maximum realism. The prototype actually behaves like the product would.

**Cons**: needs API access / keys (insecure inside a frontend; usually wrapped by a thin local proxy); real latency makes iteration slower; non-deterministic (frustrating for video recording); costs tokens on every interaction.

## What to preserve at every tier (the "floor")

Even at tier 3 with real LLMs, the prototype is still a prototype:

- **No real backend with auth / persistence.** A user record, a database, real session management — these belong to the production app, not the prototype. If you need to fake "the user is logged in", inline that state.
- **No retries, no cancellation, no exponential backoff.** When a call fails, surface the failure in the UI and stop. Production-grade resilience isn't the prototype's job.
- **Thin client.** The integration layer should be small enough that swapping it back to tier 1 / tier 2 takes minutes, not days. A 30-line wrapper around `fetch` is right; a 300-line abstraction with retry logic and request queueing is wrong.
- **No tool-use frameworks.** If your agent has tools, mock the tools (return fake search results, fake DB query results). The prototype is about *interaction with the agent*, not about the toolchain reliability.

## How to choose

```
Q1. Is the design question about UI / layout / typography?
    → Tier 1. Real LLM adds noise without signal.

Q2. Is the design question about specific agent behavior on specific inputs?
    → If a few canonical examples cover it: Tier 2 (record those examples).
    → If you need to explore the space: Tier 3.

Q3. Is the design question about latency / failure handling / "does this feel real"?
    → Tier 3. The whole point is the real-world surprise.

Q4. Are you about to do a stakeholder demo / record a video?
    → Tier 1 or Tier 2. Determinism beats realism for demos.
```

Most boards start at Tier 1, drift to Tier 2 for specific scenarios, and only adopt Tier 3 when the design judgment genuinely requires it. half-law went straight to Tier 3 because the agent's actual reasoning behavior was the design surface being evaluated. xhs-poster-demo stayed at Tier 1 because the design surface was the UI scaffolding around the agent, not the agent itself.

## Mixing tiers in one board

It's normal to have tier 1 in some places and tier 3 in others on the same board. A few patterns that work:

- **Default tier 1, opt-in tier 3 via env var or theme axis.** "Use real LLM" becomes a switch you flip when you want to feel a specific behavior.
- **Tier 3 for the agent, tier 1 for everything else.** Errors, file uploads, search-result mocks all stay scripted; only the agent message stream is real.
- **Tier 2 for canonical demos, tier 3 for iteration.** When recording a video, switch to recorded mode for determinism; when iterating, use live.

Don't try to mix tier 2 and tier 3 in the same code path — pick one as the source of truth for that interaction. Mixing leads to "is this the recorded response or a real one?" confusion.

## Anti-patterns

- ❌ Adding a real LLM client on day one because "we'll need it eventually". Tier 1 is faster to iterate; upgrade when the design question demands it.
- ❌ Production-grade error handling at tier 3. Failures should surface, not be hidden. The prototype is for design, not robustness.
- ❌ Hiding a real API key in the frontend bundle. Use a local proxy or a server-side endpoint, even for a prototype. Leaked keys are real money.
- ❌ Letting the integration layer grow into a "client SDK". 30 lines of `fetch` is right; if it grows past 100, you're building production infrastructure on the wrong side of the line.
- ❌ Making the agent so real it can't be reset or rewound. The prototype must support cheap restart — if the LLM "remembers" something the user wanted to redo, friction wins.
