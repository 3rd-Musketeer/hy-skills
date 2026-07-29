#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { highlight } from './highlight.mjs';
import { inlineImages } from './inline-images.mjs';

// Orchestrator for the optional post-author build step. Reads a light source
// HTML (external <img src>, plain <pre><code>), runs the transforms in memory,
// and writes a SELF-CONTAINED output to a SEPARATE path. The source is never
// mutated; the resolved-path check below rejects the common "out == src"
// mistake (it does not chase symlinks / case-insensitive-FS aliases — the
// threat model is a fat-fingered output name, not adversarial paths).
export async function build(srcPath, outPath, { compress = true } = {}) {
  const src = resolve(srcPath);
  const out = resolve(outPath);
  if (src === out) {
    throw new Error(`refusing to write output onto the source (${srcPath}). Pick a separate path, e.g. ${srcPath.replace(/\.html$/, '') || srcPath}.share.html`);
  }

  let html = readFileSync(src, 'utf-8');
  const hl = await highlight(html);
  html = hl.html;
  const img = await inlineImages(html, { baseDir: dirname(src), compress });
  html = img.html;

  writeFileSync(out, html);
  return { highlighted: hl.count, ...img.stats, bytes: Buffer.byteLength(html, 'utf-8'), out };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const compress = !args.includes('--no-compress');
  const [src, out] = args.filter((a) => !a.startsWith('--'));
  if (!src || !out) {
    console.error('usage: build.mjs <src.html> <out.html> [--no-compress]');
    process.exit(1);
  }
  try {
    const r = await build(src, out, { compress });
    const kib = (n) => `${(n / 1024).toFixed(0)} KiB`;
    console.log(`highlighted ${r.highlighted} code block(s)`);
    console.log(`inlined ${r.inlined} image(s) (skipped ${r.skipped}): ${kib(r.rawBytes)} raw → ${kib(r.embeddedBytes)} embedded${compress ? ' (WebP)' : ''}`);
    console.log(`self-contained → ${r.out} (${kib(r.bytes)})`);
  } catch (e) {
    console.error(`build failed: ${e.message}`);
    process.exit(1);
  }
}
