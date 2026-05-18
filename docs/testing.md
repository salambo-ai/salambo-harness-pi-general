# Testing

This repo tests the hands-only sandbox template, not a sandbox-hosted agent server.

Run:

```bash
npm run sandbox:validate
npm test
npm run sandbox:materialize
```

For Docker changes, also run:

```bash
docker build .
```

## What tests cover

- `sandbox-image/packages.mjs` shape validation;
- materialized apt/npm/pip/bootstrap files;
- Docker build inputs used by the sandbox image.

## What tests intentionally do not cover here

The production Pi brain/session/model loop is owned by the Salambo worker and is tested in the Salambo app repo. This template no longer tests:

```text
/agent/query
/agent/events/:sandboxId
/workspace/files/sync
sandbox-hosted Pi sessions
sandbox S2 event projection
```

Use deployed Salambo smoke tests to validate the full worker + Daytona + sidecar path.
