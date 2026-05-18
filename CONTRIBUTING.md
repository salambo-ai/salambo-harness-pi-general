# Contributing

Thanks for contributing to this template.

## Working Principles

- Preserve the worker-owned brain / sandbox-hands split.
- Keep the customizable surface easy to understand.
- Keep hosted extension code inside the sandbox.
- Keep platform runtime code out of the template unless it belongs in the base image.

## Before Opening a PR

Run:

```bash
npm run harness:validate
npm test
npm run harness:materialize
```

If your change touches Docker or runtime bootstrap, also build the image locally when practical:

```bash
docker build .
```

## What We Protect Strictly

- `salambo.yaml`
- `Dockerfile`
- `start.sh`
- `agent/**` resource layout
- `.salambo/extensions/**` hosted extension layout
- `harness-config/docker.mjs`
- `harness-config/initial-workspace/**`
- `/workspace`, `/workspace/.salambo`, `/opt/salambo`, and `/run/salambo` path invariants

## What Is Not Part of This Template Anymore

Do not reintroduce the old sandbox-hosted brain/server contract:

```text
/agent/query
/agent/events/:sandboxId
/workspace/files/sync
Express server runtime
sandbox-hosted Pi sessions
sandbox S2 event bridge
```

The Salambo worker owns the Pi brain/session/model loop.

## PR Expectations

- Keep changes scoped.
- Add or update tests when changing image config or path invariants.
- Update docs when a user-facing setup or invariant changes.
- Call out breaking changes explicitly.
