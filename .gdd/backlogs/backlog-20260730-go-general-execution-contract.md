---
title: go-general-execution-contract
status: done
created_at: 2026-07-30
appetite: normal
promoted_to: ../goals/goal-20260803-go-v2-general-execution-contract.md
---

# Draft: `/go` 从开发工作流升级为通用结果责任执行契约

> 这份 note 保留最初的 dogfood 判断。2026-08-03 经用户审阅后已升格为
> [`goal-20260803-go-v2-general-execution-contract`](../goals/goal-20260803-go-v2-general-execution-contract.md)；
> 最终决策见文末 Resolution。

## Trigger

用户在一次非开发任务结束后明确指出：

> “我发现我开始在越来越多的场景下使用 go，来让 agent ‘可靠、符合我的
> 标准、优雅的执行某个任务’，现在的 go 是否有点太偏向于开发了？”

这说明 `/go` 的实际心智模型已经超出当前 description：

> Implement a feature end-to-end with light TDD.

用户调用 `/go` 时越来越像是在切换一种**高信任执行模式**，而不只是在派发
feature implementation。

## Dogfood evidence：一次用户级 PATH 治理任务

任务形状是系统配置 / 本机工具链治理，不是 repo feature：

- 用户先要求评估另一个 agent 的 workaround。
- 讨论并比较多种方案后，选择用户拥有的 PATH override + fnm 所有权排序。
- 目标包含真实 shell 启动行为、工具版本所有权、说明收敛和无副作用浏览器验证。
- 修改对象主要是用户级 shell 配置；工作区根本身不是 Git repo。

### `/go` 真正提供的帮助

1. **先把完成定义变成可证伪契约。**
   第一轮回归直接发现原 workaround 仍有缺口：观察到的 PATH index 是
   `priority=1, local=2, fnm=4`。因此 Hermes 若重新创建
   `~/.local/bin/node`，仍会遮蔽 fnm。若只验证 `agent-browser --version`
   正常，很可能会过早宣布完成。
2. **要求走真实 Pickup，而不只读配置文本。**
   最终从干净环境验证多种 zsh 启动方式、实际 Node provenance、真实浏览器
   open → snapshot → targeted close，并确认测试 session 已 inactive。
3. **Simplify gate 找到一个与真实事故同形的测试缺口。**
   初版测试只验证 `command -v` 能解析；review 后改为同时执行 `--version`，
   覆盖“软链存在但目标不可执行”的失效模式。
4. **完成审计迫使 agent 检查任务之外的副作用。**
   浏览器 smoke 使用唯一 session，禁止 `close --all`，并检查没有把临时状态
   当成完成证据。

### `/go` 带来的无效摩擦

1. backend / frontend 分节与本任务无关。
2. “固定写 2–3 个 e2e tests”过于机械。此次测试值得保留，是因为 PATH 有
   稳定且高风险的不变量，不是因为所有任务都天然适合 TDD。
3. canonical repo test command 不存在。
4. 最后要求 commit 不适用：主要修改是用户级配置，工作区根不是 Git repo。
5. agent 必须自行把“light TDD”翻译为“配置前后快照 + PATH invariant +
   多启动上下文 + 隔离 smoke”。翻译结果是对的，但方法选择本应是一等能力，
   不应靠 agent 绕开 skill 的默认形状。

### 本轮判断

这是 agent 的判断，不是用户拍板：

- 当前 `/go` 约 **70% 有帮助**：结果责任、契约、真实验证、Simplify、
  Pickup、完成审计。
- 约 **30% 是开发领域实现细节被提升成通用规则**：固定 e2e、backend /
  frontend、test runner、commit。

关键区别：

> 这次结果更可靠，是因为 `/go` 的核心纪律，而不是因为任务被成功伪装成了
> 软件开发。

## Problem statement

当前 `/go` 把两个层次耦合在一起：

1. **通用执行契约**：agent 接管结果责任，把已对齐目标推进到可验证、可接手的
   终态。
2. **开发方法包**：light TDD、backend/frontend verification、canonical tests、
   commit。

第二层是第一层在 coding 场景下的一种实现，不应等同于第一层。

随着 `/go` 被用于系统配置、研究、文档、设计和外部操作，继续往当前
`SKILL.md` 追加分支会形成一个 universal mega-skill：常驻上下文越来越重，
每个任务都要绕开大量不适用条款，也违反本仓库“Say it once; trust judgment”
的 authoring discipline。

## Ideal `/go`：agent 的结果责任模式

以下是 agent 对用户理想形态的解释，尚待用户确认：

> 把一个已经基本对齐的目标交给 agent；agent 接管结果责任，自主选择适合该
> 领域的方法，把任务推进到真实、可验证、可直接接手的终态。

### “可靠”

- 动手前定义什么证据能证明任务真的完成。
- 验证范围与目标范围一致，不拿窄测试支撑宽结论。
- 检查当前真实状态，不依赖旧报告、意图或“看起来合理”。
- 对不可逆和 outward-visible 操作保留精确权限边界。

### “符合我的标准”

- 主动读取 repo / worktree / runbook / AGENTS / goal / 历史决策。
- 不让用户重新枚举已有上下文能回答的问题。
- 只把会改变目标形状、权限或不可逆后果的结构性岔路交还用户。
- 通用 best practice 服从任务现场和用户已明确的工作纪律。

### “优雅”

- 找到最小但完整的机制，不为完成任务引入第二套所有权。
- 不留下临时进程、测试 session、重复文档、脏目录和误导性说明。
- 不伤害任务范围外的状态。
- 做完以后，下一位 agent 能从现场直接读懂当前状态、边界和下一步。
- 用户只有一个明确的 Pickup action。

### 它不是什么

- 不是 bypass permission。
- 不是“不问问题”：结构性未知仍必须先问。
- 不是永远 tests-first。
- 不是“做很多步骤”的同义词。
- 不是写完代码或测试变绿就算完成。
- 不是自动获得 push、发送消息、删除远端资源等额外权限。

## Solution shape：thin core + on-demand method packs

### Thin core

所有 `/go` 任务共享一条短执行脊柱：

1. **Outcome**：用户可感知的真实终态是什么。
2. **Pickup**：用户回来后只需要做哪一个动作。
3. **Boundary**：范围、权限、不可逆动作和结构性未知。
4. **Method selection**：按任务形状选择执行与验证方法。
5. **Execution**：自主推进所有 agent-scriptable 工作，不把 setup 甩回用户。
6. **Proof**：取得与目标同范围的完成证据。
7. **Simplify & cleanup**：审整个任务留下的系统状态，不只审 code diff。
8. **Handoff**：先给可直接接手的结果，再给校准信任所需的审计材料。

核心统一的是 outcome ownership 与 proof discipline，不统一具体证据形态。

### On-demand method packs

候选结构：

```text
/go
├── development
├── system-config-and-ops
├── research-and-decision
├── document-and-writing
├── product-and-design
├── data-analysis
└── external-actions
```

#### Development

保留当前 `/go` 已验证有价值的开发方法：

- light TDD
- app factory / protocol boundary
- frontend unit → component → live tiers
- canonical test/build command
- commit
- staged app Pickup

#### System config and ops

- current-state snapshot and provenance
- rollback / reversibility
- ownership and precedence
- idempotence
- startup/runtime contexts
- isolated smoke
- process/session/temp cleanup

#### Research and decision

- query and source coverage
- primary-source preference
- alternative hypotheses and counterevidence
- fact / inference / recommendation separation
- temporal freshness
- decision criteria and revisit trigger

#### Document and writing

- first clarify intended expression and edit scope
- preserve agreed local boundaries
- rendered/readback verification
- audience comprehension
- single source of truth and duplication control

#### Product and design

- real data and representative states
- interaction and edge-state coverage
- rendered screenshots/runtime evidence
- comparison against intent, not only implementation

#### Data analysis

- data scope and exclusions
- provenance
- uncertainty / unknowns
- whether the conclusion outruns coverage
- reproducible queries and artifacts

#### External actions

- exact target resolution
- authorization and outward-visible boundary
- dry-run or preview when available
- scoped mutation
- operation receipt and postcondition verification

## What to keep / move / reinterpret from current `/go`

### Keep in core

- agent = full-context worker, human = end-user consumer
- transparence and UX principles
- structural-ambiguity escalation rule
- “agent scripts what it can” staging discipline
- first-user Pickup verification
- Simplify gate
- completion audit and evidence-backed handoff

### Move to development pack

- mandatory light TDD
- backend / pure logic section
- frontend verification tiers
- stack-specific testing references
- canonical repo test command
- default commit behavior

### Reinterpret

- **Contract**：从 API/function contract 扩为 outcome + proof contract。
- **Tests**：从固定 e2e tests 扩为 task-appropriate evidence.
- **Simplify**：从 review diff 扩为 review the resulting system state.
- **Ship**：从 commit/PR 扩为 stage the real user Pickup；外部发布仍需单独授权。

## Cross-skill boundaries to resolve

### `gdd`

候选边界：

- `gdd` 负责 shape：目标、边界、决策、acceptance、Pickup。
- `/go` 负责 execute：接受 shaped goal 后接管结果责任。

未决：没有 GDD goal 的轻量任务，`/go` 应在内存中补最小 contract，还是创建
临时 goal artifact？

### `mindset`

候选边界：

- `/go` 只声明“必须选择合适方法”。
- `mindset` / method library 负责方法选择与 grain。

未决：`/go` 应显式调用 `mindset`，还是把 method-pack routing 保持为自身的轻量
判断，避免硬依赖和额外常驻成本？

### `my-simplify`

当前 fallback 主要审代码 diff。通用 `/go` 需要能审系统状态、文档重复、临时
资源、外部副作用。可以扩 `my-simplify`，也可以给非开发 pack 各自的 cleanup
gate；尚未决定。

### `closeup`

候选边界：

- `/go` 在交付前清理本任务直接创建的临时状态。
- `closeup` 负责整个工作 session 的收尾、脚手架退休和工作树恢复。

需要避免两边重复执行或互相假设对方会清理。

### Git / publishing skills

commit、push、PR、merge 不是通用 `/go` 的天然尾声：

- repo 内开发任务可以由 development pack 默认 commit。
- push / PR / merge 继续要求显式授权并交给对应 skill。
- 非 Git 任务不应为了满足 handoff 模板制造“未 commit”噪音。

## Risks / rabbit holes

1. **Universal mega-skill**：最大的风险。核心必须短，方法细节按需加载。
2. **把可靠性写成大 checklist**：强模型已经知道的通用步骤应删除；只保留本
   repo 的角色契约、阈值和决策规则。
3. **方法包过多**：先用真实 dogfood 形成，不按理论穷举。
4. **与 `gdd` / `mindset` / `closeup` 重叠**：先画责任边界再改 skill。
5. **非开发验证容易主观化**：每个 method pack 必须给出“什么算强证据”的
   少量原则，而不是把测试替换成口头自信。
6. **权限扩张**：terminal condition 仍不扩大授权范围，尤其是外部通信、发布、
   删除和付款。
7. **触发漂移**：是否继续 explicit-only、以及 description 如何让 runtimes
   正确匹配，需要单独拍板。

## Promotion criteria

升格为 goal 前，至少拿五种真实 dogfood 反推 `/go v2`：

1. repo feature implementation
2. user/system configuration
3. research → recommendation
4. document edit with rendered verification
5. outward-visible external action

每个案例回答：

- 哪些 core discipline 真正改变了结果？
- 哪些动作只是该领域的方法包？
- 什么证据足以证明完成？
- 哪一步如果省略，用户会拿到“看起来完成、实际没完成”的结果？
- 用户 Pickup 是否真的只有一步？

然后拍板：

1. core 的最小 6–8 步到底是什么。
2. development 内容如何迁出且不损失当前体验。
3. method packs 是 `/go/references/`、共享 `skills/references/`，还是由
   `mindset` 提供。
4. `/go` 与 `gdd` / `mindset` / `my-simplify` / `closeup` 的正式边界。
5. explicit invocation 和 description 的新措辞。
6. 是否 minor bump（行为定位变化，应按 AGENTS release discipline 处理）。

## Resolution（2026-08-03）

用户审阅并批准了 thin core + on-demand packs 的方向，最终收敛为：

- `/go` 是 explicit-only 的通用结果责任执行契约。
- core 固定为 Outcome / standards recovery / Boundary / method selection /
  Execution / Proof / completion sweep / Handoff。
- contract 使用 Outcome + Proof + Boundary + Pickup；Pickup 为零或一个动作。
- 首版发布七个精简 policy-delta packs；`external-actions` 是按需叠加的权限与
  postcondition overlay。
- 已有 GDD goal 为权威输入；轻量任务只补内存 contract，不制造临时 artifact。
- `mindset` 仅在 method/grain 真有歧义时按需使用；不是硬依赖。
- `my-simplify` 保持 code-only，由 development pack 使用；其他 pack 各自完成
  resulting-state polish。
- `/go` 清理由本任务直接产生的 residue；`closeup` 继续负责 session 生命周期。
- development 可以本地 commit；push / PR / merge / send / share / delete 等
  outward-visible 操作继续要求独立授权。
- 行为定位变化按 minor release 发布为 `0.8.0`。

### Original non-decisions（已被上述 Resolution 取代）

本 note 没有决定：

- 立即重写 `/go`。
- 删除 light TDD。
- 新建上述全部 method packs。
- 把所有非开发任务都自动路由给 `/go`。
- 改名。
- 版本号或发布日期。

下一步若要推进，应先把本 note 交给用户审阅/Grilling，收敛 core 和 cross-skill
边界，再升 `.gdd/goals/`；不要直接从本草稿改 `skills/go/SKILL.md`。
