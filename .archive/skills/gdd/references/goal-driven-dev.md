# Goal-Driven Development

A methodology for shaped human-agent work. The human maintains shared context; the agent executes against it.

## Premise

An agent, given clear context and a clear goal, can deliver an outcome end-to-end. Human effort therefore shifts from prescribing execution steps to maintaining the artifacts an agent reads at cold start.

## Artifacts

Work is organized around three artifact types.

### goal

The specification of work currently being implemented. Bounded to one milestone. Treated as authoritative input by the executing agent. Short-lived: archived or marked done when its milestone completes.

### backlog

Candidate work not yet committed to. Unstructured: entries may be one-line items or expanded briefs. Most entries are never promoted; this is expected.

### refs

Decisions and findings retained for future citation. Append-only. A ref entry exists because at least two locations need to cite the same content.

## Promotion

Two promotions move content between artifacts. Both require explicit friction.

### backlog → goal

Promotion runs through a drafting step. The draft attempts to specify the backlog item as an executable goal. If the draft is stable and complete, the item is mature and is promoted. If the draft remains vague, the underlying problem is not yet concrete; the item returns to backlog.

### inline → refs

Content stays inline in the goal it serves, in a PR description, or in a commit message by default. When the same content is required in a second location, it is promoted to refs. Content not cited at least twice is not promoted.

## Constraints

Refs do not restate facts derivable from current code, git log, or commit messages. Before adding content to refs, verify it carries at least one of:

- Reasoning behind a rejected alternative
- A failure mode discovered through a dead end
- An empirical finding about the external world
- A reusable pattern or methodology

Content failing this test belongs inline (PR description, commit message, or goal section), not in refs.

## Layout

The default project layout lives under `.gdd/`:

```
.gdd/
  goal.md                     # index of milestones
  goals/
    goal-YYYYMMDD-slug.md     # one file per milestone
  backlog.md                  # index of backlog items
  backlogs/
    backlog-YYYYMMDD-slug.md  # expanded brief when needed
  refs.md                     # index of refs
  refs/
    YYYY-MM-DD-slug.md        # time-anchored ref
    slug.md                   # evergreen ref
```

### Invariants

These hold at every project scale:

- **Time in filename.** Every dated artifact carries `YYYYMMDD` (or `YYYY-MM-DD` for refs) in its filename. Time is part of context: a reader needs to know which period an artifact was written in.
- **Status in frontmatter.** Goals and backlog briefs declare status (`planned`, `in-progress`, `done`, `parked`) in YAML frontmatter. Folder location is not used to indicate status.
- **Index file at root.** Each artifact type has a top-level index (`goal.md`, `backlog.md`, `refs.md`). The index is the entry point; subdirectories hold detail.
- **File or folder.** Artifacts default to a single `.md` file. When an artifact needs to carry non-markdown companions (mockups, screenshots, sketches, data snapshots, eval scripts), it upgrades to a folder named without the `.md` suffix, containing the artifact body under a fixed inner name (`goal.md`, `backlog.md`, or `README.md` for refs) plus its assets. The upgrade trigger is the moment a non-markdown sibling is about to be written — do not leave assets next to a single-file artifact. Citations omit the `.md` suffix (`refs/2026-05-12-foo`, `goals/goal-20260517-visual-polish-session-ui`) so file → folder upgrade is transparent to references. Companions cover both **pre-execution** items (mockups, sketches, data snapshots referenced from the goal during shaping) and **post-execution** items (handoff documents, validation reports, benchmark output — artifacts produced by executing the goal); both attach to the same artifact folder. Within the folder, default to flat layout — sub-divide into a named sub-directory (e.g. `handoff/`) only when asset count grows enough that pre/post artifacts become hard to scan visually.

### Small-project form

A project with one milestone may collapse to:

```
.gdd/
  goal.md       # the milestone itself, not just an index
  backlog.md    # one-line items, no briefs
  refs/         # present only when refs exist
```

### Upgrade triggers

- Create `goals/` when a second milestone is added.
- Create `backlogs/` when a backlog item requires a brief before promotion.
- Create `refs/` and `refs.md` on the first ref entry.

## Vocabulary

Fixed meanings across this methodology and the skills that implement it. Use the role-explicit term when role matters; don't fall back to bare "user" if the role is in question.

- **the human** — the person, role-agnostic. Use when the role is mixed, switching, or doesn't matter for the point being made.
- **end user** / **consumer** — the human in their post-handoff role: picking up the finished work as the task's actual consumer would. Used in `/go` handoff shape and the goal's Pickup section.
- **co-author** — the human in their in-flow role: shaping a goal during `gdd`, answering mid-flow questions during `/go`, or invoking the escape hatch to dive into implementation. Default mode during `gdd`; escape mode during `/go`.
- **agent** — the AI doing the work. The executing party under either phase's contract.
- **dispatcher** — the upstream agent that invoked the current agent (e.g. when `/go` is run as a subagent). The dispatcher cannot reach the human mid-flow; `/go` therefore stops rather than guessing on a structural unknown.
- **"user" (bare)** — acceptable when context makes the role unambiguous (e.g. "user-observable behavior" — clearly end-user). When the role is mixed or unclear, prefer the role term explicitly. Default to the role term when in doubt.

## Roles

Two phases, two role contracts. The roles switch at the `/go` boundary, and the switch is load-bearing — most handoff friction comes from running one phase under the other phase's contract.

### During `gdd` (shaping)

Human and agent are **co-authors**. The agent surfaces options and consequences; the human chooses. Decisions are co-owned. Transparency is bidirectional — both sides reason aloud, both sides catch each other's mistakes.

### During `/go` (execution)

Roles diverge:

- **Agent** — full-context worker. Reads source and current state, performs changes and setup, **drives the proof flow as the first user**, and makes execution-detail calls. Has access to everything the project exposes.
- **Human** — end user / consumer. Picks up the finished work in the task's natural consumer role—using the result, reading the artifact, or exercising the flow—without needing to know what implementation or setup work ran. The path is already walked once by the agent.

The human can drop into co-author mode mid-flow (ask to dive in, request explanation, redirect approach), but that is an **escape hatch**. The default contract is consumer.

Two principles govern this boundary. They are the judging standard for every `/go` mechanic — a step that doesn't serve at least one of these is overhead.

- **Transparence.** The agent makes its actions visible enough that the human can trust the work without reading source. Reporting is **calibrated**, not exhaustive: the goal is letting the human decide trust with minimum cognitive load, not enabling line-by-line audit. Default surface is behavior + impact; code-level detail folds beneath, available on demand.

- **UX.** The agent stages the verification environment **and acts as the first user**. Anything within reach of the agent's tools is the agent's job — builds, migrations, dev-server bring-up, fixture loading, searches, readbacks, rendered checks, CLI invocations with available credentials, **and the proof flow itself** wherever the agent's tools can drive it. The human picks up as user #2 — opening a path the agent has already walked.

  Defer to the human only what is **truly beyond agent's tool reach**, and when deferring, **name what was tried**. "Tried the browser driver; can't reach this surface from a headless tab" is a real deferral. "I'll let you check the UI" is not. "Beyond reach" is a fact about tools, not a default state.

Telling the human what to run is **not** UX. Running it, observing the result, reporting back is.

## Skills

The `gdd` skill owns this reference: it shapes durable goals from backlog items through drafting and manages `.gdd/` structure. Use it when work benefits from explicit co-authored scope, decisions, acceptance, and Pickup.

The `go` skill implements the execution side of the role boundary in its own self-contained instructions. A shaped goal is authoritative when present; lightweight tasks use an in-memory Outcome + Proof + Boundary + Pickup contract and do not manufacture a goal artifact.
