import { createHighlighter } from 'shiki';
import { readFileSync, writeFileSync } from 'fs';

const LANGS = ['json', 'bash', 'shell', 'javascript', 'typescript', 'python', 'html', 'css', 'yaml'];
const ALIAS = { sh: 'bash', shell: 'bash', js: 'javascript', ts: 'typescript', py: 'python', yml: 'yaml' };

let _hl = null;
async function highlighter() {
  if (!_hl) _hl = await createHighlighter({ themes: ['github-light', 'github-dark'], langs: LANGS });
  return _hl;
}

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function looksLikeJson(text) {
  try { JSON.parse(text); return true; } catch {}
  const t = text.trim();
  return /^[[{]/.test(t) || /^"[^"]+"\s*:/m.test(t);
}

// Pick a language for a <pre><code> block: an explicit class="language-X" hint
// wins; otherwise only JSON is auto-detected (conservative — never guess wildly,
// so pseudo-config / prose blocks stay plain rather than mis-highlighted).
function pickLang(classAttr, decoded) {
  const m = classAttr && classAttr.match(/language-([\w-]+)/);
  if (m) {
    const raw = m[1].toLowerCase();
    const lang = ALIAS[raw] ?? raw;
    if (LANGS.includes(lang)) return lang;
  }
  return looksLikeJson(decoded) ? 'json' : null;
}

export async function highlight(html) {
  const hl = await highlighter();
  const re = /<pre><code(?:\s+class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;
  let count = 0;
  const out = html.replace(re, (full, classAttr, code) => {
    const decoded = decodeEntities(code);
    const lang = pickLang(classAttr, decoded);
    if (!lang) return full;
    count++;
    return hl.codeToHtml(decoded, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    });
  });
  return { html: out, count };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [src, dst] = process.argv.slice(2);
  if (!src || !dst) { console.error('usage: highlight.mjs <src.html> <dst.html>'); process.exit(1); }
  const { html, count } = await highlight(readFileSync(src, 'utf-8'));
  writeFileSync(dst, html);
  console.log(`highlighted ${count} block(s) → ${dst}`);
}
