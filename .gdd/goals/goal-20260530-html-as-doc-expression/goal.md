---
title: html-as-doc-expression
status: done
desc: html-as-doc 表达系统 v2 — 语义渐变色彩 + 内容优先重校准（type/宽度/讲解深度），在 styling(T1/T2)+build(T3) 之上
created_at: 2026-05-30
---

# HTML-as-Doc 表达系统 v2 Goal：色彩 + 内容优先重校准

在已 ship 的 styling（T1 doctrine / T2 primitives）与 build（T3 pipeline）之上，叠加两件事：① 一套语义渐变**色彩系统**；② 把 type / 密度 / 宽度 / 讲解深度从"apple 视觉优先"重锚到"技术文档阅读纪律"。六项增量高度耦合（共改 `component-styles.css` + `SKILL.md` + exemplar），作为一个 milestone 一次落地。

## Outcome

完成后以下为真：

1. **`component-styles.css` 携带新表达层**：
   - **内容优先 type ladder**（全派生）：`--t-xs 13 / sm 15 / base 18 / md 20 / lg 21 / xl 23 / 2xl 26 / 3xl 29 / display 40`，新增独立 `--t-eyebrow 22`（不再绑 `--t-xs`），`--lh-relaxed 1.6`。
   - **单一阅读列**：content width == prose width（≈720）；正文/标题/stat/表格/图/网格共享同一宽度，左右边缘对齐。
   - **16 个语义 `--grad-*` token**（9 语义族 + alt）+ `.grad` 工具类；宽弧用 `in oklch` 防脏。
   - **媒体/网格组件**：`.scene`（图填充 + scrim 叠标签）与 `.capcard`（图在上 + 标签在下，用于自带角标的图）两种 media 卡排法；`.figure { margin:0 }`（清 UA `margin-inline:40px`）。
   - 保留 `.shiki` 取色规则（高亮依赖，勿删）。
2. **`SKILL.md` 携带改写后的 doctrine**：§5/§6 重写为**两轴锚**（FORM=apple 配色/克制/组件；DENSITY=技术文档阅读纪律）；新增成文规则——色彩三通道 + 一屏一焦点、grid/bento/image 三判据、form≠depth（体量上限只约束 handoff）、单列对齐、`figure` 边距 reset、research/image mindset 要喂机制级深内容。
3. **新增 `references/gradient-defs.html`**：icon 描边 `<linearGradient>` 片段（嵌入 `<body>` 顶部，`stroke="url(#…)"` 引用）。
4. **`exemplar-v5` 被 `exemplar-v6` 取代**：v6 体现全套（内容优先尺度 + 语义渐变 + grid/image + 单列 + 深讲解范例 + shiki 高亮 + 图片 WebP 内联）。
5. **Plugin 0.14.0 → 0.15.0** 跨所有 manifest（含 Codex 多 target）。

## Motivation

第一篇深度 dogfood（TML Interaction Models 解读）暴露了一个**地基矛盾**：skill 把字号/密度/宽度/讲解深度都锚在 apple.com **视觉优先**范式上，但本 skill 的真实用途是**内容密集的 doc**。这条潜在偏置同时坑出三类问题：

- **字号偏小**：body 15px、display 56px、section gap 128px 是 marketing hero 的尺度，长文阅读吃力、巨标题抢内容空间。
- **讲解被压浅**：apple 美学 + §2 体量上限（2200 行）+ §9「一屏滚完」+ §1 medium-only 合力形成"简洁偏置"，深 explainer 被无形压扁。
- **宽度割裂**："容器 1040 + 正文 cap 720"的双宽度，正文窄、stat/表格铺满，右边缘对不齐。

同时另一条线：颜色单调——apple 骨架克制是对的，但缺少 apple 真正承载色彩的通道（渐变焦点 / glyph 描边 / 影像）。

不做的代价：每篇新 doc 都被同一条偏置坑（浅、小、割裂），且无色彩纪律可循。做完之后：**FORM 继续 apple、DENSITY 锚内容优先**，agent 渲染密集内容自动出"可读 + 对齐 + 有焦点色彩"的形，且知道"该讲多深由材料决定"。

为什么现在：六项已在本轮充分 dogfood（workflows / rokid / r1 / tml 深浅版五篇均过现有 build），type scale 经实时面板由人逐档锁定，单列对齐与 figure-reset 经 `getBoundingClientRect` 实证（所有块左右边缘唯一值）。实现风险已清零，只剩落地。

## Scope

### In

- `component-styles.css`：全派生 type ladder + `--t-eyebrow` + 单列宽度 + 16 `--grad-*` + `.grad` + `.scene`/`.capcard` + `.figure{margin:0}`；保留 `.shiki` 规则。
- `SKILL.md`：§5/§6 两轴锚改写；色彩通道 / grid·image / form≠depth / 单列 / figure-reset / 深内容 mindset 成文。
- 新增 `references/gradient-defs.html`。
- `exemplar-v5` → `exemplar-v6`（删旧加新）。
- 版本 bump 0.14.0 → 0.15.0（所有 manifest，含 Codex 多 target）。

### Out（推迟 → backlog，除注明外）

- **dark theme**——本轮锁 light。
- **chart / 第四视觉层**（数据可视化）——长期 backlog。
- **visual-regression harness**（Playwright 截图回归）——延续上一轮 deferred。
- **build.mjs / §11 mermaid / §3 三层**——本轮**不碰**（色彩是 author-time CSS、无 build 改动；图片内联与 shiki 高亮已覆盖新文档，实证五篇均过）。
- **media-breakout track**（图故意比正文宽）——**直接砍，不入 backlog**（与单列对齐矛盾，无正当理由）。
- **type-scale tuner 面板**——本轮一次性调试工具，数值已锁，不入 skill、不入库。

## Product Experience (PX) & Mental Model

### Agent 写作心智

- **两轴分离**：要"克制/高级"取 apple（配色、留白、组件、一屏一焦点）；要"密度/可读"取技术文档（18px 正文、克制标题、紧凑节奏、单一阅读列）。
- **色彩走三条受控通道**：渐变焦点（一屏一个，按语义取 `--grad-*`）、glyph 描边渐变、影像；骨架永远黑白灰 + 单一蓝 accent。**色彩不是内容**——没有真图就别用饱和面板冒充。
- **grid/bento 三判据**：是概览（正文兜底，删掉信息不丢）＋ 有真实图 ＋ 是值得并排扫的同级 peer，三者皆满足才用；否则退回正文/列表/等宽文字 grid。
- **form ≠ depth**：视觉克制只管表达；explainer 该讲到材料应有的深度。dogfood/research 时喂**机制级讲解**，不是 bullet 摘要。

### 人的心智 & 锚点

输出是"技术文档的阅读体验 + apple 的克制质感"：单一阅读列、18px 舒适正文、每节一个渐变焦点、真实影像承载色彩。**robust without per-doc tuning**——写内容自动出可读 + 对齐 + 有焦点的形。

## Design

### Surface

**`component-styles.css`** 增量（在现有 TOKENS / T2 / T1 三段基础上）：
- TOKENS：type ladder 全档改值 + 新增 `--t-eyebrow`；新增语义色块 `--grad-focus/tech/growth/innovation/creative/electric/rainbow/friendly/energy/passion/attention/attn-soft/critical/warm/neutral`（16，9 族）；单列变量（content==prose≈720）。
- 组件：`.grad`（背景裁切文字）；`.scene`（图填充 + 底部 scrim + 标签，用于无角标图）；`.capcard`（图上 + 文字下，用于自带角标图）；`.figure{margin:0; …}`。
- 保留：`.shiki` 双主题取色规则。

**`SKILL.md`** doctrine 增量：§5/§6 两轴锚改写；色彩三通道 + 一屏一焦点；grid/bento/image 三判据 + 两种 media 卡排法 + "删网格信息不丢"可证伪测试；form≠depth + 体量上限语义（只约束 handoff）；单列对齐；`figure` reset；research/image mindset（找真图、喂深内容）。

**`references/gradient-defs.html`**：icon 描边 `<linearGradient>` 片段（与 `lucide-symbols.html` 并列的可嵌入片段）。

**`exemplar-v6`**：体现全套的 canonical 校准件。

### Architecture

- **两轴锚 = 本 milestone 的脊柱**：把"表达克制（form）"与"内容密度/深度（density）"显式分离，分别锚 apple 与技术文档纪律。这条分离消除了"apple=字少=讲浅=窄"的潜在耦合（根因）。
- **单一阅读列消除双宽度**：content width 由容器决定且 == prose width，所有块填同一列 → 边缘对齐不可破（make-misalignment-unrepresentable）。
- **色彩三通道是加性层**：渐变/描边/影像叠在既有灰阶 + 蓝 accent 骨架上，不改 §3 三层 / §11 mermaid / T3 build。
- **build 解耦确认**：新增全是 author-time CSS/inline-SVG/`<img>`，现有 build（shiki + WebP 内联）原样覆盖；唯一耦合是 `.shiki` 取色规则须保留。

## Definition of Done

### Acceptance Scenarios

1. **新内容渲染**：用 0.15.0 skill 渲染一段内容 → 输出嵌新 component-styles：内容优先尺度（base18 / eyebrow22 / h1-40 / 行高1.6）、单一阅读列（各主要块 `getBoundingClientRect` 左右值为唯一）、每节一个语义渐变焦点、`figure` 无 40px 内缩。
2. **密集 explainer**：深 prose + figure + 表格 + stat + media 网格一篇渲染连贯——深讲解 18px 好读、media 卡用真图（无伪渐变面板）、网格是概览且正文兜底、代码经 build 高亮显色。
3. **v6 exemplar 浏览器验收**：打开即体现全套（新尺度 + 色彩通道 + grid/image + 单列 + 深讲解范例 + shiki 高亮 + 图片 WebP 内联）；`getBoundingClientRect` 证各块边缘对齐。

### Hard Gates

- `exemplar-v5` **必删**（非只加 v6）。
- `component-styles.css` 保留 `.shiki, .shiki span { color: var(--shiki-light) }`（高亮依赖）。
- `.figure { margin:0 }` 在位（清 UA `margin-inline:40px`）。
- 单列：content width == prose width，无双宽度；exemplar 边缘对齐实证（唯一左右值）。
- §5/§6 改写为两轴锚；form≠depth + "体量上限只约束 handoff" 成文。
- 16 `--grad-*` + `.grad` + `--t-eyebrow` + 全派生 ladder 在位；新增 `gradient-defs.html`。
- **不碰** `build.mjs` / §11 mermaid / §3 三层。
- **media-breakout 不加**。
- 版本 0.14.0 → 0.15.0 落到所有 manifest（含 Codex 多 target）。

## Pickup

### User role

装了 0.15.0 的 agent session 里的 half-dev-skills dogfooder / 维护者，手上有一段已收敛内容，想用 `/html-as-doc` 出图判断"对不对味"。

### Pickup action

在浏览器打开 `/go` 预渲染好的 **v6 exemplar**（或 goal 文件夹里的 tml 深度版佐证），一眼验收新系统。

### Staging required

- **Agent-scriptable**（`/go` 做）：改 `component-styles.css` + `SKILL.md` + 新增 `gradient-defs.html`；产 `exemplar-v6` 并删 `v5`；版本 bump 全 manifest；**预渲染 v6 跑过 `build.mjs` + 截图 + 跑 `getBoundingClientRect` 边缘对齐不变量**，使 pickup 第一眼即正确。
- **Human-only**：v6 exemplar 的"对味"终判（美学拍板归人；agent 给截图 + 对齐数据 + type 档位呈现）。

## Decisions

- [resolved] 六项增量打包为一个 goal
  Reason: 文件耦合（同改 component-styles + SKILL + exemplar）、dogfood 中一起验证；拆开=双倍处理 + merge 冲突（同上一轮 T1+T2 合并论证）。

- [resolved] 显式重设锚点（两轴：FORM=apple / DENSITY=技术文档纪律），改写 §5/§6
  Reason: 本轮浅/小/割裂全源于"apple 视觉优先"潜在偏置；点名它才防复发（同 §10「实证>约定」的存在理由）。纯增量会留着病根。

- [resolved] 内容优先 type ladder：base 18 / eyebrow 22 / h1(display) 40 / h2(3xl) 29 / 行高 1.6 + 全派生档（xs13 sm15 md20 lg21 xl23 2xl26）
  Reason: 经实时调节面板由人逐档锁定；base 从 15 升到 18 后中间档按比例重推，避免阶梯倒挂（md<base）。eyebrow 独立成 `--t-eyebrow` 以便单独放大不拖大 stat 标签/表头。

- [resolved] 单一阅读列（content width == prose width ≈720），media-breakout 砍除
  Reason: "容器 1040 + 正文 720"双宽度造成右边缘割裂；统一到单列后所有块边缘对齐（`getBoundingClientRect` 唯一值实证）。breakout 与单列矛盾且无正当理由，直接砍。

- [resolved] `figure { margin:0 }` 写进 reset
  Reason: `<figure>` 有浏览器默认 `margin-inline:40px`，是"图比正文宽/内缩"割裂的真凶；reset 此前只清 `p/h2/h3`，漏了 figure。

- [resolved] 语义渐变色盘 = 16 token / 9 语义族，宽弧 `in oklch`
  Reason: sRGB 线性插值跨大色相会经过灰"死区"发脏；oklch 感知均匀、保持饱和。取色自成熟色卡库（uiGradients/WebGradients）+ 公司品牌色，按内容语义归位，非手搓。

- [resolved] 色彩三通道 + 一屏一焦点；骨架保持灰阶 + 单一蓝 accent
  Reason: 实证 apple.com——色彩只走渐变文字焦点 / glyph 描边 / 影像，UI 骨架近乎全灰 + 一个蓝。色彩不是内容，无真图不得用饱和面板冒充。

- [resolved] grid/bento/image 三判据 + 两种 media 卡排法
  Reason: dogfood 中误用过——把纯文字 peer 做成饱和面板装饰。判据：概览（正文兜底，删掉信息不丢）＋ 有真图 ＋ 同级 peer。图自带角标用 `.capcard`（图上字下），无角标用 `.scene`（scrim 叠标签）。

- [resolved] form ≠ depth；§2 体量上限只约束 handoff
  Reason: skill medium-only（不补内容）+ apple 简洁 + 体量上限合力压浅讲解；显式切开"表达克制 vs 讲解深度"，explainer 该讲到材料应有的深度。深 TML 解读渲染高度 ~7850px / 401KB 自包含、读感恰当，证明上限对 explainer 不适用。

- [resolved] research/image mindset 要喂机制级深内容
  Reason: 浅是因为喂了 bullet 摘要；同套设计喂深内容即出深 doc。dogfood/research agent 应产"怎么运作/为什么"的机制级讲解。

- [resolved] exemplar v5 → v6 替换（删旧）
  Reason: v5 按旧尺度、无色彩/grid/单列，会主动误导；单一 canonical 校准件（同上一轮 v4.2→v5 必删）。

- [resolved] build / §11 / §3 不碰；唯一耦合是保留 `.shiki` 取色规则
  Reason: 新增全是 author-time CSS / inline-SVG / `<img>`；现有 build（shiki + WebP 内联）实证覆盖五篇 dogfood，无需改动。shiki 高亮靠 build 注 `--shiki-light` 变量 + CSS 那条规则显色，删了规则会静默失高亮。

- [fact] 当前 plugin version 0.14.0
  Consequences: 本 goal bump 0.15.0（minor，新 doctrine + 组件，向后兼容）。

- [fact] dogfood 佐证留档：tml 深度版（最全，压全要素）+ deepseek-r1（研究形态，验证无 bento 的克制路径）
  Consequences: 收进本 goal 文件夹（`dogfood-tml-interaction-models.share.html` / `dogfood-deepseek-r1.share.html`）作复现与对照；其余三篇不入库。
