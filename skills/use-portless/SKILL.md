---
name: use-portless
description: Start, expose, verify, and manage local dev servers through Portless stable named URLs. Use when the user wants to run a dev server, local preview, frontend app, API server, OAuth/MCP callback server, static preview, mobile/LAN preview, Tailscale/ngrok share, Playwright/browser verification target, monorepo app, git worktree preview, or reusable local URL with Portless.
when_to_use: >
  May trigger when the user wants a dev server, local preview, API, OAuth/MCP callback,
  browser verification, or stable local URL — including implicit context like "start the app"
  or "give me a preview URL". Do NOT auto-adopt Portless: propose route name, command,
  expected URL, and any setup steps, then wait for user go-ahead. Proceed without proposal
  only on explicit /use-portless or when the user already said to use Portless.
metadata:
  short-description: Run dev servers with stable Portless URLs
---

# use-portless

Use Portless as the local URL layer for dev servers. Prefer clean `.localhost` URLs and verified previews over project edits.

## Core Policy

- **Propose-first:** when this skill triggers from context (not explicit `/use-portless`), propose route name, command, expected URL, prerequisites, and cleanup — then wait for user go-ahead before running `portless` commands, editing project files, or steps that need sudo/Keychain. On explicit `/use-portless` or when the user already asked for Portless, proceed into the Workflow. If the user wants a direct start without Portless, do not force this skill.
- **Temporary run:** start or register the server through Portless without editing project files. This is the default for "start", "preview", "try", "show me", browser verification, screenshots, or one-off local testing.
- **Clean URL default:** use the default HTTPS proxy for previews, e.g. `https://<name>.localhost`. This is the main Portless value.
- **Maintained workflow:** propose config changes only when the user asks to add Portless to a project, standardize team workflow, commit a reusable script, update docs, or make future runs easier.
- **Project edits:** before editing, inspect local conventions and explain the exact files to change. Keep a direct non-Portless command available during migration, such as `dev:app`.
- **Safety:** treat LAN, Tailscale, ngrok, and public tunnels as sharing actions. Use them only when the user asks for device/team/public access or the task requires it.

## Workflow

0. **Propose (when not already authorized)**
   - After discovery, present: suggested route name, exact command, expected URL, prerequisites (CLI install, trust, proxy/service), and cleanup.
   - Wait for user go-ahead before steps 1–6. Skip this step on explicit `/use-portless` or when the user already authorized Portless.

1. **Check Portless availability**
   - Run `command -v portless`.
   - If missing, explain why Portless helps (stable named URL vs ephemeral port), propose `npm install -g portless`, and wait for user confirmation before installing.
   - Keep project files unchanged when the only blocker is a missing local Portless install.
   - Run `portless service status` when available. If it reports `Proxy on 443: responding` and `HTTPS: yes`, clean URL setup is ready.
   - For clean URLs, use the default HTTPS proxy. If setup needs sudo, Keychain, or trust confirmation, explain the benefit, propose the setup path (`portless trust` → `portless service install` recommended, or `portless proxy start`), note which steps need user interaction, and wait before running privileged commands.

2. **Discover the server shape**
   - Inspect nearby `package.json`, `vite.config.*`, `Makefile`, `pyproject.toml`, `docker-compose*.yml`, `README.md`, and obvious entrypoints.
   - Use `scripts/detect-dev-servers.mjs <path>` for a fast first pass when Node is available.
   - Identify framework, run command, current fixed port, whether it honors `PORT`, and health/preview path.

3. **Choose the route name**
   - Prefer a short product name from package name, directory name, README, or existing domain language.
   - Path heuristics when no stronger signal exists:
     - `topics/<topic>/playground` or a sibling UI directory → prefer the `<topic>` short name
     - `playground/backend`, `/api`, `cmd/server`, or similar backend signals → `api.<app>`
     - metrics, docs, or other side services → `metrics.<app>`, `docs.<app>`
     - `repos/.../<repo-name>` → repo or service name; in multi-app monorepos, use the subdirectory name
   - Use subdomains for paired services: `api.<app>`, `metrics.<app>`, `docs.<app>`.
   - Avoid Portless reserved names: `run`, `get`, `alias`, `hosts`, `list`, `trust`, `clean`, `prune`, `proxy`, `service`.

4. **Launch without editing files**
   - Package app: `portless <name> <package-manager> run <script>`.
   - Command app: `portless <name> <command> ...`.
   - Fixed-port server already running: `portless alias <name> <port>`.
   - Fixed-port command where the port must stay fixed: `portless <name> --app-port <port> <command> ...`.
   - Static directory: run a local static server, then alias it.
   - Clean URL target: default to the HTTPS proxy for previews, e.g. `https://<name>.localhost`.
   - Custom proxy port fallback: use only when the user explicitly asks for no-sudo bounded automation evidence. Run `portless alias <name> <app-port>` before `portless proxy start --no-tls -p <proxy-port>`. The resulting URL includes the proxy port, e.g. `http://<name>.localhost:1355`.
   - During bounded verification, run long-lived servers in the background, capture logs, record the PID, and clean up at the end. Leave servers running only when the user asked for a usable preview URL.

5. **Verify**
   - Run `portless list`.
   - Confirm the clean URL is present, such as `https://<name>.localhost`.
   - Probe the exact clean URL from `portless list`. Use `scripts/probe-url.mjs <url>` when Node is available.
   - For UI work, open the Portless URL in the available browser tool and verify the rendered page.
   - For API/MCP/OAuth work, probe `/healthz`, metadata endpoints, callback pages, or documented smoke routes.

6. **Report**
   - Return the clean URL, command used, route name, backing local port if known, verification result, and cleanup command. For aliases, cleanup is `portless alias --remove <name>`. Stop the proxy only when this run started an ad hoc proxy; leave an installed service running.
   - Mention project config only when it is a maintained-workflow task.

## Maintained Config Pattern

When the task is to make Portless a durable workflow, use this conservative package pattern:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:portless": "portless"
  },
  "portless": {
    "name": "myapp",
    "script": "dev"
  }
}
```

For teams ready to make Portless the default:

```json
{
  "scripts": {
    "dev": "portless",
    "dev:app": "vite"
  },
  "portless": {
    "name": "myapp",
    "script": "dev:app"
  }
}
```

For app servers, prefer compatibility with Portless-injected env:

```text
PORT
HOST
PUBLIC_URL
PORTLESS_URL
API_ORIGIN
```

Framework-specific recipes live in `references/framework-recipes.md`.

## Failure Handling

- Missing `portless`: explain why it is needed, propose `npm install -g portless` (or a project install when the repo already uses it), and wait for user confirmation before installing.
- CLI help: use `portless --help`. In Portless 0.14.0, some subcommand `--help` invocations may execute the subcommand.
- First-run trust prompt: propose `portless trust` if HTTPS trust was skipped; wait for user confirmation before running it.
- Port 443, sudo, or local CA trust setup: explain clean URL value, propose `portless trust` → `portless service install` (recommended) or `portless proxy start`, note user-interactive steps, wait for go-ahead, then retry the clean URL.
- Verification failed: diagnose by failure type (CLI missing, proxy down, trust issue, app not listening) and propose the next fix. Do not silently fall back to LAN/ngrok/tunnels unless the user asks.
- Custom proxy port: use it only after the user asks for a no-sudo automation fallback. Treat the `:<port>` URL as bounded test evidence.
- Safari `.localhost` resolution issues: propose `portless hosts sync`.
- Proxy loop between Portless apps: set `changeOrigin: true` in frontend proxy config.
- Stale crashed sessions: propose `portless prune`.
