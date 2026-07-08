---
name: salambo-template-overview
description: Orient engineers working in a Salambo agent template repo. Use when a builder asks what files matter, where to customize behavior, how runtime agent resources differ from builder macro skills, or how the template is structured.
---

# Salambo Template Overview

Use this skill to orient a builder before changing the template.

## Core model

```text
Salambo worker = model loop, run lifecycle, orchestration
this repo      = agent configuration, runtime resources, sandbox image inputs
```

This repo does not own the production web app, run queue, or hosted agent loop. It packages the resources Salambo needs to build and run an agent.

## Main directories

| Path | Purpose |
| --- | --- |
| `agent/system.md` | Base instructions for the deployed agent. |
| `agent/settings.json` | Pi model/tool settings loaded by the runtime. |
| `agent/skills/` | Runtime skills available to the deployed agent. |
| `agent/prompts/` | Runtime prompt templates available to the deployed agent. |
| `agent/extensions/` | Hosted extension modules that add tools. |
| `sandbox/Dockerfile` | Sandbox image build steps. |
| `sandbox/packages.mjs` | Apt, npm, pip, and setup customization. |
| `sandbox/workspace/` | Starter files copied into `/workspace`. |
| `sandbox/entrypoint.sh` | Sandbox startup script that keeps the worker-owned runtime attachable. |
| `salambo.yaml` | Salambo deploy/runtime metadata. |
| `.agents/skills/` | Builder macro skills for coding assistants editing this repo. |

## Important distinction

```text
agent/skills/   = skills for the deployed agent at runtime
.agents/skills/ = macro skills for engineers and coding assistants editing this repo
```

Do not put builder instructions in `agent/skills/` unless the deployed agent should see and use them.

## Change routing

- Change agent personality or policy in `agent/system.md`.
- Change model/tool selection in `agent/settings.json`.
- Add runtime reusable capabilities in `agent/skills/`.
- Add custom tools in `agent/extensions/`.
- Add OS or package dependencies in `sandbox/packages.mjs` and `sandbox/Dockerfile`.
- Add starter files in `sandbox/workspace/`.
- Change sandbox startup behavior in `sandbox/entrypoint.sh`, but only after reading the sandbox invariants.
- Change deploy metadata or extension declarations in `salambo.yaml`.

For more detail, read `references/file-map.md` and `references/lifecycle.md`.
