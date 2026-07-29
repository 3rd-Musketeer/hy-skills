---
name: infisical-secrets
description: Discover existing secrets in the user's Infisical project and dump only the requested subset into a local env file for agent or model-provider development. Use only when the user explicitly asks to use Infisical for local secrets, configure model/API keys, dump secrets, or set up env files from Infisical.
when_to_use: Explicit invocation only. Trigger when the user asks to configure local project secrets from Infisical, find API keys in Infisical, dump provider/model keys into .env.infisical, or set up an agent project with model credentials. Do not auto-trigger for ordinary environment-variable discussion or app setup.
---

# infisical-secrets

Configure a local project with the secrets it needs from the user's Infisical store.

The job is **dynamic discovery**, not a hard-coded provider map. Use the Infisical CLI/API as the source of truth for available secret names, then dump only the chosen subset into a local env file.

## Default shape

Preferred local output:

```text
.env.infisical
.env.local
.envrc
```

`.envrc`:

```bash
dotenv_if_exists .env.infisical
dotenv_if_exists .env.local
```

`.env.local` is for machine-local overrides and temporary settings. It loads after `.env.infisical`, so it can override matching names.

`.gitignore`:

```gitignore
.env.infisical
.env.local
```

## Workflow

### 1. Establish the request

Identify:

- Providers or models requested by the user, such as OpenAI, Claude, Gemini, OpenRouter, DeepSeek, xAI, Together, Helicone, Langfuse.
- Target Infisical environment, default `dev`.
- Target Infisical path, default `/`.
- Target env output file, default `.env.infisical`.
- Global Infisical fallback, if the current repo is not bound to a project.

Treat provider aliases as search hints only. Common hints:

| User says | Search hints |
|---|---|
| OpenAI / GPT | `openai`, `gpt` |
| Claude | `anthropic`, `claude` |
| Gemini | `gemini`, `google` |
| OpenRouter | `openrouter` |
| Observability | `helicone`, `langfuse` |

### 2. Check local tools

Check before relying on them:

```bash
command -v infisical
command -v direnv
```

On macOS, install missing CLI:

```bash
brew install infisical/get-cli/infisical
```

If `direnv` is missing, install it and ensure the user's shell hook is active before depending on automatic `.envrc` loading.

### 3. Bind or confirm the Infisical project

Use this priority order:

1. **Repo binding**: if `.infisical.json` exists, use it.
2. **Global fallback**: if `.infisical.json` is missing, use the user's global Infisical project from environment variables.
3. **Interactive binding**: if neither exists, run `infisical init` or ask the user which project should be the global fallback.

Global fallback variables:

```bash
INFISICAL_GLOBAL_PROJECT_ID=<project-id>
INFISICAL_GLOBAL_ENV=dev
INFISICAL_GLOBAL_PATH=/
```

`INFISICAL_GLOBAL_PROJECT_ID` is not a secret, but keep it user-local. Do not hard-code a private project ID into this public skill.

If the repo is unbound and `INFISICAL_GLOBAL_PROJECT_ID` is set, create a local `.infisical.json`:

```bash
jq -n \
  --arg workspaceId "$INFISICAL_GLOBAL_PROJECT_ID" \
  --arg defaultEnvironment "${INFISICAL_GLOBAL_ENV:-dev}" \
  '{
    workspaceId: $workspaceId,
    defaultEnvironment: $defaultEnvironment,
    gitBranchToEnvironmentMapping: null
  }' > .infisical.json
```

If login is missing, run:

```bash
infisical login
```

If the global fallback is not configured, run:

```bash
infisical init
```

Prefer using the user's existing global AI/model secrets project. If project creation is needed, ask before creating it.

### 4. Discover available secrets

List candidates dynamically from Infisical. Commands that read secrets must write to a private temp file first because CLI output may include secret values. Extract and print only secret names, then delete the temp file:

```bash
tmp="$(mktemp)"
chmod 600 "$tmp"
infisical secrets --env=dev --path=/ --recursive --output=json > "$tmp"

jq -r '.. | objects | .key? // .secretKey? // .secretName? // .name? | select(type == "string")' "$tmp" | sort -u

rm -f "$tmp"
```

Search candidate secret names using the user's provider/model hints. Prefer exact provider-standard names when present, but let the live secret inventory decide.

### 5. Resolve ambiguity

If one clear secret matches a requested provider, choose it.

If several plausible secrets match, ask one compact confirmation question listing only secret names. Example:

```text
Gemini has multiple matches: GEMINI_API_KEY, GOOGLE_API_KEY, GOOGLE_AI_STUDIO_KEY. Which one should this project use?
```

If no match exists, report the missing provider and the paths checked.

### 6. Dump the selected subset

Write only selected secrets to a temp file first, then replace `.env.infisical`.

```bash
out=".env.infisical"
tmp="$(mktemp)"
chmod 600 "$tmp"

infisical secrets get OPENAI_API_KEY ANTHROPIC_API_KEY \
  --env=dev \
  --path=/ \
  --output=dotenv > "$tmp"

mv "$tmp" "$out"
chmod 600 "$out"
```

Then create or update `.envrc` and `.gitignore` as needed, and reload `direnv`:

```bash
direnv allow .
direnv reload
```

### 7. Verify without leaking values

Verify names only:

```bash
cut -d= -f1 .env.infisical
```

Check loaded environment names without values:

```bash
direnv export json | jq 'keys'
```

Final response should include:

- Requested providers configured.
- Env var names written.
- Output file path.
- Missing or ambiguous providers.
- Any human action still needed, such as adding a missing secret in Infisical.

## Safety rules

- Never print secret values in chat, logs, command output summaries, or diffs.
- Never run shell tracing (`set -x`) around secret commands.
- Redirect commands that return values directly into a private temp file.
- Keep `.env.infisical` and `.env.local` out of git.
- Set local secret files to mode `600`.
- Prefer subset dumps over full-project dumps to reduce plaintext exposure.
- Use `infisical run -- <command>` only when the user wants ephemeral injection or the project should avoid a plaintext local env file.
