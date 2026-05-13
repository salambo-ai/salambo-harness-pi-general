# Salambo Harness Pi General

General-purpose Pi agent harness template for Salambo. It packages `@mariozechner/pi-coding-agent` behind Salambo's stable sandbox HTTP contract and is designed to be deployed with the Salambo CLI from `salambo.yaml`.

## Quickstart

```bash
cp .env.example .env
npm install
npm run typecheck
npm test
```

Run locally with the Salambo CLI from the app monorepo:

```bash
node /path/to/salambo_app/packages/cli/build/index.js doctor
node /path/to/salambo_app/packages/cli/build/index.js dev
```

Health check:

```bash
curl http://localhost:3000/health
```

Open Pi inside the running local harness container:

```bash
node /path/to/salambo_app/packages/cli/build/index.js pi
```

`salambo pi` starts Pi from `/workspace`, which is mounted from local `./workspace`.

## Deployment

This repo includes `salambo.yaml`. It is deployment configuration only:

- image build/push settings
- snapshot settings
- Salambo agent identity/active flag
- runtime egress/telemetry config
- deployed env vars and secret references
- local Docker/Pi wiring

Agent behavior and instructions do **not** live in `salambo.yaml`. Customize behavior through Pi-native files under `harness-config/` and workspace `.pi/` overrides.

Deploy immutable source with:

```bash
node /path/to/salambo_app/packages/cli/build/index.js auth set \
  --env-var SALAMBO_API_KEY \
  --api-url "$SALAMBO_BASE_URL" \
  --profile default

OPENAI_API_KEY=... node /path/to/salambo_app/packages/cli/build/index.js deploy \
  --profile default \
  --source . \
  --config salambo.yaml \
  --commit "$(git rev-parse HEAD)"
```

`salambo deploy --source .` uploads the source archive and compiled Pi/brain manifest to Salambo. Salambo then owns the Depot image build, Daytona snapshot creation, deployment activation, and rollback-safe active deployment pointer.

Secrets in `salambo.yaml` use `fromEnv`. This template declares `OPENAI_API_KEY`, so the shell or CI environment running deploy must provide `OPENAI_API_KEY` to sync it as an agent secret. Do not put raw secret values in `salambo.yaml`.

The legacy `salambo deploy` path without `--source` still builds and pushes the GHCR image locally. Prefer `--source` for hosted immutable deployments.

A GitHub Actions starter is available at:

```text
.github/workflows/deploy.yml.example
```

## Stable Contract

These surfaces stay compatible with the current platform:

- `GET /health`
- `POST /agent/query`
- `POST /agent/interrupt`
- `GET /agent/status`
- `GET /agent/events/:sandboxId`
- `POST /workspace/files/sync`
- `POST /workspace/files/import`
- `DELETE /workspace/sandbox/:sandboxId`

Workspace paths stay stable:

- `/workspace/work`
- `/workspace/outputs`

Event families stay stable:

- `sandbox.run.init`
- `sandbox.run.ready`
- `sandbox.run.complete`
- `sandbox.run.cancelled`
- `sandbox.run.error`
- `session.event`

## Repo Shape

Fixed platform layer:

- `src/routes`
- `src/core`
- `src/platform`

Customizable harness layer:

- `harness-config/`
- `Dockerfile`
- `docker-compose.yml`
- `salambo.yaml`
- `.env`
- `workspace/`

Pi-specific customization surfaces:

- `harness-config/pi-agent-home/settings.json`
- `harness-config/pi-agent-home/SYSTEM.md`
- `harness-config/pi-agent-home/extensions/`
- `harness-config/pi-agent-home/skills/`
- `harness-config/pi-agent-home/prompts/`
- `harness-config/pi-agent-home/themes/`
- `harness-config/initial-workspace/.pi/`
- `workspace/.pi/`
- `harness-config/docker.ts`
- `harness-config/image.config.mjs`

## Local vs deployed runtime

Local Docker mode validates the harness app, image tools, and Pi behavior. It does not fully emulate Salambo production runtime concerns such as S2 event streaming, managed file gateway, billing gates, snapshot launch, or platform-managed runtime secrets.

Use:

```bash
salambo pi
```

for local behavior testing.

Use:

```bash
salambo deploy
salambo smoke
```

for deployed API/runtime validation.

## Native Pi Layout

This template follows Pi's native two-scope model:

- template defaults in `PI_HOME`
- project overrides in workspace `.pi/`

In this repo that means:

- `harness-config/pi-agent-home/` seeds template-level Pi config
- `harness-config/initial-workspace/.pi/` seeds project-level Pi overrides copied into images
- `workspace/.pi/` is available for local project overrides during Docker development

Use Pi's normal directories instead of inventing another layer:

- `extensions/`
- `skills/`
- `prompts/`
- `themes/`
- `settings.json`
- `SYSTEM.md`

## Adding Pi Resources

Use Pi's native resource layout directly.

- bundled template extensions go in `harness-config/pi-agent-home/extensions/`
- bundled template skills go in `harness-config/pi-agent-home/skills/`
- bundled template prompts go in `harness-config/pi-agent-home/prompts/`
- bundled template themes go in `harness-config/pi-agent-home/themes/`
- project-local resources inside a synced workspace go in `workspace/.pi/` for local dev or `harness-config/initial-workspace/.pi/` for image defaults
- `settings.json` can also point to extra extension paths if you want to use Pi's own `extensions` array

Each extension is a TypeScript module that exports:

```ts
export default function (pi: ExtensionAPI) {
  // register tools, commands, event hooks, UI, etc.
}
```

For multi-file extensions, use `extensions/my-extension/index.ts`. If the extension has its own dependencies, give that extension directory its own `package.json`, exactly the way Pi documents it.

## Commands

```bash
npm run typecheck
npm test
npm run harness:validate
npm run harness:materialize
npm run image:print
npm run image:release
```

Docker Compose local mode:

```bash
docker compose up --build
curl http://localhost:3000/health
docker compose exec harness bash -lc 'cd /workspace && pi'
```

For first-time setup, the compose file does not require a host `~/.pi/agent/auth.json`. `OPENAI_API_KEY` can seed container auth on startup. If you want to reuse host Pi auth instead, uncomment the optional auth bind mount in `docker-compose.yml`.
