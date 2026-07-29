import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { compressToWebp, mimeFor } from './compress-images.mjs';

// Rewrites <img src="local/path.ext"> into a base64 data URI so the document is
// self-contained. Idempotent: leaves data:/http(s):/file: sources alone. When
// compress is on, raster images are routed through compressToWebp first.
export async function inlineImages(html, { baseDir, compress = true, quality, maxWidth } = {}) {
  const re = /<img([^>]*?)\ssrc="([^"]+)"([^>]*)>/g;
  const stats = { inlined: 0, skipped: 0, rawBytes: 0, embeddedBytes: 0 };

  // Collect matches with their positions (String.replace can't await), do the
  // per-image work concurrently, then reassemble the doc by slicing on index —
  // positional, so byte-identical <img> tags each get their own replacement.
  const tasks = [...html.matchAll(re)].map((m) => ({
    index: m.index, full: m[0], pre: m[1], src: m[2], post: m[3],
  }));

  await Promise.all(tasks.map(async (t) => {
    if (/^(data:|https?:|file:)/.test(t.src)) { stats.skipped++; return; }
    const ext = extname(t.src);
    if (!mimeFor(ext)) { stats.skipped++; return; }
    const buf = readFileSync(resolve(baseDir, t.src));
    stats.rawBytes += buf.byteLength;
    let outBuf = buf, mime = mimeFor(ext);
    if (compress) {
      const r = await compressToWebp(buf, ext, { quality, maxWidth });
      outBuf = r.buffer; mime = r.mime;
    }
    stats.embeddedBytes += outBuf.byteLength;
    t.replacement = `<img${t.pre} src="data:${mime};base64,${outBuf.toString('base64')}"${t.post}>`;
    stats.inlined++;
  }));

  let out = '', cursor = 0;
  for (const t of tasks) {
    out += html.slice(cursor, t.index) + (t.replacement ?? t.full);
    cursor = t.index + t.full.length;
  }
  out += html.slice(cursor);
  return { html: out, stats };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const compress = !args.includes('--no-compress');
  const [src, dst] = args.filter((a) => !a.startsWith('--'));
  if (!src || !dst) { console.error('usage: inline-images.mjs <src.html> <dst.html> [--no-compress]'); process.exit(1); }
  const { html, stats } = await inlineImages(readFileSync(src, 'utf-8'), { baseDir: dirname(resolve(src)), compress });
  writeFileSync(dst, html);
  console.log(`inlined ${stats.inlined} image(s), skipped ${stats.skipped}; ${(stats.rawBytes / 1024).toFixed(0)} KiB raw → ${(stats.embeddedBytes / 1024).toFixed(0)} KiB embedded → ${dst}`);
}
