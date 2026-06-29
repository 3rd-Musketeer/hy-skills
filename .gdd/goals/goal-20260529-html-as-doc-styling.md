---
title: html-as-doc-styling
status: done
desc: Correct html-as-doc styling via apple.com-empirical rule doctrine (T1) + structural CSS primitives (T2), shipped as one component-styles.css + v5 exemplar
created_at: 2026-05-29
---

# HTML-as-Doc Styling Correctness Goal

合并 T1（rule-level expression doctrine）+ T2（结构性 styling primitives）为一个 milestone。两者已在验证过的 `spacing-exp/combined` + `component-styles.css` 里零冲突共存，拆开只会双倍处理同一批文件（详见 Decisions 的合并论证）。T3（asset/build pipeline）保持独立 goal。

## Outcome

完成后以下为真：

1. **`references/component-styles.css` 存在且是 skill 的样式契约**：一份可 paste 的组件库，按 ownership 分三段——
   - **TOKENS**（共享）：`:root` palette / spacing scale / type scale。
   - **T2 · PRIMITIVES**：gap-stack（容器 `flex+gap` 拥有块间距，子元素不写 block margin）、type-roles（6 个 role 各一处锁死 size+leading+tracking，含 `.t-*` utility）、grid-collapse（`[data-cols]` 经 `--cols` 同载桌面列数 + 单规则塌缩）。这三条让一整类 spacing / type / responsive bug **不可表达**。
   - **T1 · COMPONENTS**：无法被结构强制的规则样式——`mark` 白粗字（无底色）、`eyebrow` gray、`.compare` 数值右对齐 + tabular-nums + thead 灰 uppercase + 无行 hairline、inline `<code>` 浅灰圆角 chip、`.stat` 三段式 center。

2. **SKILL.md 携带校正后的 expression doctrine**：3 条反复犯的规则（容器架构 / stat 三段式 / 同级禁 hairline）+ "cheapest = correct" 的 primitive 写作约定 + "实证 > 约定" process 规则 + §12 marketing-style reversal 一行。

3. **`exemplar-v4.2-apple.html` 被 `exemplar-v5` 取代**：新 exemplar 同时体现 T1 规则 + T2 primitive（v4.2 的 mark 蓝底 / 满地 hairline / eyebrow accent 已被本轮 apple.com audit 推翻）。

4. **`typography-tokens.css` 微调**：删 `--hl-bg`（mark 不再用底色），eyebrow 默认色 → secondary。

5. **Plugin version 0.12.0 → 0.13.0** 跨所有 manifest（含 Codex 多 target）。

## Motivation

第一篇非平凡 dogfood doc（LifeDialBench explainer，含真实论文 figure / JSON schema / 结果矩阵）逐条暴露了 v4.2 doctrine 的视觉问题，且更深地暴露两类病根：

- **rule 病根**：v4.2 的 hairline / mark 蓝底 / eyebrow accent 三条从没回 apple.com 验证过，是上一轮 dogfooding 自循环口耳相传的产物，一查全站不住（→ T1 + "实证>约定" process 规则）。
- **结构病根**：spacing 靠"每个 element 各自声明 margin"，相邻间距是涌现的脆弱结果（meta→quote 渲染成 0px）；type 的 size+leading+tracking 三元组能自由乱配；每个多列 grid 要手配 mobile 孪生，忘了就裂（→ T2 三条 primitive）。

不做的代价：每篇新 doc 都要 agent 重新踩同一批 spacing/type/responsive 坑 + 重新犯同一批 apple-idiom 错误。做完之后：**"最省 token 的写法 = 正确的写法"**——agent 套 role / 塞 stack / 写 `data-cols` 就自动正确，弱模型 / 短 prompt 也不易错；T1 覆盖结构管不到的视觉规则。

为什么现在：T2 三条 primitive 已在隔离 sandbox 全部实现 + 实证（`getComputedStyle` + 截图双证），`component-styles.css` 已抽出并用外链重渲染验证像素一致——**T2 实现风险已清零**；T1 的规则 + 弯路 + apple.com 实证也已在 draft 里收敛完毕。两者都 ready，且共享 `component-styles.css` + exemplar，此刻合并落地边际成本最低。

## Scope

### In

- 新增 `references/component-styles.css`（TOKENS + T2 primitives + T1 components，ownership 分段标注；以 `spacing-exp/component-styles.css` 验证版为基底）。
- SKILL.md 编辑：§6/§7 加 3 条 expression doctrine + cheapest=correct primitive 写作约定；§9 加 "实证>约定" process 规则；§12 加 marketing-style reversal 一行；§5/§7 引用 component-styles.css。
- `references/typography-tokens.css` 微调（删 `--hl-bg`；eyebrow 默认 → secondary）。
- `exemplar-v4.2-apple.html` → `exemplar-v5-*.html` 替换（删旧、加新）。
- Plugin version bump 0.12.0 → 0.13.0（所有 manifest，含 Codex 多 target）。

### Out（deferred → backlog）

- **Visual-validation harness**（Playwright 截图回归）：用户明确"现在不一定需要"。本 goal 的 DoD 用 `getBoundingClientRect` 不变量（T2）+ 手动/截图 apple.com 审计（T1）即可，不建自动回归 infra。
- **T3 · asset/build pipeline**（image inline / WebP compress / source-build mode / shiki highlight 脚本 + §1/§2 doctrine 张力）：独立 goal，near-zero 耦合。
- **`references/shiki-theme.json` build-config + highlight.mjs 脚本** → 随 T3 走（本 goal 只保留 `.shiki` dual-theme CSS 在 component-styles.css，已验证；不 ship 没有脚本消费的 orphan config）。
- **Stylelint `declaration-strict-value` token-lint**：T2 已让结构 bug 不可表达，lint 只抓 magic-number drift（另一个更低价值的问题），本 goal 不需要 → backlog。
- 自定义 component-level HTML lint：拒绝（false positive 太多）。
- 其他 skill（gdd / refactor / go 等）的改动。

## Product Experience (PX) & Mental Model

### Agent 写作心智（最关键）

**cheapest = correct**：

- 加一段正文 → 塞进 section stack，**零 spacing CSS**，自动正确间距。
- 加标题 / 大数字 → 用 `<h1>` 或 `.t-display`，三元组自动锁定，配不错 leading/tracking。
- 加多列区 → 写 `data-cols="N"`，桌面列数 + mobile 塌缩一起来。
- 强调 inline → `<mark>`（白粗字）/ overline → `.eyebrow`（gray）：语义即样式，不用记 hex。

Agent 不再需要做 pairwise margin 配平、不再需要记 mobile 断点、不再需要查 apple idiom——最省 token 的写法恰好是对的。

### 人的心智 & 锚点

输出是 **apple.com specs 页**的观感（单列左对齐、留白分组、数字本身承担权重），而非 marketing 页的错位居中。**robust without per-doc tuning**：写内容自动出形，不需要每篇手调 spacing。锚点是 apple.com 的 specs / compare 页，不是 hero 营销页。

## Design

### Surface

**`references/component-styles.css`** —— skill 的样式契约，三段 ownership：

- **TOKENS**：palette（`light-dark()`）/ `--s-*` spacing / `--t-*` type scale / `--lh-*` / `--ls-*`。
- **T2 PRIMITIVES**：
  - gap-stack：`main`/`header`/`section` = `flex; flex-direction:column; gap:<token>`；`h1,h2,h3,p { margin:0 }`；逃生门 `calc(target − stackGap)` 处理故意不均匀（如 `section > h3 + *` 贴紧）。
  - type-roles：`h1,.stat strong,.t-display` / `h2,.t-title` / `h3,.trio article h3,.t-subtitle` / `.lead,.t-lead` / `.caption,.stat span,.trio article p,.t-caption` / `.eyebrow,.eyebrow-sm,.stat-label-row,.t-eyebrow`，每个 role 一处锁死三元组；`.t-*` 供新内容显式套用。
  - grid-collapse：`.grid[data-cols] { grid-template-columns: repeat(var(--cols),minmax(0,1fr)) }` + `[data-cols="N"]{ --cols:N }` + `.trio{ --cols:3 }`；单条 `@media(≤780){ .grid[data-cols],.trio{ --cols:1 } }`。display role 同档降到 `--t-3xl`（消除旧 `h1 42px` magic number）。
- **T1 COMPONENTS**：`mark`（白粗字无底）、`.eyebrow{color:secondary}`、`.compare`（数值右对齐 tabular-nums / thead 灰 uppercase 单下边界 / 无行 hairline / winner 不染色）、`:not(pre)>code`（chip）、`.stat`（三段式 center）、`.note`/`.figure`/`.dialog`/`.qa-card` surface。

**SKILL.md doctrine 增量**（§6/§7 ≤3 段 + §9 1 段 + §12 1 行）：见 Outcome #2。

**exemplar-v5**：一篇同时演示 T1 规则 + T2 primitive 的 calibration doc（agent 实际抄的东西，比文字更高杠杆）。

### Architecture

- **架构脊柱 = make illegal states unrepresentable**：T2 把"相邻塌 0 / 三元组乱配 / 忘 mobile 孪生"三个脆弱自由度从设计空间移除，而非事后 lint。T1 覆盖无法结构化的视觉规则（hairline / 色值 / 对齐意图）。两层互补：T2 让一部分规则结构上不可违反，T1 写其余。
- **容器架构 seam（T1↔T2 唯一交界）**：T1 意图（`main` 1040 单列左对齐 / 禁负 margin / 禁 `margin-inline:auto`）与 T2 机制（`flex column + gap`）**同一 `main` rule block 共存**（已验证，零冲突），一次做完。
- **eyebrow 声明级分层**：typography（T2 role 规则）与 color（T1 组件规则）落在不同 rule block、选择器交叠、靠 cascade 加性叠加——关注点分离，非冲突。
- **两条独立 DoD workstream**：T1 = apple.com 视觉审计；T2 = `getBoundingClientRect` 不变量。合并 goal 内部不混验。

## Definition of Done

### Acceptance Scenarios

1. **Agent 用升级后的 skill 渲染新内容** → 输出引用 component-styles.css：垂直 stack（无 per-element margin）、type role、`data-cols` grid。渲染后：相邻块无 0-gap、`h1` 与 `.stat strong` 计算样式一致、≤780px 多列经单 `--cols` 规则塌成 1 列、同级无 hairline、`mark` 白粗字、`eyebrow` gray、表格数值右对齐。

2. **exemplar-v5 浏览器验证**：(T2) `getBoundingClientRect` — stack 各对间距非零且一致、`h1==.stat strong` 三元组、`data-cols`/`trio` ≤780 塌缩；(T1) 视觉审计 — 同级无 hairline、mark 白粗、eyebrow gray、数值列右对齐 tabular-nums、单列左对齐无居中无负 margin。

3. **cheapest=correct 回归**：往用 component-styles.css 的 doc 里加一个新标题 / 新 grid / 新正文段，**零 spacing/type CSS** 即正确（间距、leading/tracking、mobile 塌缩全自动）。

### Hard Gates

- `exemplar-v4.2-apple.html` 必须**删除**（不是只加 v5）。
- `--hl-bg` 必须从 typography-tokens.css **删除**。
- Version bump 落到所有 manifest（含 Codex 多 target）。
- **不建** visual-regression harness（Playwright）——显式 deferred。
- **不碰** T3 build pipeline（`<img>` 内联 / WebP / shiki 脚本 / §1/§2）。
- component-styles.css 三段 ownership 注释必须在位（防 T1/T2 后续互相 clobber）。

## Pickup

### User role

half-dev-skills 维护者 / dogfooder，在装了 0.13.0 的 agent session 里，手握一段已收敛内容，用 `/html-as-doc` 渲染并判断输出对不对味。

### Pickup action

对一段内容调用 `/html-as-doc`（或直接在浏览器打开 `references/exemplar-v5`），确认 doctrine + primitive 已生效。

### Staging required

- **Agent-scriptable**（`/go` 做）：从验证过的 `spacing-exp/component-styles.css` 落地 `references/component-styles.css`；写 SKILL.md 的 doctrine/process/reversal/cheapest 增量；产 exemplar-v5 并删 v4.2；改 typography-tokens.css；version bump；**预渲染 exemplar-v5 + 跑 `getBoundingClientRect` 不变量检查 + 截图**，使 pickup 第一眼即正确行为。
- **Human-only**：对 exemplar-v5 的 apple.com "对味"终判——是否够格成为 canonical exemplar（agent 可截图呈现 + 给出不变量数据，但美学拍板归人）。

## Decisions

- [resolved] T1 + T2 合并为一个 goal（T3 独立）
  Reason: 两者已在验证过的 `component-styles.css` / `combined/doc.html` 里零冲突共存（`main` rule block 同处 T1 意图 + T2 机制；eyebrow 靠 cascade 分层）；共享 component-styles.css + exemplar，拆开 = 双倍处理 + merge conflict + 重验证；T2 单独 ship 用户价值低（无 T1 doctrine，agent 照样犯 hairline/mark/eyebrow 错）且留半成品 CSS。
  Consequences: 一个 goal、两条独立 DoD workstream；容器架构 seam 一次做完。

- [resolved] grid 用 Option A（`data-cols` + `--cols` 塌缩），不用 auto-fit
  Reason: 语义列数（4 个 system / 3 个概念）是 content signal 不是噪音；auto-fit 摧毁它且引入 per-instance min-width 这个更高频脆弱。
  Consequences: 不加中间档，干脆 4→1（单页 doc 手机 1 列最稳）。

- [resolved] Defer visual-validation harness（Playwright 截图回归）
  Reason: 用户指令；DoD 用 `getBoundingClientRect` 不变量（T2）+ 手动/截图 apple.com 审计（T1）已足；当前 doc 量下 infra cost > 收益。
  Consequences: T1 的视觉验收依赖人 + agent 截图，非自动 diff；doc 量上来后可回 backlog 取。

- [resolved] `.shiki` dual-theme CSS 留 component-styles.css；`shiki-theme.json` build-config 随 T3 走
  Reason: theme token 没有 highlight 脚本（T3）就无消费者，本 goal ship 它 = orphan config；`.shiki` CSS 规则已在验证版里、可独立成立。
  Consequences: 与 A-draft item #5 略有出入（已记录）；T3 落地时补 build-config。

- [resolved] Stylelint token-lint defer → backlog
  Reason: T2 让结构 bug 不可表达；lint 只抓 magic-number drift（不同且更低价值的问题），非本 goal 正确性所需。

- [resolved] T3 保持独立 goal
  Reason: near-zero 耦合（只碰 `<img>`/`<pre>`）；仍卡在 SKILL.md §1「not a build system」/ §2「禁 build pipeline」的 doctrine 张力，需先解。

- [fact] component-styles.css 基底已在 `spacing-exp/` 抽出并 link-验证（15.7KB，外链重渲染像素一致）
  Consequences: T2 实现风险 ~零；`/go` 主要是 copy + 整合 + 写 T1 规则 + 产 exemplar。

- [fact] 当前 plugin version 0.12.0
  Consequences: 本 goal bump 0.13.0。

- [fact] T1 的 apple.com 实证已完成（截图存 `/tmp/apple-*.png`，详见 expression-doctrine draft）
  Consequences: doctrine 规则措辞有 ground-truth 支撑，`/go` 不需重新 audit；但新 exemplar 的"对味"终判仍归人。
