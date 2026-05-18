# Salambo Harness Pi General

Hands-only sandbox template for Salambo worker-owned Pi runs.

This repo no longer runs a sandbox-hosted Pi brain or `/agent/query` HTTP server. The production runtime is:

```text
Salambo worker = Pi brain/session/model loop
Daytona sandbox = tools, files, skills/prompts, hosted extensions, sidecar runtime
```

```mermaid
flowchart TD
  API[Responses API] --> Worker[Salambo worker]
  Worker --> Pi[Pi AgentHarness]
  Pi --> Tools[Worker-owned tools]
  Pi --> Bridge[Extension bridge]
  Tools --> Sandbox[Daytona sandbox]
  Bridge --> Sidecar[Sandbox sidecar]
  Sidecar --> Extensions[.salambo/extensions]
  Sandbox --> Workspace[/workspace]
  Sandbox --> Resources[/workspace/.salambo/agent]
```

## Quickstart

```bash
npm install
npm run harness:validate
npm test
```

Build the sandbox image locally:

```bash
npm run docker:build
```

Run it locally as a long-lived hands sandbox:

```bash
npm run compose:up
```

The container intentionally has no HTTP API. It stays alive so Salambo/Daytona can execute commands and read/write files.

## Deployment

Deploy immutable source with the Salambo CLI from the app monorepo:

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

`salambo deploy --source .` uploads the source archive and compiled Pi manifest. Salambo owns Depot image build, Daytona snapshot creation, deployment activation, and rollback-safe active deployment pointers.

## Hosted runtime contract

Stable hosted surfaces are file/image/resource surfaces, not an in-sandbox HTTP server:

- `salambo.yaml` declares deployment metadata, env/secrets, runtime config, and hosted extensions.
- `agent/settings.json` declares default model and active tools.
- `agent/system.md` becomes the base system prompt.
- `agent/skills/**` becomes Pi skill resources and is copied to `/workspace/.salambo/agent/skills`.
- `agent/prompts/**` becomes Pi prompt template resources and is copied to `/workspace/.salambo/agent/prompts`.
- `.salambo/extensions/**` contains hosted extension code executed through the Salambo sidecar.
- `harness-config/initial-workspace/**` seeds `/workspace`.
- `harness-config/docker.mjs` declares OS/npm/pip/bootstrap image additions.
- `/opt/salambo` comes from the Salambo base image and contains baked platform runtime code.
- `/run/salambo` is writable per-run platform state.

## Repo shape

```text
salambo.yaml
Dockerfile
start.sh
agent/
  settings.json
  system.md
  skills/
  prompts/
.salambo/
  extensions/
harness-config/
  docker.mjs
  image.config.mjs
  initial-workspace/
workspace/                 # local-only bind mount
docker-compose.yml          # local-only
scripts/
```

## Customizing the sandbox image

Edit:

```text
harness-config/docker.mjs
```

It controls:

- `apt`: Debian packages;
- `npm`: optional global hands-side npm tools;
- `pip`: Python packages installed into `/opt/pyenv`;
- `setup`: one-off shell setup.

The Docker build materializes this file into install inputs with:

```bash
npm run harness:materialize
```

## Hosted extensions

Add hosted extension modules under:

```text
.salambo/extensions/
```

Declare them in `salambo.yaml`:

```yaml
extensions:
  - path: .salambo/extensions/smoke.mjs
    mode: auto
```

The worker starts the sidecar with a fresh token for each run/restart. Extension code runs in the sandbox, never in the worker.

## Agent resources

Add skills and prompt templates under:

```text
agent/skills/
agent/prompts/
```

The Salambo CLI compiles them into the immutable deployment manifest. The worker passes them to Pi as `AgentHarnessResources`.

## Commands

```bash
npm run harness:validate
npm test
npm run harness:materialize
npm run image:print
npm run image:release
npm run docker:build
npm run compose:up
```

## What was removed

The old sandbox-hosted brain/server path has been removed from this template:

```text
/agent/query
/agent/events/:sandboxId
/workspace/files/sync
sandbox-hosted Pi sessions
sandbox S2 event bridge
Express server runtime
```

Those responsibilities now belong to the Salambo app/worker runtime.
