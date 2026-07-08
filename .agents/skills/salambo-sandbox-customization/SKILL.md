---
name: salambo-sandbox-customization
description: Help engineers customize the Salambo sandbox image and workspace seed, including Dockerfile changes, package dependencies, runtime paths, and safe workspace conventions. Use when adding OS/npm/pip dependencies or files the agent needs at runtime.
---

# Customize the Salambo Sandbox

Use this skill when changing the machine environment the agent runs in.

## Main files

| Goal | Edit |
| --- | --- |
| Add apt/npm/pip dependencies | `sandbox/packages.mjs` |
| Add lower-level image setup | `sandbox/Dockerfile` |
| Add starter files | `sandbox/workspace/` |
| Change startup behavior | `sandbox/entrypoint.sh` |
| Add env/secrets/egress config | `salambo.yaml` |

## Runtime paths

```text
/workspace          mutable workspace for agent work
/opt/salambo        platform-owned runtime from the base image
/opt/salambo/agent  baked agent resources
/run/salambo        per-run platform state
```

Prefer `/workspace` for generated files and working state.
Do not rely on local developer absolute paths.

## Platform invariants

Do not delete or casually replace:

- the Salambo runtime base image in `sandbox/Dockerfile`;
- `/opt/salambo` platform runtime directories;
- `/opt/salambo/agent` resource copy steps;
- `/run/salambo` run-state directory setup;
- `sandbox/entrypoint.sh`;
- `exec sleep infinity` in the entrypoint.

These keep the worker-owned runtime, hosted extension sidecar, egress proxy certificates, and Daytona sandbox lifecycle aligned.

## Dependency rules

- Prefer pinned versions for pip/npm packages when reproducibility matters.
- Keep setup commands deterministic.
- Avoid installing unnecessary large packages.
- Never bake secrets into the image.
- Use `salambo.yaml` secrets/env for runtime configuration.

## References

- `references/dependencies.md`
- `references/dockerfile.md`
- `references/entrypoint.md`
- `references/workspace.md`
