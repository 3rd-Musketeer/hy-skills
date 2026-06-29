---
title: html-as-doc-asset-pipeline
status: drafted
created_at: 2026-05-29
appetite: normal
---

# Draft: html-as-doc 的 asset / build 流水线

> 素材积累稿，非定稿。来自一次对 `/html-as-doc` 的真实 dogfooding（LifeDialBench benchmark explainer）。
> 作者标注：另有一个 session 的改进要点可能与此 merge，所以这里把 motivation、讨论与决策过程、收敛路径都展开写，方便日后合并取用。

## Friction（触发问题）

用 `/html-as-doc` 写一篇 benchmark 介绍时，图片（论文 figure）的处理暴露了两个互相冲突的需求：

1. **编辑期需要轻量 source**：把 figure 以 base64 inline 进 HTML 会让文件爆炸——本例一张 `main.png` 2030 KiB → base64 2707 KiB → 整个 HTML 2.7 MB。带着这种文件继续 Read/Edit：token 爆、diff 不可读、agent 编辑成本高。
2. **分享期需要自包含 + 小体积**：单文件分享必须 inline（否则 `<img src="相对路径">` 发出去就裂图），但 2 MB 的原图又太大，塞不进邮件附件。

当前 skill 的设定（SKILL.md §1）是「**expression discipline, not a build system**」「one shot, write end-to-end inline」，根本没有 source / build 分离的概念。于是 agent 只能二选一：要么保持 URL ref（毁掉"self-contained"承诺），要么 inline（毁掉"轻量可编辑"）。**没有干净的路。**

## Solution shape（方案草图）

给 `/html-as-doc` 配一套**后处理 build 脚本**，确立 **source / build 两 mode 契约**：

- **Source（编辑期）**：图片用 `<img src="assets/foo.png">`，代码块用 plain `<pre><code>`。小、易 diff、token 便宜、刷新快。
- **Build 产物（分享期）**：`<img src="data:image/webp;base64,...">` + shiki 高亮 spans。单文件、自包含、压缩后体积合理。

两层脚本结构：

```
skills/html-as-doc/scripts/
├── highlight.mjs        # Shiki 代码高亮（已有原型，从 /tmp/html-rework 搬入）
├── inline-images.mjs    # 图片 → base64（已有原型）
├── compress-images.mjs  # sharp：PNG/JPG → WebP，新增
└── build.mjs            # orchestrator，内存里串 transform，单读单写
```

类比 Astro / mdx 的 dev vs build：SKILL.md 只需写「写完跑 `build.mjs`」一行。

## Motivation（为什么现在做）

- N=1 已经命中：第一篇非平凡的 doc（含真实论文 figure）就撞上了 asset 膨胀，不是假想需求。
- backlog 里「build pipeline」「authoring helper」是 deferred 占位（见 `goal-20260528-html-as-doc` 的 deferred 列表 line 8 / 10），等的就是"真实 authoring friction"信号——现在信号到了。
- 这是把"分享一个 HTML"从能用变好用的关键一环：self-contained 是 skill 的核心承诺，但不该以牺牲 source 可编辑性为代价。

## 讨论 & 决策过程（怎么收敛的）

时间线：
1. 用户先让我「用 node script（不要 Edit）把图片 inline」——临时手动做了，**脚本原地写回**，文件涨到 2.7 MB，问题当场暴露。
2. 用户追问能否用 design-system / linting 约束 spacing、ROI 如何（相邻但独立的线，见下）。
3. 用户提出真正诉求：要一个**专门给 HTML 做 inline 的 script**（编辑期不爆炸，分享期拿到 inline 版）+ **图片压缩**。
4. 用户补一条关键守则：**编辑期不急着 inline，用 URL 表达即可；只有明确要分享时才打包 build**，并强调"格外注意"。

收敛到的决策（build pipeline 线）：

| # | 决策 | 取 | 弃 | 理由 |
|---|---|---|---|---|
| 1 | 脚本架构 | 两层：独立 transform + 顶层 `build.mjs` orchestrator | monolith 单文件 / 纯 stdin\|stdout pipe | 独立 transform 可单测可组合；shiki init 慢，想只重 inline 不重高亮时能单跑；纯 pipe 会丢 base-dir（图片相对路径解析不了） |
| 2 | 两 mode 契约 | source 轻量(URL ref) / build 产物自包含 | 一份文件兼顾 | 编辑成本 vs 分享自包含本质冲突，分离才两全 |
| 3 | inline 时机 | 仅在明确"分享/build"动作触发 | 写作中顺手 inline | 用户强调：保持原始文件轻、好编辑 |
| 4 | build 不动 source | 输出到独立路径，`build.mjs` 守 `out ≠ src` | 原地改写 | 物理杜绝"手滑把源文件搞重" |
| 5 | 命名约定 | `foo.html`(源) → `foo.share.html` 或 `dist/foo.html`(产物) | 同名覆盖 | 让源始终可继续编辑 |
| 6 | 压缩工具 | sharp | 系统 imagemagick | 跨平台一致 + Node 生态原生 |
| 7 | 输出格式 | 统一转 WebP，q82，max-width 2400，保 alpha，跳过 SVG | 保留原格式只优化 | WebP 收益最大；2026 兼容性已无问题（含 iOS Safari 14+）；预计 ~7× 缩减（本例 2.7MB → 目标 ~600KB） |
| 8 | 压缩默认 | 默认开，`--no-compress` 逃生 | opt-in | 分享是 build 的主要动机 |

## 第二支柱：结构性抽取 styling primitives（→ 已迁移为 A-line T2）

> **归属更新**：本支柱 = expression-doctrine backlog 的 **T2**。canonical 家在 [`backlog-20260529-html-as-doc-expression-doctrine`](backlog-20260529-html-as-doc-expression-doctrine.md)（含 T2 验证完成小节 + component-styles.css 基底）。**本节保留为 A/B 实验档案**（实验叙事与 token-efficiency 数据），不再是 B(asset-pipeline) 的工作内容——B 只剩 image inline + WebP compress + source/build。
>
> 这条线本来是 build 讨论的副产物（"能否 lint spacing"），经过一轮 A/B 实验后已成熟为独立 milestone 候选，现归 A-line T2。

### 实验：方案一（gap primitive）vs 方案二（Stylelint）A/B 实测

派了两个 subagent 各做一套，跑在隔离副本 `/Users/wuhaoyang/mori-ws/spacing-exp/{plan1,plan2}/`，亲自验证产物（非只看报告）：

- **方案一 = gap-based layout primitive**：`main/header/section` → `flex + gap`，子元素不写 block margin。实测 meta→quote `0 → 32px`，header 四对间距 24/24/24/32 一致，72 对 sibling 无一塌成 0。
- **方案二 = Stylelint `declaration-strict-value`**：23 errors（实为 12 条 unique，全真无误报），但**实测复现 `margin:0/0` → exit 0，对本次 0-gap bug 完全失明**；且无 autofix。

**决定性发现**：两者不解同一问题。方案一直接消灭 bug（让坏状态不可表达）；方案二检查"值是否来自 token"，看不见"布局是否正确"。`0` 是合法 token-free 值，必须进 ignoreValues，所以 0px gap 对它结构性隐形。**实证了"spacing 别靠 lint 抓，靠 primitive 让它错不了"。**

### Token efficiency（方案一实测）

- 静态：全文件 +1.2%（+620B，几乎全是注释）；但 `margin*:` 声明 34 → 17（腰斩），spacing 声明合计 −28%。**从零写约等。**
- 编辑节奏：异构容器调间距省 ~5×（改 1 个容器 gap vs 改 N 个 element margin）。
- 扩展内容：往 stack 加新块**零 spacing CSS、自动正确**；margin model 下每加一块都要花 token 且少花就出 bug。
- 隐藏收益：LLM 不用做 pairwise margin 配平，reasoning token 也省，输出更可预测。
- **核心性质**：gap model 下「最省 token 的写法（什么都不写）= 正确的写法」。cheapest = correct，便宜模型/短 prompt 也不易错。

### 概念定性：这是一种特定的 primitive 抽取

抽出的是「vertical stack」primitive（≈ Tailwind `space-y-*` / SwiftUI `VStack(spacing:)`）。关键不在"起了名字"，在**责任搬家方向**：spacing 所有权从 element（叶）上移到 container（父）。它是**强抽取**（make illegal states unrepresentable）而非弱抽取（DRY 去重）——它**改变状态空间形状**，把"sibling 间距"这个可独立设为 0 的自由度删掉。这也是"结构性修复 > linting"的另一视角：linter 是外挂在仍含坏状态的空间上的检查器；抽对 primitive 是把坏状态移出空间，于是不需要检查器。

### Litmus：什么 styling 关注点值得结构性抽取

> 当且仅当：① **共变脆弱性**——有 ≥2 个属性必须一起动却能被独立设置；② **高频**；③ **语义稳定**（role/形状没在 churn）。
> 用户加的硬门槛：**只有 spacing 这种极高频且已稳定的才值得抽；没稳定的 = premature abstraction，不抽。**

### 本 milestone 的 scope（按 litmus 审计后收敛）

**Tier 1 · 打包做（三条全中）**：

1. **垂直 spacing → gap stack** —— 已验证（plan1）。`main/header/section` flex+gap，子元素不写 block margin，2 个 `calc(target − stackGap)` 逃生门处理"标题贴更近"这类故意不均匀。
2. **Type roles → 锁死共变三元组** —— 证据：`h1/h2/h3` 各自手动配对 `font-size + line-height + letter-spacing`（隐含规则"字越大→leading/tracking 越紧"），且 media query 里 h1 被覆写裸 `42px`。脆弱性与 0-gap 同构（必须共变的能独立设）。抽成 type role（display/title/subtitle/body/caption/eyebrow），按 role 套用，坏配对不可表达（≈ Apple SF text styles）。
3. **响应式 grid → 塌缩 by construction（Option A）** —— 证据：media query 手动 re-override `.grid[data-cols]`/`.step`/`.trio` 成 1fr，"加新 grid 忘配 mobile 孪生"是可遗忘的自由度。**决策：Option A（保留 `data-cols` 语义列数 + 让 `[data-cols]` 属性自带塌缩），不取 auto-fit。** 理由：语义列数（4 个 system / 3 个概念）是 content-driven 的 signal 不是噪音，auto-fit 会摧毁它且引入 per-instance MIN 这个更糟的自由度（= 过度抽取）。**子决策：不加中间档，干脆 4→1（单页 doc 手机直接 1 列最稳）。**

**Tier 0 · 已结构化，无需新做**：color tokens（`:root` + `light-dark()`）、spacing/type scale tokens。

**Tier 3 · 明确不做（卡在门槛上，已考虑并排除）**：
- `mark` / `.eyebrow` 等 inline 语义强调 —— ③ 不稳定（本 session 还在 churn）。留作 SKILL.md 规则。
- 卡片/面板（`.note`/`.figure`/`.dialog`/`.qa-card`/`.snippet`）—— ③ 部分不稳定（dialog/qa-card 这次才发明，N=1）。defer，最多抽个 radius token。
- Hairline 纪律 —— ① 无共变（"有/无"guideline，非共变自由度），没法 structurally 不可表达。留作规则。

### 配套（非结构、作便宜安全网）

- **Stylelint `declaration-strict-value`**：可选 CI hook，防 magic number drift。明确标注它守的是"用没用对词汇"，**不替代** Tier 1 的结构修复（实验证明它对 spacing bug 失明）。
- **视觉回归**（Playwright 截图 diff）：defer，等 skill 产出 ≥5 篇真实 doc 再建 baseline。
- **自定义 component-level lint**：拒绝（false positive 太多，改为写进 SKILL.md 模板）。
- 哲学：**结构性保证（primitive）> prompt 级规则（SKILL.md）> 事后 checker（lint/视觉回归）**。能在设计空间里消除的错误，不留到运行后再查。

## 待解 / Promotion criteria（什么时候够格升 goal）

升格成 goal 前要拍板的：

1. **Doctrine 冲突**：SKILL.md §1「not a build system」+ §2「Do not introduce a build pipeline」与本提案直接矛盾。需决定措辞：是把 build 定义为「authoring 之后的可选 post-processor，不改 one-shot inline 写作模型」从而豁免，还是把 build 划成 skill 之外的 sibling tool？这是核心张力，必须先解。
2. **归属**：脚本放进 `html-as-doc/scripts/`，还是独立 skill / 共享 tool（未来 `pdf-as-doc` 等也可能复用 inline/compress）？
3. **是否先 merge**：等另一 session 的改进要点过来一起 shape，还是先独立推进？
4. **数字验证**：拿本次 dogfood 文件实测，确认 2.7MB → ~600KB 量级成立（含 WebP 转换不破图、shiki 仍生效）。
5. **两支柱是否同 goal**：asset-pipeline 与 styling-primitives 是否打包进同一 milestone？两者同属"产出稳定"母题但技术面独立（一个是 build 脚本，一个是 CSS 重构）。styling 支柱 scope 已收敛（见上 Tier 1/3），可独立成 goal；asset 支柱还卡在 doctrine 冲突（#1）。倾向：styling 支柱更成熟、可先行。

满足 1–2 拍板、3 决定独立或合并、5 决定打包粒度后，即可升 `goal-`。styling 支柱本身已基本满足升格条件。

## References / Context

- Dogfood 产物：`/Users/wuhaoyang/mori-ws/lifedialbench_explainer_polish.html`（当前是已 inline 的 2.7MB 版，作为"违反轻量 source 守则"的活样本保留）；同目录另有 `_v2` / 原始版
- 脚本原型：`/tmp/html-rework/highlight.mjs`、`/tmp/html-rework/inline-images.mjs`（后者本次新写，含幂等跳过 `data:`/`http(s):`/`file:` 逻辑）
- 母 goal：`.gdd/goals/goal-20260528-html-as-doc.md`
- backlog deferred 占位：`.gdd/backlog.md` line 8（build pipeline）、line 10（authoring helper）
- Doctrine 出处：`skills/html-as-doc/SKILL.md` §1（expression discipline 定位）、§2（thin stack / 禁 build pipeline）
- 数据：本例 `main.png` 2030 KiB → base64 2707 KiB；HTML 总 2758 KiB
- **styling 实验产物**：`/Users/wuhaoyang/mori-ws/spacing-exp/`（`base_reference.html` 对照 / `plan1/` gap 重构 / `plan2/` Stylelint config + 可跑 `npm run lint:css`）
- styling 实测数据：margin 声明 34→17；meta→quote 0→32px；plan2 对 `margin:0/0` exit 0（失明）
- 概念框架：strong vs weak primitive extraction、make-illegal-states-unrepresentable、litmus（共变脆弱性 + 高频 + 稳定）、"cheapest = correct"
