# Salambo Pi General

A minimal **hands sandbox** template for Salambo.

```text
Salambo app/worker = brain
this repo           = hands sandbox image + agent-owned resources
```

## Repository map

```text
agent/                  Everything agent-specific.
  settings.json         Model + active tool defaults.
  system.md             Base system prompt.
  skills/               Pi skills.
  prompts/              Pi prompt templates.
  extensions/           Hosted extension modules.

sandbox/                Everything sandbox-machine-specific.
  Dockerfile            Builds the Daytona sandbox image.
  packages.mjs          apt/npm/pip/bootstrap additions.
  workspace/            Files copied into `/workspace`.
  entrypoint.sh         Long-lived sandbox process.

salambo.yaml            Salambo deploy config.
```

Rule of thumb:

```text
Does it define agent behavior?     Put it in agent/.
Does it install/build the machine? Put it in sandbox/.
```

## Validate locally

```bash
node --check agent/extensions/smoke.mjs
node --input-type=module -e "const c=(await import('./sandbox/packages.mjs')).default; for (const k of ['apt','npm','pip']) if (!Array.isArray(c[k]) || c[k].some((x)=>typeof x !== 'string')) throw new Error(k); if (typeof c.setup !== 'string') throw new Error('setup'); console.log('sandbox/packages.mjs OK')"
```

Build the image when you have access to the private base image registry:

```bash
docker build -f sandbox/Dockerfile .
```

## Deploy

```bash
node /path/to/salambo_app/packages/cli/build/index.js deploy \
  --profile default \
  --source . \
  --config salambo.yaml \
  --commit "$(git rev-parse HEAD)"
```

`salambo deploy --source .` uploads this repo and a compiled Pi manifest. Salambo then builds the image in the managed Depot registry, creates the Daytona snapshot, and activates the deployment.

## Runtime layout inside the sandbox

```text
/workspace/                         Sandbox working directory.
/workspace/.salambo/agent/skills    Skill files for model-readable references.
/workspace/.salambo/agent/prompts   Prompt templates for model-readable references.
/workspace/agent/extensions         Hosted extension modules.
/opt/salambo                        Baked Salambo runtime from the base image.
/run/salambo                        Per-run writable platform state.
```

The sandbox entrypoint only keeps the container alive. The Salambo worker starts runs, executes commands, manages Pi sessions, and starts the extension sidecar.
