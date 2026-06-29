# Framework Recipes

Use these recipes after the main `SKILL.md` workflow identifies the server shape.

## Contents

- Node package apps
- Portless config files
- Monorepo and worktrees
- Vite with local API proxy
- Python Uvicorn / FastAPI
- Go HTTP services
- Static HTML
- Clean URL setup
- Custom proxy port fallback
- OAuth / MCP callback servers
- Mobile, LAN, and external sharing
- OS startup service

## Node Package Apps

Discovery:

```bash
sed -n '1,160p' package.json
ls vite.config.* next.config.* 2>/dev/null
```

Temporary run:

```bash
portless
portless run
portless run next dev
portless <name> npm run dev
portless <name> pnpm run dev
portless --script start
```

Use `--app-port` only when the project relies on a fixed port:

```bash
portless <name> --app-port 5180 npm run dev
```

Bypass Portless for one command:

```bash
PORTLESS=0 pnpm dev
```

Durable config:

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

You can also put Portless directly in a package script:

```json
{
  "scripts": {
    "dev": "portless run next dev"
  }
}
```

With a `portless.json`, keep the package script framework-native and run `portless` or `portless run` from the project root:

```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

## Portless Config Files

Use `portless.json` for maintained project defaults:

```json
{
  "name": "myapp",
  "script": "dev",
  "appPort": 5180
}
```

Use the package.json `"portless"` shorthand when one package owns the route:

```json
{
  "name": "@myorg/web",
  "portless": "myapp"
}
```

Use the object form when the real command lives behind another script:

```json
{
  "name": "@myorg/web",
  "scripts": {
    "dev": "portless",
    "dev:app": "next dev"
  },
  "portless": {
    "name": "myapp",
    "script": "dev:app"
  }
}
```

## Monorepo And Worktrees

One root `portless.json` can name workspace apps:

```json
{
  "apps": {
    "apps/web": { "name": "myapp" },
    "apps/api": { "name": "api.myapp" }
  }
}
```

Run all workspace packages with a `dev` script:

```bash
portless
```

Run one package from its directory:

```bash
cd apps/web
portless
```

For git worktrees, prefer `portless run` in scripts or commands. Portless prefixes linked worktree routes with the branch name:

```bash
portless run next dev
portless run --name myapp next dev
```

## Vite With Local API Proxy

Temporary run two services:

```bash
portless api.myapp npm run dev:api
portless myapp npm run dev:web
```

Durable proxy config:

```ts
server: {
  proxy: {
    "/api": {
      target: process.env.VITE_API_ORIGIN ?? "https://api.myapp.localhost",
      changeOrigin: true,
      ws: true,
    },
  },
}
```

`changeOrigin: true` keeps Portless routing on the target host.

## Python Uvicorn / FastAPI

If the command supports `--port`:

```bash
portless api.myapp uv run uvicorn app:app --host 127.0.0.1
```

If a Makefile pins a port:

```bash
make run
portless alias api.myapp 8123
```

Durable command pattern:

```makefile
run:
	uv run uvicorn app:app --host $${HOST:-127.0.0.1} --port $${PORT:-8123}
```

## Go HTTP Services

If the service reads `PORT`:

```bash
portless api.myapp go run ./cmd/server
```

For dual API and metrics ports, keep API under Portless and alias metrics when needed:

```bash
portless api.myapp go run ./cmd/server
portless alias metrics.myapp 8081
```

## Static HTML

Temporary static preview:

```bash
python3 -m http.server 8787 --bind 127.0.0.1
portless alias my-preview 8787
```

Use this for single-file mockups, design exports, and screenshot review.

## Clean URL Setup

Use clean URLs for previews:

```bash
portless proxy start
portless myapp next dev
# https://myapp.localhost
```

For maintained developer machines:

```bash
portless trust
portless service install
portless service status
```

Use `portless hosts sync` when Safari needs `/etc/hosts` entries for `.localhost` subdomains.

When `portless service status` reports `Proxy on 443: responding` and `HTTPS: yes`, keep the service running. Cleanup only removes temporary aliases and app processes.

## Custom Proxy Port Fallback

Use this only when the user explicitly asks for no-sudo bounded automation evidence. The URL includes the proxy port by design:

```bash
portless alias myapp 8123
portless proxy start --no-tls -p 1355
portless list
```

Probe the exact URL printed by `portless list`, such as:

```bash
curl -i http://myapp.localhost:1355/
```

Clean up custom proxy fallback:

```bash
portless alias --remove myapp
portless proxy stop
```

Use a custom TLD only for maintained local workflows:

```bash
portless proxy start --tld test
portless myapp next dev
```

Use wildcard mode when tenant-style subdomains should route to one app:

```bash
portless proxy start --wildcard
```

## OAuth / MCP Callback Servers

Prefer HTTPS Portless URLs for local browser and client flows:

```text
https://my-mcp.localhost/mcp
https://my-auth.localhost/callback
```

Durable projects should derive public URLs from `PORTLESS_URL` or `PUBLIC_URL`.

## Mobile, LAN, And External Sharing

LAN:

```bash
portless proxy start --lan
portless myapp npm run dev
```

Tailscale:

```bash
portless myapp --tailscale npm run dev
```

Tailscale Funnel:

```bash
portless myapp --funnel npm run dev
```

ngrok:

```bash
portless myapp --ngrok npm run dev
```

Use these for device, teammate, callback, or webhook access. Keep local-only data in local mode by default.

## OS Startup Service

Use this only for maintained developer machines that should keep clean HTTPS URLs after reboot:

```bash
portless service install
portless service install --lan
portless service install --wildcard
portless service status
portless service uninstall
```

For a reset, use `portless clean`; it removes Portless state, trust entry, hosts block, and service configuration.
