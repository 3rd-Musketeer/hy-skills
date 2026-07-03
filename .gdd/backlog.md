# Backlog

Candidate work not yet committed to. One-line items; expand to a brief under `backlogs/` when promotion needs more shape.

## Deferred from `goal-20260528-html-as-doc`

- `/handoff` skill for multi-agent handoff scenarios (name reserved; trigger when multi-agent flows materialize)
- Astro / VitePress / build pipeline for cross-handoff component reuse (decide when 2nd handoff dogfood actually hits authoring friction)
- Cross-handoff `primitives/` library extraction (decide when N ≥ 2 handoffs reuse the same component ≥ 2 times)
Three threads emerged from the 2026-05-29 `/html-as-doc` dogfooding; they are largely orthogonal by technique:

- **T1 + T2 → PROMOTED to [`goal-20260529-html-as-doc-styling`](goals/goal-20260529-html-as-doc-styling)** — assessed compatible (already co-resident, zero-conflict, in validated `component-styles.css`) and merged into one "styling correctness" goal: T1 = apple.com-实证 rule doctrine (no same-level hairlines / `mark`→白粗字 / `eyebrow`→gray / stat 三段式 / 1040 单列左对齐 / CN 无句号 / "实证>约定" process); T2 = structural primitives gap-stack / type-roles / grid-collapse (make-illegal-states-unrepresentable, validated in `spacing-exp/`). Source drafts retained as record: [expression-doctrine](backlogs/backlog-20260529-html-as-doc-expression-doctrine.md) (T1) + asset-pipeline "第二支柱" (T2 A/B experiment archive).
- **T3 → PROMOTED to [`goal-20260529-html-as-doc-build`](goals/goal-20260529-html-as-doc-build)** — optional post-author build pipeline (shiki highlight + sharp WebP compress + base64 inline) with a light-source / self-contained-share two-mode contract; §1/§2 doctrine resolved via b1 (build = compile-time, explicit, post-author — like mmdc, ships nothing to runtime). Validated on dogfood: 2.7 MB naive → 323 KB WebP share.
- **Deferred from the styling goal** (not needed now, revisit on signal):
  - Visual-validation harness (Playwright screenshot regression) — revisit when the skill produces ≥5 real docs and a baseline is worth maintaining.
  - Stylelint `declaration-strict-value` token-lint — cheap magic-number-drift safety net; T2 already makes the structural bugs unrepresentable, so this is optional governance, not correctness.
- **Spike: lighter Mermaid renderer to replace puppeteer-based mmdc (§11)** — ✅ **DONE 2026-05-29 → verdict: keep mmdc, record `mmdr` as escape hatch.** Decision ref: [`refs/2026-05-29-mermaid-renderer-fidelity`](refs/2026-05-29-mermaid-renderer-fidelity/README.md). Reproducible corpus/outputs/gallery at [`refs/2026-05-29-mermaid-renderer-fidelity/spike-mermaid-renderers/`](refs/2026-05-29-mermaid-renderer-fidelity/spike-mermaid-renderers/README.md). Coverage gate: mmdc 8/8, **mmdr (`mermaid-rs-renderer`) 8/8 — passes**, **beautiful-mermaid 5/8 — fails** (hard-rejects gantt/pie/mindmap; the pre-spike "`@rendermaid/core`" was a hallucination — doesn't exist on npm, real pure-JS candidate is `beautiful-mermaid`). mmdr clears fidelity but loses on portability: external Rust binary (not npm-co-located like sharp/shiki), needs a numeric-`fontSize` theme variant (rejects mermaid-standard `"14px"`), partial palette fidelity. Decision: don't swap §11; mmdr is the validated answer to §12's existing "mmdc install breaks → vendor" trigger (browserless full-coverage drop-in for CI/sandboxes). Phase point confirmed — both candidates are author-time tooling swaps; mermaid stays author-phase, T3 build untouched.
- `/pdf-as-doc` / `/slidev-as-doc` or other media-discipline skills (decide when a real non-HTML medium is needed; current N = 1 use case is HTML only)
- AGENTS.md / devlogs entries for this milestone (write only if release notes need them)

## Deferred from `goal-20260530-html-as-doc-expression`

- **Dark-theme color layer** — 本轮锁 light;16 个 `--grad-*` 是 light-tuned,dark 下渐变文字 / glyph 描边的可读性未调。revisit 当真正需要 dark 输出时。
- **Chart / 数据可视化第四视觉层** — 长期 backlog;§3 三层 + §12 已留触发器（SVG fallback ≥2 次 / 抽 chart layer）。本轮色彩系统已就绪、可被其复用（第四层须能消费同一套 palette token 才准入）。

## Other

- **grilling-rewrite** — ✅ **v1 DONE 2026-07-02**：grilling 已从 mattpocock 搬运件重写为本人实证风格（brain-test 推演找模糊边界 + outline 先行 + 一次只问一题带选项/分析/推荐 + 三种提问能量配额 + 追问入队不追杀 + decide/probe/backlog 三态分流 + 产物落地 + 问空停止）。实证归纳 + 本人口述纠正 + 默认值取值记录见 [`backlogs/backlog-20260702-grilling-rewrite`](backlogs/backlog-20260702-grilling-rewrite.md)。现进入 dogfood 迭代循环——体验后的手感问题回写 brief。
