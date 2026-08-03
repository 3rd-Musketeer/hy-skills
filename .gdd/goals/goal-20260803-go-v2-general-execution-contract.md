---
title: go-v2-general-execution-contract
status: done
desc: Upgrade /go from a development workflow into an explicit, evidence-backed outcome execution contract.
created_at: 2026-08-03
---

# `/go v2` Goal: 通用结果责任执行契约

## Outcome

`/go` becomes an explicit execution mode for already-aligned work: within existing authority, the agent owns the outcome, recovers relevant standards, selects a task-appropriate method, proves completion at the same scope as the claim, cleans up direct task residue, and leaves zero or one Pickup action.

## Motivation

The current skill correctly enforces outcome ownership, first-user verification, cleanup, and a usable handoff, but treats one development method—light TDD, backend/frontend sections, canonical test commands, and commits—as the universal workflow. Real use across repository work, system configuration, documents, research, product review, data analysis, and outward-visible actions needs the same core discipline without pretending every task is software development.

## Scope

In scope:

- Replace the development-shaped `SKILL.md` with a thin, eight-step execution core.
- Move development doctrine behind an on-demand method pack and add six other project-agnostic policy-delta packs.
- Align GDD, Pickup, mindset, Simplify, closeup, handoff, README, and plugin metadata boundaries.
- Bump every release version field to `0.8.0`, validate the package, and commit locally.

Deferred:

- Push, PR, marketplace refresh, or installed-client refresh.
- Renaming `/go`, changing the marketplace category, or broadening `my-simplify` beyond code.
- Adding generic checklists or scripts when static contract validation is sufficient.

## Product Experience (PX) & Mental Model

Explicitly invoking `/go` means: “this outcome is aligned; take responsibility for reaching the real terminal state.” The human should not need to prescribe the method or repeat standards already available in the environment. The agent asks only when a discovery changes the outcome shape, authorization, irreversibility, or outward-visible consequences. The handoff leads with what is true now and requires at most one human action.

## Design

### Surface

- Invocation is explicit-only. Generic implementation, research, writing, or configuration requests do not silently trigger `/go`.
- The execution contract is `Outcome + Proof + Boundary + Pickup`.
- Pickup is explicitly zero or one action; zero is valid when the delivered state is already observable.
- A shaped GDD goal is authoritative when present. Lightweight tasks use an in-memory contract and do not manufacture a goal artifact.
- Publishing, messaging, sharing, deleting, payment, and other outward-visible actions remain outside implicit authority.

### Architecture

`SKILL.md` owns the universal eight-step spine. One primary method pack supplies domain-specific policy and proof; `external-actions` overlays any task that crosses an outward-visible or destructive boundary. Packs carry only preferences and thresholds learned from practice, not a second copy of the universal workflow.

Development-only testing references move under `references/development/`. `my-simplify` remains code-only and is loaded by the development pack. `/go` cleans direct task residue; `closeup` remains responsible for post-ship session lifecycle.

## Definition of Done

### Acceptance Scenarios

| Scenario | Expected route and pass criteria |
|---|---|
| Generic request without `/go` | Does not match the explicit-only trigger. |
| Explicit repository feature | Loads `development`; conditionally uses light TDD, canonical project checks, UI evidence when relevant, code Simplify, and a local commit; never infers push authority. |
| Explicit non-Git system configuration | Loads `system-config-and-ops`; proves provenance, precedence, startup contexts, reversibility, isolated smoke, and cleanup without inventing tests or commit noise. |
| Explicit document edit | Loads `document-and-writing`; recovers intended expression and agreed scope, makes only the local edit, and verifies readback or rendered output. |
| Explicit research, product, or data task | Loads the matching pack and uses source freshness, rendered evidence, or coverage/provenance rather than substituting generic tests. |
| External mutation | Adds `external-actions`; stops when exact target or authorization is missing, otherwise records the operation receipt and verifies the postcondition. |
| Implementation discovery | May change the local method and evidence plan; must escalate before changing Outcome, Boundary, authority, or irreversible consequences. |
| Pickup already satisfied | Reports zero actions instead of manufacturing a verification step. |

### Hard Gates

- Main `/go` instructions remain thin; domain checklists live only in on-demand references.
- All Markdown references resolve after the development-reference move; no live reference relies on old numbered `/go` sections.
- Skill frontmatter and display metadata state explicit invocation and the new outcome contract.
- All five release version fields equal `0.8.0`; Kimi marketplace schema version remains `2`.
- JSON, YAML/frontmatter, link checks, `git diff --check`, scenario review, and final repository status pass.
- The approved backlog and this goal ship in the requested local commit; nothing is pushed.

## Pickup

### User role

Skill owner receiving a completed local methodology-plugin upgrade.

### Pickup action

None. The clean local commit is the delivered state; inspecting the commit is optional review, not required setup.

### Staging required

- **Agent-scriptable:** implement the skill and metadata changes, validate them, mark this goal done, and create the local commit.
- **Human-only:** none for this milestone. Publishing and client refresh are explicitly deferred, not blocked.

## Decisions

- [resolved] `/go` is explicit-only.
  Reason: it is a high-agency responsibility mode, not the default interpretation of every task-shaped request.

- [resolved] Ship seven compact policy-delta packs.
  Reason: each captures recurring personal standards from real work; none should repeat generic execution procedure. `external-actions` is an overlay rather than a primary task domain.

- [resolved] Lightweight tasks use an in-memory contract.
  Reason: GDD artifacts are valuable for shaped milestones but would add ceremony and filesystem residue to small tasks.

- [resolved] Method selection stays inside `/go` by default.
  Reason: `mindset` is useful when method or grain is genuinely ambiguous, but a hard dependency would add context and indirection to clear tasks.

- [resolved] Polish is universal; `my-simplify` remains development-specific.
  Reason: non-code work needs resulting-state cleanup, while the existing sibling skill is intentionally a code-diff reviewer.

- [resolved] Commit belongs to development; publishing remains separately authorized.
  Reason: Git is not universal, and push/PR/merge are outward-visible operations.

- [resolved] Pickup is zero or one action.
  Reason: requiring exactly one action manufactures work when the result is already delivered; requiring more than one reveals incomplete staging.

## Validation Evidence

- JSON manifests parse successfully; every skill frontmatter and `agents/openai.yaml` parses as YAML.
- The five release version fields are exactly `0.8.0`; Kimi marketplace schema remains `2`.
- Changed Markdown links resolve, including development references after relocation.
- Fifteen static contract assertions cover explicit invocation, in-memory contracts, zero-or-one Pickup, discovery boundaries, each primary pack's proof policy, the external overlay, and README routing.
- `git diff --check` passes; live skill files contain no references to the old numbered `/go` sections or former development-reference paths.
- Publishing and client refresh remain deferred by decision; this milestone ends at one clean local commit.
