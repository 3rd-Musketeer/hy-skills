# External Actions Overlay

Load in addition to the primary pack when work publishes, sends, shares, installs, deletes, pays, deploys, changes remote state, or otherwise affects people or systems beyond the local working state.

## Authority gate

- Resolve the exact account, repository, branch, environment, recipient, audience, object, and operation before acting.
- Match authorization to that exact action. Access to inspect is not permission to export; permission to edit locally is not permission to publish; a terminal condition does not broaden either.
- Treat ambiguity about target, audience, irreversibility, cost, or protected data as structural. Stop and ask rather than choosing the most convenient interpretation.
- Keep secrets, magic links, tokens, private content, and generated authorization material out of command output, artifacts, and handoffs.

## Execution posture

Prefer preview, dry-run, diff, draft, or target enumeration when the system provides it. Execute the smallest scoped mutation that achieves the Outcome. Re-resolve mutable targets immediately before the action when drift could affect who or what is changed.

Do not batch unrelated external changes for convenience. Destructive operations require exact target checks and a recoverability or rollback statement when one exists.

## Strong proof

Capture the operation receipt—commit/ref, message/thread, deployment/version, object identifier, transaction, or API response—and then verify the postcondition from the destination side. A successful request is not enough when propagation, permissions, rendering, or target identity can differ from intent.

Report what became externally visible, to whom, whether it can be reversed, and any residual propagation delay or verification limit.

## Completion sweep

Remove drafts, temporary shares, preview deployments, uploaded scratch artifacts, or local secret-bearing residue created only for the action. Do not delete material external state merely as cleanup unless that deletion was itself authorized.
