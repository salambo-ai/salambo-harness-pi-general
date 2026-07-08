# Salambo Template File Map

## Agent resources

### `agent/system.md`

The system prompt is the highest-level behavior contract for the deployed agent.
Use it for durable instructions such as role, tone, allowed workflows, domain constraints, and escalation rules.

### `agent/settings.json`

Runtime settings for Pi. Use it to select the model and enabled tools.
Do not put secrets here.

### `agent/skills/`

Runtime skills are loaded by the agent on demand. Each skill should be a directory with a `SKILL.md` file.
Use runtime skills for specialized workflows the deployed agent should follow.

### `agent/prompts/`

Reusable prompt templates. Use them for structured prompts that the agent may need repeatedly.

### `agent/extensions/`

Extension modules provide custom tools. Keep extension code small, typed by convention, and defensive about inputs.

## Sandbox resources

### `sandbox/Dockerfile`

Defines the sandbox image. Keep image changes deterministic and minimal.
This file contains platform invariants; read `salambo-sandbox-customization/references/dockerfile.md` before changing base-image, directory, copy, ownership, user, or entrypoint behavior.

### `sandbox/packages.mjs`

Preferred place for package lists and simple setup commands.

### `sandbox/workspace/`

Files copied into `/workspace` in the sandbox. Use this for starter files, sample inputs, templates, and empty folders.

### `sandbox/entrypoint.sh`

Sandbox startup script. It prepares runtime directories, configures injected egress proxy CA certificates, and keeps the sandbox alive for Salambo worker-controlled runs.
Do not delete it or replace it with an app server unless the template architecture intentionally changes.

## Salambo config

### `salambo.yaml`

Deployment and runtime metadata. Use it for agent identity, runtime config, egress allowlists, env vars, secrets, and extension file declarations for deployment.

## Builder macro skills

### `.agents/skills/`

Project-local macro skills for coding assistants that help engineers edit this repo.
These are not part of the deployed agent's runtime behavior.
