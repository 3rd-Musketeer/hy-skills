# Spike — lightweight Mermaid renderers vs mmdc

**Date** 2026-05-29 · **Status** done · **Verdict** keep mmdc as the §11 default; record `mmdr` as a validated fast/light escape hatch.

## Question

§11 compiles Mermaid via `@mermaid-js/mermaid-cli` (mmdc), which drags in puppeteer + Chromium. Is there a lighter renderer that clears the fidelity bar across the **8 diagram types §3 routes to Mermaid** (sequence / state / flowchart / ER / class / gantt / pie / mindmap)?

Two real browserless candidates (the pre-spike note had hallucinated a third, `@rendermaid/core` — it does **not** exist on npm):

| Renderer | Form | Layout | Deps | Install |
|---|---|---|---|---|
| **mmdc** (baseline) | Node + Chromium | dagre + browser text metrics | puppeteer | `npx`, zero install, any node env |
| **mmdr** (`mermaid-rs-renderer` 0.2.2) | Rust binary | native Rust | none (static) | `cargo install` (~4 min compile) / prebuilt |
| **beautiful-mermaid** 1.1.3 | pure JS (lukilabs) | `elkjs` | elkjs + entities | `npm i`, co-locates in scripts/ |

## Result — coverage gate

| type | mmdc | mmdr | beautiful-mermaid |
|---|---|---|---|
| sequence | ✓ | ✓ | ⚠ parses `rect…end` block as literal note text |
| state | ✓ | ✓ | ✓ (layout diverges) |
| flowchart | ✓ | ✓ | ✓ (clean, closest to mmdc) |
| ER | ✓ | ✓ (PK/FK badges, ≥mmdc) | ⚠ renders tiny / broken scale |
| class | ✓ | ✓ | ✓ (sparse) |
| gantt | ✓ | ✓ | ✗ **parser rejects** |
| pie | ✓ | ✓ (ignores apple palette) | ✗ **parser rejects** |
| mindmap | ✓ | ✓ | ✗ **parser rejects** |
| **score** | **8/8** | **8/8** | **5/8** |

See `gallery.html` (open in a browser) and `png/` for the visual comparison. Corpus in `corpus/`, raw SVG outputs in `out-mmdc/` `out-rs-themed/` `out-bm/`.

## Findings

**beautiful-mermaid — rejected.** 5/8 coverage is an automatic gate failure: it hard-rejects gantt, pie, and mindmap at the parser ("Invalid mermaid header"). Even on supported types it has defects — it dumped a sequence `rect rgba(…) … end` directive as literal note text, and rendered the ER diagram at a broken tiny scale. Flowchart is the one type it does well. Not viable as an mmdc replacement here.

**mmdr — passes fidelity, loses on portability.** Renders all 8 with good-to-excellent structural fidelity (ER/class arguably nicer than mmdc; uses plain `<text>`/`<tspan>`, no `foreignObject`, which is actually *better* for inline-SVG embedding). 100–1400× faster, no browser. But three real adoption costs:

1. **Not npm.** It's an external Rust binary (`cargo install` / Homebrew / Scoop), so it can't co-locate in `scripts/package.json` the way sharp/shiki do. mmdc-via-`npx` is paradoxically *more* portable for this skill's distribution model: zero install, runs in any node env.
2. **Config incompatibility.** mmdr's theme parser is stricter than mmdc's — it rejects the mermaid-standard `"fontSize": "14px"` (wants a numeric `f32`). The existing `mermaid-theme.json` does **not** work as-is; it needs a patched numeric variant (see `theme-mmdr.json`).
3. **Partial theme fidelity.** With the patched theme, most types pick up the apple tokens (`#0066CC`), but pie keeps mermaid's default lavender palette and flowchart subgraphs / sequence notes get a secondary-yellow fill. §4 token unification would need per-type re-tuning.

## Decision

**Keep mmdc as the documented §11 default. Do not swap.** The fidelity is good but not pixel-equal, and mmdc's `npx` path is zero-install and canonical. mmdr's win (speed/weight) doesn't pay for its loss (platform-specific binary + theme re-tuning) given mermaid renders only occasionally at author-time.

**Record mmdr as a validated escape hatch.** This maps onto the existing §12 trigger *"mmdc install or maintenance breaks → consider vendoring."* mmdr is the proven answer: a fast, browserless, full-coverage drop-in for CI / sandboxes / any environment where puppeteer+Chromium is unavailable — with the two caveats above (numeric-fontSize theme, partial palette).

**Phase point confirmed (the "轻量版只解决了一半" judgment).** Both candidates are *author-time tooling swaps* for §11. Neither changes mermaid's phase: it stays author-time (load-bearing render, must be visible while iterating) regardless of renderer. This spike was never about folding mermaid into the share-phase build — the lightweight question only ever addressed the dependency-weight half, not the phase half. No change to the T3 build pipeline.

## Reproduce

```bash
# baseline (cached chromium)
npx @mermaid-js/mermaid-cli -i corpus/N.mmd -o out-mmdc/N.svg -c ../../../../skills/html-as-doc/references/mermaid-theme.json -b transparent
# mmdr (after: cargo install mermaid-rs-renderer)
mmdr -i corpus/N.mmd -o out-rs-themed/N.svg -c theme-mmdr.json
# beautiful-mermaid (npm i beautiful-mermaid; renderMermaidSVG(code))
```
