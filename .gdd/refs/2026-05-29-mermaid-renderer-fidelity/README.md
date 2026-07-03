---
date: 2026-05-29
topic: 轻量 Mermaid 渲染器能否替换 mmdc（html-as-doc §11）— fidelity spike 结论
---

# Mermaid 渲染器替换 — 保留 mmdc，mmdr 作为 escape hatch

**结论先行**：不换 §11，`mmdc` 仍是默认；`mmdr`（`mermaid-rs-renderer`）作为已验证的轻量备选，挂在 §12 既有的 "mmdc install breaks → vendor" trigger 下。

完整可复现记录（corpus + 三方输出 SVG + gallery + 截图 + 复现命令）见本 ref 文件夹内的 [`spike-mermaid-renderers/`](spike-mermaid-renderers/README.md)。本 ref 只记代码答不出的部分。

## 为什么没换（① alternatives + 理由）

§11 用 mmdc 拖进 puppeteer + Chromium。Gate = **§3 路由给 Mermaid 的 8 种图全部 fidelity 过关**（sequence/state/flowchart/ER/class/gantt/pie/mindmap）。两个真实的 browserless 候选：

| | coverage | 判定 |
|---|---|---|
| mmdc（baseline） | 8/8 | — |
| **mmdr** (Rust binary) | **8/8 通过** | fidelity 过关，但**输在 portability**：外部 Rust binary，无法像 sharp/shiki 那样 co-locate 进 `scripts/package.json`；mmdc 走 `npx` 反而零安装、任意 node 环境可跑。轻量收益（100–1400×、无 browser）不抵其安装/主题重调成本——而 Mermaid 只在 author-time 偶发渲染。 |
| **beautiful-mermaid** (pure JS) | **5/8 失败** | 直接淘汰：parser 硬拒 gantt/pie/mindmap。 |

**Phase 点确认**（"轻量版只解决了一半"）：两个候选都只是 §11 的 author-time 工具替换，都不改 Mermaid 的 phase——它仍是 author-phase（load-bearing render，迭代时必须可见）。这个 spike 从头到尾与 T3 share-build 无关，也不动它。轻量只回答了"依赖重量"那一半，没回答、也不需要回答 phase 那一半。

## 试过什么、为什么不行（② dead ends + failure mode）

- **beautiful-mermaid 即使在"支持"的类型上也有缺陷**：sequence 的 `rect rgba(…) … end` 块被当字面 note 文本 dump 出来；ER 渲染成极小/破碎的尺度。能用的只有 flowchart。
- **mmdr 的 config parser 比 mmdc 严**：拒绝 mermaid 标准的 `"fontSize": "14px"`（要 numeric `f32`）。现有 `mermaid-theme.json` 直接不可用，需 patch 出 numeric 变体（`theme-mmdr.json`）。
- **mmdr theme fidelity 是部分的**：patch 后多数类型吃到 apple token（`#0066CC`），但 pie 保留 mermaid 默认 lavender 调色板、flowchart subgraph / sequence note 变 secondary-yellow 填充。§4 token unification 要逐类型重调。
- **mmdc 首次 `npx --yes` 会卡在重新下载 Chromium**（即便本地已有 cache）→ timeout。可靠调用要 pin `PUPPETEER_EXECUTABLE_PATH` 指向 cache 的 `chrome-headless-shell` + `-p pptr.json`。若将来 mmdc flakiness 复发，这是 §11 值得加的一行注脚。

## 世界本身长这样（③ empirical surprise）

- spike 前 context 里记的纯 TS 候选 **`@rendermaid/core` 根本不存在**（npm 404，是 pre-compaction 的幻觉）。真实的 pure-JS browserless 候选是 lukilabs 的 **`beautiful-mermaid`**（elkjs 布局，零 DOM 依赖）。
- `mermaid-rs-renderer`（CLI 名 `mmdr`）是真实的：crates.io 0.2.2，纯 Rust，宣称 23 种图、100–1400× 快于 mermaid-cli；实测 8/8 渲染且 ER/class 的 PK/FK badge 比 mmdc 还干净，且用纯 `<text>`/`<tspan>`（无 `foreignObject`）——对 inline-SVG 内嵌反而更友好。
