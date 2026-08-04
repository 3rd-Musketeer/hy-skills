import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = path.join(root, "skills");
const meta = JSON.parse(fs.readFileSync(path.join(root, "plugin.meta.json"), "utf8"));
const failures = [];
const allowedFrontmatter = new Set(["name", "description", "license", "metadata"]);
const forbiddenPortableTokens = ["$ARGUMENTS", "${CLAUDE_SKILL_DIR}", "${KIMI_SKILL_DIR}"];

const fail = (message) => failures.push(message);
const unquote = (value) => value.trim().replace(/^(["'])(.*)\1$/, "$2");

const entries = fs.readdirSync(skillsRoot, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) fail(`skills/${entry.name} must be a skill directory, not a top-level file`);
}

const skillDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const declaredSkills = [...meta.skills].sort();
if (JSON.stringify(skillDirs) !== JSON.stringify(declaredSkills)) {
  fail(`plugin.meta.json skills differ from skills/: declared=${declaredSkills.join(",")} actual=${skillDirs.join(",")}`);
}

for (const skillName of skillDirs) {
  const skillRoot = path.join(skillsRoot, skillName);
  const skillFile = path.join(skillRoot, "SKILL.md");
  if (!fs.existsSync(skillFile)) {
    fail(`skills/${skillName} is missing SKILL.md`);
    continue;
  }

  const source = fs.readFileSync(skillFile, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(`skills/${skillName}/SKILL.md has invalid frontmatter boundaries`);
    continue;
  }

  const frontmatter = match[1];
  const topLevelKeys = [...frontmatter.matchAll(/^([a-zA-Z0-9_-]+):/gm)].map((item) => item[1]);
  for (const key of topLevelKeys) {
    if (!allowedFrontmatter.has(key)) fail(`skills/${skillName}/SKILL.md uses non-portable frontmatter field ${key}`);
  }

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  if (!nameMatch) fail(`skills/${skillName}/SKILL.md is missing name`);
  if (!descriptionMatch) fail(`skills/${skillName}/SKILL.md is missing description`);
  if (nameMatch && unquote(nameMatch[1]) !== skillName) {
    fail(`skills/${skillName}/SKILL.md name does not match its directory`);
  }
  if (descriptionMatch && unquote(descriptionMatch[1]).length > 1024) {
    fail(`skills/${skillName}/SKILL.md description exceeds 1024 characters`);
  }
  if (source.split("\n").length > 500) fail(`skills/${skillName}/SKILL.md exceeds 500 lines`);

  const openaiFile = path.join(skillRoot, "agents", "openai.yaml");
  if (!fs.existsSync(openaiFile)) {
    fail(`skills/${skillName} is missing agents/openai.yaml`);
  } else {
    const openai = fs.readFileSync(openaiFile, "utf8");
    for (const field of ["display_name", "short_description", "default_prompt"]) {
      if (!new RegExp(`^\\s+${field}:`, "m").test(openai)) fail(`skills/${skillName}/agents/openai.yaml is missing ${field}`);
    }
  }

  const markdownFiles = [];
  const visit = (directory) => {
    for (const child of fs.readdirSync(directory, { withFileTypes: true })) {
      const childPath = path.join(directory, child.name);
      if (child.isDirectory()) visit(childPath);
      else if (child.name.endsWith(".md")) markdownFiles.push(childPath);
    }
  };
  visit(skillRoot);

  const referencesRoot = path.join(skillRoot, "references");
  if (fs.existsSync(referencesRoot)) {
    for (const entry of fs.readdirSync(referencesRoot, { withFileTypes: true })) {
      if (entry.isDirectory()) fail(`skills/${skillName}/references/${entry.name} creates a nested reference layer`);
    }
  }

  const referenceFiles = markdownFiles.filter((file) => path.dirname(file) === referencesRoot);
  const referenceNames = referenceFiles.map((file) => path.basename(file));

  for (const markdownFile of markdownFiles) {
    const relativeFile = path.relative(root, markdownFile);
    const markdown = fs.readFileSync(markdownFile, "utf8");
    if (markdown.includes("../")) fail(`${relativeFile} traverses outside its resource directory with ../`);
    for (const token of forbiddenPortableTokens) {
      if (markdown.includes(token)) fail(`${relativeFile} depends on client-specific token ${token}`);
    }

    if (path.dirname(markdownFile) === referencesRoot) {
      for (const referenceName of referenceNames) {
        if (referenceName === path.basename(markdownFile)) continue;
        if (markdown.includes(`\`${referenceName}\``) || markdown.includes(`](${referenceName})`)) {
          fail(`${relativeFile} chains to sibling reference ${referenceName}`);
        }
      }
    }

    const resourcePaths = [
      ...markdown.matchAll(/`((?:references|scripts|assets)\/[^`\s]+)`/g),
      ...markdown.matchAll(/\]\(((?:references|scripts|assets)\/[^)]+)\)/g)
    ].map((item) => item[1].split("#", 1)[0].replace(/[.,;:]$/, ""));

    for (const resourcePath of resourcePaths) {
      const target = path.resolve(skillRoot, resourcePath);
      if (!target.startsWith(`${skillRoot}${path.sep}`)) fail(`${relativeFile} references a path outside its skill: ${resourcePath}`);
      else if (!fs.existsSync(target)) fail(`${relativeFile} references missing resource ${resourcePath}`);
    }
  }
}

const manifestCheck = spawnSync(process.execPath, [path.join(root, "scripts", "render-manifests.mjs"), "--check"], {
  cwd: root,
  encoding: "utf8"
});
if (manifestCheck.status !== 0) fail((manifestCheck.stderr || manifestCheck.stdout).trim());

if (failures.length > 0) {
  console.error("Validation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Validated ${skillDirs.length} self-contained skills and all generated manifests.`);
