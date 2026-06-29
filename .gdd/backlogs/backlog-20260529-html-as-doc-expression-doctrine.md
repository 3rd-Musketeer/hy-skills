---
title: html-as-doc-expression-doctrine
status: drafted
created_at: 2026-05-29
appetite: normal
---

# Draft: html-as-doc 的 expression doctrine 校正（apple.com 实证 + 结构稳定）

> 素材积累稿，非定稿。来自 2026-05-29 `/html-as-doc` dogfooding（LifeDialBench benchmark explainer）。这一轮长出 **三条线**，本稿是其中的 **T1 · expression doctrine（rule-level）**。
>
> **三线分工**（详见 `.gdd/backlog.md`）：
> - **T1（本稿）** = 无法被结构性强制的 **规则** + exemplar + process：禁同级 hairline / `mark`→白粗字 / `eyebrow`→gray / stat 三段式 / 1040 单列左对齐（作为 *布局意图*）/ CN 无句号 / 实证>约定。
> - **T2 = 结构性 styling primitives**（gap-stack / type-roles / grid-collapse），已在 [asset-pipeline backlog](backlog-20260529-html-as-doc-asset-pipeline.md) 的"第二支柱"里用 A/B 实验做成熟。**T2 自己的 Tier-3 明确把 hairline/mark/eyebrow 划给"SKILL.md 规则"= 本稿 T1**——所以 T1 与 T2 是**互补两层**（T1 写规则，T2 让一部分规则结构上不可违反），不是重叠。
> - **T3 = asset/build pipeline**（image/shiki/source-build + §1/§2），同 asset backlog 的 Pillar 1。与 T1/T2 耦合近零。
>
> ⚠️ **本稿早期版本误把 gap-primitive / Stylelint 当作 A 的内容**——那些是 T2，已在下文 cede 给 T2。本稿只保留无法结构化的 rule-level 内容。**唯一与 T2 的交界**：容器架构——T1 定"1040 单列左对齐"的意图，T2 的 gap-stack 是实现机制，需协调（见文末「与 T2 的边界」）。

## Friction（触发问题）

第一篇非平凡 doc（含真实论文 figure、JSON schema、结果矩阵表）渲染出来后，逐条暴露了 `goal-20260528` 那版 doctrine（即 exemplar v4.2 的特征）的多处视觉问题：

1. **代码块无高亮**：~10 个 JSON 块全单色，但 JSON shape 是 load-bearing content，不是装饰。（注：高亮的**实现**归 B 的 build pipeline，本稿只确立"代码该高亮"的 doctrine + 静态 theme token。）
2. **markdown 残留**：body 里出现字面反引号 `` `data/EgoMem.json` ``，agent 把 markdown 习惯带进了 HTML。
3. **stat 同宽 + 信息排布怪**：等宽 grid 把 `165,795` 和 `12` 一字排开，视觉权重错位；试图用 hero 卡差异化反而更糟。
4. **表格排版**：数值列左对齐、难扫；winner 用 accent 蓝 tint 是冗余信号。

更深的问题：**v4.2 doctrine 里 hairline / mark 蓝底 / eyebrow accent 三条都没有 ground-truth check**——它们是上一轮 dogfooding 自循环沉淀的，从没回 apple.com 验证过。这一轮一查就发现三条都站不住。

## 决策过程（怎么收敛的，含走过的弯路）

这条线收敛得很曲折，弯路本身是有价值的 doctrine 证据，全部记下：

### 第一阶段 · 组件级修复

| 点 | 错误起点 | 收敛 | apple.com 实证 |
|---|---|---|---|
| stat hero | 给 RAG 加灰底卡 + 其余裸文本（异构混搭） | 取消差异化，4 列同质化 | Mac compare 页：MacBook Pro（最强）和 Neo（最弱）列**完全等量齐观**，零差异化，靠数字本身说话 |
| stat 形状 | 巨号 "Benchmark" + 一整句中文描述 | 巨号必须配 tiny 短词/数字标签；配整句改 `.trio`（h3+p 子段） | Mac compare：tiny "From" + 巨号 "10-core" + tiny "CPU" |
| hairline | `.stat`/`.step`/`.compare tr` 每行 `border-top` | 同级之间禁 hairline，只在 section 边界画 | specs 页：hairline 只分隔 section（Size and Weight ↔ Display），section 内并列项纯留白 |
| `<mark>` | 蓝底 highlight（`--hl-bg`） | 白字加粗 inline | iPhone 17 Pro 营销页："best-ever iPhone battery life" 是 gray body 里的白粗字，无底色 |
| `.eyebrow` | accent 蓝 | secondary gray | "COMPARE ALL MODELS" / "WHY MAC" 都是灰 uppercase，accent 留给链接/CTA |
| 表格 | 数值左对齐、winner 染蓝、每行 hairline | 数值 right-align + tabular-nums、winner 不染色、thead gray uppercase + 单根下边界 | Mac compare thead 低对比灰 uppercase，注意力推向数字 |
| inline code | markdown backtick | `<code>` + 浅灰底圆角细边 | — |

### 第二阶段 · 容器架构（最曲折，三次试错）

| 版本 | 做法 | 结果 | 判定 |
|---|---|---|---|
| v1 | `main 980` 单列（原始） | stat/hairline 问题盖过架构感知 | 基线 |
| v2-试1 | `main 1200` + prose 收 820 **左对齐** + figure 用负 margin 突破列宽 | 右侧 380px 大白，"怪怪的" | ✗ 负 margin 是补丁 |
| v2-试2 | `main 1200` + **heading 左 / body 居中**（模仿 Apple 错位） | 一些左一些中，"割裂" | ✗ |
| **最终** | `main 1040` 单列，**全部左对齐取列宽**，无 prose 收窄、无 margin auto、无负 margin | 视觉一致，用户"对味了" | ✓ |

**关键洞察**：Apple 营销页确实是"heading 贴左 + body 居中"的刻意错位（apple.com.cn 实测：h2 "设计" 在 `left 78`，body p 在 `left 260 / right 260` 居中），且 media full-bleed（hero video `width 1440 / left -95` 比 viewport 还宽）。**但那套排版必须 per-section hand-tune spacing 才不崩**。我们要做的是"写内容自动出形"的模板系统，没有 hand-tune 预算，所以**主动放弃 marketing 错位，选 specs 式单列左对齐**——trade-off 是失去 marketing 层次感，换 robustness。这个换很划算。

### 第三阶段 · locale 标点

apple.com.cn 实测：h1/h2/h3（设计 / 性能 / 先刷重点 / iPhone 17 Pro）**全部不带句号**，但 body 段落**带句号**（"电池续航也大大突破"）。英文营销标题反而带句号（"Get the highlights."）。规则：**CN title/subtitle/eyebrow/label 不加句号，body 段落是 house-style 选择**。本 dogfood doc 段落短、像"标签块"，最终全删句号。

## Solution shape（升 goal 后要落地的）

按"能写成代码的不写成规则、能从更高原则推导的不单列、没被反复犯错的不进 doctrine"过滤后，**只有 3 条真正反复犯的错值得进 SKILL.md 主体**：

### Doctrine（SKILL.md 新增 ≤3 段）
1. **容器架构**：`main { max-width: 1040px }` + 全部左对齐取列宽；明确**禁止负 margin 突破列宽 + 禁止 `margin-inline: auto` 居中**。这一条覆盖 marketing错位 / hero 偏移 / figure 突破 三类反复犯的错。
2. **stat 形状**：tiny eyebrow + 巨号(≤4 char 或数字) + tiny label 三段式，center 对齐；配整句改 `.trio`；多列同行**禁 hero 差异化**（同质化原则）。
3. **同级禁 hairline**：`.stat` / `.step` / `.compare tbody tr` 之间不画线，只允许 section 边界 / thead-下 / figure 容器边界。

### Artifacts（比文字描述更高杠杆）
4. **新增 `references/component-styles.css`（rule-level 部分）**：把 1-3 的可表达为静态 CSS 的规则 + `<mark>` 白粗字 + eyebrow gray + inline `<code>` + 表格列对齐 / thead 配色 / tabular-nums + CN 标题无句号注释，写成可 paste CSS。**不含** gap-stack / type-role / grid-collapse 这些结构性 primitive——那些是 T2 的产物。两者最终可能 paste 进同一份文件，但 ownership 分开：T1 写 component-level 规则样式，T2 写 layout primitive。
5. **新增 `references/shiki-theme.json`**：代码高亮的静态 token（跟 mermaid-theme.json 同构）。注意：高亮**脚本**（highlight.mjs）归 T3；本稿只提供 theme token + "代码该高亮"的 doctrine 一行。
6. **微调 `references/typography-tokens.css`**：删 `--hl-bg`（mark 不再用 bg），eyebrow 默认色改 secondary。（注意：type-scale token 的 *covariance 锁定* 是 T2 type-role 的事，本稿只动 mark/eyebrow 两个色值。）
7. **exemplar 替换** `exemplar-v4.2-apple.html` → `exemplar-v5-polish-apple.html`：v4.2 已被本轮 audit 部分推翻（mark 蓝底 / hairline 满地 / eyebrow accent 都是 v4.2 特征）。Exemplar 是 agent 实际抄的东西，比 SKILL.md 文字还重要。**注意**：新 exemplar 理想上应同时体现 T1 规则 + T2 primitive，所以 exemplar 是 T1/T2 共享产物——若分开做 milestone，谁后做谁补齐 exemplar 的另一半。

### Process（元教训，1 段写进 SKILL.md）
9. **实证 > 约定**：任何 "Apple idiom" claim 在 polish phase 前必须 audit ≥3 个真实 apple.com 页面验证；禁止沿用上一版 doctrine 的口耳相传。v4.2 被推翻就是没做这件事的代价。这条比所有 detail rule 加起来都重要。

### §12 reversal trigger 加一行
> doc 需要 marketing-style 错位（heading-左 / body-居中）+ per-section spacing 手调 → 本 skill 不适用，手写 CSS 或抽 sister skill `/html-as-marketing`。

## 砍掉的 / cede 出去的（不进 T1 doctrine 主体）

- gap-stack / type-role / grid-collapse 结构性 primitive → **cede T2**
- Stylelint `declaration-strict-value` token-lint → **cede T2**（其安全网）
- 视觉回归（Playwright 截图 diff）→ defer（T2 line 116 同结论）
- 自定义 component-level HTML lint → 拒绝（T2 line 117 同结论）
- shiki 高亮**脚本** → **cede T3**（build transform）
- table 列右对齐 / thead 灰 uppercase / tabular-nums / locale 句号差异 → 折进 component-styles.css 不写成 doctrine
- "Apple 两种 idiom 分类"展开成节 → §12 reversal 一行即可
- "foolproof > maximally-apple" 框架 → 用容器架构那条的「禁负 margin」隐含

## 与 T2 / T3 的边界 & 接缝

- **T1 ↔ T2 是互补两层，不重叠**：T2 的 Tier-3 已主动把 hairline/mark/eyebrow 划给"SKILL.md 规则"= T1；T1 也不碰 gap-stack/type-role/grid-collapse。
- **唯一交界 = 容器架构**：T1 定意图（main 1040 单列左对齐 / 禁负 margin / 禁居中），T2 的 gap-stack 是把"单列 + 块间距正确"做成结构不可违反的机制。**若 T1、T2 同 milestone 则一次定；若分开，T1 先定意图、T2 再补结构。**
- **component-styles.css 共享**：T1 写 component-level 规则样式，T2 写 layout primitive；最终可能同一文件，ownership 分行。
- **exemplar 共享**：理想 exemplar 同时体现 T1 规则 + T2 primitive；谁后做谁补另一半。
- **T1 ↔ T3 近零耦合**：T3 改 §1/2/11 + scripts，只碰 `<img>`/`<pre>`，不读任何 T1 视觉规则。
- **弱协调**：三者都 bump plugin version → 谁后落地谁机械 merge。

## T2 验证完成（2026-05-29 sandbox，实证）

T2 的三条结构 primitive 已在隔离 sandbox **全部实现并验证**，不再是"提案"。

**sandbox**：`/Users/wuhaoyang/mori-ws/spacing-exp/`
- `plan1/` = 只做 gap-stack（方案一）；`plan2/` = 只做 Stylelint（方案二）；`combined/doc.html` = 三条 primitive 叠加；`combined/doc-linked.html` = 改外链 CSS 的抽取验证版。

**三条 primitive 实测**（`getComputedStyle` + 截图双证）：
| primitive | 机制 | 实测证据 | 消除的脆弱自由度 |
|---|---|---|---|
| gap-stack | `main/header/section` flex+`gap`，子元素不写 block margin，2 个 `calc(target−stackGap)` 逃生门 | meta→quote 0→**32px**，72 对 sibling 无塌陷 | "相邻塌成 0" 不可表达 |
| type-roles | 6 个 role（display/title/subtitle/lead/caption/eyebrow）各**定义一处**锁死 size+leading+tracking，组件只引用 | `h1` 与 `.stat strong` 计算样式**完全一致**（56/60.48/−1.008）；旧 `h1 42px` magic number 消失 | "size 配错 leading/tracking" 不可表达 |
| grid-collapse（Option A） | `[data-cols]` 用 `--cols` 变量同载桌面列数+塌缩；`.trio` 同契约 | 桌面 4·3 列语义保留；≤780px 由**单条** `.grid[data-cols],.trio{--cols:1}` 全塌 1 列 | "加新 grid 忘配 mobile" 移除 |

**Option A 决策已落地**：保留 `data-cols` 语义列数（不取 auto-fit——语义列数是 content signal 不是噪音）；**不加中间档**，干脆 4→1。

**component-styles.css 已抽出并验证**：`spacing-exp/component-styles.css`（15.7 KB / 525 行），头部按 TOKENS / T2·PRIMITIVES / T1·COMPONENTS 标注 ownership（对应本稿 Artifact #4 的分行要求）。抽取完整性用 `doc-linked.html` 改 `<link>` 重渲染验证——与内联版**像素一致**，三条 primitive 经外链全部生效。这份文件即 **A-line skill 升级 `references/component-styles.css` 的现成基底**。

**token efficiency**（方案一实测，见 asset backlog 第二支柱）：静态 +1.2%（全注释），但 margin 声明 34→17、编辑省 ~5×、扩展近乎免费，且"最省 token 的写法 = 正确的写法"。

> 含义：T2 **三条 primitive + component-styles.css 基底都已 ready 且实证**，升 goal 的技术风险已清零，只剩"和 T1 怎么打包"的组织决策（见下）。

## 关键未决：T1 与 T2 是否同一个 milestone？

这是升 goal 前最该拍的：

- **合并论**：T1（规则）+ T2（结构）是同一"styling 正确性"母题的两层，共享 exemplar + component CSS + 容器架构决策，两者都 ready，分开做会两次过同一批文件。
- **分开论**：技术面不同（写规则/exemplar vs 重构 CSS 成 primitive），T2 已在 asset backlog 里被当成独立可升的"第二支柱"（line 128：styling 支柱可先行）。
- 倾向：**T1+T2 合并成一个 "html-as-doc styling correctness" goal**（rules + primitives 两 workstream），T3 单独。但这需要用户拍板，因为 T2 当前挂在 asset backlog 名下、可能用户想让它跟 T3 一起走。

## 其余 promotion criteria

1. 确认 T1 的 3 条规则措辞 + component-styles.css 里 rule-level 与 primitive 的分行。
2. exemplar 是否等 T3 落地再定 source/build 形态，还是先出 build-mode 版。

## References / Context

- Dogfood 产物（最终 polish 版，A 的活样本）：`/Users/wuhaoyang/mori-ws/lifedialbench_explainer_polish.html`（main 1040 单列左对齐 / 无 hairline / mark 白粗字 / eyebrow gray / 无句号 / trio 子段 / stat 巨号 center）
- **T2 sandbox + 验证产物**：`/Users/wuhaoyang/mori-ws/spacing-exp/`（`plan1` gap-only / `plan2` stylelint-only / `combined/doc.html` 三条叠加 / `combined/doc-linked.html` 外链抽取验证 / `component-styles.css` 抽出基底 15.7KB）
- **component-styles.css 基底**（A-line `references/component-styles.css` 的现成来源）：`/Users/wuhaoyang/mori-ws/spacing-exp/component-styles.css`
- apple.com 实证截图：`/tmp/apple-specs-mid.png`（specs section hairline）、`/tmp/apple-cmp-2.png`（Mac compare 等量齐观 + 巨号 center）、`/tmp/apple-mac-1.png`（同质化白卡）、`/tmp/apple-mbp-1.png`（outline border 选项卡）、`/tmp/apple-design-2.png`（marketing 错位 + 白粗字 inline emphasis）
- 母 goal：`.gdd/goals/goal-20260528-html-as-doc.md`
- 姊妹 backlog（B）：`.gdd/backlogs/backlog-20260529-html-as-doc-asset-pipeline.md`
- Doctrine 出处：`skills/html-as-doc/SKILL.md` §5（视觉参考）、§7（组件规则）、§9（编辑纪律）、§12（reversal）
- 被推翻的 exemplar：`skills/html-as-doc/references/exemplar-v4.2-apple.html`
