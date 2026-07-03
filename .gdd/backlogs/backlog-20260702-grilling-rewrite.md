---
title: grilling-rewrite
status: done
created_at: 2026-07-02
appetite: normal
---

> **v1 落地记录（2026-07-02）**：`skills/grilling/SKILL.md` 已按本 brief 重写为可体验版本，进入 dogfood-迭代循环。待拍板项按讨论倾向取了默认值：①命名保留 **grilling**（名字买 relentless 姿态，doctrine 买准确）；②outline 落 **`.tmp/grilling/YYYYMMDD-<slug>.md`**（对齐 gdd 的 `.tmp/` staging 约定）；③产物落点：gdd 项目 → goal Decisions + backlog，否则 topic note 或 human 指定；④开局对齐与收尾清扫**合并为一个 skill**，两种入口同一套机制。体验后不合手感的点回写本 brief 迭代。

# Draft: 把 grilling 重写为 Haoyang 自己的拷问纪律

## Friction

现有 `skills/grilling/SKILL.md` 是 mattpocock/skills 的 16 行原样搬运，与本人实际工作风格的实证对照发现核心条款不成立，且自身有硬伤：

- 正文是用户口吻（"Interview **me** relentlessly"），作为对 agent 的指令指代错位。
- 触发策略自相矛盾：README 说 "Explicit invocation only"，frontmatter description 却是可自动触发的措辞，也没有其他 explicit-only skill 的 "Do NOT auto-trigger" 守卫。
- 无产物落点（问完的结论去哪不知道）、无停止条件、未接入 gdd 管线（grilling 天然是 goal shaping 的上游/收尾环节）。
- **one-question-at-a-time 被大量反证**（见下），照原样执行只会拖慢节奏。

## 实证依据（2026-07-02，mori-ws 全量对话语料归纳）

语料：Claude Code 侧 288 个 session 文件（去重后 1318 条亲手消息，114 条含质询标记）+ Codex 侧 54 个 mori-ws session（~1698 条，144 条含质询标记），全部集中在 2026-06/07。信息最密的原始 session（可回查）：CC `a3371e2a`（06-11 MCP polish）、`afcadc44`（06-07 检索引擎）、`c2bad828`（06-29 gdd/PRD）、`4f6f1e84`（07-01/02 energyOS v3）；Codex `019f1b58`（07-01，**唯一一次真实调用 grilling skill**）、`019ecfd8`（06-16）。

### 本人直接表述（2026-07-02 口述补充 — 优先级高于以下所有语料推断）

1. **一次只问一题是我要的，大清单轰炸是 anti-pattern。** 语料里"一条消息批复 5–9 个编号问题"是对 agent 倾倒问题清单的**应对行为，不是偏好**。最舒服的形态：agent 自己想清楚要问哪些，然后一个一个问，每问一个给【选项 + 各选项分析 + 推荐】。（方法论教训：transcript 挖出的行为 ≠ 偏好——用户的回复形态会适应 agent 的提问形态。）
2. **Outline 先行，否则会被带偏。** 已观察到的 anti-pattern：agent 不做 outline 直接一个个问 → 被每次回答带偏，在单个问题上无穷追问，忘记自己原本要问的清单，节奏跑偏。正确做法：开问前把要问的清单写下来（如 tmp 文件）；问的过程中发现值得追问的点，先补进清单、不当场追杀，然后顺着清单问下去；不因回答里的额外信息偏离原定序列。
3. **Grilling 的本质是对齐 —— "我不知道 agent 不知道我的什么想法和需求"。** 我不想自己去枚举要约束哪些东西并手打出来，那是 agent 的活：动手前做 brain test（脑内推演一遍任务），找到模糊边界和未知选择，**做之前**问清楚；执行中新冒出的问题随做随问即可。

### 本人的 grilling 模式（语料归纳，P1–P10）

1. **岔路清单式**：核心对齐动作是索要"需要我拍板的决策点"清单，然后批量批复（A1/A2、#1/#2 编号）。"在这个指导思想下，还有什么需要我决断的岔路？"
2. **先调研后动手**：拿不准的分歧改判为"去验证"——"我觉得这两个方案都要 probe，不是二选一的关系，结论说话"。
3. **溯源拷问**：参数/分类/结论必须区分"有依据"和"你编的"——"这个 temperature 是 official docs 明确推荐的吗？还是你自己随便设的？"
4. **必要性/ROI 拷问**：KISS / YAGNI / "是否值得这个复杂度" / "有什么产品价值"。
5. **机制展开**：不满足于 what，要 how/why 到能复述——"讲一下是哪里污染了，怎么污染的"。
6. **自我提案 + 邀请反驳**：先给设计，再要 agent 挑毛病、给替代项、给单一推荐；愿意被证明是错的。
7. **风险具名 + 边界枚举**：直接列反例场景压测（一次枚举 7 种中美时区用户组合），不说空泛的"考虑边界情况"。
8. **收束信号明确、产物落地强制**：拍板词"同意/ok/我拍板了/gdd"；拍板后必写 note / 规格 / goal doc Decisions；未决项一律 backlog。
9. **抽样体感验收**：数值之外要看代表性原始样本"我自己来体感一下"。
10. **理解回环**：答偏立即"我的意思是/我问的不是这个"重述，agent 必须回到原问题而非顺着自己的理解继续。

### 反模式（他明确不吃的，A1–A7）

- 问文档/代码/note/飞书/历史 session/memory 里已有答案的问题（"重读一下，你问我的问题里面很多都有解答"）。
- 不做调研就给结论或开问（"你做了调研吗"→"请你先调研"，连续两条明显不满）。
- 丢失产品视角、技术自嗨（最强烈爆发："你得有产品经理的思维"；技术拷问必须挂在"用户拿到什么"上）。
- 方案/讨论无限膨胀（grilling 环节中骂过"你的生成规则也是想的太复杂"——grilling 的目的之一是砍实体，不是把方案问复杂）。
- 给选项不给单一推荐（"统一你的推荐"）。
- **一次倾倒大清单让他回复**（本人纠正后确认为 anti-pattern；语料里的批量批复是应对行为，见上方"本人直接表述"）。
- **无 outline 的逐题问**：被每次答案带偏、单题无穷下钻、忘记原清单（本人口述观察）。
- 停留在思考层不产出（"要产出可见的结果，而不是一直停留在思考层面"，出现 2 次）。

### mattpocock 条款裁决

| 原条款 | 裁决 |
|---|---|
| Interview me relentlessly about every aspect | **改**：不是被全面面试，而是"把剩余问题问干净"——开局对齐（列岔路）+ 收尾清扫（反复扫到问空，07-01 真实调用连扫三轮） |
| Walk each branch, one-by-one | **保留精神、改形态**：按分支推进，但靠批量裁决；分支出口三态：拍板 / probe / backlog |
| For each question, provide recommended answer | **强化保留**：推荐必须带依据/出处，"随便设的"会被溯源拷问打回 |
| Ask questions one at a time | **保留（本人显式确认）+ 补 outline 纪律**：语料初判"反转"是误读——批量批复是应对行为。一次一题、每题带选项+分析+推荐；前提是 outline 先行，追问入队不追杀 |
| Explore codebase instead of asking | **保留并扩展**：扩展到 note/goal doc/飞书/历史 session/memory；且"能用实验回答的也不要问我——去 probe" |
| （无）结论落地 | **新增**：每次 grilling 以工件收尾 |
| （无）问题资格审查 | **新增**：每题要能说出"答案不同会改变什么"+ 用户价值挂钩 |

## Solution shape

重写后的 skill 骨架（强证据支撑，除标注推断外）：

- **定位**：relentless 提问纪律，混合三种提问能量（2026-07-02 本人补充：不只是 align）——①**对齐题**：找出"human 不知道 agent 不知道的东西"，把模糊边界、未知选择在动手前问清；②**压力题**：溯源 / ROI / KISS / 反例边界，试图把方案问塌；③**开脑题**：探索性、创造性的 what-if，问题本身要能启发 human 走到没想过的选项。做任务之前 brain test 推演一遍再开问；执行中新问题随做随问。outline 提纲对三种题型都留配额，开脑题结构性保证、不靠 agent 心情。
- **触发**：explicit-only（description 内置守卫）。两个入口形态：①开局对齐——human 给出 brief/设计后，agent 推演并把不确定边界问干净再动手；②收尾清扫——收敛后反复调用直到问空。支持幂等重复调用。
- **Outline 先行**：开问前先自查（代码/note/goal doc/文档/历史 session/memory 能答的不问），把要问的问题按依赖排序写入 tmp 文件（outline）；问题三分流后只留 decide 级进入提问序列。
- **一次只问一题**：从 outline 顺序取题；每题带【选项 + 各选项分析 + 推荐（附一行依据/出处）+ consequence（答案不同会改变什么）】，答不出 consequence 的问题删掉；每题挂用户价值；保持 KISS 压力方向（拷问以砍实体为荣）。
- **追问入队不追杀**：回答中冒出的值得追问的点先补进 outline，回到清单节奏；不因回答里的额外信息偏离原定序列，不在单题上无穷下钻。
- **三态分流**：decide（要人拍板，进提问序列）/ probe（可用实验或调研回答——给出 probe 方案而非问人）/ backlog（不影响主线）——probe 与 backlog 的分流结果列出来供确认。
- **答后行为**：每题得到裁决后简短回显并记录，继续下一题；遇"我的意思是/我问的不是这个"必须回到原问题重新理解，不许顺着自己原来的理解继续。
- **产物落地**：默认写当前 topic 的 note；gdd 项目内落 goal doc Decisions + backlog；"需要验证的关键假设"单独成清单。对接 gdd 既有容器，不新造格式。
- **停止条件**：①连续一轮扫不出 decide 级问题；②decide 全有裁决、probe 有去处、backlog 已记录；③human 给收束词。结束时输出"岔路已清空，剩余 X 项 probe / Y 项 backlog"式收尾。
- **语言**（推断）：中文为主中英术语混排，直给结论，编号列表/表格为主要格式。

## Rabbit holes

- 不要把 grilling 写成第二个 gdd——它是"问题清扫纪律"，产物对接 gdd 容器而不重造 shaping 流程；与 gdd 的分工边界要在重写时想清楚。
- probe 分流依赖 harness 有 subagent/调研能力；skill-only 运行时需要降级路径（列出 probe 方案交给 human 自行派发）。
- 语料全部来自 2026-06/07 单一工作区（mori-ws 6 月才建立），样本期短；风格可能随项目类型（研究型 vs 工程型）漂移，首版发布后要靠 dogfood 校准。

## Promotion criteria

- 对 Solution shape 里几个默认值的拍板：outline tmp 文件的落点与命名（是否复用 `.tmp/` 约定）、产物默认落点（note vs goal Decisions 的优先序）、开局对齐与收尾清扫是否合并为一个 skill。
- **命名拍板**：grilling vs align vs 第三名（sparring/socratic/深访）。2026-07-02 讨论倾向：**留 grilling**——三种能量共享的是 relentless 姿态而非问题类型，名字买姿态、doctrine 买准确；align 只覆盖三分之一且否定发散性；名字偏窄+内文够宽可行，名字寡淡则不会被调用。
- 下一个真实的 plan-stress-test 场景出现时（有活体 dogfood 对象）即可促发重写。
