# System Configuration and Operations Pack

Load for shell configuration, installed tools, local services, runtime wiring, launch behavior, environment ownership, or operational repair.

## Defaults

- Snapshot the current state before mutation, including resolved target, provenance, ownership, precedence, relevant process identity, and observable behavior.
- Preserve one clear owner. Do not solve precedence or versioning by introducing a second untracked mechanism that can silently drift.
- Record the original value before changing borrowed state. Prefer reversible, idempotent changes and identify the rollback path before execution.
- Validate every startup or runtime context that can materially change the result—not just the current interactive shell or already-warm process.
- Use uniquely named, scoped smoke resources. Never use broad cleanup such as “close all” when a targeted session, process, row, or fixture can be removed.

## Strong proof

Configuration text is intent, not completion evidence. Prove the resolved runtime behavior from clean or representative contexts, including executable identity/version when ownership matters. Exercise one realistic smoke flow and verify both the desired postcondition and the absence of collateral effects.

Liveness alone is insufficient when identity is the contract: “the endpoint responds” does not prove the intended binary, configuration, or deployment is active.

## Completion sweep

Remove test sessions, temporary overrides, scratch files, background processes, and partial fallback mechanisms created by the task. Restore borrowed state when the accepted Outcome does not intentionally change it. Leave a concise ownership or recovery pointer when the resulting state would otherwise be ambiguous.
