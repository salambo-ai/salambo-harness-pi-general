---
name: salambo-extensions
description: Precise reference for engineers adding Salambo hosted extension tools and hooks in an agent template. Use when creating files under agent/extensions, wiring tools into settings, using lifecycle hooks, validating inputs, or deciding whether logic should be a runtime skill or a tool.
---

# Salambo Extensions

Use this skill when adding custom tools or hosted extension hooks to the agent.

## Important: hosted subset, not full local Pi extensions

Salambo hosted extensions run inside the hosted sandbox sidecar. They intentionally support a subset of Pi's full local extension API.

Supported hosted API:

```text
pi.registerTool(...)
pi.on(...)
pi.setModel(...)
```

Do not assume local Pi extension features such as TUI UI APIs, commands, shortcuts, resource discovery, or package installation are available in hosted runtime unless Salambo explicitly adds them.

## Main files

| Path | Purpose |
| --- | --- |
| `agent/extensions/*.mjs` | Hosted extension module source. |
| `salambo.yaml` | Declares extension entrypoints and load mode. |
| `agent/settings.json` | Enables registered tool names. |
| `sandbox/packages.mjs` | Adds runtime dependencies used by extension code. |

## When to use an extension

Use an extension when the agent needs executable behavior:

- query an internal API;
- transform a file;
- validate structured data;
- run deterministic business logic;
- call a service with controlled inputs;
- intercept or adjust supported runtime hooks.

Use a runtime skill instead when the agent only needs instructions or a workflow.

## First references to read

- `references/hosted-extension-api.md` for the exact supported API.
- `references/supported-hooks.md` for all supported hook names, event shapes, and return values.
- `references/tool-contract.md` for `pi.registerTool(...)` requirements.
- `references/salambo-yaml-wiring.md` for extension declaration and modes.
- `references/testing.md` for validation steps.
