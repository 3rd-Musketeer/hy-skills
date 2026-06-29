import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import sharp from 'sharp';
import { build } from './build.mjs';
import { compressToWebp } from './compress-images.mjs';

// A light source doc: external <img src>, plain JSON code block, plus a
// language-hinted bash block. This is what an author writes (small, diffable).
function makeFixture() {
  const dir = mkdtempSync(join(tmpdir(), 'hadbuild-'));
  // A 1600px PNG with alpha — big enough that WebP should win handily.
  // (generated, not committed, so there's no binary fixture to maintain)
  return { dir };
}

async function writePng(dir, name, width = 3000) {
  const buf = await sharp({
    create: { width, height: 900, channels: 4, background: { r: 30, g: 100, b: 200, alpha: 1 } },
  }).png().toBuffer();
  writeFileSync(join(dir, name), buf);
  return buf.byteLength;
}

const SRC_HTML = (img) => `<!doctype html><html><body>
  <div class="figure"><img src="${img}" alt="fig"></div>
  <pre><code>{ "history_name": "Alice", "n": 6 }</code></pre>
  <pre><code class="language-bash">git clone https://example.com/repo.git
cd repo</code></pre>
  <pre><code>just prose, leave me plain</code></pre>
</body></html>`;

test('build produces a self-contained output and never mutates the source', async () => {
  const { dir } = makeFixture();
  await writePng(dir, 'fig.png');
  const src = join(dir, 'doc.html');
  const out = join(dir, 'doc.share.html');
  const srcText = SRC_HTML('fig.png');
  writeFileSync(src, srcText);

  const r = await build(src, out, { compress: true });
  const result = readFileSync(out, 'utf-8');

  // self-contained: no external img src survives; the image became a data URI
  assert.equal(/<img[^>]+src="(?!data:)/.test(result), false, 'no external img src remains');
  assert.match(result, /<img[^>]+src="data:image\/webp;base64,/, 'image inlined as base64 WebP');
  // code highlighted: shiki emits dual-theme spans
  assert.match(result, /class="shiki/, 'shiki highlighted the code');
  assert.match(result, /--shiki-light/, 'dual-theme vars present for the .shiki CSS to switch on');
  assert.equal(r.highlighted >= 2, true, 'json + bash blocks highlighted');
  // the plain-prose block is left untouched (conservative: not mis-highlighted)
  assert.match(result, /just prose, leave me plain/);

  // source is byte-identical after the build
  assert.equal(readFileSync(src, 'utf-8'), srcText, 'source untouched');

  rmSync(dir, { recursive: true, force: true });
});

test('build refuses to write output onto the source (out !== src guard)', async () => {
  const { dir } = makeFixture();
  const src = join(dir, 'doc.html');
  writeFileSync(src, '<html></html>');
  await assert.rejects(() => build(src, src), /refusing to write output onto the source/);
  // also rejects when out resolves to src via a different but equivalent path
  await assert.rejects(() => build(src, join(dir, '.', 'doc.html')), /refusing/);
  assert.equal(readFileSync(src, 'utf-8'), '<html></html>', 'source untouched after refusal');
  rmSync(dir, { recursive: true, force: true });
});

test('WebP compression yields a smaller embed than raw-PNG inlining', async () => {
  const { dir } = makeFixture();
  const rawPng = await writePng(dir, 'fig.png');
  const src = join(dir, 'doc.html');
  writeFileSync(src, SRC_HTML('fig.png'));

  const compressed = await build(src, join(dir, 'c.html'), { compress: true });
  const naive = await build(src, join(dir, 'n.html'), { compress: false });

  assert.equal(naive.embeddedBytes, rawPng, 'no-compress embeds the raw PNG bytes');
  assert.ok(compressed.embeddedBytes < naive.embeddedBytes, 'WebP embed is smaller than raw PNG');
  assert.ok(compressed.embeddedBytes < naive.embeddedBytes * 0.6, 'WebP is materially smaller');

  // maxWidth must actually downscale through the full build path (3000px -> 2400).
  // Regression guard: an earlier {...DEFAULTS, ...opts} spread let undefined opts
  // clobber the default maxWidth, so the image shipped at full resolution.
  const cText = readFileSync(join(dir, 'c.html'), 'utf-8');
  const b64 = cText.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/)[1];
  const meta = await sharp(Buffer.from(b64, 'base64')).metadata();
  assert.equal(meta.width, 2400, 'embedded WebP is downscaled to maxWidth');
  rmSync(dir, { recursive: true, force: true });
});

test('compressToWebp passes SVG through untouched (no rasterizing vectors)', async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>');
  const r = await compressToWebp(svg, '.svg');
  assert.equal(r.compressed, false);
  assert.equal(r.mime, 'image/svg+xml');
  assert.equal(r.buffer, svg);
});
