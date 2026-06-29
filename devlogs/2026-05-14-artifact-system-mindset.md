---
session_date: 2026-05-14
topic: Artifact-mediated agent collaboration — mindset, empirical findings, and ADR placement
status: working notes (not yet codified into skills)
---

# Half-dev-skills 体系化：本次会话的探究与结论

本文档记录一次围绕 half-dev-skills 体系化展开的深度讨论。核心问题：
**如何围绕一个 repo，让人与 agent 持续协作迭代产品，让不同 agent 基于 artifact 协作？**

讨论从分析 emma_demo 的开发纪律开始，经过 3 个新 repo（hearken / wechat-reader / context-layer）的实证调研，
最后收敛到 mindset 层面的判断。本文按时间顺序记录主要发现 + 思维演化 + 最终结论。

---

## 一、起点：从 emma_demo 抽取的 5 条纪律

调研 emma_demo 的 `AGENTS.md` / `justfile` / `devlogs/` / `features/` 等，归纳出 5 条相互咬合的纪律：

1. **Contract first, structure second** —— `session_pipe` 大重构的第一步不是切模块，是修 `SessionBoundary` schema drift、引入 typed envelope。契约钉死后才动结构。
2. **Optimize for parallel-agent reality** —— 1 worktree = 1 task = 1 branch，rebase 对齐 `origin/<base>`，singleton runtime lock。多 agent 并行是默认假设。
3. **廉价探索 vs 昂贵保留分轨** —— `features/experimental/`（gitignored）vs 升级后的 `features/<name>/`；`tools/`（观察世界）vs `scripts/`（改变世界）。
4. **Oversight surface 是一等输出** —— Devlog dead-ends、handoff shape、propose-with-alternatives —— 用户用来抓 agent 做错事的报告。Dev-skills-simplification devlog 里的三类框架：command-layer / oversight surface / **ceremony，砍**。
5. **步长与置信度对齐** —— `session_pipe` 30+ 次 seam 抽取，每次都"先抽出 + 保留 wrapper + 后续清理"。Friction-as-signal：测试需要 20 行 setup → 当场重构，不是 audit findings。

底层假设：**AI agent 是协作者，不是工具**。所以结构化 + 契约化 + 可监督是同一个问题的三个面。

---

## 二、Stateless Collaboration 的修正

用户初判："goal-shaper → /go 端到端让 agent stateless collaboration"。

修正：不是全程无状态，是 **"stateless at the seams"**：

- **接缝无状态**：GOAL.md 设计成冷启动可接住；§6 handoff shape 把 assumptions / simplify outcome / out-of-scope 显式吐出
- **阶段内仍有状态**：/go 进行中 TODO / 半完成修改 / 临场理解 —— 这些不会无状态化也不应该

更准的命名："**Artifact-mediated collaboration with stateless seams**"。

**实质进步**：把协作的最小单位从"一次对话"推到了"一个 artifact 接缝到下一个 artifact 接缝"。

---

## 三、跨 repo 实证调研

### Corpus（goal-shaper 时代的 3 个 repo + 基准）

- `hearken`（2026-05-13 push，Python，audio context layer）
- `wechat-reader`（2026-05-12 push，Python，WeChat 阅读 CLI）
- `context-layer`（2026-05-04 push，Python，从 emma 抽取的 context infra）
- `emma_demo`（基准，已分析过，不重读）

### 矩阵（current skill catalog × 实际使用）

| Skill | hearken | wechat-reader | context-layer | emma_demo |
|---|---|---|---|---|
| **goal-shaper** | ✅ 单活跃+归档 | ✅ 时间戳文件夹 | ✅ versioned 目录 | 🟡 docs/wip-features |
| /go handoff shape | 🟡 | 🟡 | 🟡 (runbook 替代) | 🟡 |
| refactor / my-simplify | 🟡 隐式 | 🟡 隐式 | 🟡 隐式 | ✅ |
| prototype-board | ✅ macos-panel | — | — | — |
| open-worktree | ❌ | ❌ | ❌ | ✅ |
| commit-push-pr | ❌ | ❌ | ❌ | ✅ |
| loop-for-merge | ❌ | ❌ | ❌ | ✅ |
| close-worktree | ❌ | ❌ | ❌ | ✅ |
| AGENTS.md/CLAUDE.md | ❌ | ❌ | ✅ | ✅ |

### 关键发现

1. **goal-shaper 是稳定核心** —— 3 个 repo 全用，但**布局有 3 种合理形态**：
   - 单活跃 + 归档（hearken）
   - 时间戳 flat 文件夹（wechat-reader）
   - Versioned 目录（context-layer）
   - → skill 不应该强推一种 layout

2. **Worktree cluster 全部 0 触发** —— 4 个 skill 在 3 个新项目里没人用。Solo 项目天然不需要并行 PR workflow。

3. **Practice 跑在 skill 前面的 invention**：
   - **Friction Log + PX mental model + Expected Shape**（wechat-reader）
   - **Versioned goal + runbook**（context-layer）
   - **Milestone archive 模式**（hearken：完成 goal 移到 docs/）
   - **Smoke gate ladder**（hearken：s1/s2/s3 + real-X + eval harness → devlog）
   - **多 target plugin 打包**（wechat-reader：Codex+Claude+Cursor+裸 MCP 一棵树）

---

## 四、Artifact 系统的最终 mindset

### 三层 context（按 freshness 梯度）

```
现在  (live edge)    —— GOAL          —— agent: execute
可能  (pre-edge)     —— BACKLOG/DRAFT —— agent: 读取以 shaping
过去  (sediment)     —— ADR/STUDIES   —— agent: cite (不重新论证)
```

每层有不同的：
- **新鲜度要求**：现在必须 sharp，可能可以 lossy，过去 append-only
- **agent 动作**：execute / shaping-read / cite
- **生命周期**：goal 短、backlog 不限、sediment 长期

### Mindset 核心：GOAL 是唯一 load-bearing artifact

4 个 artifact 不是 peer：

| Artifact | 认知状态 | Agent 动作 | 寿命 |
|---|---|---|---|
| **GOAL** | certain, executable | execute | 短，完成归档 |
| **Backlog** | uncertain, parking | shaping 时读；可弃 | 不限；大部分死在里面（正常） |
| **Draft / RFC** | shaping 中，allowed ambiguity | review / push back | 直到 promotion criteria 满足 |
| **ADR** | decided, canonical | cite / supersede / mark reviewed | 长期，append-only |
| **Studies / Devlogs** | evidence, reasoning notes | cite as evidence | 长期，append-only |

人类的高杠杆动作集中在两个 transition：
1. **Backlog → GOAL** 的 promotion（决定 commit 什么）
2. **GOAL shaping** 本身（把模糊变 deterministic）

Implementation / ADR 撰写 / study 跑评估都可以是 agent 工作。

### 为什么这套 work（第一性原理）

**Agent 协作的瓶颈不是"agent 不够聪明"，是 "context 不够 self-contained"**：

1. Agent 没有跨 session 记忆 → artifact 必须自包含
2. Agent 没有取舍 taste → 每类 artifact 该读还是该忽略要显式说明
3. Agent 不会自然遗忘 → 必须显式区分"过去 vs 现在"
4. 多 agent 没有共同上下文 → artifact 必须是协作的唯一介质 → backlog 必须可弃

---

## 五、ADR 调研：3 次修正后的判断

### 修正轨迹

| # | 判断 | 触发原因 |
|---|---|---|
| 1 | "ADR 在 practice 里没 pay rent，应该删掉" ❌ | 看到 4 repo 0 ADR + 0 retrospective citation |
| 2 | "ADR 内容已经在自然长出来，需要正确归位" ✅ | 用户指出 emma_demo 不算 goal-shaper 时代；hearken 实证发现 shadow ADR + restatement drift |
| 3 | "**Binding moment 是 goal-shaping，不是 evaluation 完成**" ✅ 最终 | 用户提议 ADR work 嵌入 goal-shaping |

### 实证发现（hearken 是 goal-shaper-era 项目，公允的测试对象）

**0 个显式 ADR 文件**（4 repo 全部为 0）。

**但有 1 个 shadow ADR**：`prototype/macos-panel/decisions.md`
- Decided / Why / Alternatives / Cleanup / Files —— 形态完全是 ADR
- 不在 `adrs/`、不叫 `adr-NNNN-`、没有 Status
- **被 0 个其它文件引用**

**4 个决策完美符合 goal-shaper §8 提取标准（多方案 / 基准 / 跨行后果 / 可能 supersede），但全部 inline 在 backlog/draft/devlog**：

| 决策 | 标准命中 |
|---|---|
| Dual-ASR vs single mixed | 4/4 |
| 20s refinement window | 4/4 |
| CAM++ remap threshold 0.6 | 3.5/4 |
| source vs speaker_identity 拆分 | 3.5/4 |

**最强 friction signal：dual-ASR 决策在 6 个文件里被 restate**
- Backlog Decision Snapshot / Draft §1 / Draft §5 / E1 devlog / Runtime-retrofit backlog / README
- 4-5 种不同措辞，drift 已经开始

### Citation 模式：前瞻型，不是回顾型

| 测试 | 结果 |
|---|---|
| emma_demo 半年里重大架构 devlog 被后续引用 | **0** |
| wechat-reader 跨 goal 引用更早 goal 的决策 | **0** |
| hearken Decision Snapshot 被引用 | **3 次**（README、retrofit-backlog、draft RFC） |
| hearken Draft RFC §4 Evidence 表 | **6 个 cite**（4 devlog + 2 backlog） |

**结论**：Citation 主要发生在 draft shaping 时**往回拉证据**。
"半年后查决策"在 practice 中**没发生过**。这是 ADR 在你的体系里**真正的使用场景**：
为下一个 goal-shaping 提供 input，不是 retrospective lookup。

---

## 六、ADR 工作的正确时机：Goal-shaping

### 关键洞察（用户提出，最终修正了我之前的框架）

**Binding moment 不是 evaluation 完成，是 goal-shaping**：

- Evaluation 完成只产出 evidence + **tentative default**
- 真正的 commitment（"产品要 ride 这个决策"）发生在 **goal commit 到这个方向那一刻**
- Hearken 实证印证：E1-E4 完成后决策进 Backlog Decision Snapshot —— **正确位置**，因为还没 commit
- Draft RFC 出现 = commitment 入口，promote 到 GOAL 时才该提升为 ADR

### Goal-shaping 是最优时机的 4 个理由

1. **认知密度最高**：人和 agent 都在显式思考 alternatives，Nygard 模板的 4 段自然填得出来
2. **承担成本被显式承担**：要不要 lock 进 adrs/ 这个判断只有 commit 的人能做
3. **Cite/supersede 需要"新 context"**：判断旧 ADR 是否还有效，只能在"当前 context 被定义"的时刻做
4. **Agent 协作友好**：agent 做 goal-shaping 时 grep refs/ 是自然动作，不是额外步骤

### 完整工作流

```
Evaluation / spike 完成
  ↓ 产出 evidence + tentative default
devlogs/ + (可选) Backlog 内 Decision Snapshot
  ↓ 还没 commit
Goal-shaping (binding moment!)
  ↓ 1. Survey scoped refs/
  ↓ 2. 对每条相关 ref 判断: cite / mark reviewed / supersede / extend
  ↓ 3. 对每条新结构决策: spawn adrs/adr-NNNN
  ↓ 4. Goal Decisions section 全是 cite (零 restatement)
/go execute
  ↓ 实现中临时决策
    - 小: goal Implementation Decisions inline
    - 大: handoff 标 ADR candidate → 下次 shaping 处理
    - 紧急: 现场写 ADR (exception path)
Goal archive
  ↓ ADRs 留在 adrs/ 成为下一个 goal-shaping 的输入
```

### Revisit 时的 4 种动作

| 判断 | 对 ref 的动作 | 对新 goal 的动作 |
|---|---|---|
| 仍适用 | 不修改 | cite adr-NNNN |
| 仍适用 + 已 review 确认 | 末尾加一行 `Reviewed: YYYY-MM-DD by goal-slug, still applicable`（替换旧 review 行，不堆叠） | cite |
| 不再适用 | Status: accepted → superseded by adr-MMMM | 引用新 ADR |
| 场景扩展 | 不动 | 写新 ADR，显式说明关系（refines / scopes / complements），不 supersede |

**"Reviewed:" 一行的价值**：让"我们 review 过觉得仍成立"和"我们根本没看过"在 artifact 上可区分。这是工业界普遍缺失的 mechanism。

### 工业界最佳实践（验证）

Pattern 1（Nygard 原始 / 主流）—— Decision-time write：
- 决策有 ≥2 个明确 alternatives 被对比过
- 决策会被多个未来 component / task 引用
- 决策含一个非显然常量
- 决策难以逆转

Pattern 2 —— PR description as ADR（startup 常用，agent 不友好）
Pattern 3 —— Y-statement（Spotify 推广，一句话 ADR）
Pattern 4 —— Decision log（chronological，emma_demo devlog 接近这个）

→ 对 agent 协作场景，**Pattern 1 + Pattern 3 混用最合理**。重决策走完整 Nygard，轻决策走 Y-statement 一行。

---

## 七、Half-dev-skills 的演化方向

### 应该做的

1. **Half-dev-skills 不是 process bible，是共享 vocabulary + 几个 transition skills**
2. **核心 vocabulary**：GOAL / Backlog / Draft / ADR / Devlog —— 5 个词
3. **核心技能**：`goal-shaper` / `/go` / 隐含的 `archive-goal`
4. **Goal-shaper 升级为 ADR work 的承载者**：
   - 在 §1 之前加 `§0 Survey Refs` 段
   - §8 Decisions 把 ADR 提取改为 default（不是 overflow trigger）
   - 加 "Reviewed:" mechanism

### 应该重新审视的

1. **Worktree cluster** (open / commit-push-pr / loop-for-merge / close) —— 3 个新项目里 0 触发
   - 应该分为 **"solo-goal track"** 和 **"parallel-multi-agent track"**
   - 给后者加 "when NOT to use"，避免 solo 项目产生 ceremony 焦虑
2. **AGENTS.md / CLAUDE.md 定位** —— 不是所有项目都需要（hearken 没有也 work）

### 应该吸收的 practice 发明

按 ROI 排序：

1. **Friction Log / PX mental model / Expected Shape**（wechat-reader）→ goal-shaper required section
2. **Goal layout 3 种合理形态** → skill 列出 + 给选用准则
3. **Milestone 归档模式**（hearken）→ goal-shaper lifecycle 文档化
4. **Smoke gate ladder**（hearken）→ `/go` references/ 里的可选 doctrine
5. **多 target plugin 打包**（wechat-reader）→ 抽成 skill

---

## 八、几条贯穿讨论的 first-principle

1. **Layout 是项目品味，role separation 是 invariant** —— 跨 3 个 repo 验证
2. **Decisions become artifacts at commit moment**（修正自"decisions are sections, not artifacts"）
3. **Backlog 的价值就是 lossy + discardable** —— 不要强加结构
4. **Citation 主要是前瞻型，不是回顾型** —— shaping 时拉证据，不是半年后查决策
5. **承认 stateless seams 的限制**：阶段内有状态合法，接缝间无状态是契约

---

## 九、留下的 open items

具体待落地动作（未写入 skill）：

1. **Goal-shaper §0 Survey Refs 段** —— 文字未写。建议内容：
   > Before drafting any section, scan `adrs/` for prior decisions that may affect this goal.
   > Filter by topic relevance, not by recency. For each relevant ADR:
   > - Mark: `cite` (still applies), `supersede` (overturning), or `extend` (still applies but scope changes)
   > - When confirming without change, append `Reviewed: YYYY-MM-DD by <goal-slug>, still applicable` (replace previous review line; do not stack)
   >
   > At §8 Decisions, every entry should be either a cite to existing ADR, or a pointer to a new ADR spawned during shaping. Do not restate decision content in the goal.

2. **Goal-shaper §8 Decisions 改造** —— ADR extraction 改为 default：
   > ADR extraction is the default for any structural decision made during shaping, not an exception triggered by overflow.
   > Inline only when the decision is bounded to this goal's execution and will not be referenced elsewhere.

3. **`/go` §6 handoff shape 加一条** —— ADR candidate 列表：
   > If implementation produces ≥1 decisions matching ADR criteria but too out-of-scope to write now, list them as "ADR candidates" in handoff. Next goal-shaping will promote them.

4. **ADR 文件命名 + 索引约定** —— 当 refs/ 长到 20+ 个时如何 scoped survey。建议：`adr-NNNN-<topic>-<slug>.md`，可能需要 `adrs/INDEX.md`

5. **Skill catalog 分轨方案** —— solo-track / parallel-track 文档化

6. **Hearken 的 ADR 现场修复（验证体系）**：
   - `prototype/macos-panel/decisions.md` → `adrs/adr-0001-prototype-board-shape.md` + `adr-0002-recording-widgets-row-2-swap.md`
   - Backlog Decision Snapshot 4 行 → `adrs/adr-0003` 到 `adr-0006`
   - Draft RFC promote 时 spawn `adr-0007`（source vs speaker_identity 拆分）

---

## 十、一句话最终结论

> **你已经走到的位置**：把 agent 协作的最小单位从"一次对话"推到"一个 artifact 接缝到下一个 artifact 接缝"，
> 且 GOAL 是这个接缝系统的唯一 load-bearing 节点。
> ADR 是 GOAL shaping 时的副产物（不是单独工作流），
> Backlog 是 lossy parking（不需要结构），
> devlogs/studies 是 evidence sediment。
>
> **Half-dev-skills 接下来要做的不是写更多规则，是把这套已经被实证检验的 mindset 沉淀成 vocabulary，
> 把 goal-shaper 升级为 ADR work 的天然承载者。**
