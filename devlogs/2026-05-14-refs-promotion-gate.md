---
session_date: 2026-05-14
precursor: 2026-05-14-artifact-system-mindset.md
topic: refs/ 作为统一沉积层；两道门 promotion gate；4 独特价值；folder form
status: working notes (not yet codified into skills)
---

# Refs/ Promotion Gate — Session 续

承接 `2026-05-14-artifact-system-mindset.md` 的 4-artifact 框架（GOAL / Backlog / Draft / ADR-or-Study），
本次 session 沿着 **devlogs 到底有没有用** 这个具体问题，进一步收敛到：

> **ADR + study + devlog 不再区分；统一进 `refs/`。promotion 由"两道门 + 4 独特价值"决定。**

这份文档记录这个收敛的过程 + 最终的 `refs/` 管理方案。

---

## Part 1 · 起点问题

承接前次的开放点：现有 `devlogs/` 跟 user 心智已经漂移（ADR 内容 / study 内容 / 杂项混在一起）。
两个相互拉扯的担心：

1. 分裂成 ADR + study + study 各自的文件夹 → **心智破碎**，每条新内容都要选类别
2. 保留 devlogs 作为 catch-all → **泛滥**，35 篇里多数没人会回头读

→ 看似要在"破碎"和"泛滥"之间二选一。

---

## Part 2 · 调研：devlogs 实际在做什么

数据：

- emma_demo 35 篇 / hearken 7 篇 / context-layer 0 / wechat-reader 0 / half-dev-skills 0
- emma_demo devlogs 被 **8 处非-devlog 文件** 引用（task / backlog / module README / AGENTS.md）
- emma_demo 和 hearken 模板**根本不同**：
  - emma_demo：Context / Decisions / Dead-ends / Open-questions（决策叙事）
  - hearken：Context / Harness / Metrics / Results（评估测量报告）
- 越新的 repo 越不用 devlogs —— context-layer / wechat-reader / half-dev-skills 都没有

实际职能分裂成 3 类（挂同一个名）：

| 实际职能 | 心智上是 | 例子 |
|---|---|---|
| 决策理由 + dead ends | ADR | local-refine-single-flight-fix |
| 评估测量结果 + harness | study | hearken E1-E4 全部 |
| 多决策汇总 / 分支回顾 | 杂项 | app-stack-alignment |

→ "devlog" 这个词跟现有心智已经漂移，不该作为一类 artifact 存在。

---

## Part 3 · 真实价值评估（直接读 35+7 篇）

读完后真实分布：

- **1/3 是金子** —— 方法论 / empirical 发现 / 带具体 reasoning 的 trade-off / 纯证据
- **1/3 是边缘** —— 决策叙事但已凝固进代码，罕见考古时才有价值
- **1/3 是 PR description 翻译稿** —— refactor narrative / 状态更新 / "做了 X 然后做了 Y"

最后那 1/3 就是泛滥的具体来源。它泛滥不是因为分类不清楚，而是**作者写之前没问"代码本身会不会回答这个"**。

---

## Part 4 · 4 独特价值（值得记录的判定）

代码答不出的 4 件事，就是写下来的独特价值：

| 独特价值 | 代码为什么答不出 |
|---|---|
| ① **为什么没选 X**（带具体理由的 alternatives） | 代码只显示"选了什么" |
| ② **试过什么、为什么不行**（dead ends + 具体 failure mode） | 失败路径不在代码里 |
| ③ **世界本身长这样**（empirical surprise） | 外部发现，跟代码无关 |
| ④ **这一类问题的处理方法**（reusable methodology / pattern） | 代码是 instantiation，方法论是 pattern |

反向标尺（**最重要的一条**）：

> **代码本身能回答的，refs/ 不再说一遍。**

读者手边就有当前代码 → 读你这篇还能学到什么？什么都学不到 → 不该存在。

---

## Part 5 · Citation-pressure 晋升原则

观察到的一致规律（跨 3 个 repo）：

```
默认 = 内容写在最近的 owning artifact 里
       （goal 段落 / PR description / commit message / backlog 条目）

第二次需要从另一个地方引用同一段内容时，那一刻是 promote 的时刻。

永远不会被二次引用的内容，就不应该有自己的文件。
```

这条原则同时解掉两个担心：

- **不破碎**：大多数内容不需要独立类别（留在 owning artifact 里）
- **不泛滥**：独立文件必须由 citation pressure 推上来，作者一人决定不了

关键转换：
**心智从"我现在写的东西是什么类别？"变成"这个东西未来会被几个地方引用？"**

---

## Part 6 · `refs/` 管理方案（最终收敛）

### 是什么

Repo 里**被反复引用的内容的唯一沉积层**。决策 / 证据 / 概念都在这里，**不再区分 ADR / study / devlog**。

### 命名

- 时间敏感（决策、评估、快照）：`refs/YYYY-MM-DD-slug.md`
- Evergreen 概念（架构、术语、心智模型）：`refs/slug.md` + frontmatter `evergreen: true`
- Flat 结构。某主题超过 ~5 个文件再考虑 group

### 形态：file 或 folder（lazy 升级）

**默认 `.md`**。当且仅当需要承载 non-markdown 内容（代码样本、数据快照、多张图表、生成脚本）时，升级为 `refs/YYYY-MM-DD-slug/` 文件夹 + 内部 `README.md`。

升级判定：**离开这个文件夹，ref 的可读性 / 可复现性会塌吗？**
- 会 → 升级为文件夹
- 不会 → 链接出去（don't duplicate）

文件夹里放：
- 历史 pinned 的数据快照（`metrics.json`、smoke-runs 冻结）
- 评估 harness 脚本（可重跑）
- 截图 / 图表源（Mermaid / Graphviz / PNG）
- 多个相关 .md（README + raw-results + methodology）

不放：
- 还在演进的"当前"数据（链接到 canonical 位置）
- 生产代码（住 src/，这里 link）
- 大体积二进制（外部存储 + link）

**引用习惯：始终省略 `.md` 后缀**（写 `refs/2026-05-12-foo`），让 file → folder 升级成本归零。

### 两道门 promotion gate

写一段内容时，按顺序问：

**门 1 · 内联可行吗？**
- 留在 goal 段落 / PR description / commit message / backlog 条目里，下个读者能找到吗？
- 能 → 留在那里
- 不能（要被 ≥2 个地方引用）→ 进门 2

**门 2 · 满足 4 独特价值之一吗？**
- 满足 → 写进 refs/
- 都不满足 → 留在 PR description / goal 段落里（本质是 status update / 实现叙事，不该 promote）

### 不进 refs/ 的典型内容

- 重构步骤的散文叙述（git log 已经回答）
- "做了 X 然后做了 Y" 多决策汇总（PR description 已经回答）
- "M0 完成、M1 进行中" 状态更新（README / goal 已经回答）
- 末尾 Open Questions / TODO（该进 backlog）

### 最小写入动作

1. 文件名按上面命名
2. Frontmatter 极简：`date`（时间敏感）或 `last_updated`（evergreen）；其它字段等真有查询需求再加
3. 内容直奔 4 独特价值之一，不写过渡段

### 更新 / 废弃

- **Evergreen 文件**原地编辑 + 更新 `last_updated`
- **时间敏感文件不就地修改**：写新文件，旧文件 frontmatter 加 `superseded_by: <new-slug>`

### 历史 devlogs 怎么办（关键判断：不动）

**不强迫整改 emma_demo 的 35 篇 devlogs。**

- 已被引用 ≥2 次的 → 视作历史 refs，保留原位即可（或择机改名）
- 没被引用过的 → 留在 `devlogs/` 不动，新内容停在那里，文件夹自然停止增长

Migration cost 高于 ROI；未来内容走 `refs/` 即可，旧内容 forever frozen 是可接受的状态。

---

## Part 7 · 跟 artifact 体系的总位置

```
goals/         现在 —— 正在 handoff 给 agent 做的事
backlog/       可能 —— 想到了但没想清楚要不要做、怎么做
goals/drafts/  shaping —— uncertainty 正在收敛 (RFC pattern)
refs/          过去 —— 通过两道门、被反复引用的决策/证据/概念
```

`refs/` 是 4 个 active 文件夹里唯一**允许 append、不允许就地大改**的（evergreen 例外）。它是体系的"过去"层。

---

## Part 8 · 元原则（贯穿本次收敛的）

1. **默认内联，按引用压力晋升** —— 一段内容写在距离它最近的 owning artifact 内；≥2 次引用才提升到独立文件
2. **代码本身能回答的，文档不再说一遍** —— Reader 手边就有当前代码 → 读这段还能学到什么？什么都学不到 → 不该存在
3. **类别少、进入条件硬** —— bucket 数量不是问题，每个 bucket 没有硬进入条件才是问题
4. **Layout 是项目品味，role separation 是 invariant** —— 同一原则在不同项目可以有不同 instantiation；不要强加 folder structure

→ 这 4 条是 `refs/` 机制成立的底层，比文件夹名字本身重要 10 倍。

---

## Part 9 · 给 half-dev-skills 的具体动作

### 元说明层（plugin-level，不专属任何 skill）

把 Part 6 的 `refs/` 管理方案 + Part 8 的 4 元原则写进 plugin 的 **顶层 README / meta-principles**，作为所有 skill 共用的 vocabulary。

### `/go` skill §6 handoff shape

加一条 promotion check：

> 执行中若产生应进 refs/ 的内容，按两道门 + 4 独特价值过一遍：
> - 不满足 → 留在 PR description / goal 段落里
> - 满足 → 写进 refs/（lazy folder 升级）
>
> 不要为了"记录"而 promote。

### `goal-shaper` skill §0 Survey

承接前次文档的 §0 Survey Refs 提案，但目标统一为 `refs/`（不再区分 adrs/ 或 studies/）：

> Before drafting any section, scan `refs/` for prior decisions / evidence / concepts that may affect this goal.
> Filter by topic, not by recency.
> For each relevant ref:
> - cite (still applies)
> - mark reviewed (append `Reviewed: YYYY-MM-DD by <goal-slug>` —— replace previous, do not stack)
> - supersede (frontmatter `superseded_by:`)
> - extend (write a new ref, declare relationship)

### Devlog 退场策略

不要在 skill 里写 "deprecate devlogs/"。让它**事实上停止增长**：
- 新内容默认走 `refs/`
- 老 `devlogs/` 文件冻结
- 半年后回看，自然就 obvious 了

---

## Part 10 · Open items

未落地动作：

1. **`refs/` spec 写进 plugin 顶层** —— 不在任何 skill 内，需要新位置（plugin README 或 `meta/` 目录）
2. **`/go` §6 加 promotion check** —— 具体文字未写，但提案已收敛
3. **`goal-shaper` §0 Survey 升级为 refs-aware** —— 取代之前 adrs-only 的版本
4. **Plugin 引用约定** —— 教用户 / agent 始终省略 `.md` 后缀（lazy folder 升级的前置）
5. **跟前次文档的 ADR 工作流对齐** —— 前次提到的 "binding moment 是 goal-shaping" 跟 `refs/` 的 promotion 机制是同一件事的两个视角，可以合并表述

---

## 一句话最终结论

> **devlog / ADR / study 不该作为三类 artifact 存在。它们的实际工作（被反复引用的决策、证据、概念）统一进 `refs/`，由"两道门 + 4 独特价值"控制 promotion。**
>
> **真正的纪律不是 "什么放 refs/"，是"代码本身能回答的，refs/ 不再说一遍"。这条尺比文件夹名字重要 10 倍。**

承接前次的 mindset 文档：你已经走到的位置 = artifact-mediated stateless collaboration。本次的具体贡献 = 把"过去"层的命名 + promotion gate 收敛清楚，让 agent 在该写 / 不该写 / 写哪里这件事上有可执行的判断。
