# Salambo Pi General

A minimal **hands sandbox** template for Salambo.

```text
Salambo app/worker = brain
this repo           = hands sandbox image
```

## Repository map

```text
agent/                  Brain inputs compiled by `salambo deploy`.
  settings.json         Model + active tool defaults.
  system.md             Base system prompt.
  skills/               Pi skills.
  prompts/              Pi prompt templates.

extensions/             Hosted extension code. Copied to `/workspace/extensions`.

sandbox/                Sandbox image inputs.
  packages.mjs          apt/npm/pip/bootstrap additions.
  workspace/            Files copied into `/workspace`.
  entrypoint.sh         Long-lived sandbox process.

scripts/                Tiny sandbox config helper scripts.
Dockerfile              Builds the Daytona sandbox image.
salambo.yaml            Salambo deploy config.
```

If a file affects the model/agent brain, it belongs in `agent/`.
If a file runs as extension code, it belongs in `extensions/`.
If a file affects the sandbox machine, it belongs in `sandbox/`.

## Validate locally

```bash
npm install
npm run sandbox:validate
npm test
npm run sandbox:materialize
```

Build the image when you have access to the private base image registry:

```bash
npm run docker:build
```

## Deploy

```bash
node /path/to/salambo_app/packages/cli/build/index.js deploy \
  --profile default \
  --source . \
  --config salambo.yaml \
  --commit "$(git rev-parse HEAD)"
```

`salambo deploy --source .` uploads this repo and a compiled Pi manifest. Salambo then builds the image, creates the Daytona snapshot, and activates the deployment.

## Runtime layout inside the sandbox

```text
/workspace/                         Sandbox working directory.
/workspace/.salambo/agent/skills    Skill files for model-readable references.
/workspace/.salambo/agent/prompts   Prompt templates for model-readable references.
/workspace/extensions               Hosted extension modules.
/opt/salambo                        Baked Salambo runtime from the base image.
/run/salambo                        Per-run writable platform state.
```

The sandbox entrypoint only keeps the container alive. The Salambo worker starts runs, executes commands, manages Pi sessions, and starts the extension sidecar.

## Customize

### Agent behavior

Edit:

```text
agent/settings.json
agent/system.md
agent/skills/**
agent/prompts/**
```

### Hosted extensions

Add modules under:

```text
extensions/
```

Declare them in `salambo.yaml`:

```yaml
extensions:
  - path: extensions/smoke.mjs
    mode: auto
```

### Sandbox machine

Edit:

```text
sandbox/packages.mjs
```

It controls:

- Debian packages;
- global npm tools;
- Python packages;
- one-off setup shell.

## Commands

```bash
npm run sandbox:validate
npm run sandbox:materialize
npm run docker:build
```
