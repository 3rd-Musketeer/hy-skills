import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const meta = JSON.parse(fs.readFileSync(path.join(root, "plugin.meta.json"), "utf8"));
const mode = process.argv[2] ?? "--check";

if (!new Set(["--check", "--write"]).has(mode)) {
  console.error("Usage: node scripts/render-manifests.mjs [--check|--write]");
  process.exit(2);
}

const skillList = meta.skills.join(", ");
const description = `${meta.description} Ships ${skillList} as self-contained Agent Skills for Codex, Claude Code, Cursor, Kimi Code, and compatible clients.`;
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

const outputs = new Map([
  [
    ".codex-plugin/plugin.json",
    {
      name: meta.name,
      version: meta.version,
      description,
      author: meta.author,
      keywords: meta.keywords,
      skills: "./skills/",
      interface: {
        displayName: meta.interface.displayName,
        shortDescription: meta.interface.shortDescription,
        longDescription: meta.interface.longDescription,
        developerName: meta.interface.developerName,
        category: meta.interface.category,
        capabilities: meta.interface.capabilities,
        defaultPrompt: meta.interface.defaultPrompt
      }
    }
  ],
  [
    ".agents/plugins/marketplace.json",
    {
      name: meta.name,
      interface: { displayName: meta.interface.displayName },
      plugins: [
        {
          name: meta.name,
          source: { source: "url", url: meta.gitUrl, ref: "main" },
          policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
          category: meta.interface.category,
          description,
          version: meta.version
        }
      ]
    }
  ],
  [
    ".claude-plugin/plugin.json",
    {
      name: meta.name,
      description,
      version: meta.version,
      author: meta.author,
      homepage: meta.homepage,
      repository: meta.repository,
      keywords: meta.keywords
    }
  ],
  [
    ".claude-plugin/marketplace.json",
    {
      $schema: "https://json.schemastore.org/claude-code-marketplace.json",
      name: meta.name,
      description: `${meta.interface.longDescription} Self-hosted single-plugin marketplace.`,
      owner: meta.author,
      plugins: [
        {
          name: meta.name,
          displayName: meta.interface.displayName,
          description,
          source: "./",
          author: meta.author,
          homepage: meta.homepage,
          repository: meta.repository,
          keywords: meta.keywords,
          category: meta.interface.category
        }
      ]
    }
  ],
  [
    ".cursor-plugin/plugin.json",
    {
      name: meta.name,
      version: meta.version,
      description,
      author: meta.author,
      homepage: meta.homepage,
      repository: meta.repository,
      keywords: meta.keywords,
      skills: "./skills/"
    }
  ],
  [
    "kimi.plugin.json",
    {
      name: meta.name,
      version: meta.version,
      description,
      author: meta.author,
      homepage: meta.homepage,
      keywords: meta.keywords,
      skills: "./skills/",
      interface: {
        displayName: meta.interface.displayName,
        shortDescription: meta.interface.shortDescription,
        longDescription: meta.interface.longDescription,
        developerName: meta.interface.developerName,
        websiteURL: meta.homepage
      }
    }
  ],
  [
    ".kimi-plugin/marketplace.json",
    {
      version: "2",
      plugins: [
        {
          id: meta.name,
          displayName: meta.interface.displayName,
          source: meta.repository
        }
      ]
    }
  ]
]);

const drift = [];

for (const [relativePath, value] of outputs) {
  const target = path.join(root, relativePath);
  const expected = json(value);

  if (mode === "--write") {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, expected);
    console.log(`wrote ${relativePath}`);
    continue;
  }

  const actual = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;
  if (actual !== expected) drift.push(relativePath);
}

if (drift.length > 0) {
  console.error(`Generated manifests are stale: ${drift.join(", ")}`);
  console.error("Run: node scripts/render-manifests.mjs --write");
  process.exit(1);
}

if (mode === "--check") console.log(`Validated ${outputs.size} generated manifests.`);
