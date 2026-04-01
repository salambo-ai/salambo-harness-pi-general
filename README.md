# Salambo Sandbox Pi SDK

Dockerized sandbox template for `@mariozechner/pi-coding-agent` that preserves the current Salambo HTTP API, workspace semantics, and event contract.

## Quickstart

```bash
cp .env.example .env
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:3000/health
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

Workspace semantics stay the same:

- `/workspace/work`
- `/workspace/outputs`

Event families stay the same:

- `sandbox.run.init`
- `sandbox.run.ready`
- `sandbox.run.complete`
- `sandbox.run.cancelled`
- `sandbox.run.error`
- `session.event`

## Repo Shape

This repo keeps the same split as the other Salambo templates:

- fixed platform layer: `src/routes`, `src/core`, `src/platform`
- customizable harness layer: `harness-config/`, Docker/runtime files, `.env`

The main pi-specific harness surface is:

- `harness-config/pi-agent-home/settings.json`
- `harness-config/pi-agent-home/SYSTEM.md`
- `harness-config/pi-agent-home/extensions/`
- `harness-config/pi-agent-home/skills/`
- `harness-config/pi-agent-home/prompts/`
- `harness-config/pi-agent-home/themes/`
- `harness-config/initial-workspace/.pi/`
- `harness-config/docker.ts`
- `harness-config/image.config.mjs`

## Runtime Notes

- the sandbox runner in `src/core/agent-runner.ts` uses `@mariozechner/pi-coding-agent`
- the sandbox app hardcodes only the minimal app-level contract it owns
- the repo seeds `PI_HOME` from `harness-config/pi-agent-home/`
- pi runtime state then lives in the actual runtime `PI_HOME`
- pi project overrides live in `/workspace/.pi/`
- pi auth/config defaults to `PI_HOME`
- local default `PI_HOME` is `./harness-config/pi-agent-home`
- Docker default `PI_HOME` is `/home/node/.pi/agent`
- local auth is not copied implicitly from `~/.pi/agent`; use normal pi auth files or provider env vars
- resume support is adapted to the Salambo `sessionId` contract via an internal pi session registry

## Native Pi Layout

This template follows pi's native two-scope model:

- template defaults in `PI_HOME`
- project overrides in workspace `.pi/`

In this repo that means:

- `harness-config/pi-agent-home/` seeds template-level pi config
- `harness-config/initial-workspace/.pi/` seeds project-level pi overrides

Use pi's normal directories instead of inventing another layer:

- `extensions/`
- `skills/`
- `prompts/`
- `themes/`
- `settings.json`
- `SYSTEM.md`

Use `settings.json` path arrays or packages only when you need extra paths or shareable bundles.

## Adding Pi Resources

Use pi's native resource layout directly.

- bundled template extensions go in `harness-config/pi-agent-home/extensions/`
- bundled template skills go in `harness-config/pi-agent-home/skills/`
- bundled template prompts go in `harness-config/pi-agent-home/prompts/`
- bundled template themes go in `harness-config/pi-agent-home/themes/`
- project-local resources inside a synced workspace go in `harness-config/initial-workspace/.pi/`
- `settings.json` can also point to extra extension paths if you want to use pi's own `extensions` array

Each extension is a TypeScript module that exports:

```ts
export default function (pi: ExtensionAPI) {
  // register tools, commands, event hooks, UI, etc.
}
```

For multi-file extensions, use `extensions/my-extension/index.ts`. If the extension has its own dependencies, give that extension directory its own `package.json`, exactly the way pi documents it.

## Commands

```bash
npm run typecheck
npm test
npm run harness:materialize
```

## Current State

- local tests pass
- typecheck passes
- the top-level docs and machine config are now pi-oriented
- the main remaining follow-up is persisting the pi session registry across process restarts
