import sharp from 'sharp';

export const DEFAULTS = { quality: 82, maxWidth: 2400 };

// Pure image transform: raster buffer -> WebP buffer (quality + max-width clamp,
// alpha preserved). Returns the ORIGINAL buffer/mime untouched for vector (SVG)
// or already-WebP input, so callers can pass everything through unconditionally.
export async function compressToWebp(buffer, ext, opts = {}) {
  // `??` not spread: callers thread through `{quality: undefined, maxWidth: undefined}`
  // when the flag is unset, and an explicit `undefined` would clobber the default.
  const quality = opts.quality ?? DEFAULTS.quality;
  const maxWidth = opts.maxWidth ?? DEFAULTS.maxWidth;
  const e = ext.toLowerCase();
  if (e === '.svg' || e === '.webp' || e === '.gif') {
    // SVG is vector (don't rasterize); webp already compressed; gif may animate.
    return { buffer, mime: mimeFor(e), compressed: false };
  }
  const img = sharp(buffer, { failOn: 'none' });
  const meta = await img.metadata();
  if (meta.width && meta.width > maxWidth) img.resize({ width: maxWidth, withoutEnlargement: true });
  const out = await img.webp({ quality }).toBuffer();
  return { buffer: out, mime: 'image/webp', compressed: true };
}

export function mimeFor(ext) {
  return {
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  }[ext.toLowerCase()] ?? null;
}
