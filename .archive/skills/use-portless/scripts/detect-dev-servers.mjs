#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const root = resolve(process.argv[2] || process.cwd());
const out = {
  root,
  nameHint: basename(root),
  package: null,
  files: {},
  candidates: [],
};

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function has(name) {
  const path = join(root, name);
  const ok = existsSync(path);
  out.files[name] = ok;
  return ok;
}

function grepFile(path, patterns) {
  if (!existsSync(path) || statSync(path).isDirectory()) return [];
  const text = readFileSync(path, "utf8");
  return patterns.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

function add(candidate) {
  out.candidates.push(candidate);
}

const pkgPath = join(root, "package.json");
if (existsSync(pkgPath)) {
  const pkg = readJson(pkgPath);
  if (pkg) {
    out.package = {
      name: pkg.name || "",
      scripts: pkg.scripts || {},
      portless: pkg.portless || null,
    };
    for (const [script, command] of Object.entries(pkg.scripts || {})) {
      if (/(dev|start|preview|serve|raw|api|web)/i.test(`${script} ${command}`)) {
        add({
          kind: "package-script",
          script,
          command,
          nameHint: pkg.name || basename(root),
          readsPort: /(^|[^A-Z_])PORT([^A-Z_]|$)|--port|\$PORT|process\.env\.PORT/.test(command),
        });
      }
    }
  }
}

for (const entry of readdirSync(root)) {
  if (/^vite\.config\.[cm]?[jt]s$/.test(entry)) {
    const path = join(root, entry);
    const text = readFileSync(path, "utf8");
    add({
      kind: "vite",
      config: entry,
      fixedPorts: [...text.matchAll(/\bport:\s*(\d+)/g)].map((m) => Number(m[1])),
      hasProxy: /\bproxy\s*:/.test(text),
      hasChangeOrigin: /changeOrigin\s*:\s*true/.test(text),
    });
  }
}

if (has("Makefile")) {
  const text = readFileSync(join(root, "Makefile"), "utf8");
  add({
    kind: "makefile",
    targets: [...text.matchAll(/^([A-Za-z0-9_.-]+):/gm)].map((m) => m[1]),
    fixedPorts: [...text.matchAll(/--port\s+(\d+)|:(\d{4,5})|PORT[=:]\s*["']?(\d+)/g)].map((m) =>
      Number(m[1] || m[2] || m[3]),
    ),
    readsPort: /\$\{?PORT|PORT:-/.test(text),
  });
}

if (has("pyproject.toml")) {
  add({
    kind: "python-project",
    signals: grepFile(join(root, "pyproject.toml"), [/uvicorn/i, /fastapi/i, /starlette/i]),
  });
}

for (const entry of readdirSync(root)) {
  if (entry.endsWith(".py")) {
    const path = join(root, entry);
    const text = readFileSync(path, "utf8");
    if (/ThreadingHTTPServer|HTTPServer|uvicorn|FastAPI|Flask/.test(text)) {
      add({
        kind: "python-entrypoint",
        file: entry,
        fixedPorts: [...text.matchAll(/["'](\d{4,5})["']|port\s*=\s*(\d{4,5})/g)].map((m) =>
          Number(m[1] || m[2]),
        ),
        readsPort: /os\.getenv\(["']PORT["']|os\.environ\.get\(["']PORT["']/.test(text),
      });
    }
  }
}

let parent = dirname(root);
for (let depth = 0; depth < 3; depth += 1) {
  for (const name of ["README.md", "AGENTS.md"]) {
    const path = join(parent, name);
    if (existsSync(path)) {
      const text = readFileSync(path, "utf8");
      const mentions = [];
      for (const match of text.matchAll(/(?:localhost|127\.0\.0\.1):(\d+)/g)) {
        mentions.push(Number(match[1]));
      }
      if (mentions.length) {
        add({ kind: "nearby-doc", file: path, fixedPorts: [...new Set(mentions)] });
      }
    }
  }
  parent = dirname(parent);
}

console.log(JSON.stringify(out, null, 2));
